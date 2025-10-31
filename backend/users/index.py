'''
Business: Управление пользователями, авторизация через Telegram, оплата и техподдержка
Args: event с httpMethod, body, queryStringParameters, headers
Returns: Данные пользователей, токены авторизации, платежи, тикеты поддержки
'''

import json
import os
import uuid
import hashlib
import secrets
import base64
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request

DATABASE_URL = os.environ.get('DATABASE_URL')
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
YOOKASSA_SHOP_ID = os.environ.get('YOOKASSA_SHOP_ID', '')
YOOKASSA_SECRET_KEY = os.environ.get('YOOKASSA_SECRET_KEY', '')
SCHEMA = 't_p8741694_magazin_samp'

def decimal_to_float(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def send_telegram_message(chat_id: int, text: str):
    if not TELEGRAM_BOT_TOKEN:
        return
    try:
        url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
        data = json.dumps({'chat_id': chat_id, 'text': text, 'parse_mode': 'HTML'}).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        urllib.request.urlopen(req)
    except:
        pass

def generate_session_token() -> str:
    return secrets.token_urlsafe(32)

def create_yookassa_payment(amount: float, order_id: int, description: str) -> Dict:
    url = 'https://api.yookassa.ru/v3/payments'
    idempotence_key = str(uuid.uuid4())
    
    payload = {
        'amount': {'value': f'{amount:.2f}', 'currency': 'RUB'},
        'confirmation': {
            'type': 'redirect',
            'return_url': 'https://magazin-samp.poehali.dev/payment-success'
        },
        'capture': True,
        'description': description,
        'metadata': {'order_id': order_id}
    }
    
    credentials = base64.b64encode(f'{YOOKASSA_SHOP_ID}:{YOOKASSA_SECRET_KEY}'.encode()).decode()
    headers = {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotence_key,
        'Authorization': f'Basic {credentials}'
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers)
    response = urllib.request.urlopen(req)
    return json.loads(response.read().decode('utf-8'))

def get_user_from_session(cursor, session_token: str) -> Optional[int]:
    cursor.execute(
        f"""SELECT user_id FROM {SCHEMA}.user_sessions 
            WHERE session_token = %s AND expires_at > %s""",
        (session_token, datetime.now())
    )
    result = cursor.fetchone()
    return result['user_id'] if result else None

def handle_telegram_bot(update: Dict, cursor, conn) -> Dict:
    if 'message' not in update:
        return {'statusCode': 200, 'body': 'ok'}
    
    message = update['message']
    chat_id = message['chat']['id']
    text = message.get('text', '')
    telegram_username = message['from'].get('username', '')
    telegram_id = message['from']['id']
    first_name = message['from'].get('first_name', 'Пользователь')
    
    if text == '/start':
        cursor.execute(
            f"SELECT id FROM {SCHEMA}.users WHERE telegram_id = %s",
            (telegram_id,)
        )
        user = cursor.fetchone()
        
        if user:
            send_telegram_message(
                chat_id,
                f"✅ <b>Вы уже зарегистрированы!</b>\n\nВаш ID: <code>{user['id']}</code>\nИспользуйте /login для входа."
            )
        else:
            username = telegram_username or f"user_{telegram_id}"
            email = f"{telegram_id}@telegram.user"
            
            cursor.execute(
                f"""INSERT INTO {SCHEMA}.users 
                (username, email, telegram_id, telegram_username, created_at) 
                VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                (username, email, telegram_id, telegram_username, datetime.now())
            )
            user_id = cursor.fetchone()['id']
            conn.commit()
            
            send_telegram_message(
                chat_id,
                f"🎉 <b>Добро пожаловать, {first_name}!</b>\n\n✅ Регистрация завершена\n🆔 ID: <code>{user_id}</code>\n\nИспользуйте /login для входа."
            )
    
    elif text == '/login':
        cursor.execute(
            f"SELECT id FROM {SCHEMA}.users WHERE telegram_id = %s",
            (telegram_id,)
        )
        user = cursor.fetchone()
        
        if not user:
            send_telegram_message(chat_id, "❌ Вы не зарегистрированы. Используйте /start")
        else:
            session_token = generate_session_token()
            expires_at = datetime.now() + timedelta(days=30)
            
            cursor.execute(
                f"""INSERT INTO {SCHEMA}.user_sessions (user_id, session_token, expires_at) 
                VALUES (%s, %s, %s)""",
                (user['id'], session_token, expires_at)
            )
            cursor.execute(
                f"UPDATE {SCHEMA}.users SET last_login = %s WHERE id = %s",
                (datetime.now(), user['id'])
            )
            conn.commit()
            
            login_url = f"https://magazin-samp.poehali.dev/auth?token={session_token}"
            send_telegram_message(
                chat_id,
                f"🔐 <b>Ссылка для входа:</b>\n{login_url}\n\n⏰ Действительна 30 дней"
            )
    else:
        send_telegram_message(
            chat_id,
            "ℹ️ <b>Команды:</b>\n/start - Регистрация\n/login - Вход"
        )
    
    return {'statusCode': 200, 'body': json.dumps({'ok': True})}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token, X-Admin-Auth, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    params = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    body_data = json.loads(event.get('body', '{}')) if event.get('body') else {}
    
    action = params.get('action') or body_data.get('action', '')
    
    if 'update_id' in body_data or 'message' in body_data:
        result = handle_telegram_bot(body_data, cursor, conn)
        cursor.close()
        conn.close()
        return result
    
    if action == 'auth':
        token = params.get('token')
        
        if not token:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Token required'})
            }
        
        cursor.execute(
            f"""SELECT s.session_token, s.expires_at, s.user_id,
                u.username, u.email, u.balance, u.telegram_username
                FROM {SCHEMA}.user_sessions s
                JOIN {SCHEMA}.users u ON s.user_id = u.id
                WHERE s.session_token = %s AND s.expires_at > %s""",
            (token, datetime.now())
        )
        
        session = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not session:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid or expired token'})
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'user': {
                    'id': session['user_id'],
                    'username': session['username'],
                    'email': session['email'],
                    'balance': float(session['balance']) if session['balance'] else 0.0,
                    'telegram_username': session['telegram_username']
                },
                'session_token': session['session_token']
            }, default=decimal_to_float)
        }
    
    session_token = headers.get('x-session-token') or headers.get('X-Session-Token')
    user_id = get_user_from_session(cursor, session_token) if session_token else None
    
    if action == 'verify':
        if not user_id:
            cursor.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'authenticated': False})
            }
        
        cursor.execute(
            f"SELECT username, email, balance, status FROM {SCHEMA}.users WHERE id = %s",
            (user_id,)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'authenticated': True,
                'user': dict(user) if user else None
            }, default=decimal_to_float)
        }
    
    if action == 'payment':
        if not user_id:
            cursor.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }
        
        product_id = body_data.get('product_id')
        
        cursor.execute(
            f"SELECT title, price FROM {SCHEMA}.products WHERE id = %s",
            (product_id,)
        )
        product = cursor.fetchone()
        
        if not product:
            cursor.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Product not found'})
            }
        
        price = float(product['price'].replace('₽', '').replace(' ', '').strip())
        auto_delivery_text = f"Товар: {product['title']}\nДоступ предоставлен автоматически."
        
        cursor.execute(
            f"""INSERT INTO {SCHEMA}.orders 
                (user_id, product_id, status, auto_delivery_content, delivery_status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
            (user_id, product_id, 'pending', auto_delivery_text, 'pending', datetime.now())
        )
        order_id = cursor.fetchone()['id']
        
        if YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY:
            payment_response = create_yookassa_payment(
                price, order_id, f"Оплата заказа #{order_id} - {product['title']}"
            )
            
            cursor.execute(
                f"""INSERT INTO {SCHEMA}.payments 
                    (user_id, order_id, amount, payment_method, payment_status, transaction_id, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (user_id, order_id, price, 'yookassa', 'pending', payment_response['id'], datetime.now())
            )
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'payment_url': payment_response['confirmation']['confirmation_url'],
                    'order_id': order_id,
                    'amount': price
                }, default=decimal_to_float)
            }
    
    if 'event' in body_data and body_data.get('event') == 'payment.succeeded':
        payment_data = body_data['object']
        payment_id = payment_data['id']
        order_id = int(payment_data['metadata']['order_id'])
        
        cursor.execute(
            f"""UPDATE {SCHEMA}.orders 
                SET status = %s, delivery_status = %s, delivered_at = %s 
                WHERE id = %s""",
            ('completed', 'delivered', datetime.now(), order_id)
        )
        cursor.execute(
            f"""UPDATE {SCHEMA}.payments 
                SET payment_status = %s, completed_at = %s 
                WHERE transaction_id = %s""",
            ('completed', datetime.now(), payment_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'status': 'processed'})
        }
    
    if action == 'support':
        if method == 'GET':
            if user_id:
                cursor.execute(
                    f"""SELECT id, subject, status, priority, created_at, updated_at
                        FROM {SCHEMA}.support_tickets WHERE user_id = %s
                        ORDER BY created_at DESC""",
                    (user_id,)
                )
            else:
                cursor.execute(
                    f"""SELECT t.id, t.subject, t.status, t.priority, t.created_at, 
                        t.updated_at, u.username
                        FROM {SCHEMA}.support_tickets t
                        JOIN {SCHEMA}.users u ON t.user_id = u.id
                        ORDER BY t.created_at DESC"""
                )
            
            tickets = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'tickets': [dict(t) for t in tickets]}, default=str)
            }
        
        elif method == 'POST':
            if not user_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Unauthorized'})
                }
            
            subject = body_data.get('subject')
            priority = body_data.get('priority', 'normal')
            
            cursor.execute(
                f"""INSERT INTO {SCHEMA}.support_tickets 
                    (user_id, subject, priority, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                (user_id, subject, priority, datetime.now(), datetime.now())
            )
            ticket_id = cursor.fetchone()['id']
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ticket_id': ticket_id, 'status': 'created'})
            }
    
    if method == 'GET':
        cursor.execute(
            f'SELECT id, username, email, balance, status, created_at FROM {SCHEMA}.users ORDER BY created_at DESC'
        )
        users = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps([dict(u) for u in users], ensure_ascii=False, default=str)
        }
    
    elif method == 'POST':
        action_type = body_data.get('action')
        
        if action_type == 'add_balance':
            user_id_target = body_data.get('user_id')
            amount = body_data.get('amount')
            description = body_data.get('description', 'Пополнение баланса')
            
            cursor.execute(
                f"""UPDATE {SCHEMA}.users 
                    SET balance = balance + %s 
                    WHERE id = %s
                    RETURNING id, balance""",
                (amount, user_id_target)
            )
            
            result = cursor.fetchone()
            
            cursor.execute(
                f"""INSERT INTO {SCHEMA}.balance_transactions (user_id, amount, type, description)
                    VALUES (%s, %s, %s, %s)""",
                (user_id_target, amount, 'deposit', description)
            )
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user_id': result['id'],
                    'new_balance': float(result['balance'])
                }, default=decimal_to_float)
            }
        
        elif action_type == 'update_status':
            user_id_target = body_data.get('user_id')
            status = body_data.get('status')
            
            cursor.execute(
                f"""UPDATE {SCHEMA}.users 
                    SET status = %s 
                    WHERE id = %s
                    RETURNING id, status""",
                (status, user_id_target)
            )
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user_id': result['id'],
                    'status': result['status']
                })
            }
    
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
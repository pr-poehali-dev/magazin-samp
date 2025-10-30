'''
Business: User management API - get users, update balance, change status
Args: event with httpMethod, body, queryStringParameters
Returns: HTTP response with user data or operation result
'''

import json
import os
import psycopg2
from typing import Dict, Any, List, Optional
from decimal import Decimal

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def decimal_to_float(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute("""
                SELECT id, username, email, balance, status, created_at 
                FROM users 
                ORDER BY created_at DESC
            """)
            columns = [desc[0] for desc in cur.description]
            users = []
            for row in cur.fetchall():
                user = dict(zip(columns, row))
                user['created_at'] = user['created_at'].isoformat() if user['created_at'] else None
                users.append(user)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(users, default=decimal_to_float)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'add_balance':
                user_id = body_data.get('user_id')
                amount = body_data.get('amount')
                description = body_data.get('description', 'Пополнение баланса')
                
                cur.execute("""
                    UPDATE users 
                    SET balance = balance + %s 
                    WHERE id = %s
                    RETURNING id, balance
                """, (amount, user_id))
                
                result = cur.fetchone()
                
                cur.execute("""
                    INSERT INTO balance_transactions (user_id, amount, type, description)
                    VALUES (%s, %s, %s, %s)
                """, (user_id, amount, 'deposit', description))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'user_id': result[0],
                        'new_balance': float(result[1])
                    })
                }
            
            elif action == 'update_status':
                user_id = body_data.get('user_id')
                status = body_data.get('status')
                
                cur.execute("""
                    UPDATE users 
                    SET status = %s 
                    WHERE id = %s
                    RETURNING id, status
                """, (status, user_id))
                
                result = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'user_id': result[0],
                        'status': result[1]
                    })
                }
        
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Invalid action'})
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        cur.close()
        conn.close()

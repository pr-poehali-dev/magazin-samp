'''
Business: Manage administrators - list, create, update, delete admins
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with admin data
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Database configuration missing'})
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            action = params.get('action', 'admins')
            
            if action == 'site_status':
                cursor.execute(
                    "SELECT site_enabled FROM t_p8741694_magazin_samp.admins LIMIT 1"
                )
                result = cursor.fetchone()
                site_enabled = result['site_enabled'] if result else True
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'site_enabled': site_enabled})
                }
            
            if action == 'logs':
                limit = int(params.get('limit', 100))
                cursor.execute(
                    "SELECT id, user_id, username, action, ip_address, user_agent, status, created_at FROM auth_logs ORDER BY created_at DESC LIMIT %s",
                    (limit,)
                )
                logs = cursor.fetchall()
                
                logs_list = [
                    {
                        'id': log['id'],
                        'user_id': log['user_id'],
                        'username': log['username'],
                        'action': log['action'],
                        'ip_address': log['ip_address'],
                        'user_agent': log['user_agent'],
                        'status': log['status'],
                        'created_at': log['created_at'].isoformat() if log['created_at'] else None
                    }
                    for log in logs
                ]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'logs': logs_list})
                }
            
            cursor.execute(
                "SELECT id, username, email, role, is_active, created_at FROM admins ORDER BY created_at DESC"
            )
            admins = cursor.fetchall()
            
            admins_list = [
                {
                    'id': a['id'],
                    'username': a['username'],
                    'email': a['email'],
                    'role': a['role'],
                    'is_active': a['is_active'],
                    'created_at': a['created_at'].isoformat() if a['created_at'] else None
                }
                for a in admins
            ]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'admins': admins_list})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            username = body_data.get('username')
            password = body_data.get('password')
            email = body_data.get('email')
            role = body_data.get('role', 'admin')
            created_by = body_data.get('created_by')
            
            if not username or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'username and password are required'})
                }
            
            try:
                cursor.execute(
                    "INSERT INTO admins (username, password, email, role, created_by) VALUES (%s, %s, %s, %s, %s) RETURNING id, username, email, role",
                    (username, password, email, role, created_by)
                )
                new_admin = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'admin': {
                            'id': new_admin['id'],
                            'username': new_admin['username'],
                            'email': new_admin['email'],
                            'role': new_admin['role']
                        }
                    })
                }
            except psycopg2.IntegrityError:
                conn.rollback()
                return {
                    'statusCode': 409,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Username already exists'})
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'toggle_site':
                site_enabled = body_data.get('site_enabled', True)
                
                cursor.execute(
                    "UPDATE t_p8741694_magazin_samp.admins SET site_enabled = %s",
                    (site_enabled,)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'site_enabled': site_enabled})
                }
            
            admin_id = body_data.get('id')
            is_active = body_data.get('is_active')
            
            if admin_id is None:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'id is required'})
                }
            
            cursor.execute(
                "UPDATE t_p8741694_magazin_samp.admins SET is_active = %s WHERE id = %s RETURNING id",
                (is_active, admin_id)
            )
            result = cursor.fetchone()
            
            if not result:
                conn.rollback()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Admin not found'})
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {}) or {}
            admin_id = params.get('id')
            
            if not admin_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'id is required'})
                }
            
            cursor.execute("DELETE FROM admins WHERE id = %s RETURNING id", (admin_id,))
            result = cursor.fetchone()
            
            if not result:
                conn.rollback()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Admin not found'})
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
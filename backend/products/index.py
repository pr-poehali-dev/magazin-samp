"""
Business: API для управления товарами магазина SAMP
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами: request_id, function_name
Returns: HTTP response dict с товарами из базы данных
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            product_id = params.get('id')
            
            if product_id:
                cur.execute(
                    '''SELECT p.*, 
                       COALESCE(
                           json_agg(
                               json_build_object('id', pi.id, 'image_url', pi.image_url, 'is_primary', pi.is_primary, 'display_order', pi.display_order)
                               ORDER BY pi.display_order
                           ) FILTER (WHERE pi.id IS NOT NULL),
                           '[]'::json
                       ) as images
                       FROM products p
                       LEFT JOIN product_images pi ON p.id = pi.product_id
                       WHERE p.id = %s
                       GROUP BY p.id''',
                    (product_id,)
                )
                product = cur.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'product': product}, ensure_ascii=False, default=str),
                    'isBase64Encoded': False
                }
            else:
                cur.execute(
                    '''SELECT p.*, 
                       COALESCE(
                           json_agg(
                               json_build_object('id', pi.id, 'image_url', pi.image_url, 'is_primary', pi.is_primary)
                               ORDER BY pi.display_order
                           ) FILTER (WHERE pi.id IS NOT NULL),
                           '[]'::json
                       ) as images
                       FROM products p
                       LEFT JOIN product_images pi ON p.id = pi.product_id
                       GROUP BY p.id
                       ORDER BY p.id'''
                )
                products = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'products': products}, ensure_ascii=False, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'create_product')
            
            if action == 'create_product':
                title = body_data.get('title')
                price = body_data.get('price')
                description = body_data.get('description')
                icon = body_data.get('icon', 'Package')
                gradient = body_data.get('gradient', 'bg-gradient-primary')
                
                cur.execute(
                    "INSERT INTO products (title, price, description, icon, gradient) VALUES (%s, %s, %s, %s, %s) RETURNING *",
                    (title, price, description, icon, gradient)
                )
                conn.commit()
                new_product = cur.fetchone()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'product': new_product}, ensure_ascii=False, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'add_image':
                product_id = body_data.get('product_id')
                image_url = body_data.get('image_url')
                is_primary = body_data.get('is_primary', False)
                display_order = body_data.get('display_order', 0)
                
                cur.execute(
                    "INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (%s, %s, %s, %s) RETURNING *",
                    (product_id, image_url, is_primary, display_order)
                )
                conn.commit()
                new_image = cur.fetchone()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'image': new_image}, ensure_ascii=False, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            product_id = body_data.get('id')
            
            update_fields = []
            update_values = []
            
            for field in ['title', 'price', 'description', 'icon', 'gradient']:
                if field in body_data:
                    update_fields.append(f"{field} = %s")
                    update_values.append(body_data[field])
            
            if update_fields:
                update_values.append(product_id)
                query = f"UPDATE products SET {', '.join(update_fields)} WHERE id = %s RETURNING *"
                cur.execute(query, update_values)
                conn.commit()
                updated_product = cur.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'product': updated_product}, ensure_ascii=False, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            product_id = params.get('id')
            image_id = params.get('image_id')
            
            if image_id:
                cur.execute('DELETE FROM product_images WHERE id = %s', (image_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'Image deleted'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            elif product_id:
                cur.execute('DELETE FROM products WHERE id = %s', (product_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'Product deleted'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
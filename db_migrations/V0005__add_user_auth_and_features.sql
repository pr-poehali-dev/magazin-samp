-- Добавляем поля для Telegram авторизации в users
ALTER TABLE t_p8741694_magazin_samp.users 
ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Создаем таблицу сессий для авторизованных пользователей
CREATE TABLE IF NOT EXISTS t_p8741694_magazin_samp.user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p8741694_magazin_samp.users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON t_p8741694_magazin_samp.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON t_p8741694_magazin_samp.user_sessions(user_id);

-- Создаем таблицу для фотографий товаров
CREATE TABLE IF NOT EXISTS t_p8741694_magazin_samp.product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES t_p8741694_magazin_samp.products(id),
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON t_p8741694_magazin_samp.product_images(product_id);

-- Создаем таблицу для тикетов техподдержки
CREATE TABLE IF NOT EXISTS t_p8741694_magazin_samp.support_tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p8741694_magazin_samp.users(id),
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(50) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON t_p8741694_magazin_samp.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON t_p8741694_magazin_samp.support_tickets(status);

-- Создаем таблицу для сообщений в тикетах
CREATE TABLE IF NOT EXISTS t_p8741694_magazin_samp.support_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES t_p8741694_magazin_samp.support_tickets(id),
    user_id INTEGER REFERENCES t_p8741694_magazin_samp.users(id),
    admin_id INTEGER REFERENCES t_p8741694_magazin_samp.admins(id),
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_ticket ON t_p8741694_magazin_samp.support_messages(ticket_id);

-- Создаем таблицу для платежей
CREATE TABLE IF NOT EXISTS t_p8741694_magazin_samp.payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p8741694_magazin_samp.users(id),
    order_id INTEGER REFERENCES t_p8741694_magazin_samp.orders(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RUB',
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON t_p8741694_magazin_samp.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON t_p8741694_magazin_samp.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON t_p8741694_magazin_samp.payments(transaction_id);

-- Добавляем поле для автовыдачи товара в orders
ALTER TABLE t_p8741694_magazin_samp.orders
ADD COLUMN IF NOT EXISTS auto_delivery_content TEXT,
ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'Package',
    gradient VARCHAR(100) DEFAULT 'bg-gradient-primary',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    items JSONB NOT NULL,
    total_price INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'В обработке',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (title, price, description, icon, gradient) VALUES
    ('Готовый проект', '1000₽', 'Полностью готовый сервер SAMP', 'Package', 'bg-gradient-primary'),
    ('Мод Arizona RP', '250₽', 'Модификация для Arizona RP', 'Gamepad2', 'bg-gradient-secondary'),
    ('Мод Rodina RP', '250₽', 'Модификация для Rodina RP', 'Gamepad2', 'bg-gradient-accent'),
    ('Логи', '200₽', 'Система логирования сервера', 'FileText', 'bg-gradient-primary'),
    ('Лаунчер PC', '200₽', 'Лаунчер для ПК', 'Monitor', 'bg-gradient-secondary'),
    ('Лаунчер Mobile', '250₽', 'Мобильный лаунчер', 'Smartphone', 'bg-gradient-accent');

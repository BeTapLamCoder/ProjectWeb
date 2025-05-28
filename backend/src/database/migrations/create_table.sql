-- Tạo ENUM type cho role và order status nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('admin', 'customer');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
        CREATE TYPE order_status_enum AS ENUM ('pending', 'paid', 'shipped', 'completed', 'cancelled');
    END IF;
END $$;

-- USERS
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(255) PRIMARY KEY,
    username_name TEXT NOT NULL UNIQUE,
    password VARCHAR(80) NOT NULL,
    email VARCHAR(320) NOT NULL CHECK (
        email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    ),
    phone_number VARCHAR(10) CHECK (phone_number ~ '^0[0-9]{9}$'),
    role user_role_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORY
CREATE TABLE IF NOT EXISTS category (
    category_id VARCHAR(255) PRIMARY KEY,
    category_name TEXT NOT NULL,
    description TEXT
);

-- PRODUCT
CREATE TABLE IF NOT EXISTS product (
    product_id VARCHAR(255) PRIMARY KEY,
    product_name TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category_id VARCHAR(255) NOT NULL REFERENCES category (category_id),
    is_active BOOLEAN DEFAULT FALSE,
    image_url TEXT
);

-- CART
CREATE TABLE IF NOT EXISTS cart (
    cart_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users (user_id)
);

-- CART_DETAIL
CREATE TABLE IF NOT EXISTS cart_detail (
    cart_id VARCHAR(255) NOT NULL REFERENCES cart (cart_id),
    product_id VARCHAR(255) NOT NULL REFERENCES product (product_id),
    quantity INT NOT NULL,
    color VARCHAR(255) NOT NULL,
    size VARCHAR(255) NOT NULL,
    PRIMARY KEY (
        cart_id,
        product_id,
        size,
        color
    )
);

-- ORDER
CREATE TABLE IF NOT EXISTS "order" (
    order_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users (user_id),
    total_amount NUMERIC(10, 2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status order_status_enum NOT NULL,
    shipping_address TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    receiver_phone TEXT NOT NULL
);

-- ORDER_DETAIL
CREATE TABLE IF NOT EXISTS order_detail (
    order_id VARCHAR(255) NOT NULL REFERENCES "order" (order_id),
    product_id VARCHAR(255) NOT NULL REFERENCES product (product_id),
    quantity INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    color VARCHAR(255) NOT NULL,
    size VARCHAR(255) NOT NULL,
    PRIMARY KEY (
        order_id,
        product_id,
        size,
        color
    )
);

-- Tạo sequence cho từng bảng
CREATE SEQUENCE IF NOT EXISTS user_id_seq START 1;

CREATE SEQUENCE IF NOT EXISTS category_id_seq START 1;

CREATE SEQUENCE IF NOT EXISTS product_id_seq START 1;

CREATE SEQUENCE IF NOT EXISTS cart_id_seq START 1;

CREATE SEQUENCE IF NOT EXISTS order_id_seq START 1;

-- Thiết lập giá trị mặc định cho cột ID của từng bảng

ALTER TABLE users
ALTER COLUMN user_id
SET DEFAULT 'USR' || LPAD(
    nextval('user_id_seq')::TEXT,
    5,
    '0'
);

ALTER TABLE category
ALTER COLUMN category_id
SET DEFAULT 'CAT' || LPAD(
    nextval('category_id_seq')::TEXT,
    4,
    '0'
);

ALTER TABLE product
ALTER COLUMN product_id
SET DEFAULT 'PRD' || LPAD(
    nextval('product_id_seq')::TEXT,
    5,
    '0'
);

ALTER TABLE cart
ALTER COLUMN cart_id
SET DEFAULT 'CART' || LPAD(
    nextval('cart_id_seq')::TEXT,
    5,
    '0'
);

ALTER TABLE "order"
ALTER COLUMN order_id
SET DEFAULT 'ORD' || LPAD(
    nextval('order_id_seq')::TEXT,
    5,
    '0'
);
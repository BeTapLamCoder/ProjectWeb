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
    name TEXT NOT NULL,
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
    image_url TEXT,
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
    image_url TEXT,
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

-- USERS
INSERT INTO
    users (
        name,
        password,
        email,
        phone_number,
        role
    )
VALUES (
        'Super Admin',
        '$2b$10$4kC5QQAdURfxYQNnotjiGurrXhTufvbKExPkgERqTDFqHVxjLft7K',
        'admin@gmail.vn',
        '0123456789',
        'admin'
    ),
    (
        'Nguyen Danh',
        '$2b$10$4kC5QQAdURfxYQNnotjiGurrXhTufvbKExPkgERqTDFqHVxjLft7K',
        'usera@yody.vn',
        '0987654321',
        'customer'
    ),
    (
        'Tran Huy',
        '$2b$10$4kC5QQAdURfxYQNnotjiGurrXhTufvbKExPkgERqTDFqHVxjLft7K',
        'userb@yody.vn',
        '0911222333',
        'customer'
    );

-- CATEGORY
INSERT INTO
    category (category_name, description)
VALUES (
        'Shirts',
        'All kinds of shirts'
    ),
    (
        'Polo Shirts',
        'Polo shirts for men and women'
    ),
    (
        'Jeans',
        'Various jeans styles'
    );
-- PRODUCT
INSERT INTO
    product (
        product_name,
        description,
        price,
        category_id,
        is_active,
        image_url
    )
VALUES (
        'Basic White Shirt',
        'A classic white shirt',
        199,
        (
            SELECT category_id
            FROM category
            WHERE
                category_name = 'Shirts'
        ),
        TRUE,
        'https://buggy.yodycdn.com/images/product/81a8890c1dfbbe97a2bc500604f58d72.webp?width=987&height=1316'
    ),
    (
        'Blue Polo',
        'Comfortable blue polo shirt',
        199,
        (
            SELECT category_id
            FROM category
            WHERE
                category_name = 'Polo Shirts'
        ),
        TRUE,
        'https://buggy.yodycdn.com/images/product/feab5fe94eec59320275de33c6601515.webp?width=987&height=1316'
    ),
    (
        'Slim Fit Jeans',
        'Trendy slim fit jeans',
        199,
        (
            SELECT category_id
            FROM category
            WHERE
                category_name = 'Jeans'
        ),
        TRUE,
        'https://buggy.yodycdn.com/images/product/094fea61615890b116739f045687fd89.webp?width=987&height=1316'
    ),
    (
        'Áo khoác nam Bomber',
        'Áo khoác da thời trang cho nam',
        23,
        (
            SELECT category_id
            FROM category
            WHERE
                category_name = 'Shirts'
        ),
        true,
        'https://buggy.yodycdn.com/images/product/9a5062b7740c0fccf004863a50b423da.webp?width=987&height=1316'
    ),
    (
        'Quần Âu Nam Baggy Xếp Ly Trước',
        'Quần âu nam',
        21,
        (
            SELECT category_id
            FROM category
            WHERE
                category_name = 'Jeans'
        ),
        true,
        'https://buggy.yodycdn.com/images/product/c91886b010677ba3c3ff5c0c5e4546d5.webp?width=987&height=1316'
    ),
    (
        'Quần Âu Nam Cạp Di Động Kẻ Sọc',
        'Quần âu nam',
        16.50,
        (
            SELECT category_id
            FROM category
            WHERE
                category_name = 'Jeans'
        ),
        true,
        'https://buggy.yodycdn.com/images/product/9eb0e03279dec623a5e7dfe24d78e212.webp?width=987&height=1316'
    ),
    (
        'Quần Dài Âu Nam Cơ Bản Giữ Phom',
        'Quần âu nam',
        19,
        (
            SELECT category_id
            FROM category
            WHERE
                category_name = 'Jeans'
        ),
        true,
        'https://buggy.yodycdn.com/images/product/7403d1939d88caf1e06fa6fdcaa3807a.webp?width=987&height=1316'
    ),
    (
        'Thắt Lưng Nam Khoá Cài Kim Loại Viền Vuông',
        'Phụ kiện nam',
        19,
        (
            SELECT category_id
            FROM category
            WHERE
                category_name = 'Shirts'
        ),
        true,
        'https://buggy.yodycdn.com/images/product/1f869e2bf62801a73b6c4b5436a47bf5.webp?width=987&height=1316'
    ),
    (
        'Thắt Lưng Nam Da Trơn TLM4025',
        'Phụ kiện nam',
        19,
        (
            SELECT category_id
            FROM category
            WHERE
                category_name = 'Shirts'
        ),
        true,
        'https://buggy.yodycdn.com/images/product/7ae34f4f72d147881479b8369d7f925e.webp?width=987&height=1316'
    );
-- CART
INSERT INTO
    cart (user_id)
VALUES (
        (
            SELECT user_id
            FROM users
            WHERE
                email = 'usera@yody.vn'
        )
    ),
    (
        (
            SELECT user_id
            FROM users
            WHERE
                email = 'userb@yody.vn'
        )
    );

-- CART_DETAIL
INSERT INTO
    cart_detail (
        cart_id,
        product_id,
        quantity,
        color,
        size,
        image_url
    )
VALUES (
        (
            SELECT cart_id
            FROM cart
            LIMIT 1
        ),
        (
            SELECT product_id
            FROM product
            WHERE
                product_name = 'Basic White Shirt'
        ),
        2,
        'White',
        'M',
        'https://buggy.yodycdn.com/images/product/81a8890c1dfbbe97a2bc500604f58d72.webp?width=987&height=1316'
    ),
    (
        (
            SELECT cart_id
            FROM cart
            LIMIT 1
        ),
        (
            SELECT product_id
            FROM product
            WHERE
                product_name = 'Blue Polo'
        ),
        1,
        'Blue',
        'L',
        'https://buggy.yodycdn.com/images/product/feab5fe94eec59320275de33c6601515.webp?width=987&height=1316'
    );

-- ORDER
INSERT INTO
    "order" (
        user_id,
        total_amount,
        status,
        shipping_address,
        receiver_name,
        receiver_phone
    )
VALUES (
        (
            SELECT user_id
            FROM users
            WHERE
                email = 'usera@yody.vn'
        ),
        698000,
        'pending',
        '123 Main St, Hanoi',
        'Nguyen Van A',
        '0987654321'
    );

-- ORDER_DETAIL
INSERT INTO
    order_detail (
        order_id,
        product_id,
        quantity,
        price,
        color,
        size,
        image_url
    )
VALUES (
        (
            SELECT order_id
            FROM "order"
            LIMIT 1
        ),
        (
            SELECT product_id
            FROM product
            WHERE
                product_name = 'Basic White Shirt'
        ),
        2,
        299000,
        'White',
        'M',
        'https://buggy.yodycdn.com/images/product/81a8890c1dfbbe97a2bc500604f58d72.webp?width=987&height=1316'
    ),
    (
        (
            SELECT order_id
            FROM "order"
            LIMIT 1
        ),
        (
            SELECT product_id
            FROM product
            WHERE
                product_name = 'Blue Polo'
        ),
        1,
        399000,
        'Blue',
        'L',
        'https://buggy.yodycdn.com/images/product/feab5fe94eec59320275de33c6601515.webp?width=987&height=1316'
    );
-- Tạo ENUM type cho role và order status nếu chưa có
CREATE TABLE product_category (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_product_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE product (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    sku VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    unit VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'UNIT',
    sale_price DECIMAL(13,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    tracks_stock BOOLEAN NOT NULL DEFAULT TRUE,
    minimum_stock DECIMAL(13,3) NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_product_sku (sku),
    KEY ix_product_active_name (active, name, id),
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES product_category(id),
    CONSTRAINT ck_product_price CHECK (sale_price >= 0),
    CONSTRAINT ck_product_minimum CHECK (minimum_stock >= 0),
    CONSTRAINT ck_product_unit CHECK (unit = 'UNIT')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE stock_balance (
    product_id BIGINT NOT NULL,
    quantity DECIMAL(13,3) NOT NULL DEFAULT 0,
    updated_at DATETIME(6) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id),
    CONSTRAINT fk_stock_balance_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT ck_stock_balance_non_negative CHECK (quantity >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE stock_movement (
    id BIGINT NOT NULL AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    movement_type VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    quantity DECIMAL(13,3) NOT NULL,
    previous_quantity DECIMAL(13,3) NOT NULL,
    resulting_quantity DECIMAL(13,3) NOT NULL,
    reason VARCHAR(240) NOT NULL,
    actor_user_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY ix_stock_movement_product_time (product_id, created_at, id),
    CONSTRAINT fk_stock_movement_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT fk_stock_movement_actor FOREIGN KEY (actor_user_id) REFERENCES app_user(id),
    CONSTRAINT ck_stock_movement_quantity CHECK (quantity > 0),
    CONSTRAINT ck_stock_movement_result CHECK (resulting_quantity >= 0),
    CONSTRAINT ck_stock_movement_type CHECK (movement_type IN ('ENTRY', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


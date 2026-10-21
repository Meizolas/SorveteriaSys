ALTER TABLE stock_movement DROP CHECK ck_stock_movement_type;
ALTER TABLE stock_movement ADD CONSTRAINT ck_stock_movement_type
    CHECK (movement_type IN ('ENTRY', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'SALE_OUT'));

CREATE TABLE sale (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NULL,
    idempotency_key CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    request_fingerprint CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    operator_user_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    subtotal DECIMAL(13,2) NOT NULL,
    discount DECIMAL(13,2) NOT NULL DEFAULT 0,
    total DECIMAL(13,2) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_sale_code (code),
    UNIQUE KEY uk_sale_idempotency (idempotency_key),
    KEY ix_sale_created (created_at, id),
    CONSTRAINT fk_sale_operator FOREIGN KEY (operator_user_id) REFERENCES app_user(id),
    CONSTRAINT ck_sale_status CHECK (status = 'COMPLETED'),
    CONSTRAINT ck_sale_values CHECK (subtotal >= 0 AND discount >= 0 AND total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE sale_item (
    id BIGINT NOT NULL AUTO_INCREMENT,
    sale_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_sku VARCHAR(40) NOT NULL,
    product_name VARCHAR(120) NOT NULL,
    unit VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    unit_price DECIMAL(13,2) NOT NULL,
    quantity DECIMAL(13,3) NOT NULL,
    line_total DECIMAL(13,2) NOT NULL,
    PRIMARY KEY (id),
    KEY ix_sale_item_sale (sale_id, id),
    CONSTRAINT fk_sale_item_sale FOREIGN KEY (sale_id) REFERENCES sale(id),
    CONSTRAINT fk_sale_item_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT ck_sale_item_values CHECK (unit_price >= 0 AND quantity > 0 AND line_total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE payment (
    id BIGINT NOT NULL AUTO_INCREMENT,
    sale_id BIGINT NOT NULL,
    method VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    received_amount DECIMAL(13,2) NOT NULL,
    applied_amount DECIMAL(13,2) NOT NULL,
    change_amount DECIMAL(13,2) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_payment_sale (sale_id),
    CONSTRAINT fk_payment_sale FOREIGN KEY (sale_id) REFERENCES sale(id),
    CONSTRAINT ck_payment_method CHECK (method IN ('CASH', 'PIX', 'CARD')),
    CONSTRAINT ck_payment_values CHECK (received_amount >= 0 AND applied_amount >= 0 AND change_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

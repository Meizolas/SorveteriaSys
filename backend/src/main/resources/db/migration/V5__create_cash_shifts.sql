CREATE TABLE cash_shift (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NULL,
    operator_user_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    opening_amount DECIMAL(13,2) NOT NULL,
    counted_amount DECIMAL(13,2) NULL,
    difference_amount DECIMAL(13,2) NULL,
    closing_reason VARCHAR(240) NULL,
    opened_at DATETIME(6) NOT NULL,
    closed_at DATETIME(6) NULL,
    version BIGINT NOT NULL DEFAULT 0,
    open_guard TINYINT GENERATED ALWAYS AS (CASE WHEN status = 'OPEN' THEN 1 ELSE NULL END) STORED,
    PRIMARY KEY (id),
    UNIQUE KEY uk_cash_shift_code (code),
    UNIQUE KEY uk_cash_shift_single_open (open_guard),
    KEY ix_cash_shift_opened (opened_at, id),
    CONSTRAINT fk_cash_shift_operator FOREIGN KEY (operator_user_id) REFERENCES app_user(id),
    CONSTRAINT ck_cash_shift_status CHECK (status IN ('OPEN', 'CLOSED')),
    CONSTRAINT ck_cash_shift_values CHECK (opening_amount >= 0 AND counted_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE cash_movement (
    id BIGINT NOT NULL AUTO_INCREMENT,
    cash_shift_id BIGINT NOT NULL,
    movement_type VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    amount DECIMAL(13,2) NOT NULL,
    reason VARCHAR(240) NOT NULL,
    sale_id BIGINT NULL,
    actor_user_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_cash_movement_sale (sale_id),
    KEY ix_cash_movement_shift (cash_shift_id, created_at, id),
    CONSTRAINT fk_cash_movement_shift FOREIGN KEY (cash_shift_id) REFERENCES cash_shift(id),
    CONSTRAINT fk_cash_movement_sale FOREIGN KEY (sale_id) REFERENCES sale(id),
    CONSTRAINT fk_cash_movement_actor FOREIGN KEY (actor_user_id) REFERENCES app_user(id),
    CONSTRAINT ck_cash_movement_type CHECK (movement_type IN ('OPENING', 'SUPPLY', 'WITHDRAWAL', 'CASH_SALE')),
    CONSTRAINT ck_cash_movement_amount CHECK (amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE sale ADD COLUMN cash_shift_id BIGINT NULL AFTER operator_user_id;
ALTER TABLE sale ADD KEY ix_sale_cash_shift (cash_shift_id, created_at, id);
ALTER TABLE sale ADD CONSTRAINT fk_sale_cash_shift FOREIGN KEY (cash_shift_id) REFERENCES cash_shift(id);

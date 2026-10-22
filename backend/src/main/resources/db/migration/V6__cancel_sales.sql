DELIMITER //
CREATE PROCEDURE migrate_sale_cancellation()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'sale' AND column_name = 'canceled_at'
    ) THEN
        ALTER TABLE sale DROP CHECK ck_sale_status;
        ALTER TABLE sale ADD CONSTRAINT ck_sale_status CHECK (status IN ('COMPLETED', 'CANCELED'));
        ALTER TABLE sale
            ADD COLUMN canceled_at DATETIME(6) NULL AFTER created_at,
            ADD COLUMN canceled_by BIGINT UNSIGNED NULL AFTER canceled_at,
            ADD COLUMN cancellation_reason VARCHAR(240) NULL AFTER canceled_by,
            ADD CONSTRAINT fk_sale_canceled_by FOREIGN KEY (canceled_by) REFERENCES app_user(id);
        ALTER TABLE stock_movement DROP CHECK ck_stock_movement_type;
        ALTER TABLE stock_movement ADD CONSTRAINT ck_stock_movement_type
            CHECK (movement_type IN ('ENTRY', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'SALE_OUT', 'SALE_RETURN'));
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE() AND table_name = 'cash_movement'
          AND index_name = 'uk_cash_movement_sale'
    ) THEN
        ALTER TABLE cash_movement DROP FOREIGN KEY fk_cash_movement_sale;
        ALTER TABLE cash_movement DROP INDEX uk_cash_movement_sale;
        ALTER TABLE cash_movement ADD UNIQUE KEY uk_cash_movement_sale_type (sale_id, movement_type);
        ALTER TABLE cash_movement ADD CONSTRAINT fk_cash_movement_sale FOREIGN KEY (sale_id) REFERENCES sale(id);
        ALTER TABLE cash_movement DROP CHECK ck_cash_movement_type;
        ALTER TABLE cash_movement ADD CONSTRAINT ck_cash_movement_type
            CHECK (movement_type IN ('OPENING', 'SUPPLY', 'WITHDRAWAL', 'CASH_SALE', 'CASH_REFUND'));
    END IF;
END//
CALL migrate_sale_cancellation()//
DROP PROCEDURE migrate_sale_cancellation//
DELIMITER ;

ALTER TABLE product
    DROP CHECK ck_product_unit,
    ADD CONSTRAINT ck_product_unit CHECK (unit IN ('UNIT', 'KG'));

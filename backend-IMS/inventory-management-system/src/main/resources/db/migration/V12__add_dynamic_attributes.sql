-- V12__add_dynamic_attributes.sql

-- 1. Add material and attributes to products table
ALTER TABLE products 
    ADD COLUMN material VARCHAR(100) AFTER brand,
    ADD COLUMN attributes TEXT AFTER material;

-- 2. Add dynamic columns to invoice_items table
ALTER TABLE invoice_items
    ADD COLUMN size VARCHAR(100) AFTER hsn_code,
    ADD COLUMN color VARCHAR(100) AFTER size,
    ADD COLUMN brand VARCHAR(100) AFTER color,
    ADD COLUMN material VARCHAR(100) AFTER brand,
    ADD COLUMN attributes TEXT AFTER material;

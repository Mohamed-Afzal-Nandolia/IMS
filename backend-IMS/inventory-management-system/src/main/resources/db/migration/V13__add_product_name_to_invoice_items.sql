-- V13__add_product_name_to_invoice_items.sql
-- Add missing product_name column to invoice_items table
ALTER TABLE invoice_items
    ADD COLUMN product_name VARCHAR(255) AFTER product_id;

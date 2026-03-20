-- V11__add_invoice_item_base_fields.sql

-- Add unit and hsn_code to invoice_items table
ALTER TABLE invoice_items
    ADD COLUMN unit VARCHAR(50) AFTER total_price,
    ADD COLUMN hsn_code VARCHAR(20) AFTER unit;

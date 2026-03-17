-- V7__add_purchase_prefix_to_business.sql
-- Adds purchase_invoice_prefix to businesses table

ALTER TABLE businesses
    ADD COLUMN purchase_invoice_prefix VARCHAR(20) DEFAULT 'PUR' AFTER invoice_prefix;

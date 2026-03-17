-- V8__remove_invoice_status.sql
-- Removes the status column from the invoices table

ALTER TABLE invoices
    DROP COLUMN status;

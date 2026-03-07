-- V2__add_business_settings_fields.sql
-- Adds missing configuration and profile fields to businesses table

ALTER TABLE businesses
ADD COLUMN city VARCHAR(255),
ADD COLUMN state VARCHAR(255),
ADD COLUMN pincode VARCHAR(20),
ADD COLUMN bank_name VARCHAR(255),
ADD COLUMN account_number VARCHAR(100),
ADD COLUMN ifsc_code VARCHAR(50),
ADD COLUMN upi_id VARCHAR(100),
ADD COLUMN invoice_prefix VARCHAR(20) DEFAULT 'INV',
ADD COLUMN invoice_terms TEXT,
ADD COLUMN invoice_notes TEXT,
ADD COLUMN show_bank_details BOOLEAN DEFAULT TRUE,
ADD COLUMN show_upi_qr BOOLEAN DEFAULT TRUE,
ADD COLUMN show_digital_signature BOOLEAN DEFAULT TRUE,
ADD COLUMN low_stock_alert BOOLEAN DEFAULT TRUE,
ADD COLUMN new_invoice_alert BOOLEAN DEFAULT TRUE,
ADD COLUMN payment_received_alert BOOLEAN DEFAULT TRUE,
ADD COLUMN overdue_invoices_alert BOOLEAN DEFAULT TRUE;

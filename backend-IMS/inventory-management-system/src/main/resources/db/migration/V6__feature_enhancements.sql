-- V6__feature_enhancements.sql
-- IMS Pro Feature Enhancements: Departments, Subcategories, Product Templates,
-- Min Stock Level, SKU/Invoice prefix counters

-- =====================================================================
-- 1. DEPARTMENTS TABLE
-- =====================================================================
CREATE TABLE departments (
    id              VARCHAR(36)  PRIMARY KEY,
    business_id     VARCHAR(36)  NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN      DEFAULT TRUE,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX idx_departments_business ON departments(business_id);

-- =====================================================================
-- 2. ADD department_id TO categories
--    (parent_id already exists for subcategories)
-- =====================================================================
ALTER TABLE categories
    ADD COLUMN department_id VARCHAR(36) NULL AFTER business_id;

ALTER TABLE categories
    ADD CONSTRAINT fk_categories_department
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

CREATE INDEX idx_categories_department ON categories(department_id);

-- =====================================================================
-- 3. PRODUCT TEMPLATES TABLE
-- =====================================================================
CREATE TABLE product_templates (
    id            VARCHAR(36)  PRIMARY KEY,
    business_id   VARCHAR(36)  NOT NULL,
    template_type VARCHAR(100) NOT NULL, -- e.g. 'SIZE', 'COLOR', 'MATERIAL'
    label         VARCHAR(255) NOT NULL,
    is_system     BOOLEAN      DEFAULT FALSE, -- TRUE = seeded default, not deletable
    sort_order    INT          DEFAULT 0,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE product_template_values (
    id          VARCHAR(36)  PRIMARY KEY,
    template_id VARCHAR(36)  NOT NULL,
    value       VARCHAR(255) NOT NULL,
    sort_order  INT          DEFAULT 0,
    FOREIGN KEY (template_id) REFERENCES product_templates(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_templates_business ON product_templates(business_id);

-- =====================================================================
-- 4. ADDITIONAL COLUMNS ON businesses
-- =====================================================================
ALTER TABLE businesses
    ADD COLUMN global_min_stock_level   INT          DEFAULT 10  AFTER overdue_invoices_alert,
    ADD COLUMN sku_prefix               VARCHAR(20)  DEFAULT 'SKU' AFTER global_min_stock_level,
    ADD COLUMN sku_counter              INT          DEFAULT 1   AFTER sku_prefix,
    ADD COLUMN purchase_invoice_counter INT          DEFAULT 1   AFTER sku_counter,
    ADD COLUMN sales_invoice_counter    INT          DEFAULT 1   AFTER purchase_invoice_counter;

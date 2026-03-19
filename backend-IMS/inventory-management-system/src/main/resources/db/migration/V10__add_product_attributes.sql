-- V10__product_attributes_and_master_templates.sql
-- 1. Add retail-specific attributes to the products table
ALTER TABLE products 
    ADD COLUMN size VARCHAR(50) AFTER description,
    ADD COLUMN color VARCHAR(50) AFTER size,
    ADD COLUMN brand VARCHAR(100) AFTER color,
    ADD COLUMN discount_rate DECIMAL(5, 2) DEFAULT 0.00 AFTER brand;

-- 2. Create Master Template Registry
CREATE TABLE master_product_templates (
    id            VARCHAR(36)  PRIMARY KEY,
    template_type VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'SIZE', 'COLOR'
    label         VARCHAR(255) NOT NULL,
    sort_order    INT          DEFAULT 0,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master_product_template_values (
    id          VARCHAR(36)  PRIMARY KEY,
    template_id VARCHAR(36)  NOT NULL,
    value       VARCHAR(255) NOT NULL,
    sort_order  INT          DEFAULT 0,
    FOREIGN KEY (template_id) REFERENCES master_product_templates(id) ON DELETE CASCADE
);

-- 3. Seed Master Data (Retail Essentials)
-- Note: 'BRAND' is excluded as requested to allow full manual entry only.

INSERT INTO master_product_templates (id, template_type, label, sort_order) VALUES
('m-sz-1', 'SIZE', 'Size', 1),
('m-cl-1', 'COLOR', 'Color', 2),
('m-mt-1', 'MATERIAL', 'Material', 3);

-- Seed Master Values for Size
INSERT INTO master_product_template_values (id, template_id, value, sort_order) VALUES
(UUID(), 'm-sz-1', 'XS', 1),
(UUID(), 'm-sz-1', 'S', 2),
(UUID(), 'm-sz-1', 'M', 3),
(UUID(), 'm-sz-1', 'L', 4),
(UUID(), 'm-sz-1', 'XL', 5),
(UUID(), 'm-sz-1', 'XXL', 6),
(UUID(), 'm-sz-1', 'XXXL', 7);

-- Seed Master Values for Color
INSERT INTO master_product_template_values (id, template_id, value, sort_order) VALUES
(UUID(), 'm-cl-1', 'Black', 1),
(UUID(), 'm-cl-1', 'White', 2),
(UUID(), 'm-cl-1', 'Red', 3),
(UUID(), 'm-cl-1', 'Blue', 4),
(UUID(), 'm-cl-1', 'Green', 5),
(UUID(), 'm-cl-1', 'Yellow', 6),
(UUID(), 'm-cl-1', 'Pink', 7),
(UUID(), 'm-cl-1', 'Purple', 8);

-- Seed Master Values for Material
INSERT INTO master_product_template_values (id, template_id, value, sort_order) VALUES
(UUID(), 'm-mt-1', 'Cotton', 1),
(UUID(), 'm-mt-1', 'Polyester', 2),
(UUID(), 'm-mt-1', 'Silk', 3),
(UUID(), 'm-mt-1', 'Wool', 4),
(UUID(), 'm-mt-1', 'Leather', 5),
(UUID(), 'm-mt-1', 'Denim', 6);

-- Add Unit to Master Template Registry
INSERT INTO master_product_templates (id, template_type, label, sort_order) VALUES
('m-un-1', 'UNIT', 'Unit', 4);

-- Seed Master Values for Unit
INSERT INTO master_product_template_values (id, template_id, value, sort_order) VALUES
(UUID(), 'm-un-1', 'pcs', 1),
(UUID(), 'm-un-1', 'kg', 2),
(UUID(), 'm-un-1', 'g', 3),
(UUID(), 'm-un-1', 'm', 4),
(UUID(), 'm-un-1', 'l', 5),
(UUID(), 'm-un-1', 'ml', 6),
(UUID(), 'm-un-1', 'box', 7),
(UUID(), 'm-un-1', 'pack', 8),
(UUID(), 'm-un-1', 'ton', 9);

-- V1__init.sql
-- Complete MySQL Schema for IMS Pro
-- Matches the expected structure from the frontend React hooks

CREATE TABLE businesses (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    gstin VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id VARCHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    hsn_code VARCHAR(50),
    sac_code VARCHAR(50),
    category_id VARCHAR(36),
    unit VARCHAR(50) DEFAULT 'pcs',
    selling_price DECIMAL(10, 2) DEFAULT 0,
    purchase_price DECIMAL(10, 2) DEFAULT 0,
    mrp DECIMAL(10, 2) DEFAULT 0,
    gst_rate DECIMAL(5, 2) DEFAULT 18,
    cess_rate DECIMAL(5, 2) DEFAULT 0,
    current_stock DECIMAL(10, 2) DEFAULT 0,
    opening_stock DECIMAL(10, 2) DEFAULT 0,
    min_stock_level DECIMAL(10, 2) DEFAULT 10,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE parties (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'customer' or 'supplier'
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    gstin VARCHAR(50),
    billing_address TEXT,
    shipping_address TEXT,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL,
    party_id VARCHAR(36) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'sale', 'purchase', 'sales_return', 'purchase_return'
    invoice_number VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'draft', 'pending', 'paid', 'overdue'
    issue_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(15, 2) DEFAULT 0,
    total_tax DECIMAL(15, 2) DEFAULT 0,
    cgst_amount DECIMAL(15, 2) DEFAULT 0,
    sgst_amount DECIMAL(15, 2) DEFAULT 0,
    igst_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE
);

CREATE TABLE invoice_items (
    id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit_price DECIMAL(10, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE stock_adjustments (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'increase' or 'decrease'
    quantity DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Adding some indexes for performance
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_invoices_business_type ON invoices(business_id, type);
CREATE INDEX idx_invoices_party ON invoices(party_id);

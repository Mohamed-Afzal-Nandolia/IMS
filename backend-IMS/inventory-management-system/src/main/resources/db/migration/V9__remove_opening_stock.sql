-- Migration to remove unused opening_stock column from products table
ALTER TABLE products DROP COLUMN opening_stock;

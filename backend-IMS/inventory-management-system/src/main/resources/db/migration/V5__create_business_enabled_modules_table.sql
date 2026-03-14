CREATE TABLE business_enabled_modules (
    business_id VARCHAR(36) NOT NULL,
    module VARCHAR(255) NOT NULL,
    CONSTRAINT fk_business_enabled_modules_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

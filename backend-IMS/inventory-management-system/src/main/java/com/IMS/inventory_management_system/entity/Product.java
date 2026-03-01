package com.IMS.inventory_management_system.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @Column(length = 36)
    private String id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private String name;

    @Column(length = 100)
    private String sku;

    @Column(name = "hsn_code", length = 50)
    private String hsnCode;

    @Column(name = "sac_code", length = 50)
    private String sacCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(length = 50, columnDefinition = "varchar(50) default 'pcs'")
    private String unit = "pcs";

    @Column(name = "selling_price", precision = 10, scale = 2)
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Column(name = "purchase_price", precision = 10, scale = 2)
    private BigDecimal purchasePrice = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal mrp = BigDecimal.ZERO;

    @Column(name = "gst_rate", precision = 5, scale = 2)
    private BigDecimal gstRate = new BigDecimal("18.00");

    @Column(name = "cess_rate", precision = 5, scale = 2)
    private BigDecimal cessRate = BigDecimal.ZERO;

    @Column(name = "current_stock", precision = 10, scale = 2)
    private BigDecimal currentStock = BigDecimal.ZERO;

    @Column(name = "opening_stock", precision = 10, scale = 2)
    private BigDecimal openingStock = BigDecimal.ZERO;

    @Column(name = "min_stock_level", precision = 10, scale = 2)
    private BigDecimal minStockLevel = new BigDecimal("10.00");

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", columnDefinition = "boolean default true")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 100)
    private String sku;

    @Column(name = "hsn_code", length = 20)
    private String hsnCode;

    @Column(name = "sac_code", length = 20)
    private String sacCode;

    @Column(length = 50)
    private String unit;

    @Builder.Default
    @Column(name = "selling_price", precision = 15, scale = 2)
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "purchase_price", precision = 15, scale = 2)
    private BigDecimal purchasePrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 15, scale = 2)
    private BigDecimal mrp = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "gst_rate", precision = 15, scale = 2)
    private BigDecimal gstRate = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "cess_rate", precision = 15, scale = 2)
    private BigDecimal cessRate = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "current_stock", precision = 15, scale = 3)
    private BigDecimal currentStock = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "min_stock_level", precision = 15, scale = 3)
    private BigDecimal minStockLevel = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(length = 100)
    private String size;

    @Column(length = 100)
    private String color;

    @Column(length = 100)
    private String brand;

    @Column(length = 100)
    private String material;

    @Column(name = "discount_rate", precision = 5, scale = 2)
    private java.math.BigDecimal discountRate;

    @Column(columnDefinition = "TEXT")
    private String attributes; // JSON string

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

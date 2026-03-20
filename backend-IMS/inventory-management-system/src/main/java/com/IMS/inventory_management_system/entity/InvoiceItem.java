package com.IMS.inventory_management_system.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;

@Entity
@Table(name = "invoice_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {

    @Id
    @Column(length = 36)
    private String id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "product_name")
    private String productName;

    @Builder.Default
    @Column(precision = 15, scale = 3)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "unit_price", precision = 15, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "tax_rate", precision = 15, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "tax_amount", precision = 15, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_price", precision = 15, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Column(length = 50)
    private String unit;

    @Column(name = "hsn_code", length = 20)
    private String hsnCode;

    @Column(length = 100)
    private String size;

    @Column(length = 100)
    private String color;

    @Column(length = 100)
    private String brand;

    @Column(length = 100)
    private String material;

    @Column(columnDefinition = "TEXT")
    private String attributes; // JSON string
}

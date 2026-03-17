package com.IMS.inventory_management_system.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "product_template_values")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductTemplateValue {

    @Id
    @Column(length = 36)
    private String id;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private ProductTemplate template;

    @Column(nullable = false)
    private String value;

    @Column(name = "sort_order", columnDefinition = "integer default 0")
    private Integer sortOrder = 0;
}

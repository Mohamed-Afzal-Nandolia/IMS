package com.IMS.inventory_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "master_product_template_values")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MasterProductTemplateValue {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne
    @JoinColumn(name = "template_id", nullable = false)
    private MasterProductTemplate template;

    @Column(nullable = false)
    private String value;

    @Column(name = "sort_order")
    private Integer sortOrder;
}

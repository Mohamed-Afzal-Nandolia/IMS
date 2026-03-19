package com.IMS.inventory_management_system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "master_product_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MasterProductTemplate {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "template_type", nullable = false, unique = true, length = 100)
    private String templateType;

    @Column(nullable = false)
    private String label;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<MasterProductTemplateValue> values;
}

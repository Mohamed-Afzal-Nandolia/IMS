package com.IMS.inventory_management_system.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "businesses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Business {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String name;

    private String email;
    private String phone;
    private String gstin;

    @Column(columnDefinition = "TEXT")
    private String address;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<Category> categories;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<Product> products;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<Party> parties;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<Invoice> invoices;
}

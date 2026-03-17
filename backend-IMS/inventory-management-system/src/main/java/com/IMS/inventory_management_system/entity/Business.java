package com.IMS.inventory_management_system.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    @Column(unique = true, length = 100)
    private String slug;

    private String email;
    private String phone;
    private String gstin;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String city;
    private String state;
    private String pincode;

    // Bank Details
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String upiId;

    // Invoice Settings
    private String invoicePrefix;
    @Column(length = 20, columnDefinition = "varchar(20) default 'PUR'")
    @Builder.Default
    private String purchaseInvoicePrefix = "PUR";
    @Column(columnDefinition = "TEXT")
    private String invoiceTerms;
    @Column(columnDefinition = "TEXT")
    private String invoiceNotes;
    private Boolean showBankDetails;
    private Boolean showUpiQr;
    private Boolean showDigitalSignature;

    // Notifications
    private Boolean lowStockAlert;
    private Boolean newInvoiceAlert;
    private Boolean paymentReceivedAlert;
    private Boolean overdueInvoicesAlert;
    
    @Column(columnDefinition = "integer default 10")
    @Builder.Default
    private Integer globalMinStockLevel = 10;
    
    @Column(columnDefinition = "varchar(20) default 'SKU'")
    @Builder.Default
    private String skuPrefix = "SKU";
    
    @Column(columnDefinition = "integer default 1")
    @Builder.Default
    private Integer skuCounter = 1;
    
    @Column(columnDefinition = "integer default 1")
    @Builder.Default
    private Integer purchaseInvoiceCounter = 1;

    @Column(columnDefinition = "integer default 1")
    @Builder.Default
    private Integer salesInvoiceCounter = 1;

    @Column(name = "is_active", columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean isActive = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "business_enabled_modules", joinColumns = @JoinColumn(name = "business_id"))
    @Column(name = "module")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<com.IMS.inventory_management_system.enums.Modules> enabledModules = new HashSet<>();

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

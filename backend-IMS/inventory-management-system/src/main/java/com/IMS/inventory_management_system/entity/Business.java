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
    @Column(columnDefinition = "TEXT")
    private String invoiceTerms;
    @Column(columnDefinition = "TEXT")
    private String invoiceNotes;
    private boolean showBankDetails;
    private boolean showUpiQr;
    private boolean showDigitalSignature;

    // Notifications
    private boolean lowStockAlert;
    private boolean newInvoiceAlert;
    private boolean paymentReceivedAlert;
    private boolean overdueInvoicesAlert;

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

package com.IMS.inventory_management_system.repository;

import com.IMS.inventory_management_system.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, String> {
    List<InvoiceItem> findByInvoiceId(String invoiceId);
}

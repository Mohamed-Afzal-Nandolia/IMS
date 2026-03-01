package com.IMS.inventory_management_system.repository;

import com.IMS.inventory_management_system.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    List<Invoice> findByBusinessId(String businessId);

    List<Invoice> findByBusinessIdAndType(String businessId, String type);
}

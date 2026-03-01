package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.dto.InvoiceRequest;
import com.IMS.inventory_management_system.entity.Invoice;
import com.IMS.inventory_management_system.entity.InvoiceItem;
import com.IMS.inventory_management_system.entity.Product;
import com.IMS.inventory_management_system.repository.InvoiceItemRepository;
import com.IMS.inventory_management_system.repository.InvoiceRepository;
import com.IMS.inventory_management_system.repository.PartyRepository;
import com.IMS.inventory_management_system.repository.ProductRepository;
import com.IMS.inventory_management_system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final PartyRepository partyRepository;
    private final ProductRepository productRepository;

    public List<Invoice> getAllInvoices(String type) {
        String businessId = SecurityUtils.getCurrentBusinessId();
        if (type != null && !type.isEmpty()) {
            return invoiceRepository.findByBusinessIdAndType(businessId, type);
        }
        return invoiceRepository.findByBusinessId(businessId);
    }

    public List<InvoiceItem> getInvoiceItems(String invoiceId) {
        return invoiceItemRepository.findByInvoiceId(invoiceId);
    }

    @Transactional
    public Invoice createInvoice(InvoiceRequest request) {
        Invoice invoice = request.getInvoice();
        invoice.setId(UUID.randomUUID().toString());
        invoice.setBusiness(SecurityUtils.getCurrentUser().getBusiness());

        if (invoice.getIssueDate() == null)
            invoice.setIssueDate(LocalDate.now());
        if (invoice.getStatus() == null)
            invoice.setStatus("completed"); // Or derived based on payment

        // Validate Party
        if (invoice.getParty() != null && invoice.getParty().getId() != null) {
            partyRepository.findById(invoice.getParty().getId()).ifPresent(invoice::setParty);
        }

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Process Items and update Inventory
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (InvoiceItem item : request.getItems()) {
                item.setId(UUID.randomUUID().toString());
                item.setInvoice(savedInvoice);

                // Fetch real product to update stock
                Product product = productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found"));

                item.setProduct(product);
                invoiceItemRepository.save(item);

                // Update Stock based on transaction type
                if ("sale".equalsIgnoreCase(invoice.getType())
                        || "purchase_return".equalsIgnoreCase(invoice.getType())) {
                    product.setCurrentStock(product.getCurrentStock().subtract(item.getQuantity()));
                } else if ("purchase".equalsIgnoreCase(invoice.getType())
                        || "sales_return".equalsIgnoreCase(invoice.getType())) {
                    product.setCurrentStock(product.getCurrentStock().add(item.getQuantity()));
                }
                productRepository.save(product);
            }
        }

        return savedInvoice;
    }

    @Transactional
    public void deleteInvoice(String id) {
        Invoice existing = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));

        if (!existing.getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new IllegalStateException("Unauthorized access");
        }

        // Revert Stock
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(id);
        for (InvoiceItem item : items) {
            Product product = item.getProduct();
            if ("sale".equalsIgnoreCase(existing.getType()) || "purchase_return".equalsIgnoreCase(existing.getType())) {
                product.setCurrentStock(product.getCurrentStock().add(item.getQuantity()));
            } else if ("purchase".equalsIgnoreCase(existing.getType())
                    || "sales_return".equalsIgnoreCase(existing.getType())) {
                product.setCurrentStock(product.getCurrentStock().subtract(item.getQuantity()));
            }
            productRepository.save(product);
        }

        invoiceRepository.delete(existing);
    }
}

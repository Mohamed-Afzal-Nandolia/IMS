package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.dto.InvoiceRequest;
import com.IMS.inventory_management_system.entity.Invoice;
import com.IMS.inventory_management_system.entity.InvoiceItem;
import com.IMS.inventory_management_system.entity.Product;
import com.IMS.inventory_management_system.repository.BusinessRepository;
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
    private final BusinessRepository businessRepository;

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
        com.IMS.inventory_management_system.entity.Business business = businessRepository.findById(SecurityUtils.getCurrentBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));
        invoice.setBusiness(business);

        if (invoice.getIssueDate() == null)
            invoice.setIssueDate(LocalDate.now());

        // Validate Party
        if (invoice.getParty() != null && invoice.getParty().getId() != null) {
            partyRepository.findById(invoice.getParty().getId()).ifPresent(invoice::setParty);
        }

        // Auto-generate invoice number if not provided
        if (invoice.getInvoiceNumber() == null || invoice.getInvoiceNumber().trim().isEmpty()) {
            String prefix = business.getInvoicePrefix() != null ? business.getInvoicePrefix() : "INV";

            if ("purchase".equalsIgnoreCase(invoice.getType())
                    || "purchase_return".equalsIgnoreCase(invoice.getType())) {
                String pPrefix = business.getPurchaseInvoicePrefix() != null ? business.getPurchaseInvoicePrefix() : "PUR";
                int counter = business.getPurchaseInvoiceCounter() != null ? business.getPurchaseInvoiceCounter() : 1;
                invoice.setInvoiceNumber(String.format("%s-%05d", pPrefix, counter));
                business.setPurchaseInvoiceCounter(counter + 1);
            } else {
                int counter = business.getSalesInvoiceCounter() != null ? business.getSalesInvoiceCounter() : 1;
                invoice.setInvoiceNumber(String.format("%s-%05d", prefix, counter));
                business.setSalesInvoiceCounter(counter + 1);
            }
            businessRepository.save(business);
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
                BigDecimal currentStock = product.getCurrentStock() != null ? product.getCurrentStock()
                        : BigDecimal.ZERO;
                if ("sale".equalsIgnoreCase(invoice.getType())
                        || "purchase_return".equalsIgnoreCase(invoice.getType())) {
                    product.setCurrentStock(currentStock.subtract(item.getQuantity()));
                } else if ("purchase".equalsIgnoreCase(invoice.getType())
                        || "sales_return".equalsIgnoreCase(invoice.getType())) {
                    product.setCurrentStock(currentStock.add(item.getQuantity()));
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

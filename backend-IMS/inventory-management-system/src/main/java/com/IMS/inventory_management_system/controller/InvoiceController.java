package com.IMS.inventory_management_system.controller;

import com.IMS.inventory_management_system.dto.InvoiceRequest;
import com.IMS.inventory_management_system.entity.Invoice;
import com.IMS.inventory_management_system.entity.InvoiceItem;
import com.IMS.inventory_management_system.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices(@RequestParam(required = false) String type) {
        return ResponseEntity.ok(invoiceService.getAllInvoices(type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoice(@PathVariable String id) {
        // Find single invoice can be added to service if needed, right now we just grab
        // the list
        // Implementing basic fetch logic if needed
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<InvoiceItem>> getInvoiceItems(@PathVariable String id) {
        return ResponseEntity.ok(invoiceService.getInvoiceItems(id));
    }

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.createInvoice(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable String id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}

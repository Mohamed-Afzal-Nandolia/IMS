package com.IMS.inventory_management_system.controller;

import com.IMS.inventory_management_system.entity.Business;
import com.IMS.inventory_management_system.repository.BusinessRepository;
import com.IMS.inventory_management_system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/business")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessRepository businessRepository;

    @GetMapping
    public ResponseEntity<Business> getBusiness() {
        String id = SecurityUtils.getCurrentBusinessId();
        return businessRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<Business> updateBusiness(@RequestBody Business request) {
        String id = SecurityUtils.getCurrentBusinessId();
        Business existing = businessRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Business not found"));

        existing.setName(request.getName());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setGstin(request.getGstin());
        existing.setAddress(request.getAddress());
        existing.setCity(request.getCity());
        existing.setState(request.getState());
        existing.setPincode(request.getPincode());
        existing.setBankName(request.getBankName());
        existing.setAccountNumber(request.getAccountNumber());
        existing.setIfscCode(request.getIfscCode());
        existing.setUpiId(request.getUpiId());

        // Invoice Settings
        existing.setInvoicePrefix(request.getInvoicePrefix());
        existing.setInvoiceTerms(request.getInvoiceTerms());
        existing.setInvoiceNotes(request.getInvoiceNotes());
        existing.setShowBankDetails(request.isShowBankDetails());
        existing.setShowUpiQr(request.isShowUpiQr());
        existing.setShowDigitalSignature(request.isShowDigitalSignature());

        // Notifications
        existing.setLowStockAlert(request.isLowStockAlert());
        existing.setNewInvoiceAlert(request.isNewInvoiceAlert());
        existing.setPaymentReceivedAlert(request.isPaymentReceivedAlert());
        existing.setOverdueInvoicesAlert(request.isOverdueInvoicesAlert());

        return ResponseEntity.ok(businessRepository.save(existing));
    }
}

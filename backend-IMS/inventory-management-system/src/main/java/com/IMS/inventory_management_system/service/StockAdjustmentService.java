package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.entity.Product;
import com.IMS.inventory_management_system.entity.StockAdjustment;
import com.IMS.inventory_management_system.repository.ProductRepository;
import com.IMS.inventory_management_system.repository.StockAdjustmentRepository;
import com.IMS.inventory_management_system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockAdjustmentService {

    private final StockAdjustmentRepository stockAdjustmentRepository;
    private final ProductRepository productRepository;

    public List<StockAdjustment> getAllAdjustments() {
        return stockAdjustmentRepository.findByBusinessId(SecurityUtils.getCurrentBusinessId());
    }

    @Transactional
    public StockAdjustment createAdjustment(StockAdjustment adjustment) {
        adjustment.setId(UUID.randomUUID().toString());
        adjustment.setBusiness(SecurityUtils.getCurrentUser().getBusiness());
        adjustment.setCreatedBy(SecurityUtils.getCurrentUser().getEmail());

        Product product = productRepository.findById(adjustment.getProduct().getId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!product.getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new IllegalStateException("Unauthorized access");
        }

        if ("increase".equalsIgnoreCase(adjustment.getType())) {
            product.setCurrentStock(product.getCurrentStock().add(adjustment.getQuantity()));
        } else if ("decrease".equalsIgnoreCase(adjustment.getType())) {
            product.setCurrentStock(product.getCurrentStock().subtract(adjustment.getQuantity()));
        }

        productRepository.save(product);
        adjustment.setProduct(product);
        return stockAdjustmentRepository.save(adjustment);
    }
}

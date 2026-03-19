package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.entity.Product;
import com.IMS.inventory_management_system.repository.BusinessRepository;
import com.IMS.inventory_management_system.repository.CategoryRepository;
import com.IMS.inventory_management_system.repository.ProductRepository;
import com.IMS.inventory_management_system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BusinessRepository businessRepository;

    public List<Product> getAllProducts() {
        return productRepository.findByBusinessId(SecurityUtils.getCurrentBusinessId());
    }

    public List<Product> getActiveProducts() {
        return productRepository.findByBusinessIdAndIsActiveTrue(SecurityUtils.getCurrentBusinessId());
    }

    @Transactional
    public Product createProduct(Product product) {
        product.setId(UUID.randomUUID().toString());
        com.IMS.inventory_management_system.entity.Business business = businessRepository.findById(SecurityUtils.getCurrentBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));
        product.setBusiness(business);

        // Ensure category validation
        if (product.getCategory() != null && product.getCategory().getId() != null) {
            categoryRepository.findById(product.getCategory().getId())
                    .ifPresent(product::setCategory);
        }

        // Initialize default values for stock and prices if null
        if (product.getCurrentStock() == null)
            product.setCurrentStock(java.math.BigDecimal.ZERO);
        if (product.getPurchasePrice() == null)
            product.setPurchasePrice(java.math.BigDecimal.ZERO);
        if (product.getSellingPrice() == null)
            product.setSellingPrice(java.math.BigDecimal.ZERO);
        if (product.getMrp() == null)
            product.setMrp(java.math.BigDecimal.ZERO);
        if (product.getMinStockLevel() == null || product.getMinStockLevel().compareTo(java.math.BigDecimal.ZERO) == 0) {
            product.setMinStockLevel(java.math.BigDecimal.valueOf(business.getGlobalMinStockLevel()));
        }

        // Auto-generate SKU if not provided
        if (product.getSku() == null || product.getSku().trim().isEmpty()) {
            String prefix = business.getSkuPrefix() != null ? business.getSkuPrefix() : "SKU";
            int counter = business.getSkuCounter() != null ? business.getSkuCounter() : 1;

            product.setSku(String.format("%s-%04d", prefix, counter));

            // Increment and save counter
            business.setSkuCounter(counter + 1);
            businessRepository.save(business);
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(String id, Product updatedProduct) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!existing.getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new IllegalStateException("Unauthorized access");
        }

        existing.setName(updatedProduct.getName());
        existing.setSku(updatedProduct.getSku());
        existing.setHsnCode(updatedProduct.getHsnCode());
        existing.setSacCode(updatedProduct.getSacCode());
        existing.setUnit(updatedProduct.getUnit());
        existing.setSellingPrice(updatedProduct.getSellingPrice());
        existing.setPurchasePrice(updatedProduct.getPurchasePrice());
        existing.setMrp(updatedProduct.getMrp());
        existing.setGstRate(updatedProduct.getGstRate());
        existing.setCessRate(updatedProduct.getCessRate());
        existing.setMinStockLevel(updatedProduct.getMinStockLevel());
        existing.setDescription(updatedProduct.getDescription());
        existing.setSize(updatedProduct.getSize());
        existing.setColor(updatedProduct.getColor());
        existing.setBrand(updatedProduct.getBrand());
        existing.setDiscountRate(updatedProduct.getDiscountRate());

        if (updatedProduct.getIsActive() != null) {
            existing.setIsActive(updatedProduct.getIsActive());
        }

        if (updatedProduct.getCategory() != null && updatedProduct.getCategory().getId() != null) {
            categoryRepository.findById(updatedProduct.getCategory().getId())
                    .ifPresent(existing::setCategory);
        }

        return productRepository.save(existing);
    }

    @Transactional
    public void deleteProduct(String id) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!existing.getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new IllegalStateException("Unauthorized access");
        }
        productRepository.delete(existing);
    }
}

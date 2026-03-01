package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.entity.Product;
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

    public List<Product> getAllProducts() {
        return productRepository.findByBusinessId(SecurityUtils.getCurrentBusinessId());
    }

    public List<Product> getActiveProducts() {
        return productRepository.findByBusinessIdAndIsActiveTrue(SecurityUtils.getCurrentBusinessId());
    }

    @Transactional
    public Product createProduct(Product product) {
        product.setId(UUID.randomUUID().toString());
        product.setBusiness(SecurityUtils.getCurrentUser().getBusiness());

        // Ensure category validation
        if (product.getCategory() != null && product.getCategory().getId() != null) {
            categoryRepository.findById(product.getCategory().getId())
                    .ifPresent(product::setCategory);
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

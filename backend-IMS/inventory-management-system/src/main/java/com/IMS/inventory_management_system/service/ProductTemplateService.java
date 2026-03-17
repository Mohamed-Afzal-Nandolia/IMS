package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.entity.Business;
import com.IMS.inventory_management_system.entity.ProductTemplate;
import com.IMS.inventory_management_system.entity.ProductTemplateValue;
import com.IMS.inventory_management_system.repository.ProductTemplateRepository;
import com.IMS.inventory_management_system.repository.ProductTemplateValueRepository;
import com.IMS.inventory_management_system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductTemplateService {

    private final ProductTemplateRepository productTemplateRepository;
    private final ProductTemplateValueRepository productTemplateValueRepository;

    public List<ProductTemplate> getAllTemplates() {
        return productTemplateRepository.findByBusinessIdOrderBySortOrderAsc(SecurityUtils.getCurrentBusinessId());
    }

    @Transactional
    public ProductTemplate createTemplate(ProductTemplate template) {
        template.setId(UUID.randomUUID().toString());
        template.setBusiness(SecurityUtils.getCurrentUser().getBusiness());
        template.setIsSystem(false);
        
        ProductTemplate saved = productTemplateRepository.save(template);
        
        if (template.getValues() != null) {
            for (ProductTemplateValue val : template.getValues()) {
                val.setId(UUID.randomUUID().toString());
                val.setTemplate(saved);
                productTemplateValueRepository.save(val);
            }
        }
        
        return saved;
    }

    @Transactional
    public ProductTemplateValue addTemplateValue(String templateId, ProductTemplateValue value) {
        ProductTemplate template = productTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));

        if (!template.getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new IllegalStateException("Unauthorized access");
        }

        value.setId(UUID.randomUUID().toString());
        value.setTemplate(template);
        return productTemplateValueRepository.save(value);
    }

    @Transactional
    public void deleteTemplate(String id) {
        ProductTemplate template = productTemplateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));

        if (!template.getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new IllegalStateException("Unauthorized access");
        }
        
        if (template.getIsSystem()) {
            throw new IllegalStateException("Cannot delete a system default template");
        }

        productTemplateRepository.delete(template);
    }

    @Transactional
    public void deleteTemplateValue(String id) {
        ProductTemplateValue value = productTemplateValueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Value not found"));

        if (!value.getTemplate().getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new IllegalStateException("Unauthorized access");
        }

        productTemplateValueRepository.delete(value);
    }

    /**
     * Seeds base templates for a given business instance.
     */
    @Transactional
    public void seedDefaultTemplates(Business business) {
        createDefaultTemplate(business, "SIZE", "Size", 1, Arrays.asList("XS", "S", "M", "L", "XL", "XXL", "XXXL"));
        createDefaultTemplate(business, "COLOR", "Color", 2, Arrays.asList("Red", "Blue", "Green", "Yellow", "Black", "White", "Grey", "Pink", "Orange", "Purple"));
        createDefaultTemplate(business, "MATERIAL", "Material", 3, Arrays.asList("Cotton", "Polyester", "Silk", "Wool", "Leather", "Denim"));
        createDefaultTemplate(business, "PACK_TYPE", "Pack Type", 4, Arrays.asList("Single", "Pack of 6", "Pack of 12", "Box of 24"));
        createDefaultTemplate(business, "WEIGHT_CLASS", "Weight Class", 5, Arrays.asList("0-500g", "500g-1kg", "1kg-5kg", "5kg+"));
        createDefaultTemplate(business, "UNIT_TYPE", "Unit Type", 6, Arrays.asList("Piece", "Pair", "Set", "Bundle"));
    }

    private void createDefaultTemplate(Business business, String type, String label, int sortOrder, List<String> values) {
        ProductTemplate template = ProductTemplate.builder()
                .id(UUID.randomUUID().toString())
                .business(business)
                .templateType(type)
                .label(label)
                .isSystem(true)
                .sortOrder(sortOrder)
                .build();
                
        ProductTemplate savedTemplate = productTemplateRepository.save(template);

        int idx = 1;
        for (String val : values) {
            ProductTemplateValue value = ProductTemplateValue.builder()
                    .id(UUID.randomUUID().toString())
                    .template(savedTemplate)
                    .value(val)
                    .sortOrder(idx++)
                    .build();
            productTemplateValueRepository.save(value);
        }
    }
}

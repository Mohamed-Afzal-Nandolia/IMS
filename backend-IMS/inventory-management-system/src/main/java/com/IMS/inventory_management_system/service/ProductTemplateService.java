package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.entity.Business;
import com.IMS.inventory_management_system.entity.MasterProductTemplate;
import com.IMS.inventory_management_system.entity.MasterProductTemplateValue;
import com.IMS.inventory_management_system.entity.ProductTemplate;
import com.IMS.inventory_management_system.entity.ProductTemplateValue;
import com.IMS.inventory_management_system.repository.MasterProductTemplateRepository;
import com.IMS.inventory_management_system.repository.ProductTemplateRepository;
import com.IMS.inventory_management_system.repository.ProductTemplateValueRepository;
import com.IMS.inventory_management_system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductTemplateService {

    private final ProductTemplateRepository productTemplateRepository;
    private final ProductTemplateValueRepository productTemplateValueRepository;
    private final MasterProductTemplateRepository masterProductTemplateRepository;

    public List<ProductTemplate> getAllTemplates() {
        String businessId = SecurityUtils.getCurrentBusinessId();
        List<ProductTemplate> templates = productTemplateRepository.findByBusinessIdOrderBySortOrderAsc(businessId);
        
        if (templates.isEmpty()) {
            Business business = SecurityUtils.getCurrentUser().getBusiness();
            seedDefaultTemplates(business);
            return productTemplateRepository.findByBusinessIdOrderBySortOrderAsc(businessId);
        }
        
        return templates;
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
    public ProductTemplate updateTemplate(String id, ProductTemplate templateDetails) {
        ProductTemplate template = productTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!template.getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new RuntimeException("Unauthorized");
        }

        template.setLabel(templateDetails.getLabel() != null ? templateDetails.getLabel() : template.getLabel());
        template.setTemplateType(templateDetails.getTemplateType() != null ? templateDetails.getTemplateType() : template.getTemplateType());
        template.setSortOrder(templateDetails.getSortOrder() != null ? templateDetails.getSortOrder() : template.getSortOrder());

        if (templateDetails.getValues() != null) {
            // Update values list - CascadeType.ALL + orphanRemoval = true handles this
            template.getValues().clear();
            for (ProductTemplateValue val : templateDetails.getValues()) {
                val.setId(val.getId() == null ? UUID.randomUUID().toString() : val.getId());
                val.setTemplate(template);
                template.getValues().add(val);
            }
        }

        return productTemplateRepository.save(template);
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
        List<MasterProductTemplate> masters = masterProductTemplateRepository.findAllByOrderBySortOrderAsc();
        
        for (MasterProductTemplate master : masters) {
            ProductTemplate template = ProductTemplate.builder()
                    .id(UUID.randomUUID().toString())
                    .business(business)
                    .templateType(master.getTemplateType())
                    .label(master.getLabel())
                    .isSystem(true)
                    .sortOrder(master.getSortOrder())
                    .build();
                    
            ProductTemplate savedTemplate = productTemplateRepository.save(template);

            if (master.getValues() != null) {
                for (MasterProductTemplateValue masterValue : master.getValues()) {
                    ProductTemplateValue value = ProductTemplateValue.builder()
                            .id(UUID.randomUUID().toString())
                            .template(savedTemplate)
                            .value(masterValue.getValue())
                            .sortOrder(masterValue.getSortOrder())
                            .build();
                    productTemplateValueRepository.save(value);
                }
            }
        }
    }
}

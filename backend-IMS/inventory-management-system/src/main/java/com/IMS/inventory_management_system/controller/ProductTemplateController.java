package com.IMS.inventory_management_system.controller;

import com.IMS.inventory_management_system.entity.ProductTemplate;
import com.IMS.inventory_management_system.entity.ProductTemplateValue;
import com.IMS.inventory_management_system.service.ProductTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-templates")
@RequiredArgsConstructor
public class ProductTemplateController {

    private final ProductTemplateService productTemplateService;

    @GetMapping
    public ResponseEntity<List<ProductTemplate>> getAllTemplates() {
        return ResponseEntity.ok(productTemplateService.getAllTemplates());
    }

    @PostMapping
    public ResponseEntity<ProductTemplate> createTemplate(@RequestBody ProductTemplate template) {
        return ResponseEntity.ok(productTemplateService.createTemplate(template));
    }

    @PostMapping("/{templateId}/values")
    public ResponseEntity<ProductTemplateValue> addTemplateValue(@PathVariable String templateId, @RequestBody ProductTemplateValue value) {
        return ResponseEntity.ok(productTemplateService.addTemplateValue(templateId, value));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        productTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/values/{id}")
    public ResponseEntity<Void> deleteTemplateValue(@PathVariable String id) {
        productTemplateService.deleteTemplateValue(id);
        return ResponseEntity.noContent().build();
    }
}

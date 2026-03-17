package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.entity.Category;
import com.IMS.inventory_management_system.repository.CategoryRepository;
import com.IMS.inventory_management_system.repository.DepartmentRepository;
import com.IMS.inventory_management_system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;

    public List<Category> getAllCategories() {
        String businessId = SecurityUtils.getCurrentBusinessId();
        return categoryRepository.findByBusinessId(businessId);
    }

    @Transactional
    public Category createCategory(Category category) {
        // Enforce Multi-Tenancy
        category.setId(UUID.randomUUID().toString());
        category.setBusiness(SecurityUtils.getCurrentUser().getBusiness());
        if (category.getIsActive() == null)
            category.setIsActive(true);

        if (category.getDepartment() != null && category.getDepartment().getId() != null) {
            departmentRepository.findById(category.getDepartment().getId()).ifPresent(category::setDepartment);
        }

        if (category.getParent() != null && category.getParent().getId() != null) {
            categoryRepository.findById(category.getParent().getId()).ifPresent(category::setParent);
        }

        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(String id, Category updatedCategory) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        // Ensure same business
        if (!existing.getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new IllegalStateException("Unauthorized access");
        }

        existing.setName(updatedCategory.getName());
        existing.setDescription(updatedCategory.getDescription());
        if (updatedCategory.getIsActive() != null) {
            existing.setIsActive(updatedCategory.getIsActive());
        }

        if (updatedCategory.getDepartment() != null) {
            if (updatedCategory.getDepartment().getId() != null) {
                departmentRepository.findById(updatedCategory.getDepartment().getId()).ifPresent(existing::setDepartment);
            } else {
                existing.setDepartment(null);
            }
        }

        if (updatedCategory.getParent() != null) {
            if (updatedCategory.getParent().getId() != null) {
                categoryRepository.findById(updatedCategory.getParent().getId()).ifPresent(existing::setParent);
            } else {
                existing.setParent(null);
            }
        }

        return categoryRepository.save(existing);
    }

    @Transactional
    public void deleteCategory(String id) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (!existing.getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new IllegalStateException("Unauthorized access");
        }
        categoryRepository.delete(existing);
    }
}

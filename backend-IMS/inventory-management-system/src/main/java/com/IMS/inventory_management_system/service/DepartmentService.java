package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.entity.Department;
import com.IMS.inventory_management_system.repository.DepartmentRepository;
import com.IMS.inventory_management_system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findByBusinessId(SecurityUtils.getCurrentBusinessId());
    }

    @Transactional
    public Department createDepartment(Department department) {
        department.setId(UUID.randomUUID().toString());
        department.setBusiness(SecurityUtils.getCurrentUser().getBusiness());
        if (department.getIsActive() == null) {
            department.setIsActive(true);
        }
        return departmentRepository.save(department);
    }

    @Transactional
    public Department updateDepartment(String id, Department updatedDepartment) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        if (!existing.getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new IllegalStateException("Unauthorized access");
        }

        existing.setName(updatedDepartment.getName());
        existing.setDescription(updatedDepartment.getDescription());
        if (updatedDepartment.getIsActive() != null) {
            existing.setIsActive(updatedDepartment.getIsActive());
        }

        return departmentRepository.save(existing);
    }

    @Transactional
    public void deleteDepartment(String id) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        if (!existing.getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new IllegalStateException("Unauthorized access");
        }
        
        departmentRepository.delete(existing);
    }
}

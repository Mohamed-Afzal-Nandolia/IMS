package com.IMS.inventory_management_system.repository;

import com.IMS.inventory_management_system.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, String> {
    List<Department> findByBusinessId(String businessId);
}

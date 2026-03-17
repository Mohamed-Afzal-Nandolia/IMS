package com.IMS.inventory_management_system.repository;

import com.IMS.inventory_management_system.entity.ProductTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductTemplateRepository extends JpaRepository<ProductTemplate, String> {
    List<ProductTemplate> findByBusinessId(String businessId);
    List<ProductTemplate> findByBusinessIdOrderBySortOrderAsc(String businessId);
}

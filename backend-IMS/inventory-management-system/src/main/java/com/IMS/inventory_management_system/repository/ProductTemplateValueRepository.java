package com.IMS.inventory_management_system.repository;

import com.IMS.inventory_management_system.entity.ProductTemplateValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductTemplateValueRepository extends JpaRepository<ProductTemplateValue, String> {
}

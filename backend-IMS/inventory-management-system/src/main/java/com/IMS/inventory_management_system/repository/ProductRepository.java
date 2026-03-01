package com.IMS.inventory_management_system.repository;

import com.IMS.inventory_management_system.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByBusinessId(String businessId);

    List<Product> findByBusinessIdAndIsActiveTrue(String businessId);
}

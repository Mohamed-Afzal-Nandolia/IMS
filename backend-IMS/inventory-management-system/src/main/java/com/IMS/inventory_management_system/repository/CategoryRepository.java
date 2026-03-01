package com.IMS.inventory_management_system.repository;

import com.IMS.inventory_management_system.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByBusinessId(String businessId);
}

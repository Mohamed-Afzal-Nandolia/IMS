package com.IMS.inventory_management_system.repository;

import com.IMS.inventory_management_system.entity.MasterProductTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MasterProductTemplateRepository extends JpaRepository<MasterProductTemplate, String> {
    List<MasterProductTemplate> findAllByOrderBySortOrderAsc();
}

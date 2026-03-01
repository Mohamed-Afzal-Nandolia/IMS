package com.IMS.inventory_management_system.repository;

import com.IMS.inventory_management_system.entity.StockAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, String> {
    List<StockAdjustment> findByBusinessId(String businessId);

    List<StockAdjustment> findByProductId(String productId);
}

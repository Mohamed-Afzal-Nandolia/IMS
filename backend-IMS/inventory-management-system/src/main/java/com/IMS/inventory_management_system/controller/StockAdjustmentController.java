package com.IMS.inventory_management_system.controller;

import com.IMS.inventory_management_system.entity.StockAdjustment;
import com.IMS.inventory_management_system.service.StockAdjustmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stock-adjustments")
@RequiredArgsConstructor
public class StockAdjustmentController {

    private final StockAdjustmentService stockAdjustmentService;

    @GetMapping
    public ResponseEntity<List<StockAdjustment>> getAllAdjustments() {
        return ResponseEntity.ok(stockAdjustmentService.getAllAdjustments());
    }

    @PostMapping
    public ResponseEntity<StockAdjustment> createAdjustment(@RequestBody StockAdjustment adjustment) {
        return ResponseEntity.ok(stockAdjustmentService.createAdjustment(adjustment));
    }
}

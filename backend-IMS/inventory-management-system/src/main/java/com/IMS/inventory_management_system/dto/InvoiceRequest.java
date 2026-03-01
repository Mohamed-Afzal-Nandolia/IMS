package com.IMS.inventory_management_system.dto;

import com.IMS.inventory_management_system.entity.Invoice;
import com.IMS.inventory_management_system.entity.InvoiceItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceRequest {
    private Invoice invoice;
    private List<InvoiceItem> items;
}

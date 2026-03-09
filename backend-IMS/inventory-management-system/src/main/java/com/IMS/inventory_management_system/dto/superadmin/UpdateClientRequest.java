package com.IMS.inventory_management_system.dto.superadmin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateClientRequest {
    private String businessName;
    private String slug;
    private String adminEmail;
    private String adminPassword;
    private String phone;
    private String gstin;
}

package com.IMS.inventory_management_system.dto.superadmin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OnboardClientRequest {
    private String businessName;
    private String slug; // Optional — auto-generated if blank
    private String adminEmail;
    private String adminPassword; // Optional — auto-generated if blank
    private String phone;
    private String gstin;
}

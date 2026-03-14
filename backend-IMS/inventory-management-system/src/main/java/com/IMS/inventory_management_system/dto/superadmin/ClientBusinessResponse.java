package com.IMS.inventory_management_system.dto.superadmin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClientBusinessResponse {
    private String id;
    private String name;
    private String slug;
    private String email;
    private String phone;
    private String gstin;
    private boolean active;
    private String adminEmail;
    private String generatedPassword; // only populated on onboarding
    private LocalDateTime createdAt;
    private Set<com.IMS.inventory_management_system.enums.Modules> enabledModules;
}

package com.IMS.inventory_management_system.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String token;
    private String refreshToken;
    private String businessId;
    private String businessSlug;
    private String userId;
    private String role;
    private Set<com.IMS.inventory_management_system.enums.Modules> enabledModules;
}

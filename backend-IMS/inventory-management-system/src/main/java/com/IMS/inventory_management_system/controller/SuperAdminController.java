package com.IMS.inventory_management_system.controller;

import com.IMS.inventory_management_system.dto.auth.AuthenticationRequest;
import com.IMS.inventory_management_system.dto.auth.AuthenticationResponse;
import com.IMS.inventory_management_system.dto.superadmin.ClientBusinessResponse;
import com.IMS.inventory_management_system.dto.superadmin.OnboardClientRequest;
import com.IMS.inventory_management_system.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/super-admin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    /** Public: Super admin login — checked internally for ROLE_SUPER_ADMIN */
    @PostMapping("/auth/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(superAdminService.login(request));
    }

    /** List all onboarded client businesses */
    @GetMapping("/businesses")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<ClientBusinessResponse>> listClients() {
        return ResponseEntity.ok(superAdminService.listClients());
    }

    /** Onboard a new client */
    @PostMapping("/businesses")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ClientBusinessResponse> onboardClient(@RequestBody OnboardClientRequest request) {
        return ResponseEntity.ok(superAdminService.onboardClient(request));
    }

    /** Activate or deactivate a client */
    @PatchMapping("/businesses/{id}/toggle-active")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ClientBusinessResponse> toggleActive(@PathVariable String id) {
        return ResponseEntity.ok(superAdminService.toggleActive(id));
    }
}

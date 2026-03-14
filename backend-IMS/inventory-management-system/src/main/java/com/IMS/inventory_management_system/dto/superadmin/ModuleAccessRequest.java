package com.IMS.inventory_management_system.dto.superadmin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ModuleAccessRequest {
    private Set<com.IMS.inventory_management_system.enums.Modules> enabledModules = new HashSet<>();
}

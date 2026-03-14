package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.dto.auth.AuthenticationRequest;
import com.IMS.inventory_management_system.dto.auth.AuthenticationResponse;
import com.IMS.inventory_management_system.dto.superadmin.ClientBusinessResponse;
import com.IMS.inventory_management_system.dto.superadmin.ModuleAccessRequest;
import com.IMS.inventory_management_system.dto.superadmin.OnboardClientRequest;
import com.IMS.inventory_management_system.dto.superadmin.UpdateClientRequest;
import com.IMS.inventory_management_system.entity.Business;
import com.IMS.inventory_management_system.entity.User;
import com.IMS.inventory_management_system.repository.BusinessRepository;
import com.IMS.inventory_management_system.repository.UserRepository;
import com.IMS.inventory_management_system.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuthenticationService authenticationService;
    private final RefreshTokenService refreshTokenService;

    private static final String SUPER_ADMIN_ROLE = "ROLE_SUPER_ADMIN";

    /** Login: only allows ROLE_SUPER_ADMIN */
    public AuthenticationResponse login(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        if (!SUPER_ADMIN_ROLE.equals(user.getRole())) {
            throw new BadCredentialsException("Access denied: not a super admin account");
        }

        String token = jwtService.generateTokenWithClaims(user, SUPER_ADMIN_ROLE, "superadmin");
        String refreshToken = refreshTokenService.createRefreshToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .role(SUPER_ADMIN_ROLE)
                .businessSlug("superadmin")
                .build();
    }

    /** List all client businesses (excluding the super admin placeholder business) */
    public List<ClientBusinessResponse> listClients() {
        return businessRepository.findAll().stream()
                .filter(b -> !"superadmin".equals(b.getSlug()))
                .map(b -> {
                    String adminEmail = userRepository.findFirstByBusinessId(b.getId())
                            .map(User::getEmail)
                            .orElse("-");
                    return toClientResponse(b, adminEmail, null);
                })
                .collect(Collectors.toList());
    }

    /** Onboard a new client: create business + admin user, return credentials */
    @Transactional
    public ClientBusinessResponse onboardClient(OnboardClientRequest request) {
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? request.getSlug().toLowerCase().replaceAll("[^a-z0-9]", "")
                : authenticationService.generateUniqueSlug(request.getBusinessName());

        if (businessRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Slug '" + slug + "' is already taken");
        }

        String rawPassword = (request.getAdminPassword() != null && !request.getAdminPassword().isBlank())
                ? request.getAdminPassword()
                : generatePassword();

        Business business = Business.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getBusinessName())
                .slug(slug)
                .email(request.getAdminEmail())
                .phone(request.getPhone())
                .gstin(request.getGstin())
                .isActive(true)
                .enabledModules(request.getEnabledModules() != null ? request.getEnabledModules() : new java.util.HashSet<com.IMS.inventory_management_system.enums.Modules>())
                .build();
        businessRepository.save(business);

        User admin = User.builder()
                .id(UUID.randomUUID().toString())
                .business(business)
                .email(request.getAdminEmail())
                .password(passwordEncoder.encode(rawPassword))
                .role("ROLE_ADMIN")
                .build();
        userRepository.save(admin);

        return toClientResponse(business, admin.getEmail(), rawPassword);
    }

    /** Update client business/admin fields after onboarding */
    @Transactional
    public ClientBusinessResponse updateClient(String businessId, UpdateClientRequest request) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found: " + businessId));

        if ("superadmin".equals(business.getSlug())) {
            throw new IllegalArgumentException("Super admin business cannot be modified here");
        }

        if (request.getBusinessName() != null && !request.getBusinessName().isBlank()) {
            business.setName(request.getBusinessName().trim());
        }
        if (request.getPhone() != null) {
            business.setPhone(request.getPhone().trim());
        }
        if (request.getGstin() != null) {
            business.setGstin(request.getGstin().trim());
        }

        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            String normalizedSlug = request.getSlug().toLowerCase().replaceAll("[^a-z0-9]", "");
            if (normalizedSlug.isBlank()) {
                throw new IllegalArgumentException("Slug must contain at least one letter or number");
            }
            if (businessRepository.existsBySlug(normalizedSlug) && !normalizedSlug.equals(business.getSlug())) {
                throw new IllegalArgumentException("Slug '" + normalizedSlug + "' is already taken");
            }
            business.setSlug(normalizedSlug);
        }

        User admin = userRepository.findFirstByBusinessId(business.getId())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found for business: " + businessId));

        if (request.getAdminEmail() != null && !request.getAdminEmail().isBlank()) {
            String nextEmail = request.getAdminEmail().trim().toLowerCase();
            if (!nextEmail.equalsIgnoreCase(admin.getEmail()) && userRepository.existsByEmail(nextEmail)) {
                throw new IllegalArgumentException("Email already exists");
            }
            admin.setEmail(nextEmail);
        }

        if (request.getAdminPassword() != null && !request.getAdminPassword().isBlank()) {
            admin.setPassword(passwordEncoder.encode(request.getAdminPassword()));
            refreshTokenService.revokeAllForUser(admin.getId());
        }

        business.setEmail(admin.getEmail());
        businessRepository.save(business);
        userRepository.save(admin);

        return toClientResponse(business, admin.getEmail(), null);
    }

    /** Toggle active status for a client business */
    @Transactional
    public ClientBusinessResponse toggleActive(String businessId) {
        Business b = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found: " + businessId));
        b.setActive(!b.isActive());
        businessRepository.save(b);
        String adminEmail = userRepository.findFirstByBusinessId(b.getId())
                .map(User::getEmail)
                .orElse("-");
        return toClientResponse(b, adminEmail, null);
    }

    private String generatePassword() {
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$";
        SecureRandom rng = new SecureRandom();
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            sb.append(chars.charAt(rng.nextInt(chars.length())));
        }
        return sb.toString();
    }

    /** Update module access for a specific client business */
    @Transactional
    public ClientBusinessResponse updateModuleAccess(String businessId, ModuleAccessRequest request) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found: " + businessId));

        if ("superadmin".equals(business.getSlug())) {
            throw new IllegalArgumentException("Super admin business cannot be modified here");
        }

        business.getEnabledModules().clear();
        if (request.getEnabledModules() != null) {
            business.getEnabledModules().addAll(request.getEnabledModules());
        }
        businessRepository.save(business);

        String adminEmail = userRepository.findFirstByBusinessId(business.getId())
                .map(com.IMS.inventory_management_system.entity.User::getEmail)
                .orElse("-");
        return toClientResponse(business, adminEmail, null);
    }

    private ClientBusinessResponse toClientResponse(Business business, String adminEmail, String generatedPassword) {
        return ClientBusinessResponse.builder()
                .id(business.getId())
                .name(business.getName())
                .slug(business.getSlug())
                .email(business.getEmail())
                .phone(business.getPhone())
                .gstin(business.getGstin())
                .active(business.isActive())
                .adminEmail(adminEmail)
                .generatedPassword(generatedPassword)
                .createdAt(business.getCreatedAt())
                .enabledModules(business.getEnabledModules())
                .build();
    }
}

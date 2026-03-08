package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.dto.auth.AuthenticationRequest;
import com.IMS.inventory_management_system.dto.auth.AuthenticationResponse;
import com.IMS.inventory_management_system.dto.superadmin.ClientBusinessResponse;
import com.IMS.inventory_management_system.dto.superadmin.OnboardClientRequest;
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

    private static final String SUPER_ADMIN_ROLE = "ROLE_SUPER_ADMIN";

    /** Login — only allows ROLE_SUPER_ADMIN */
    public AuthenticationResponse login(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        if (!SUPER_ADMIN_ROLE.equals(user.getRole())) {
            throw new BadCredentialsException("Access denied: not a super admin account");
        }

        String token = jwtService.generateTokenWithClaims(user, SUPER_ADMIN_ROLE, "superadmin");
        return AuthenticationResponse.builder()
                .token(token)
                .userId(user.getId())
                .role(SUPER_ADMIN_ROLE)
                .businessSlug("superadmin")
                .build();
    }

    /**
     * List all client businesses (excluding the super admin placeholder business)
     */
    public List<ClientBusinessResponse> listClients() {
        return businessRepository.findAll().stream()
                .filter(b -> !"superadmin".equals(b.getSlug()))
                .map(b -> {
                    // Find the admin user for this business
                    String adminEmail = userRepository.findFirstByBusinessId(b.getId())
                            .map(User::getEmail).orElse("—");
                    return ClientBusinessResponse.builder()
                            .id(b.getId())
                            .name(b.getName())
                            .slug(b.getSlug())
                            .email(b.getEmail())
                            .phone(b.getPhone())
                            .gstin(b.getGstin())
                            .active(b.isActive())
                            .adminEmail(adminEmail)
                            .createdAt(b.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /** Onboard a new client: create business + admin user, return credentials */
    @Transactional
    public ClientBusinessResponse onboardClient(OnboardClientRequest request) {
        // Determine slug
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? request.getSlug().toLowerCase().replaceAll("[^a-z0-9]", "")
                : authenticationService.generateUniqueSlug(request.getBusinessName());

        if (businessRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Slug '" + slug + "' is already taken");
        }

        // Determine password
        String rawPassword = (request.getAdminPassword() != null && !request.getAdminPassword().isBlank())
                ? request.getAdminPassword()
                : generatePassword();

        // Create business
        Business business = Business.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getBusinessName())
                .slug(slug)
                .email(request.getAdminEmail())
                .phone(request.getPhone())
                .gstin(request.getGstin())
                .isActive(true)
                .build();
        businessRepository.save(business);

        // Create admin user
        User admin = User.builder()
                .id(UUID.randomUUID().toString())
                .business(business)
                .email(request.getAdminEmail())
                .password(passwordEncoder.encode(rawPassword))
                .role("ROLE_ADMIN")
                .build();
        userRepository.save(admin);

        return ClientBusinessResponse.builder()
                .id(business.getId())
                .name(business.getName())
                .slug(slug)
                .email(business.getEmail())
                .phone(business.getPhone())
                .gstin(business.getGstin())
                .active(true)
                .adminEmail(admin.getEmail())
                .generatedPassword(rawPassword) // only returned here
                .createdAt(business.getCreatedAt())
                .build();
    }

    /** Toggle active status for a client business */
    @Transactional
    public ClientBusinessResponse toggleActive(String businessId) {
        Business b = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found: " + businessId));
        b.setActive(!b.isActive());
        businessRepository.save(b);
        String adminEmail = userRepository.findFirstByBusinessId(b.getId())
                .map(User::getEmail).orElse("—");
        return ClientBusinessResponse.builder()
                .id(b.getId()).name(b.getName()).slug(b.getSlug())
                .email(b.getEmail()).phone(b.getPhone()).gstin(b.getGstin())
                .active(b.isActive()).adminEmail(adminEmail).createdAt(b.getCreatedAt())
                .build();
    }

    private String generatePassword() {
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$";
        SecureRandom rng = new SecureRandom();
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++)
            sb.append(chars.charAt(rng.nextInt(chars.length())));
        return sb.toString();
    }
}

package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.dto.auth.AuthenticationRequest;
import com.IMS.inventory_management_system.dto.auth.AuthenticationResponse;
import com.IMS.inventory_management_system.dto.auth.RefreshTokenRequest;
import com.IMS.inventory_management_system.dto.auth.RegisterRequest;
import com.IMS.inventory_management_system.entity.Business;
import com.IMS.inventory_management_system.entity.RefreshToken;
import com.IMS.inventory_management_system.entity.User;
import com.IMS.inventory_management_system.repository.BusinessRepository;
import com.IMS.inventory_management_system.repository.UserRepository;
import com.IMS.inventory_management_system.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.text.Normalizer;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

        private final UserRepository repository;
        private final BusinessRepository businessRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final RefreshTokenService refreshTokenService;
        private final AuthenticationManager authenticationManager;

        @Transactional
        public AuthenticationResponse register(RegisterRequest request) {
                if (repository.existsByEmail(request.getEmail())) {
                        throw new IllegalArgumentException("Email already exists");
                }

                // Generate slug from business name
                String slug = generateUniqueSlug(request.getBusinessName());

                // Create a new Business first
                Business business = Business.builder()
                                .id(UUID.randomUUID().toString())
                                .name(request.getBusinessName())
                                .slug(slug)
                                .isActive(true)
                                .build();
                businessRepository.save(business);

                // Create the Admin User for this Business
                User user = User.builder()
                                .id(UUID.randomUUID().toString())
                                .business(business)
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role("ROLE_ADMIN")
                                .build();
                repository.save(user);

                return issueAuthResponse(user, slug);
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = repository.findByEmail(request.getEmail())
                                .orElseThrow();

                ensureBusinessActive(user);

                String slug = user.getBusiness() != null ? user.getBusiness().getSlug() : null;

                // If slug is missing (legacy user), generate and save it
                if (slug == null && user.getBusiness() != null) {
                        slug = generateUniqueSlug(user.getBusiness().getName());
                        user.getBusiness().setSlug(slug);
                        businessRepository.save(user.getBusiness());
                }

                return issueAuthResponse(user, slug);
        }

        @Transactional
        public AuthenticationResponse refresh(RefreshTokenRequest request) {
                if (request == null || request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
                        throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                                        "Refresh token is required");
                }

                RefreshToken existingToken = refreshTokenService.verify(request.getRefreshToken());
                User user = existingToken.getUser();

                refreshTokenService.revoke(existingToken);
                ensureBusinessActive(user);

                String slug = resolveBusinessSlug(user);
                return issueAuthResponse(user, slug);
        }

        @Transactional
        public void logout(RefreshTokenRequest request) {
                if (request == null) {
                        return;
                }
                refreshTokenService.revokeByRawToken(request.getRefreshToken());
        }

        /** Converts a business name to a unique, URL-safe slug */
        public String generateUniqueSlug(String name) {
                String base = Normalizer.normalize(name, Normalizer.Form.NFD)
                                .replaceAll("[^\\p{ASCII}]", "")
                                .toLowerCase()
                                .replaceAll("[^a-z0-9]+", "")
                                .replaceAll("^-+|-+$", "");

                if (base.isEmpty())
                        base = "business";

                String slug = base;
                int counter = 1;
                while (businessRepository.existsBySlug(slug)) {
                        slug = base + counter++;
                }
                return slug;
        }

        private AuthenticationResponse issueAuthResponse(User user, String slug) {
                String jwtToken = jwtService.generateTokenWithClaims(user, user.getRole(), slug);
                String refreshToken = refreshTokenService.createRefreshToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .refreshToken(refreshToken)
                                .businessId(user.getBusiness() != null ? user.getBusiness().getId() : null)
                                .businessSlug(slug)
                                .userId(user.getId())
                                .role(user.getRole())
                                .build();
        }

        private String resolveBusinessSlug(User user) {
                if ("ROLE_SUPER_ADMIN".equals(user.getRole())) {
                        return "superadmin";
                }

                if (user.getBusiness() == null) {
                        return null;
                }

                String slug = user.getBusiness().getSlug();
                if (slug == null) {
                        slug = generateUniqueSlug(user.getBusiness().getName());
                        user.getBusiness().setSlug(slug);
                        businessRepository.save(user.getBusiness());
                }
                return slug;
        }

        private void ensureBusinessActive(User user) {
                if (user == null || "ROLE_SUPER_ADMIN".equals(user.getRole())) {
                        return;
                }
                if (user.getBusiness() != null && !user.getBusiness().isActive()) {
                        refreshTokenService.revokeAllForUser(user.getId());
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                                        "Account suspended. Please contact support.");
                }
        }
}

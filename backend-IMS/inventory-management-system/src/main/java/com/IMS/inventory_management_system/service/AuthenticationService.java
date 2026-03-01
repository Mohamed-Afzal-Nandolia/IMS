package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.dto.auth.AuthenticationRequest;
import com.IMS.inventory_management_system.dto.auth.AuthenticationResponse;
import com.IMS.inventory_management_system.dto.auth.RegisterRequest;
import com.IMS.inventory_management_system.entity.Business;
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

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create a new Business first
        Business business = Business.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getBusinessName())
                .build();
        businessRepository.save(business);

        // Create the Admin User for this Business
        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .business(business)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("ROLE_ADMIN") // First user is Admin
                .build();
        repository.save(user);

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .businessId(business.getId())
                .userId(user.getId())
                .role(user.getRole())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .businessId(user.getBusiness().getId())
                .userId(user.getId())
                .role(user.getRole())
                .build();
    }
}

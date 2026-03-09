package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.entity.RefreshToken;
import com.IMS.inventory_management_system.entity.User;
import com.IMS.inventory_management_system.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Value("${application.security.jwt.refresh.expiration:2592000000}")
    private long refreshTokenExpirationMs;

    @Transactional
    public String createRefreshToken(User user) {
        String rawToken = generateRawToken();
        RefreshToken token = RefreshToken.builder()
                .id(UUID.randomUUID().toString())
                .user(user)
                .tokenHash(hashToken(rawToken))
                .expiresAt(LocalDateTime.now().plusNanos(refreshTokenExpirationMs * 1_000_000))
                .revoked(false)
                .build();
        refreshTokenRepository.save(token);
        return rawToken;
    }

    @Transactional(readOnly = true)
    public RefreshToken verify(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw unauthorized("Refresh token is required");
        }
        RefreshToken token = refreshTokenRepository.findByTokenHash(hashToken(rawToken))
                .orElseThrow(() -> unauthorized("Invalid refresh token"));
        if (token.isRevoked() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw unauthorized("Refresh token expired or revoked");
        }
        return token;
    }

    @Transactional
    public void revoke(RefreshToken token) {
        if (token.isRevoked()) {
            return;
        }
        token.setRevoked(true);
        token.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(token);
    }

    @Transactional
    public void revokeByRawToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        refreshTokenRepository.findByTokenHash(hashToken(rawToken)).ifPresent(this::revoke);
    }

    @Transactional
    public void revokeAllForUser(String userId) {
        if (userId == null || userId.isBlank()) {
            return;
        }
        refreshTokenRepository.revokeAllActiveByUserId(userId, LocalDateTime.now());
    }

    private String generateRawToken() {
        byte[] bytes = new byte[48];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm unavailable", e);
        }
    }

    private ResponseStatusException unauthorized(String message) {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, message);
    }
}

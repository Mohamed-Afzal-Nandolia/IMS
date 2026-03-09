package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    @Scheduled(cron = "${application.security.jwt.refresh.cleanup-cron:0 0 * * * *}")
    public void cleanupExpiredAndRevokedTokens() {
        long deleted = refreshTokenRepository.deleteByExpiresAtBeforeOrRevokedTrue(LocalDateTime.now());
        if (deleted > 0) {
            log.info("Cleaned up {} expired/revoked refresh token records", deleted);
        }
    }
}

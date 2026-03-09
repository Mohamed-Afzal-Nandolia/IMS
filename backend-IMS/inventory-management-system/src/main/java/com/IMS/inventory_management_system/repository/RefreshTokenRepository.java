package com.IMS.inventory_management_system.repository;

import com.IMS.inventory_management_system.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    long deleteByExpiresAtBeforeOrRevokedTrue(LocalDateTime cutoff);

    @Modifying
    @Query("""
            update RefreshToken rt
               set rt.revoked = true,
                   rt.revokedAt = :revokedAt
             where rt.user.id = :userId
               and rt.revoked = false
            """)
    int revokeAllActiveByUserId(@Param("userId") String userId, @Param("revokedAt") LocalDateTime revokedAt);
}

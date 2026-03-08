package com.IMS.inventory_management_system.config;

import com.IMS.inventory_management_system.entity.Business;
import com.IMS.inventory_management_system.entity.User;
import com.IMS.inventory_management_system.repository.BusinessRepository;
import com.IMS.inventory_management_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Runs on application startup:
 * 1. Seeds the super admin user if not already present.
 * 2. Back-fills slugs for existing businesses that have none.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private static final String SUPER_ADMIN_EMAIL = "superadmin@ims.com";
    private static final String SUPER_ADMIN_PASSWORD = "superadmin123"; // Change after first login!
    private static final String SUPER_ADMIN_SLUG = "superadmin";

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedSuperAdmin();
        backfillMissingSlugs();
    }

    private void seedSuperAdmin() {
        if (userRepository.existsByEmail(SUPER_ADMIN_EMAIL)) {
            log.info("Super admin already exists — skipping seed.");
            return;
        }

        // Create placeholder business for super admin
        Business superBusiness = businessRepository.findBySlug(SUPER_ADMIN_SLUG).orElseGet(() -> {
            Business b = Business.builder()
                    .id(UUID.randomUUID().toString())
                    .name("IMS Super Admin")
                    .slug(SUPER_ADMIN_SLUG)
                    .isActive(true)
                    .build();
            return businessRepository.save(b);
        });

        User superAdmin = User.builder()
                .id(UUID.randomUUID().toString())
                .business(superBusiness)
                .email(SUPER_ADMIN_EMAIL)
                .password(passwordEncoder.encode(SUPER_ADMIN_PASSWORD))
                .role("ROLE_SUPER_ADMIN")
                .build();
        userRepository.save(superAdmin);

        log.info("✅ Super admin seeded — email: {}, password: {} (CHANGE THIS!)",
                SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
    }

    private void backfillMissingSlugs() {
        businessRepository.findAll().forEach(business -> {
            if (business.getSlug() == null || business.getSlug().isBlank()) {
                String base = business.getName().toLowerCase()
                        .replaceAll("[^a-z0-9]+", "")
                        .replaceAll("^-+|-+$", "");
                if (base.isEmpty())
                    base = "business";
                String slug = base;
                int i = 1;
                while (businessRepository.existsBySlug(slug)) {
                    slug = base + i++;
                }
                business.setSlug(slug);
                businessRepository.save(business);
                log.info("Back-filled slug '{}' for business '{}'", slug, business.getName());
            }
        });
    }
}

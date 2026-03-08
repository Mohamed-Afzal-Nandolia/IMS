package com.IMS.inventory_management_system.repository;

import com.IMS.inventory_management_system.entity.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessRepository extends JpaRepository<Business, String> {
    Optional<Business> findByEmail(String email);

    Optional<Business> findBySlug(String slug);

    boolean existsBySlug(String slug);
}

package com.IMS.inventory_management_system.repository;

import com.IMS.inventory_management_system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findFirstByBusinessId(String businessId);

    @Query("select b.isActive from User u join u.business b where u.email = ?1")
    Boolean isBusinessActiveByEmail(String email);
}

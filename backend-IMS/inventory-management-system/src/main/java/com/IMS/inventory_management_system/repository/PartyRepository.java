package com.IMS.inventory_management_system.repository;

import com.IMS.inventory_management_system.entity.Party;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartyRepository extends JpaRepository<Party, String> {
    List<Party> findByBusinessId(String businessId);

    List<Party> findByBusinessIdAndType(String businessId, String type);
}

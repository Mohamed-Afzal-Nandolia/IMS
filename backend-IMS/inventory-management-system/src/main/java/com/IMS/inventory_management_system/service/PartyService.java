package com.IMS.inventory_management_system.service;

import com.IMS.inventory_management_system.entity.Party;
import com.IMS.inventory_management_system.repository.PartyRepository;
import com.IMS.inventory_management_system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PartyService {

    private final PartyRepository partyRepository;

    public List<Party> getAllParties(String type) {
        String businessId = SecurityUtils.getCurrentBusinessId();
        if (type != null && !type.isEmpty()) {
            return partyRepository.findByBusinessIdAndType(businessId, type);
        }
        return partyRepository.findByBusinessId(businessId);
    }

    @Transactional
    public Party createParty(Party party) {
        party.setId(UUID.randomUUID().toString());
        party.setBusiness(SecurityUtils.getCurrentUser().getBusiness());
        return partyRepository.save(party);
    }

    @Transactional
    public Party updateParty(String id, Party updatedParty) {
        Party existing = partyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Party not found"));

        if (!existing.getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new IllegalStateException("Unauthorized access");
        }

        existing.setName(updatedParty.getName());
        existing.setEmail(updatedParty.getEmail());
        existing.setPhone(updatedParty.getPhone());
        existing.setGstin(updatedParty.getGstin());
        existing.setBillingAddress(updatedParty.getBillingAddress());
        existing.setShippingAddress(updatedParty.getShippingAddress());

        if (updatedParty.getIsActive() != null) {
            existing.setIsActive(updatedParty.getIsActive());
        }

        return partyRepository.save(existing);
    }

    @Transactional
    public void deleteParty(String id) {
        Party existing = partyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Party not found"));

        if (!existing.getBusiness().getId().equals(SecurityUtils.getCurrentBusinessId())) {
            throw new IllegalStateException("Unauthorized access");
        }
        partyRepository.delete(existing);
    }
}

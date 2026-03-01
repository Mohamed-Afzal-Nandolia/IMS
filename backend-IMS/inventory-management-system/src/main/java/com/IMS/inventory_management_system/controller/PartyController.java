package com.IMS.inventory_management_system.controller;

import com.IMS.inventory_management_system.entity.Party;
import com.IMS.inventory_management_system.service.PartyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parties")
@RequiredArgsConstructor
public class PartyController {

    private final PartyService partyService;

    @GetMapping
    public ResponseEntity<List<Party>> getAllParties(@RequestParam(required = false) String type) {
        return ResponseEntity.ok(partyService.getAllParties(type));
    }

    @PostMapping
    public ResponseEntity<Party> createParty(@RequestBody Party party) {
        return ResponseEntity.ok(partyService.createParty(party));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Party> updateParty(@PathVariable String id, @RequestBody Party party) {
        return ResponseEntity.ok(partyService.updateParty(id, party));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParty(@PathVariable String id) {
        partyService.deleteParty(id);
        return ResponseEntity.noContent().build();
    }
}

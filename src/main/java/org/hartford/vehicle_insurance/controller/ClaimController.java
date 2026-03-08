package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.Claim;
import org.hartford.vehicle_insurance.service.ClaimService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/claims")
public class ClaimController {
    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping("/{subscriptionId}/apply")
    @PreAuthorize("hasRole('CUSTOMER')")
    public Claim applyClaim(@PathVariable Long subscriptionId, @RequestBody Claim claim) {
        return claimService.applyClaim(subscriptionId, claim);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<Claim> getMyClaims() {
        return claimService.getMyClaims();
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('CLAIM_OFFICER')")
    public List<Claim> getPendingClaims() {
        return claimService.getPendingClaims();
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('CLAIM_OFFICER')")
    public Claim approveClaim(@PathVariable Long id) {
        return claimService.approveClaim(id);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('CLAIM_OFFICER')")
    public Claim rejectClaim(@PathVariable Long id) {
        return claimService.rejectClaim(id);
    }
}

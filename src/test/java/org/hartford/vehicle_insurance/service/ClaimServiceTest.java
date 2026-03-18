package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.ClaimRepo;
import org.hartford.vehicle_insurance.Repository.MyUserRepo;
import org.hartford.vehicle_insurance.Repository.PolicySubscriptionRepo;
import org.hartford.vehicle_insurance.model.Claim;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ClaimServiceTest {
    @Mock
    private ClaimRepo claimRepo;
    @Mock
    private MyUserRepo myUserRepo;
    @Mock
    private PolicySubscriptionRepo policySubscriptionRepo;
    @InjectMocks
    private ClaimService claimService;

    @Test
    void applyClaim_shouldReturnClaim() {
        org.hartford.vehicle_insurance.model.Claim claim = new org.hartford.vehicle_insurance.model.Claim();
        claim.setClaimDate(java.time.LocalDate.now()); // Set required date
        claim.setClaimAmount(1000.0); // Set required claim amount
        org.hartford.vehicle_insurance.model.MyUser user = new org.hartford.vehicle_insurance.model.MyUser();
        user.setId(1L);
        org.hartford.vehicle_insurance.model.PolicySubscription sub = new org.hartford.vehicle_insurance.model.PolicySubscription();
        sub.setMyUser(user);
        sub.setStatus("APPROVED");
        org.hartford.vehicle_insurance.model.Policy policy = new org.hartford.vehicle_insurance.model.Policy();
        policy.setCoverageAmount(100000.0);
        // Set required dates on PolicySubscription, not Policy
        sub.setPolicy(policy);
        sub.setStartDate(java.time.LocalDate.now().minusDays(10));
        sub.setEndDate(java.time.LocalDate.now().plusDays(10));
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("user", "pass"));
        when(myUserRepo.findByUsername(anyString())).thenReturn(java.util.Optional.of(user));
        when(policySubscriptionRepo.findById(1L)).thenReturn(java.util.Optional.of(sub));
        when(claimRepo.save(any(org.hartford.vehicle_insurance.model.Claim.class))).thenReturn(claim);
        org.hartford.vehicle_insurance.model.Claim result = claimService.applyClaim(1L, claim);
        assertNotNull(result);
    }

    @Test
    void approveClaim_shouldSetStatusApproved() {
        org.hartford.vehicle_insurance.model.Claim claim = new org.hartford.vehicle_insurance.model.Claim();
        when(claimRepo.findById(1L)).thenReturn(java.util.Optional.of(claim));
        when(claimRepo.save(any(org.hartford.vehicle_insurance.model.Claim.class))).thenReturn(claim);
        org.hartford.vehicle_insurance.model.Claim result = claimService.approveClaim(1L);
        assertEquals(org.hartford.vehicle_insurance.model.ClaimStatus.APPROVED, result.getStatus());
    }

    @Test
    void rejectClaim_shouldSetStatusRejected() {
        org.hartford.vehicle_insurance.model.Claim claim = new org.hartford.vehicle_insurance.model.Claim();
        when(claimRepo.findById(1L)).thenReturn(java.util.Optional.of(claim));
        when(claimRepo.save(any(org.hartford.vehicle_insurance.model.Claim.class))).thenReturn(claim);
        org.hartford.vehicle_insurance.model.Claim result = claimService.rejectClaim(1L);
        assertEquals(org.hartford.vehicle_insurance.model.ClaimStatus.REJECTED, result.getStatus());
    }

    @Test
    void getMyClaims_shouldReturnList() {
        org.hartford.vehicle_insurance.model.MyUser user = new org.hartford.vehicle_insurance.model.MyUser();
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("user", "pass"));
        when(myUserRepo.findByUsername(anyString())).thenReturn(java.util.Optional.of(user));
        when(claimRepo.findByPolicySubscription_MyUser(user)).thenReturn(java.util.Collections.singletonList(new org.hartford.vehicle_insurance.model.Claim()));
        java.util.List<org.hartford.vehicle_insurance.model.Claim> result = claimService.getMyClaims();
        assertFalse(result.isEmpty());
    }

    @Test
    void getPendingClaims_shouldReturnList() {
        when(claimRepo.findByStatus(org.hartford.vehicle_insurance.model.ClaimStatus.PENDING)).thenReturn(java.util.Collections.singletonList(new org.hartford.vehicle_insurance.model.Claim()));
        java.util.List<org.hartford.vehicle_insurance.model.Claim> result = claimService.getPendingClaims();
        assertFalse(result.isEmpty());
    }
}

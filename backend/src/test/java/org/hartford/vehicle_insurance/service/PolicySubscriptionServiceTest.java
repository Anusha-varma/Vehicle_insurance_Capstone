package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.PolicySubscriptionRepo;
import org.hartford.vehicle_insurance.Repository.MyUserRepo;
import org.hartford.vehicle_insurance.Repository.PolicyRepo;
import org.hartford.vehicle_insurance.Repository.ClaimRepo;
import org.hartford.vehicle_insurance.model.PolicySubscription;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
class PolicySubscriptionServiceTest {
    @Mock
    private PolicySubscriptionRepo policySubscriptionRepo;
    @Mock
    private MyUserRepo myUserRepo;
    @Mock
    private PolicyRepo policyRepo;
    @Mock
    private ClaimRepo claimRepo;
    @InjectMocks
    private PolicySubscriptionService policySubscriptionService;

    @Test
    void applyPolicy_shouldReturnSubscription() {
        PolicySubscription sub = new PolicySubscription();
        org.hartford.vehicle_insurance.model.MyUser user = new org.hartford.vehicle_insurance.model.MyUser();
        user.setId(1L);
        org.hartford.vehicle_insurance.model.Policy policy = new org.hartford.vehicle_insurance.model.Policy();
        policy.setBasePremium(1000.0); // Set required basePremium
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("user", "pass"));
        when(myUserRepo.findByUsername(anyString())).thenReturn(java.util.Optional.of(user));
        when(policyRepo.findById(1L)).thenReturn(java.util.Optional.of(policy));
        when(policySubscriptionRepo.existsByMyUserAndPolicyAndVehicleNumber(any(), any(), any())).thenReturn(false);
        when(policySubscriptionRepo.existsByVehicleNumberAndStatus(any(), any())).thenReturn(false);
        when(policySubscriptionRepo.save(any(PolicySubscription.class))).thenReturn(sub);
        PolicySubscription result = policySubscriptionService.applyPolicy(1L, sub);
        assertNotNull(result);
    }

    @Test
    void getMySubscriptions_shouldReturnList() {
        org.hartford.vehicle_insurance.model.MyUser user = new org.hartford.vehicle_insurance.model.MyUser();
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("user", "pass"));
        when(myUserRepo.findByUsername(anyString())).thenReturn(java.util.Optional.of(user));
        when(policySubscriptionRepo.findByMyUser(user)).thenReturn(java.util.Collections.singletonList(new PolicySubscription()));
        java.util.List<PolicySubscription> result = policySubscriptionService.getMySubscriptions();
        assertFalse(result.isEmpty());
    }

    @Test
    void getAllPendingApplications_shouldReturnList() {
        when(policySubscriptionRepo.findByStatus(PolicySubscription.STATUS_PENDING)).thenReturn(java.util.Collections.singletonList(new PolicySubscription()));
        java.util.List<PolicySubscription> result = policySubscriptionService.getAllPendingApplications();
        assertFalse(result.isEmpty());
    }

    @Test
    void updateVehicleDetails_shouldUpdateAndReturnSubscription() {
        PolicySubscription sub = new PolicySubscription();
        org.hartford.vehicle_insurance.model.Policy policy = new org.hartford.vehicle_insurance.model.Policy();
        policy.setBasePremium(1000.0);
        sub.setPolicy(policy);
        sub.setMyUser(new org.hartford.vehicle_insurance.model.MyUser());
        when(policySubscriptionRepo.findById(1L)).thenReturn(java.util.Optional.of(sub));
        when(policySubscriptionRepo.save(any(PolicySubscription.class))).thenReturn(sub);
        PolicySubscription result = policySubscriptionService.updateVehicleDetails(1L, "ABC123", "ModelX", 2020);
        assertEquals("ABC123", result.getVehicleNumber());
        assertEquals("ModelX", result.getVehicleModel());
        assertEquals(2020, result.getVehicleYear());
    }

    @Test
    void renewSubscription_shouldReturnNewSubscription() {
        PolicySubscription existing = new PolicySubscription();
        org.hartford.vehicle_insurance.model.MyUser user = new org.hartford.vehicle_insurance.model.MyUser();
        user.setId(1L);
        org.hartford.vehicle_insurance.model.Policy policy = new org.hartford.vehicle_insurance.model.Policy();
        policy.setBasePremium(1000.0);
        existing.setMyUser(user);
        existing.setPolicy(policy);
        existing.setVehicleNumber("ABC123");
        existing.setVehicleModel("ModelX");
        existing.setVehicleYear(2020);
        existing.setEndDate(java.time.LocalDate.now());
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("user", "pass"));
        when(myUserRepo.findByUsername(anyString())).thenReturn(java.util.Optional.of(user));
        when(policySubscriptionRepo.findById(1L)).thenReturn(java.util.Optional.of(existing));
        when(claimRepo.findByPolicySubscriptionId(1L)).thenReturn(java.util.Collections.emptyList());
        when(policySubscriptionRepo.save(any(PolicySubscription.class))).thenReturn(new PolicySubscription());
        PolicySubscription result = policySubscriptionService.renewSubscription(1L);
        assertNotNull(result);
    }

    @Test
    void getAllApplications_shouldReturnList() {
        when(policySubscriptionRepo.findAll()).thenReturn(java.util.Collections.singletonList(new PolicySubscription()));
        java.util.List<PolicySubscription> result = policySubscriptionService.getAllApplications();
        assertFalse(result.isEmpty());
    }

    @Test
    void approveApplication_shouldSetStatusApproved() {
        PolicySubscription sub = new PolicySubscription();
        when(policySubscriptionRepo.findById(1L)).thenReturn(java.util.Optional.of(sub));
        when(policySubscriptionRepo.save(any(PolicySubscription.class))).thenReturn(sub);
        PolicySubscription result = policySubscriptionService.approveApplication(1L);
        assertEquals(PolicySubscription.STATUS_APPROVED, result.getStatus());
    }

    @Test
    void rejectApplication_shouldSetStatusRejected() {
        PolicySubscription sub = new PolicySubscription();
        when(policySubscriptionRepo.findById(1L)).thenReturn(java.util.Optional.of(sub));
        when(policySubscriptionRepo.save(any(PolicySubscription.class))).thenReturn(sub);
        PolicySubscription result = policySubscriptionService.rejectApplication(1L);
        assertEquals(PolicySubscription.STATUS_REJECTED, result.getStatus());
    }
}

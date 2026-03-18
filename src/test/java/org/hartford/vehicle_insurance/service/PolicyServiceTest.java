package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.PolicyRepo;
import org.hartford.vehicle_insurance.model.Policy;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
class PolicyServiceTest {
    @Mock
    private PolicyRepo policyRepo;
    @InjectMocks
    private PolicyService policyService;

    @Test
    void getPolicyById_shouldReturnPolicy() {
        Policy policy = new Policy();
        when(policyRepo.findById(1L)).thenReturn(Optional.of(policy));
        Optional<Policy> result = policyService.getPolicyById(1L);
        assertTrue(result.isPresent());
        assertEquals(policy, result.get());
    }

    @Test
    void getAllPolicies_shouldReturnList() {
        when(policyRepo.findAll()).thenReturn(java.util.Collections.emptyList());
        assertNotNull(policyService.getAllPolicies());
    }

    @Test
    void createPolicy_shouldReturnPolicy() {
        Policy policy = new Policy();
        when(policyRepo.save(any(Policy.class))).thenReturn(policy);
        Policy result = policyService.createPolicy(policy);
        assertEquals(policy, result);
    }

    @Test
    void updatePolicy_shouldReturnUpdatedPolicy() {
        Policy policy = new Policy();
        policy.setName("Test");
        when(policyRepo.findById(1L)).thenReturn(Optional.of(policy));
        when(policyRepo.save(any(Policy.class))).thenReturn(policy);
        Policy result = policyService.updatePolicy(1L, policy);
        assertEquals("Test", result.getName());
    }

    @Test
    void deletePolicy_shouldNotThrow() {
        try {
            policyService.deletePolicy(1L);
        } catch (Exception e) {
            fail("Should not throw exception");
        }
    }
}

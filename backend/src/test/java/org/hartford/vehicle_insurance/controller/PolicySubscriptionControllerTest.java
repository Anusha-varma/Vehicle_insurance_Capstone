package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.PolicySubscription;
import org.hartford.vehicle_insurance.service.PolicySubscriptionService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockPart;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PolicySubscriptionControllerTest {
    @Mock
    private PolicySubscriptionService policySubscriptionService;
    @InjectMocks
    private PolicySubscriptionController policySubscriptionController;

    @Test
    void applyPolicy_shouldReturnSubscription() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(policySubscriptionController).build();
        PolicySubscription sub = new PolicySubscription();
        when(policySubscriptionService.applyPolicy(eq(1L), any(PolicySubscription.class))).thenReturn(sub);
        mockMvc.perform(post("/policy/1/apply")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }



    @Test
    void getMySubscriptions_shouldReturnList() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(policySubscriptionController).build();
        when(policySubscriptionService.getMySubscriptions()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/policy/my"))
                .andExpect(status().isOk());
    }

    @Test
    void updateVehicleDetails_shouldReturnSubscription() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(policySubscriptionController).build();
        PolicySubscription sub = new PolicySubscription();
        when(policySubscriptionService.updateVehicleDetails(eq(1L), eq(null), eq(null), eq(null))).thenReturn(sub);
        mockMvc.perform(put("/policy/1/vehicle-details")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void renewPolicySubscription_shouldReturnSubscription() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(policySubscriptionController).build();
        PolicySubscription sub = new PolicySubscription();
        when(policySubscriptionService.renewSubscription(eq(1L))).thenReturn(sub);
        mockMvc.perform(post("/policy/1/renew"))
                .andExpect(status().isOk());
    }
}

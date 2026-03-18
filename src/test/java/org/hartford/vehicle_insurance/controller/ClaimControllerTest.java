package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.Repository.ClaimRepo;
import org.hartford.vehicle_insurance.model.Claim;
import org.hartford.vehicle_insurance.service.ClaimService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ClaimControllerTest {
    @Mock
    private ClaimService claimService;
    @Mock
    private ClaimRepo claimRepository;
    @InjectMocks
    private ClaimController claimController;

    @Test
    void applyClaimJson_shouldReturnClaim() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(claimController).build();
        Claim claim = new Claim();
        when(claimService.applyClaim(eq(1L), any(Claim.class))).thenReturn(claim);
        mockMvc.perform(post("/claims/1/apply")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"claimAmount\":1000}")) // Provide claimAmount to avoid error
                .andExpect(status().isOk());
    }

    @Test
    void applyClaimWithDocuments_shouldReturnClaim() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(claimController).build();
        Claim claim = new Claim();
        when(claimService.applyClaim(eq(1L), any(Claim.class))).thenReturn(claim);
        MockMultipartFile data = new MockMultipartFile("data", "data", "application/json", "{\"claimAmount\":1000}".getBytes()); // Provide claimAmount
        mockMvc.perform(multipart("/claims/1/apply").file(data))
                .andExpect(status().isOk());
    }

    @Test
    void getMyClaims_shouldReturnClaims() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(claimController).build();
        when(claimService.getMyClaims()).thenReturn(Collections.singletonList(new Claim()));
        mockMvc.perform(get("/claims/my"))
                .andExpect(status().isOk());
    }

    @Test
    void getPendingClaims_shouldReturnClaims() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(claimController).build();
        when(claimService.getPendingClaims()).thenReturn(Collections.singletonList(new Claim()));
        mockMvc.perform(get("/claims/pending"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllClaims_shouldReturnClaims() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(claimController).build();
        when(claimRepository.findAll()).thenReturn(Collections.singletonList(new Claim()));
        mockMvc.perform(get("/claims/all"))
                .andExpect(status().isOk());
    }

    @Test
    void approveClaim_shouldReturnClaim() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(claimController).build();
        Claim claim = new Claim();
        when(claimService.approveClaim(1L)).thenReturn(claim);
        mockMvc.perform(put("/claims/1/approve"))
                .andExpect(status().isOk());
    }

    @Test
    void rejectClaim_shouldReturnClaim() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(claimController).build();
        Claim claim = new Claim();
        when(claimService.rejectClaim(1L)).thenReturn(claim);
        mockMvc.perform(put("/claims/1/reject"))
                .andExpect(status().isOk());
    }
}

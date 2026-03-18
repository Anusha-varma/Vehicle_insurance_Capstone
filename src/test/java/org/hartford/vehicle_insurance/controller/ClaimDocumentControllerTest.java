package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.ClaimDocument;
import org.hartford.vehicle_insurance.service.ClaimDocumentService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ClaimDocumentControllerTest {
    @Mock
    private ClaimDocumentService claimDocumentService;
    @InjectMocks
    private ClaimDocumentController claimDocumentController;

    @Test
    void uploadDocument_shouldReturnDocument() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(claimDocumentController).build();
        ClaimDocument doc = new ClaimDocument();
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", MediaType.TEXT_PLAIN_VALUE, "test".getBytes());
        when(claimDocumentService.uploadDocument(1L, file)).thenReturn(doc);
        mockMvc.perform(multipart("/claims/1/upload-document").file(file))
                .andExpect(status().isOk());
    }

    @Test
    void getClaimDocuments_shouldReturnList() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(claimDocumentController).build();
        ClaimDocument doc = new ClaimDocument();
        List<ClaimDocument> docs = Collections.singletonList(doc);
        when(claimDocumentService.canAccessDocument(1L)).thenReturn(true);
        when(claimDocumentService.getClaimDocuments(1L)).thenReturn(docs);
        mockMvc.perform(get("/claims/1/documents"))
                .andExpect(status().isOk());
    }

    @Test
    void getClaimDocuments_shouldReturnForbiddenIfNoAccess() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(claimDocumentController).build();
        when(claimDocumentService.canAccessDocument(1L)).thenReturn(false);
        mockMvc.perform(get("/claims/1/documents"))
                .andExpect(status().isForbidden());
    }

    @Test
    void downloadDocument_shouldReturnFile() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(claimDocumentController).build();
        ClaimDocument doc = new ClaimDocument();
        doc.setFileName("test.txt");
        doc.setContentType(MediaType.TEXT_PLAIN_VALUE);
        doc.setClaim(new org.hartford.vehicle_insurance.model.Claim());
        doc.getClaim().setId(1L);
        when(claimDocumentService.canAccessDocument(1L)).thenReturn(true);
        when(claimDocumentService.getDocumentById(2L)).thenReturn(doc);
        when(claimDocumentService.getDocumentContent(2L)).thenReturn("test content".getBytes());
        mockMvc.perform(get("/claims/1/documents/2"))
                .andExpect(status().isOk());
    }

    @Test
    void downloadDocument_shouldReturnForbiddenIfNoAccess() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(claimDocumentController).build();
        when(claimDocumentService.canAccessDocument(1L)).thenReturn(false);
        mockMvc.perform(get("/claims/1/documents/2"))
                .andExpect(status().isForbidden());
    }

    @Test
    void downloadDocument_shouldReturnForbiddenIfWrongClaim() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(claimDocumentController).build();
        ClaimDocument doc = new ClaimDocument();
        doc.setFileName("test.txt");
        doc.setContentType(MediaType.TEXT_PLAIN_VALUE);
        doc.setClaim(new org.hartford.vehicle_insurance.model.Claim());
        doc.getClaim().setId(99L); // Wrong claimId
        when(claimDocumentService.canAccessDocument(1L)).thenReturn(true);
        when(claimDocumentService.getDocumentById(2L)).thenReturn(doc);
        mockMvc.perform(get("/claims/1/documents/2"))
                .andExpect(status().isForbidden());
    }
}

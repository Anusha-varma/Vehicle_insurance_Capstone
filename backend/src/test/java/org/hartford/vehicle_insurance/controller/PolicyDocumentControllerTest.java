package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.PolicyDocument;
import org.hartford.vehicle_insurance.service.PolicyDocumentService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.anyLong;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@ExtendWith(MockitoExtension.class)
class PolicyDocumentControllerTest {
    @Mock
    private PolicyDocumentService policyDocumentService;
    @InjectMocks
    private PolicyDocumentController policyDocumentController;

    @Test
    void uploadDocument_shouldReturnDocument() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(policyDocumentController).build();
        PolicyDocument doc = new PolicyDocument();
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", MediaType.TEXT_PLAIN_VALUE, "test".getBytes());
        when(policyDocumentService.uploadDocument(1L, file)).thenReturn(doc);
        mockMvc.perform(multipart("/policy-subscription/1/upload-document").file(file))
                .andExpect(status().isOk());
    }

    @Test
    void getPolicyDocuments_shouldReturnList() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(policyDocumentController).build();
        PolicyDocument doc1 = new PolicyDocument();
        PolicyDocument doc2 = new PolicyDocument();
        List<PolicyDocument> docs = Arrays.asList(doc1, doc2);
        when(policyDocumentService.getPolicyDocuments(anyLong())).thenReturn(docs);
        mockMvc.perform(MockMvcRequestBuilders.get("/policy-subscription/1/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").exists())
                .andExpect(jsonPath("$[1]").exists());
    }
}

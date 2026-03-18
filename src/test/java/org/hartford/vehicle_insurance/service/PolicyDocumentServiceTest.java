package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.PolicyDocumentRepo;
import org.hartford.vehicle_insurance.Repository.PolicySubscriptionRepo;
import org.hartford.vehicle_insurance.model.PolicyDocument;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PolicyDocumentServiceTest {
    @Mock
    private PolicyDocumentRepo policyDocumentRepo;
    @Mock
    private PolicySubscriptionRepo policySubscriptionRepo;
    @InjectMocks
    private PolicyDocumentService policyDocumentService;

    @Test
    void uploadDocument_shouldReturnDocument() {
        PolicyDocument doc = new PolicyDocument();
        org.hartford.vehicle_insurance.model.PolicySubscription sub = new org.hartford.vehicle_insurance.model.PolicySubscription();
        org.springframework.web.multipart.MultipartFile file = mock(org.springframework.web.multipart.MultipartFile.class);
        when(policySubscriptionRepo.findById(1L)).thenReturn(java.util.Optional.of(sub));
        when(file.isEmpty()).thenReturn(false);
        try {
            when(file.getOriginalFilename()).thenReturn("test.pdf");
            when(file.getContentType()).thenReturn("application/pdf");
            when(file.getBytes()).thenReturn(new byte[]{1,2,3});
        } catch (Exception ignored) {}
        when(policyDocumentRepo.save(any(PolicyDocument.class))).thenReturn(doc);
        PolicyDocument result = policyDocumentService.uploadDocument(1L, file);
        assertEquals(doc, result);
    }

    @Test
    void getPolicyDocuments_shouldReturnList() {
        when(policySubscriptionRepo.existsById(1L)).thenReturn(true);
        when(policyDocumentRepo.findByPolicySubscriptionId(1L)).thenReturn(java.util.Collections.singletonList(new PolicyDocument()));
        java.util.List<PolicyDocument> result = policyDocumentService.getPolicyDocuments(1L);
        assertFalse(result.isEmpty());
    }
}

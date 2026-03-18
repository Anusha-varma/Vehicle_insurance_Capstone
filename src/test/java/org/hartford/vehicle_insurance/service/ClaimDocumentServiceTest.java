package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.ClaimDocumentRepo;
import org.hartford.vehicle_insurance.Repository.ClaimRepo;
import org.hartford.vehicle_insurance.Repository.MyUserRepo;
import org.hartford.vehicle_insurance.model.ClaimDocument;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.mockito.Mockito.*;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ClaimDocumentServiceTest {
    @Mock
    private ClaimDocumentRepo claimDocumentRepo;
    @Mock
    private ClaimRepo claimRepo;
    @Mock
    private MyUserRepo myUserRepo;
    @InjectMocks
    private ClaimDocumentService claimDocumentService;

    @Test
    void uploadDocument_shouldReturnDocument() {
        // Arrange
        ClaimDocument doc = new ClaimDocument();
        org.hartford.vehicle_insurance.model.Claim claim = new org.hartford.vehicle_insurance.model.Claim();
        org.springframework.web.multipart.MultipartFile file = mock(org.springframework.web.multipart.MultipartFile.class);
        when(claimRepo.findById(1L)).thenReturn(java.util.Optional.of(claim));
        when(file.isEmpty()).thenReturn(false);
        try {
            when(file.getOriginalFilename()).thenReturn("test.pdf");
            when(file.getContentType()).thenReturn("application/pdf");
            when(file.getBytes()).thenReturn(new byte[]{1,2,3});
        } catch (Exception ignored) {}
        when(claimDocumentRepo.save(any(ClaimDocument.class))).thenReturn(doc);
        // Act
        ClaimDocument result = claimDocumentService.uploadDocument(1L, file);
        // Assert
        assertEquals(doc, result);
    }

    @Test
    void uploadDocuments_shouldReturnList() {
        org.hartford.vehicle_insurance.model.Claim claim = new org.hartford.vehicle_insurance.model.Claim();
        org.springframework.web.multipart.MultipartFile file = mock(org.springframework.web.multipart.MultipartFile.class);
        when(claimRepo.findById(1L)).thenReturn(java.util.Optional.of(claim));
        when(file.isEmpty()).thenReturn(false);
        try {
            when(file.getOriginalFilename()).thenReturn("test.pdf");
            when(file.getContentType()).thenReturn("application/pdf");
            when(file.getBytes()).thenReturn(new byte[]{1,2,3});
        } catch (Exception ignored) {}
        when(claimDocumentRepo.save(any(ClaimDocument.class))).thenReturn(new ClaimDocument());
        java.util.List<ClaimDocument> result = claimDocumentService.uploadDocuments(1L, new org.springframework.web.multipart.MultipartFile[]{file});
        assertFalse(result.isEmpty());
    }

    @Test
    void getClaimDocuments_shouldReturnList() {
        when(claimRepo.existsById(1L)).thenReturn(true);
        when(claimDocumentRepo.findByClaimId(1L)).thenReturn(java.util.Collections.singletonList(new ClaimDocument()));
        java.util.List<ClaimDocument> result = claimDocumentService.getClaimDocuments(1L);
        assertFalse(result.isEmpty());
    }

    @Test
    void getDocumentById_shouldReturnDocument() {
        ClaimDocument doc = new ClaimDocument();
        when(claimDocumentRepo.findById(1L)).thenReturn(java.util.Optional.of(doc));
        ClaimDocument result = claimDocumentService.getDocumentById(1L);
        assertEquals(doc, result);
    }

    @Test
    void canAccessDocument_shouldReturnTrueForClaimOfficer() {
        org.hartford.vehicle_insurance.model.MyUser user = new org.hartford.vehicle_insurance.model.MyUser();
        user.setRoles("CLAIM_OFFICER");
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("user", "pass"));
        when(myUserRepo.findByUsername(anyString())).thenReturn(java.util.Optional.of(user));
        boolean result = claimDocumentService.canAccessDocument(1L);
        assertTrue(result);
    }

    @Test
    void canAccessDocument_shouldReturnTrueForClaimOwner() {
        org.hartford.vehicle_insurance.model.MyUser user = new org.hartford.vehicle_insurance.model.MyUser();
        user.setId(1L);
        org.hartford.vehicle_insurance.model.Claim claim = new org.hartford.vehicle_insurance.model.Claim();
        org.hartford.vehicle_insurance.model.PolicySubscription sub = new org.hartford.vehicle_insurance.model.PolicySubscription();
        sub.setMyUser(user);
        claim.setPolicySubscription(sub);
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("user", "pass"));
        when(myUserRepo.findByUsername(anyString())).thenReturn(java.util.Optional.of(user));
        when(claimRepo.findById(1L)).thenReturn(java.util.Optional.of(claim));
        boolean result = claimDocumentService.canAccessDocument(1L);
        assertTrue(result);
    }

    @Test
    void getDocumentContent_shouldReturnContentFromDb() {
        ClaimDocument doc = new ClaimDocument();
        doc.setContent(new byte[]{1,2,3});
        when(claimDocumentRepo.findById(1L)).thenReturn(java.util.Optional.of(doc));
        byte[] result = claimDocumentService.getDocumentContent(1L);
        assertArrayEquals(new byte[]{1,2,3}, result);
    }
}

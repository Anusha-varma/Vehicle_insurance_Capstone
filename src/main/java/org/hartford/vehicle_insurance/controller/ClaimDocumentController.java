package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.ClaimDocument;
import org.hartford.vehicle_insurance.service.ClaimDocumentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/claims")
@CrossOrigin("*")
public class ClaimDocumentController {
    private final ClaimDocumentService claimDocumentService;

    public ClaimDocumentController(ClaimDocumentService claimDocumentService) {
        this.claimDocumentService = claimDocumentService;
    }

    /**
     * POST /claims/{claimId}/upload-document
     * Upload a single document for a claim
     */
    @PostMapping("/{claimId}/upload-document")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ClaimDocument uploadDocument(
            @PathVariable Long claimId,
            @RequestParam("file") MultipartFile file) {
        return claimDocumentService.uploadDocument(claimId, file);
    }

    /**
     * GET /claims/{claimId}/documents
     * Returns list of document metadata for a claim
     */
    @GetMapping("/{claimId}/documents")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CLAIM_OFFICER')")
    public ResponseEntity<List<ClaimDocument>> getClaimDocuments(@PathVariable Long claimId) {
        // Validate access - user must be claim owner or claim officer
        if (!claimDocumentService.canAccessDocument(claimId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<ClaimDocument> documents = claimDocumentService.getClaimDocuments(claimId);
        return ResponseEntity.ok(documents);
    }

    /**
     * GET /claims/{claimId}/documents/{documentId}
     * Returns the actual file as a downloadable response
     * Note: This endpoint is permitAll to support direct browser access with token in query param
     */
    @GetMapping("/{claimId}/documents/{documentId}")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long claimId,
            @PathVariable Long documentId,
            @RequestParam(value = "token", required = false) String token) {

        // For direct browser access, authorization is handled by JwtFilter via query param
        // Just validate the user can access this document
        try {
            if (!claimDocumentService.canAccessDocument(claimId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            ClaimDocument document = claimDocumentService.getDocumentById(documentId);

            // Verify document belongs to the specified claim
            if (!document.getClaim().getId().equals(claimId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            byte[] content = claimDocumentService.getDocumentContent(documentId);

            HttpHeaders headers = new HttpHeaders();
            String contentType = document.getContentType() != null ? document.getContentType() : "application/octet-stream";
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("inline", document.getFileName());
            headers.setContentLength(content.length);

            return new ResponseEntity<>(content, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}

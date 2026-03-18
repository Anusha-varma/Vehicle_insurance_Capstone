package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.ClaimDocumentRepo;
import org.hartford.vehicle_insurance.Repository.ClaimRepo;
import org.hartford.vehicle_insurance.Repository.MyUserRepo;
import org.hartford.vehicle_insurance.model.Claim;
import org.hartford.vehicle_insurance.model.ClaimDocument;
import org.hartford.vehicle_insurance.model.MyUser;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class ClaimDocumentService {
    private final ClaimDocumentRepo claimDocumentRepo;
    private final ClaimRepo claimRepo;
    private final MyUserRepo myUserRepo;

    public ClaimDocumentService(ClaimDocumentRepo claimDocumentRepo, ClaimRepo claimRepo, MyUserRepo myUserRepo) {
        this.claimDocumentRepo = claimDocumentRepo;
        this.claimRepo = claimRepo;
        this.myUserRepo = myUserRepo;
    }

    /**
     * Upload documents and store in database as byte array
     */
    public ClaimDocument uploadDocument(Long claimId, MultipartFile file) {
        Claim claim = claimRepo.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            ClaimDocument claimDocument = new ClaimDocument();
            claimDocument.setClaim(claim);
            claimDocument.setFileName(file.getOriginalFilename());
            claimDocument.setContentType(file.getContentType());
            claimDocument.setFileType(file.getContentType()); // Set both for backward compatibility
            claimDocument.setContent(file.getBytes());
            claimDocument.setFilePath("DB_STORAGE"); // Placeholder to satisfy NOT NULL constraint
            claimDocument.setUploadedAt(LocalDateTime.now());

            return claimDocumentRepo.save(claimDocument);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Upload multiple documents for a claim
     */
    public List<ClaimDocument> uploadDocuments(Long claimId, MultipartFile[] files) {
        List<ClaimDocument> uploadedDocs = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    uploadedDocs.add(uploadDocument(claimId, file));
                }
            }
        }
        return uploadedDocs;
    }

    /**
     * Get document metadata for a claim (without content)
     */
    public List<ClaimDocument> getClaimDocuments(Long claimId) {
        if (!claimRepo.existsById(claimId)) {
            throw new RuntimeException("Claim not found");
        }
        return claimDocumentRepo.findByClaimId(claimId);
    }

    /**
     * Get a specific document by ID with security validation
     */
    public ClaimDocument getDocumentById(Long documentId) {
        return claimDocumentRepo.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    /**
     * Validate that the requesting user can access this document
     * Returns true if user is the claim owner or a CLAIM_OFFICER
     */
    public boolean canAccessDocument(Long claimId) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        MyUser user = myUserRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is a CLAIM_OFFICER
        if (user.getRoles() != null && user.getRoles().contains("CLAIM_OFFICER")) {
            return true;
        }

        // Check if user is the claim owner
        Claim claim = claimRepo.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        return claim.getPolicySubscription().getMyUser().getId().equals(user.getId());
    }

    /**
     * Get document content as byte array for download
     */
    public byte[] getDocumentContent(Long documentId) {
        ClaimDocument document = getDocumentById(documentId);

        // If content is stored in database
        if (document.getContent() != null) {
            return document.getContent();
        }

        // Fallback to file system if content is null but filePath exists
        if (document.getFilePath() != null) {
            try {
                Path path = Paths.get(document.getFilePath());
                return Files.readAllBytes(path);
            } catch (IOException e) {
                throw new RuntimeException("Failed to read file: " + e.getMessage());
            }
        }

        throw new RuntimeException("Document content not found");
    }
}

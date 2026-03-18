package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.PolicyDocumentRepo;
import org.hartford.vehicle_insurance.Repository.PolicySubscriptionRepo;
import org.hartford.vehicle_insurance.model.PolicyDocument;
import org.hartford.vehicle_insurance.model.PolicySubscription;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Component
public class PolicyDocumentService {
    private final PolicyDocumentRepo policyDocumentRepo;
    private final PolicySubscriptionRepo policySubscriptionRepo;
    private static final String UPLOAD_DIR = "uploads/policies/";

    public PolicyDocumentService(PolicyDocumentRepo policyDocumentRepo, PolicySubscriptionRepo policySubscriptionRepo) {
        this.policyDocumentRepo = policyDocumentRepo;
        this.policySubscriptionRepo = policySubscriptionRepo;
        createUploadDirectory();
    }

    private void createUploadDirectory() {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Failed to create upload directory: " + e.getMessage());
        }
    }

    public PolicyDocument uploadDocument(Long subscriptionId, MultipartFile file) {
        // Fetch policy subscription
        PolicySubscription policySubscription = policySubscriptionRepo.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Policy subscription not found"));

        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            // Generate unique filename
            String originalFileName = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFileName);
            String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;

            // Save file to disk
            Path uploadPath = Paths.get(UPLOAD_DIR, uniqueFileName);
            Files.write(uploadPath, file.getBytes());

            // Save metadata to database
            PolicyDocument policyDocument = new PolicyDocument();
            policyDocument.setPolicySubscription(policySubscription);
            policyDocument.setFileName(originalFileName);
            policyDocument.setFileType(file.getContentType());
            policyDocument.setFilePath(UPLOAD_DIR + uniqueFileName);
            policyDocument.setUploadedAt(java.time.LocalDateTime.now());
            return policyDocumentRepo.save(policyDocument);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    public List<PolicyDocument> getPolicyDocuments(Long subscriptionId) {
        // Verify policy subscription exists
        if (!policySubscriptionRepo.existsById(subscriptionId)) {
            throw new RuntimeException("Policy subscription not found");
        }
        return policyDocumentRepo.findByPolicySubscriptionId(subscriptionId);
    }

    private String getFileExtension(String fileName) {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf("."));
        }
        return "";
    }
}





package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.PolicyDocument;
import org.hartford.vehicle_insurance.service.PolicyDocumentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/policy-subscription")
@CrossOrigin("*")
public class PolicyDocumentController {
    private final PolicyDocumentService policyDocumentService;

    public PolicyDocumentController(PolicyDocumentService policyDocumentService) {
        this.policyDocumentService = policyDocumentService;
    }

    @PostMapping("/{subscriptionId}/upload-document")
    @PreAuthorize("hasRole('CUSTOMER')")
    public PolicyDocument uploadDocument(
            @PathVariable Long subscriptionId,
            @RequestParam("file") MultipartFile file) {
        return policyDocumentService.uploadDocument(subscriptionId, file);
    }

    @GetMapping("/{subscriptionId}/documents")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CLAIM_OFFICER','ADMIN','UNDERWRITER')")
    public List<PolicyDocument> getPolicyDocuments(@PathVariable Long subscriptionId) {
        return policyDocumentService.getPolicyDocuments(subscriptionId);
    }
}

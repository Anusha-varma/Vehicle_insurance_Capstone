package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.Repository.ClaimRepo;
import org.hartford.vehicle_insurance.Repository.MyUserRepo;
import org.hartford.vehicle_insurance.Repository.PolicySubscriptionRepo;
import org.hartford.vehicle_insurance.model.Claim;
import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.service.ClaimDocumentService;
import org.hartford.vehicle_insurance.service.ClaimService;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/claims")
@CrossOrigin("*")
public class ClaimController {
    private final ClaimService claimService;
    private final ClaimDocumentService claimDocumentService;
    private final ClaimRepo claimRepository;
    private final MyUserRepo myUserRepo;
    private final ClaimRepo claimRepo;
    private final PolicySubscriptionRepo policySubscriptionRepo;
    public ClaimController(ClaimService claimService, ClaimDocumentService claimDocumentService, ClaimRepo claimRepository, MyUserRepo myUserRepo, ClaimRepo claimRepo, PolicySubscriptionRepo policySubscriptionRepo) {
        this.claimService = claimService;
        this.claimDocumentService = claimDocumentService;
        this.claimRepository = claimRepository;
        this.myUserRepo = myUserRepo;
        this.claimRepo = claimRepo;
        this.policySubscriptionRepo = policySubscriptionRepo;
    }

    // Original JSON endpoint (backward compatible)
    @PostMapping(value = "/{subscriptionId}/apply", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    public Claim applyClaimJson(@PathVariable Long subscriptionId, @RequestBody Claim claim) {
        return claimService.applyClaim(subscriptionId, claim);
    }

    // Multipart endpoint with JSON data part (matches frontend format)
    @PostMapping(value = "/{subscriptionId}/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    public Claim applyClaimWithDocuments(
            @PathVariable Long subscriptionId,
            @RequestPart(value = "data", required = false) Map<String, Object> data,
            @RequestParam(value = "claimAmount", required = false) Double claimAmountParam,
            @RequestParam(value = "reason", required = false) String reasonParam,
            @RequestParam(value = "injuryType", required = false) String injuryTypeParam,
            @RequestPart(value = "documents", required = false) MultipartFile[] documents) {

        Claim claim = new Claim();

        if (data != null) {
            // Frontend sends JSON as "data" part
            Object amountObj = data.get("claimAmount");
            if (amountObj instanceof Number) {
                claim.setClaimAmount(((Number) amountObj).doubleValue());
            } else if (amountObj instanceof String) {
                claim.setClaimAmount(Double.parseDouble((String) amountObj));
            } else {
                throw new RuntimeException("claimAmount is required");
            }

            // Map reason
            claim.setReason((String) data.get("reason"));

            // Map Third Party fields out of the JSON
            if (data.containsKey("claimType") && data.get("claimType") != null) {
                claim.setClaimType(org.hartford.vehicle_insurance.model.ClaimType.valueOf((String) data.get("claimType")));
            }
            if (data.containsKey("thirdPartyName")) {
                claim.setThirdPartyName((String) data.get("thirdPartyName"));
            }
            if (data.containsKey("thirdPartyVehicleNumber")) {
                claim.setThirdPartyVehicleNumber((String) data.get("thirdPartyVehicleNumber"));
            }
            // Map injuryType from JSON or fallback to request param
            String injuryType = (String) data.get("injuryType");
            if ((injuryType == null || injuryType.trim().isEmpty()) && injuryTypeParam != null && !injuryTypeParam.trim().isEmpty()) {
                injuryType = injuryTypeParam;
            }
            claim.setInjuryType(injuryType);
            if (data.containsKey("garageEstimate") && data.get("garageEstimate") != null) {
                Object estObj = data.get("garageEstimate");
                if (estObj instanceof Number) {
                    claim.setGarageEstimate(((Number) estObj).doubleValue());
                } else if (estObj instanceof String && !((String)estObj).isEmpty()) {
                    claim.setGarageEstimate(Double.parseDouble((String) estObj));
                }
            }
            if (data.containsKey("damageDescription")) {
                claim.setDamageDescription((String) data.get("damageDescription"));
            }
        } else if (claimAmountParam != null) {
            claim.setClaimAmount(claimAmountParam);
            claim.setReason(reasonParam);
            // Map injuryType from request param if present
            if (injuryTypeParam != null && !injuryTypeParam.trim().isEmpty()) {
                claim.setInjuryType(injuryTypeParam);
            }
        } else {
            throw new RuntimeException("claimAmount is required");
        }

        System.out.println("DEBUG: Applying claim - amount=" + claim.getClaimAmount() + ", reason=" + claim.getReason() + ", type=" + claim.getClaimType() + ", injuryType=" + claim.getInjuryType());

        // Apply claim
        Claim savedClaim = claimService.applyClaim(subscriptionId, claim);

        // Upload documents if provided
        if (documents != null && documents.length > 0) {
            System.out.println("DEBUG: Uploading " + documents.length + " documents");
            claimDocumentService.uploadDocuments(savedClaim.getId(), documents);
        }

        return savedClaim;
    }


    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<Claim> getMyClaims() {
        return claimService.getMyClaims();
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('CLAIM_OFFICER')")
    public List<Claim> getPendingClaims() {
        return claimService.getPendingClaims();
    }


    @GetMapping("/all")
    @PreAuthorize("hasRole('CLAIM_OFFICER')")
    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('CLAIM_OFFICER')")
    public Claim approveClaim(@PathVariable Long id) {
        return claimService.approveClaim(id);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('CLAIM_OFFICER')")
    public Claim rejectClaim(@PathVariable Long id) {
        return claimService.rejectClaim(id);
    }
    @GetMapping("/commission")
    @PreAuthorize("hasRole('CLAIM_OFFICER')")
    public Double getClaimOfficerCommission() {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        MyUser officer = myUserRepo.findByUsername(username)
                .orElseThrow();

        return policySubscriptionRepo.sumClaimOfficerCommission(officer.getId());
    }
}

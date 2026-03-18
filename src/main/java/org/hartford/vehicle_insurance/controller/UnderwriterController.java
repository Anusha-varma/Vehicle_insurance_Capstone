package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.Repository.MyUserRepo;
import org.hartford.vehicle_insurance.Repository.PolicySubscriptionRepo;
import org.hartford.vehicle_insurance.dto.PremiumBreakdownDTO;
import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.model.PolicySubscription;
import org.hartford.vehicle_insurance.service.PolicySubscriptionService;
import org.hartford.vehicle_insurance.service.PolicyDocumentService;
import org.hartford.vehicle_insurance.model.PolicyDocument;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/underwriter")
@CrossOrigin("*")
public class UnderwriterController {
    private final PolicySubscriptionService policySubscriptionService;
    private final PolicyDocumentService policyDocumentService;
    private final MyUserRepo myUserRepo;
    private final PolicySubscriptionRepo policySubscriptionRepo;

    public UnderwriterController(PolicySubscriptionService policySubscriptionService, PolicyDocumentService policyDocumentService, MyUserRepo myUserRepo, PolicySubscriptionRepo policySubscriptionRepo) {
        this.policySubscriptionService = policySubscriptionService;
        this.policyDocumentService = policyDocumentService;
        this.myUserRepo = myUserRepo;
        this.policySubscriptionRepo = policySubscriptionRepo;
    }

    @PreAuthorize("hasAnyRole('UNDERWRITER','ADMIN')")
    @GetMapping("/pending-applications")
    public List<PolicySubscription> getAllPendingApplications() {
        return policySubscriptionService.getAllPendingApplications();
    }

    @PreAuthorize("hasRole('UNDERWRITER')")
    @PutMapping("/policy-applications/{id}/approve")
    public PolicySubscription approveApplication(@PathVariable Long id) {
        return policySubscriptionService.approveApplication(id);
    }

    @PreAuthorize("hasRole('UNDERWRITER')")
    @PutMapping("/policy-applications/{id}/reject")
    public PolicySubscription rejectApplication(@PathVariable Long id) {
        return policySubscriptionService.rejectApplication(id);
    }

    @GetMapping("/all-applications")
    @PreAuthorize("hasRole('UNDERWRITER')")
    public List<PolicySubscription> getAllApplications() {
        return policySubscriptionService.getAllApplications();
    }

    @PreAuthorize("hasRole('UNDERWRITER')")
    @GetMapping("/policy-applications/{subscriptionId}/documents")
    public List<PolicyDocument> getPolicyDocuments(@PathVariable Long subscriptionId) {
        return policyDocumentService.getPolicyDocuments(subscriptionId);
    }
    @PreAuthorize("hasRole('UNDERWRITER')")
    @GetMapping("/policy-applications/{id}/premium-breakdown")
    public PremiumBreakdownDTO getPremiumBreakdown(@PathVariable Long id) {
        return policySubscriptionService.getPremiumBreakdown(id);
    }
    @GetMapping("/commission")
    @PreAuthorize("hasRole('UNDERWRITER')")
    public Double getMyCommission() {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        MyUser user = myUserRepo.findByUsername(username)
                .orElseThrow();

        return policySubscriptionRepo.sumUnderwriterCommission(user.getId());
    }
}

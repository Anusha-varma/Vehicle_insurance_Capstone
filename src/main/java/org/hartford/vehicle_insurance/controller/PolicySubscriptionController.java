package org.hartford.vehicle_insurance.controller;
import org.hartford.vehicle_insurance.dto.PolicyApplicationRequest;
import org.hartford.vehicle_insurance.model.PolicySubscription;
import org.hartford.vehicle_insurance.service.PolicySubscriptionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("policy")
public class PolicySubscriptionController {
    private final PolicySubscriptionService policySubscriptionService;

    public PolicySubscriptionController(PolicySubscriptionService policySubscriptionService) {
        this.policySubscriptionService = policySubscriptionService;
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("{policyId}/apply")
    public PolicySubscription applyForPolicy(
            @PathVariable Long policyId,
            @RequestBody PolicyApplicationRequest request) {

        PolicySubscription subscription = new PolicySubscription();
        subscription.setStartDate(request.getStartDate());
        subscription.setEndDate(request.getEndDate());

        return policySubscriptionService.applyPolicy(
                policyId,
                subscription,
                request.getAddOnIds()
        );
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/my")
    public List<PolicySubscription> getMySubscriptions() {
        return policySubscriptionService.getMySubscriptions();
    }
}

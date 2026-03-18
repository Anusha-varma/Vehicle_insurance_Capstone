package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.PolicySubscription;
import org.hartford.vehicle_insurance.service.PolicySubscriptionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PolicySubscriptionService policySubscriptionService;

    public PaymentController(PolicySubscriptionService policySubscriptionService) {
        this.policySubscriptionService = policySubscriptionService;
    }

    @PostMapping("/{subscriptionId}")
    public PolicySubscription payPremium(
            @PathVariable Long subscriptionId,
            @RequestParam String transactionId) {

        return policySubscriptionService.payPremium(subscriptionId, transactionId);
    }
}
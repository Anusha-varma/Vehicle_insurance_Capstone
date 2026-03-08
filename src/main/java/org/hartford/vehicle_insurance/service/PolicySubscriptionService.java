package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.MyUserRepo;
import org.hartford.vehicle_insurance.Repository.PolicyRepo;
import org.hartford.vehicle_insurance.Repository.PolicySubscriptionRepo;
import org.hartford.vehicle_insurance.Repository.AddOnRepo;
import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.model.Policy;
import org.hartford.vehicle_insurance.model.PolicySubscription;
import org.hartford.vehicle_insurance.model.AddOn;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class PolicySubscriptionService {
    private final PolicySubscriptionRepo policySubscriptionRepo;
    private final MyUserRepo myUserRepo;
    private final PolicyRepo policyRepo;
    private final AddOnRepo addOnRepo;

    public PolicySubscriptionService(PolicySubscriptionRepo policySubscriptionRepo, MyUserRepo myUserRepo, PolicyRepo policyRepo, AddOnRepo addOnRepo) {
        this.policySubscriptionRepo = policySubscriptionRepo;
        this.myUserRepo = myUserRepo;
        this.policyRepo = policyRepo;
        this.addOnRepo = addOnRepo;
    }

    public PolicySubscription applyPolicy(Long policyId, PolicySubscription policySubscription, List<Long> addOnIds) {

        // Get logged-in username
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        //Fetch user from DB
        MyUser user = myUserRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        //Fetch policy
        Policy policy = policyRepo.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        if (!policy.getIsActive()) {
            throw new RuntimeException("Policy is not active");
        }
        if (policySubscriptionRepo.existsByPolicyAndMyUser(policy, user)) {
            throw new RuntimeException("You already applied for this policy");
        }

        // Fetch add-ons if provided
        Set<AddOn> selectedAddOns = new java.util.HashSet<>();
        if (addOnIds != null && !addOnIds.isEmpty()) {
            selectedAddOns = addOnRepo.findAllById(addOnIds).stream()
                .collect(Collectors.toSet());
        }

        policySubscription.setMyUser(user);
        policySubscription.setPolicy(policy);
        policySubscription.setSelectedAddOns(selectedAddOns);
        // Automatically approve policy subscriptions
        policySubscription.setStatus(PolicySubscription.STATUS_APPROVED);

        return policySubscriptionRepo.save(policySubscription);
    }

    // Overloaded method for backward compatibility (without add-ons)
    public PolicySubscription applyPolicy(Long policyId, PolicySubscription policySubscription) {
        return applyPolicy(policyId, policySubscription, null);
    }
    public List<PolicySubscription> getMySubscriptions() {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        MyUser user = myUserRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return policySubscriptionRepo.findByMyUser(user);
    }

}

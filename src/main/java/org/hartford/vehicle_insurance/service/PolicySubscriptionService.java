package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.MyUserRepo;
import org.hartford.vehicle_insurance.Repository.PolicyRepo;
import org.hartford.vehicle_insurance.Repository.PolicySubscriptionRepo;
import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.model.Policy;
import org.hartford.vehicle_insurance.model.PolicySubscription;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PolicySubscriptionService {
    private final PolicySubscriptionRepo policySubscriptionRepo;

    private final MyUserRepo myUserRepo;
private final PolicyRepo policyRepo;
    public PolicySubscriptionService(PolicySubscriptionRepo policySubscriptionRepo, MyUserRepo myUserRepo, PolicyRepo policyRepo) {
        this.policySubscriptionRepo = policySubscriptionRepo;
        this.myUserRepo = myUserRepo;
        this.policyRepo = policyRepo;
    }

    public PolicySubscription applyPolicy(Long policyId, PolicySubscription policySubscription) {

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
        policySubscription.setMyUser(user);
        policySubscription.setPolicy(policy);
        // Automatically approve policy subscriptions (Underwriter role removed)
        policySubscription.setStatus(PolicySubscription.STATUS_APPROVED);

        return policySubscriptionRepo.save(policySubscription);
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

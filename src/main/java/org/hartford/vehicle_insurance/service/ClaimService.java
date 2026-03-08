package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.ClaimRepo;
import org.hartford.vehicle_insurance.Repository.MyUserRepo;
import org.hartford.vehicle_insurance.Repository.PolicySubscriptionRepo;
import org.hartford.vehicle_insurance.model.Claim;
import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.model.PolicySubscription;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class ClaimService {
    private final ClaimRepo claimRepo;
    private final MyUserRepo myUserRepo;
    private final PolicySubscriptionRepo policySubscriptionRepo;

    public ClaimService(ClaimRepo claimRepo, MyUserRepo myUserRepo, PolicySubscriptionRepo policySubscriptionRepo) {
        this.claimRepo = claimRepo;
        this.myUserRepo = myUserRepo;
        this.policySubscriptionRepo = policySubscriptionRepo;
    }

    public Claim applyClaim(Long subscriptionId, Claim claim) {
        // Get logged-in username
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();


        // Fetch user from DB
        MyUser user = myUserRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch PolicySubscription by subscriptionId
        PolicySubscription subscription = policySubscriptionRepo.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        if (claim.getClaimAmount() > subscription.getPolicy().getCoverageAmount()) {
            throw new RuntimeException("Claim amount exceeds coverage limit");
        }
        LocalDate today = LocalDate.now();

        if (today.isBefore(subscription.getStartDate()) ||
                today.isAfter(subscription.getEndDate())) {
            throw new RuntimeException("Claim not allowed outside policy period");
        }
        // Ensure subscription belongs to logged-in user
        if (!subscription.getMyUser().getId().equals(user.getId())) {
            throw new RuntimeException("Subscription does not belong to logged-in user");
        }

        // Ensure subscription status is APPROVED
        if (!subscription.getStatus().equals(PolicySubscription.STATUS_APPROVED)) {
            throw new RuntimeException("Subscription must be approved to apply for claim");
        }

        // Set claim details
        claim.setPolicySubscription(subscription);
        claim.setClaimDate(LocalDate.now());
        claim.setStatus(Claim.STATUS_PENDING);

        return claimRepo.save(claim);
    }

    public Claim approveClaim(Long claimId) {
        Claim claim = claimRepo.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        claim.setStatus(Claim.STATUS_APPROVED);
        return claimRepo.save(claim);
    }

    public Claim rejectClaim(Long claimId) {
        Claim claim = claimRepo.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        claim.setStatus(Claim.STATUS_REJECTED);
        return claimRepo.save(claim);
    }

    public List<Claim> getMyClaims() {
        // Get logged-in username
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // Fetch user from DB
        MyUser user = myUserRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return claimRepo.findByPolicySubscription_MyUser(user);
    }

    public List<Claim> getPendingClaims() {
        return claimRepo.findByStatus(Claim.STATUS_PENDING);
    }
}

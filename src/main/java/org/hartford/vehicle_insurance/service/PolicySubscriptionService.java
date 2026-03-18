package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.MyUserRepo;
import org.hartford.vehicle_insurance.Repository.PolicyRepo;
import org.hartford.vehicle_insurance.Repository.PolicySubscriptionRepo;
import org.hartford.vehicle_insurance.dto.PremiumBreakdownDTO;
import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.model.Policy;
import org.hartford.vehicle_insurance.model.PolicySubscription;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class PolicySubscriptionService {
    private final PolicySubscriptionRepo policySubscriptionRepo;
    private final MyUserRepo myUserRepo;
    private final PolicyRepo policyRepo;
    private final org.hartford.vehicle_insurance.Repository.ClaimRepo claimRepo;
    private final NotificationService notificationService;

    public PolicySubscriptionService(PolicySubscriptionRepo policySubscriptionRepo, MyUserRepo myUserRepo, PolicyRepo policyRepo, org.hartford.vehicle_insurance.Repository.ClaimRepo claimRepo, NotificationService notificationService) {
        this.policySubscriptionRepo = policySubscriptionRepo;
        this.myUserRepo = myUserRepo;
        this.policyRepo = policyRepo;
        this.claimRepo = claimRepo;
        this.notificationService = notificationService;
    }

    public PolicySubscription applyPolicy(Long policyId, PolicySubscription policySubscription) {
        // Get logged-in username
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        policySubscription.setPaymentStatus("PENDING");
        //Fetch user from DB
        MyUser user = myUserRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        //Fetch policy
        Policy policy = policyRepo.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        if (!policy.getIsActive()) {
            throw new RuntimeException("Policy is not active");
        }
        if (policySubscriptionRepo.existsByMyUserAndPolicyAndVehicleNumber(user, policy, policySubscription.getVehicleNumber())) {
            throw new RuntimeException("You already applied for this policy with this vehicle");
        }
        // New validation: block duplicate vehicle number for any customer if already APPROVED
        policySubscription.setMyUser(user);
        policySubscription.setPolicy(policy);
        // Calculate and set risk score
        Double riskScore = calculateRiskScore(policy, user, policySubscription);
        policySubscription.setRiskScore(riskScore);
        // Calculate premium using risk score
        double basePremium = policy.getBasePremium();
        double finalPremium = basePremium * riskScore;
        finalPremium = Math.round(finalPremium * 100.0) / 100.0;
        policySubscription.setTotalPremium(finalPremium);
        // Set status to PENDING (not auto-approved)
        policySubscription.setStatus(PolicySubscription.STATUS_PENDING);
        if (policySubscriptionRepo.existsByVehicleNumberAndStatus(policySubscription.getVehicleNumber(), "APPROVED")) {
            throw new IllegalArgumentException("A policy already exists for this vehicle number.");
        }
        PolicySubscription savedResult = policySubscriptionRepo.save(policySubscription);
        
        // Trigger Notifications
        notificationService.createNotification("New policy application pending review for vehicle " + savedResult.getVehicleNumber(), "UNDERWRITER", null);
        notificationService.createNotification("New policy application submitted by " + username, "ADMIN", null);
        
        return savedResult;
    }

    /**
     * Calculates risk score based on vehicle type, policy type, vehicle age, and customer history.
     * Lower score = lower risk, Higher score = higher risk.
     * Score range: 1.0 (lowest risk) to 5.0 (highest risk)
     */
    private Double calculateRiskScore(Policy policy, MyUser user, PolicySubscription subscription) {
        double baseScore = 1.0;

        System.out.println("========== POLICY RISK CALCULATION START ==========");

        // Factor 1: Vehicle Age (older vehicles = higher risk) - MOST IMPORTANT
        Integer vehicleYear = subscription.getVehicleYear();
        System.out.println("Vehicle Year: " + vehicleYear);
        if (vehicleYear != null) {
            int currentYear = java.time.LocalDate.now().getYear();
            int vehicleAge = currentYear - vehicleYear;
            System.out.println("Current Year: " + currentYear + ", Vehicle Age: " + vehicleAge + " years");

            if (vehicleAge >= 15) {
                baseScore += 0.8;
                System.out.println("Age Risk: +0.8 (very old, >= 15 years)");
            } else if (vehicleAge >= 10) {
                baseScore += 0.5;
                System.out.println("Age Risk: +0.5 (old, >= 10 years)");
            } else if (vehicleAge >= 5) {
                baseScore += 0.3;
                System.out.println("Age Risk: +0.3 (medium, >= 5 years)");
            } else if (vehicleAge >= 2) {
                baseScore += 0.1;
                System.out.println("Age Risk: +0.1 (new, >= 2 years)");
            } else {
                System.out.println("Age Risk: +0.0 (brand new, < 2 years)");
            }
        } else {
            System.out.println("WARNING: Vehicle Year is NULL - skipping age-based risk");
        }

        // Factor 2: Vehicle Type Risk
        String vehicleType = policy.getVehicleType();
        System.out.println("Vehicle Type: " + vehicleType);
        if (vehicleType != null) {
            switch (vehicleType.toUpperCase()) {
                case "BIKE":
                case "TWO_WHEELER":
                    baseScore += 0.5;
                    System.out.println("Vehicle Type Risk: +0.5 (two-wheeler)");
                    break;
                case "CAR":
                case "FOUR_WHEELER":
                    baseScore += 0.2;
                    System.out.println("Vehicle Type Risk: +0.2 (car)");
                    break;
                case "COMMERCIAL":
                case "TRUCK":
                    baseScore += 0.6;
                    System.out.println("Vehicle Type Risk: +0.6 (commercial)");
                    break;
                default:
                    baseScore += 0.1;
                    System.out.println("Vehicle Type Risk: +0.1 (other)");
                    break;
            }
        }

        // Factor 3: Policy Type Risk
        String policyType = policy.getPolicyType();
        System.out.println("Policy Type: " + policyType);
        if (policyType != null) {
            if ("THIRD_PARTY".equalsIgnoreCase(policyType)) {
                baseScore += 0.3;
                System.out.println("Policy Type Risk: +0.3 (third party)");
            } else if ("COMPREHENSIVE".equalsIgnoreCase(policyType)) {
                baseScore += 0.1;
                System.out.println("Policy Type Risk: +0.1 (comprehensive)");
            }
        }

        // Factor 4: Coverage Amount Risk
        Double coverageAmount = policy.getCoverageAmount();
        System.out.println("Coverage Amount: " + coverageAmount);
        if (coverageAmount != null) {
            if (coverageAmount >= 1000000) {
                baseScore += 0.5;
                System.out.println("Coverage Risk: +0.5");
            } else if (coverageAmount >= 500000) {
                baseScore += 0.3;
                System.out.println("Coverage Risk: +0.3");
            } else if (coverageAmount >= 200000) {
                baseScore += 0.1;
                System.out.println("Coverage Risk: +0.1");
            }
        }

        System.out.println("========== FINAL POLICY RISK: " + baseScore + " ==========");

        // Ensure score is within bounds (1.0 to 5.0)
        baseScore = Math.max(1.0, Math.min(5.0, baseScore));

        // Round to 2 decimal places
        return Math.round(baseScore * 100.0) / 100.0;
    }

    public List<PolicySubscription> getMySubscriptions() {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        MyUser user = myUserRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return policySubscriptionRepo.findByMyUser(user);
    }

    public PolicySubscription updateVehicleDetails(Long subscriptionId, String vehicleNumber, String vehicleModel, Integer vehicleYear) {
        PolicySubscription subscription = policySubscriptionRepo.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        subscription.setVehicleNumber(vehicleNumber);
        subscription.setVehicleModel(vehicleModel);
        subscription.setVehicleYear(vehicleYear);

        // Recalculate risk score now that vehicle details are available
        Double newRiskScore = calculateRiskScore(subscription.getPolicy(), subscription.getMyUser(), subscription);
        double basePremium = subscription.getPolicy().getBasePremium();
        double finalPremium = basePremium * newRiskScore;
        subscription.setTotalPremium(Math.round(finalPremium * 100.0) / 100.0);

        System.out.println("Updated subscription " + subscriptionId + " with vehicleYear=" + vehicleYear + ", new riskScore=" + newRiskScore);

        return policySubscriptionRepo.save(subscription);
    }

    public PremiumBreakdownDTO getPremiumBreakdown(Long subscriptionId) {

        PolicySubscription sub = policySubscriptionRepo.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        PremiumBreakdownDTO dto = new PremiumBreakdownDTO();

        dto.setPolicyName(sub.getPolicy().getName());
        dto.setVehicleNumber(sub.getVehicleNumber());
        dto.setVehicleModel(sub.getVehicleModel());
        dto.setVehicleYear(sub.getVehicleYear());

        double basePremium = sub.getPolicy().getBasePremium();
        double riskScore = sub.getRiskScore();

        int vehicleAge = LocalDate.now().getYear() - sub.getVehicleYear();

        double vehicleAgeFactor = vehicleAge * 100;

        double riskMultiplier = 1 + (riskScore / 10);

        double finalPremium = (basePremium + vehicleAgeFactor) * riskMultiplier;

        dto.setBasePremium(basePremium);
        dto.setVehicleAgeFactor(vehicleAgeFactor);
        dto.setRiskScore(riskScore);
        dto.setRiskMultiplier(riskMultiplier);
        dto.setCalculatedPremium(finalPremium);

        return dto;
    }
    public PolicySubscription renewSubscription(Long subscriptionId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        MyUser user = myUserRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        PolicySubscription existingSubscription = policySubscriptionRepo.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        if (!existingSubscription.getMyUser().getId().equals(user.getId())) {
             throw new RuntimeException("Unauthorized to renew this subscription");
        }
        PolicySubscription newSubscription = new PolicySubscription();
        newSubscription.setMyUser(user);
        newSubscription.setPolicy(existingSubscription.getPolicy());
        newSubscription.setVehicleNumber(existingSubscription.getVehicleNumber());
        newSubscription.setVehicleModel(existingSubscription.getVehicleModel());
        newSubscription.setVehicleYear(existingSubscription.getVehicleYear());
        // Set new start and end dates
        java.time.LocalDate newStartDate = existingSubscription.getEndDate() != null ? existingSubscription.getEndDate() : java.time.LocalDate.now();
        if (newStartDate.isBefore(java.time.LocalDate.now())) {
            newStartDate = java.time.LocalDate.now();
        }
        newSubscription.setStartDate(newStartDate);
        newSubscription.setEndDate(newStartDate.plusYears(1));
        Double riskScore = calculateRiskScore(newSubscription.getPolicy(), user, newSubscription);
        newSubscription.setRiskScore(riskScore);
        boolean eligibleForNoClaimDiscount = false;
        java.util.List<org.hartford.vehicle_insurance.model.Claim> claims = claimRepo.findByPolicySubscriptionId(existingSubscription.getId());
        if (claims == null || claims.isEmpty()) {
            eligibleForNoClaimDiscount = true;
        }
        double basePremium = newSubscription.getPolicy().getBasePremium();
        double finalPremium = basePremium * riskScore;
        if (eligibleForNoClaimDiscount) {
            finalPremium = finalPremium * 0.9;
        }
        newSubscription.setTotalPremium(Math.round(finalPremium * 100.0) / 100.0);
        newSubscription.setStatus(PolicySubscription.STATUS_APPROVED);
        return policySubscriptionRepo.save(newSubscription);
    }

    public List<PolicySubscription> getAllApplications() {
        return policySubscriptionRepo.findAll();
    }
    // Underwriter: Get all pending policy applications
    public List<PolicySubscription> getAllPendingApplications() {
        return policySubscriptionRepo.findByStatus(PolicySubscription.STATUS_PENDING);
    }

    // Underwriter: Approve a pending application
    public PolicySubscription approveApplication(Long subscriptionId) {

        PolicySubscription sub = policySubscriptionRepo.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        MyUser underwriter = myUserRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        sub.setStatus(PolicySubscription.STATUS_APPROVED);

        // store who approved
        sub.setUnderwriterId(underwriter.getId());

        PolicySubscription savedResult = policySubscriptionRepo.save(sub);

        // Trigger Notifications
        notificationService.createNotification("Your policy application for vehicle " + savedResult.getVehicleNumber() + " has been approved.", "CUSTOMER", savedResult.getMyUser().getId());
        notificationService.createNotification("Policy application for vehicle " + savedResult.getVehicleNumber() + " approved by Underwriter " + username, "ADMIN", null);

        return savedResult;
    }
    // Underwriter: Reject a pending application
    public PolicySubscription rejectApplication(Long subscriptionId) {
        PolicySubscription sub = policySubscriptionRepo.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        sub.setStatus(PolicySubscription.STATUS_REJECTED);
        
        PolicySubscription savedResult = policySubscriptionRepo.save(sub);

        // Trigger Notifications
        notificationService.createNotification("Your policy application for vehicle " + savedResult.getVehicleNumber() + " has been rejected.", "CUSTOMER", savedResult.getMyUser().getId());
        notificationService.createNotification("Policy application for vehicle " + savedResult.getVehicleNumber() + " rejected.", "ADMIN", null);

        return savedResult;
    }
    public PolicySubscription payPremium(Long subscriptionId, String transactionId) {

        PolicySubscription sub = policySubscriptionRepo.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        if (!"APPROVED".equals(sub.getStatus())) {
            throw new RuntimeException("Policy not approved yet");
        }

        if ("PAID".equals(sub.getPaymentStatus())) {
            throw new RuntimeException("Premium already paid");
        }

        // Ensure premium exists
        if (sub.getTotalPremium() == 0.0) {
            double basePremium = sub.getPolicy().getBasePremium();
            double risk = sub.getRiskScore() != null ? sub.getRiskScore() : 1.0;
            double premium = basePremium * risk;
            premium = Math.round(premium * 100.0) / 100.0;
            sub.setTotalPremium(premium);
        }

        sub.setPaymentStatus("PAID");
        sub.setTransactionId(transactionId);

        double premium = sub.getTotalPremium();

        double underwriterCommission = premium * 0.05;
        double claimOfficerCommission = premium * 0.02;

        sub.setUnderwriterCommission(underwriterCommission);
        sub.setClaimOfficerCommission(claimOfficerCommission);

        PolicySubscription savedResult = policySubscriptionRepo.save(sub);

        // Trigger Notifications
        notificationService.createNotification("Premium payment successful for vehicle " + savedResult.getVehicleNumber(), "CUSTOMER", savedResult.getMyUser().getId());
        notificationService.createNotification("Premium payment successful for vehicle " + savedResult.getVehicleNumber() + " by user " + savedResult.getMyUser().getUsername(), "ADMIN", null);

        return savedResult;
    }
}

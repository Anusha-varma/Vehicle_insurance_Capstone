package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.ClaimRepo;
import org.hartford.vehicle_insurance.Repository.MyUserRepo;
import org.hartford.vehicle_insurance.Repository.PolicySubscriptionRepo;
import org.hartford.vehicle_insurance.model.Claim;
import org.hartford.vehicle_insurance.model.ClaimStatus;
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
    private final NotificationService notificationService;

    public ClaimService(ClaimRepo claimRepo, MyUserRepo myUserRepo, PolicySubscriptionRepo policySubscriptionRepo, NotificationService notificationService) {
        this.claimRepo = claimRepo;
        this.myUserRepo = myUserRepo;
        this.policySubscriptionRepo = policySubscriptionRepo;
        this.notificationService = notificationService;
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

        // Third-party claim logic
        if (claim.getClaimType() != null && claim.getClaimType().name().equals("THIRD_PARTY")) {
            // Validate injuryType
            if (claim.getInjuryType() == null || claim.getInjuryType().trim().isEmpty()) {
                throw new RuntimeException("injuryType is required for third-party claims");
            }
            // For VEHICLE_DAMAGE, garageEstimate is required
            if ("VEHICLE_DAMAGE".equalsIgnoreCase(claim.getInjuryType()) && claim.getGarageEstimate() == null) {
                throw new RuntimeException("garageEstimate is required for VEHICLE_DAMAGE third-party claims");
            }
            double coverageAmount = subscription.getPolicy().getCoverageAmount() != null ? subscription.getPolicy().getCoverageAmount() : 0.0;
            String injuryType = claim.getInjuryType().toUpperCase();
            // INSIDE your ClaimService.java -> applyClaim() method

            if (claim.getClaimType() != null && claim.getClaimType().name().equals("THIRD_PARTY")) {
                // Validate injuryType
                if (claim.getInjuryType() == null || claim.getInjuryType().trim().isEmpty()) {
                    throw new RuntimeException("injuryType is required for third-party claims");
                }


                // Validate the amount the user entered instead of overwriting it
                if ("VEHICLE_DAMAGE".equals(injuryType)) {
                    Double estimate = claim.getGarageEstimate();
                    if (estimate == null) {
                        throw new RuntimeException("garageEstimate is required for VEHICLE_DAMAGE");
                    }

                    // Ensure their requested amount isn't greater than the minimum of Estimate/Coverage Limit
                    double maxAllowed = Math.min(estimate, coverageAmount);
                    if (claim.getClaimAmount() > maxAllowed) {
                        throw new RuntimeException("Claim amount cannot exceed garage estimate or policy coverage limit");
                    }

                } else if ("MINOR_INJURY".equals(injuryType)) {
                    if (claim.getClaimAmount() > 50000.0) {
                        throw new RuntimeException("Claim amount cannot exceed ₹50,000 for minor injury");
                    }
                } else if ("SERIOUS_INJURY".equals(injuryType)) {
                    if (claim.getClaimAmount() > 150000.0) {
                        throw new RuntimeException("Claim amount cannot exceed ₹150,000 for serious injury");
                    }
                } else if ("DEATH".equals(injuryType)) {
                    if (claim.getClaimAmount() > 500000.0) {
                        throw new RuntimeException("Claim amount cannot exceed ₹500,000 for death");
                    }
                } else {
                    throw new RuntimeException("Unknown injuryType for third-party claim: " + injuryType);
                }
            }

        } else {
            // Self-claim: validate claim amount
            if (claim.getClaimAmount() > subscription.getPolicy().getCoverageAmount()) {
                throw new RuntimeException("Claim amount exceeds coverage limit");
            }
        }

        claim.setPolicySubscription(subscription);
        claim.setClaimDate(LocalDate.now());
        claim.setStatus(ClaimStatus.PENDING);
        double riskScore = calculateRiskFactor(subscription);
        claim.setRiskScore(riskScore);
        
        Claim savedResult = claimRepo.save(claim);

        // Trigger Notifications
        notificationService.createNotification("New claim request pending review for vehicle " + subscription.getVehicleNumber(), "CLAIM_OFFICER", null);
        notificationService.createNotification("New claim request submitted by " + username + " for vehicle " + subscription.getVehicleNumber(), "ADMIN", null);
        
        return savedResult;
    }

    public Claim approveClaim(Long claimId) {

        Claim claim = claimRepo.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        MyUser officer = myUserRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        claim.setStatus(ClaimStatus.APPROVED);

        // save claim officer id
        PolicySubscription sub = claim.getPolicySubscription();
        sub.setClaimOfficerId(officer.getId());

        policySubscriptionRepo.save(sub);

        Claim savedResult = claimRepo.save(claim);

        // Trigger Notifications
        notificationService.createNotification("Your claim request for vehicle " + sub.getVehicleNumber() + " has been approved.", "CUSTOMER", sub.getMyUser().getId());
        notificationService.createNotification("Claim request for vehicle " + sub.getVehicleNumber() + " approved by Claim Officer " + username, "ADMIN", null);

        return savedResult;
    }
    public Claim rejectClaim(Long claimId) {
        Claim claim = claimRepo.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        claim.setStatus(ClaimStatus.REJECTED);
        
        Claim savedResult = claimRepo.save(claim);

        // Trigger Notifications
        notificationService.createNotification("Your claim request for vehicle " + savedResult.getPolicySubscription().getVehicleNumber() + " has been rejected.", "CUSTOMER", savedResult.getPolicySubscription().getMyUser().getId());
        notificationService.createNotification("Claim request for vehicle " + savedResult.getPolicySubscription().getVehicleNumber() + " rejected.", "ADMIN", null);

        return savedResult;
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
    private double calculateRiskFactor(PolicySubscription subscription) {
        double risk = 1.0;

        System.out.println("========== RISK CALCULATION START ==========");
        System.out.println("Subscription ID: " + subscription.getId());

        // Factor 1: Vehicle Age (older vehicles = higher risk)
        Integer vehicleYear = subscription.getVehicleYear();
        System.out.println("Vehicle Year from DB: " + vehicleYear);

        if (vehicleYear != null) {
            int currentYear = LocalDate.now().getYear();
            int vehicleAge = currentYear - vehicleYear;
            System.out.println("Current Year: " + currentYear + ", Vehicle Age: " + vehicleAge + " years");

            if (vehicleAge >= 15) {
                risk += 0.8;
                System.out.println("Age Risk: +0.8 (very old, >= 15 years)");
            } else if (vehicleAge >= 10) {
                risk += 0.5;
                System.out.println("Age Risk: +0.5 (old, >= 10 years)");
            } else if (vehicleAge >= 5) {
                risk += 0.3;
                System.out.println("Age Risk: +0.3 (medium, >= 5 years)");
            } else if (vehicleAge >= 2) {
                risk += 0.1;
                System.out.println("Age Risk: +0.1 (new, >= 2 years)");
            } else {
                System.out.println("Age Risk: +0.0 (brand new, < 2 years)");
            }
        } else {
            System.out.println("WARNING: Vehicle Year is NULL - skipping age-based risk");
        }

        // Factor 2: Coverage Amount
        Double coverageAmount = subscription.getPolicy().getCoverageAmount();
        System.out.println("Coverage Amount: " + coverageAmount);
        if (coverageAmount != null) {
            if (coverageAmount >= 1000000) {
                risk += 0.5;
                System.out.println("Coverage Risk: +0.5");
            } else if (coverageAmount >= 500000) {
                risk += 0.3;
                System.out.println("Coverage Risk: +0.3");
            } else if (coverageAmount >= 200000) {
                risk += 0.1;
                System.out.println("Coverage Risk: +0.1");
            }
        }

        // Factor 3: Policy Type
        String policyType = subscription.getPolicy().getPolicyType();
        System.out.println("Policy Type: " + policyType);
        if (policyType != null) {
            if ("THIRD_PARTY".equalsIgnoreCase(policyType)) {
                risk += 0.3;
                System.out.println("Policy Type Risk: +0.3");
            } else if ("COMPREHENSIVE".equalsIgnoreCase(policyType)) {
                risk += 0.1;
                System.out.println("Policy Type Risk: +0.1");
            }
        }

        // Factor 4: Vehicle Type
        String vehicleType = subscription.getPolicy().getVehicleType();
        System.out.println("Vehicle Type: " + vehicleType);
        if (vehicleType != null) {
            switch (vehicleType.toUpperCase()) {
                case "BIKE":
                case "TWO_WHEELER":
                    risk += 0.5;
                    System.out.println("Vehicle Type Risk: +0.5 (two-wheeler)");
                    break;
                case "COMMERCIAL":
                case "TRUCK":
                    risk += 0.6;
                    System.out.println("Vehicle Type Risk: +0.6 (commercial)");
                    break;
                case "CAR":
                case "FOUR_WHEELER":
                    risk += 0.2;
                    System.out.println("Vehicle Type Risk: +0.2 (car)");
                    break;
                default:
                    risk += 0.1;
                    System.out.println("Vehicle Type Risk: +0.1 (other)");
                    break;
            }
        }

        // Factor 5: Previous claims - SKIP for current calculation to avoid circular issues
        // The issue might be that including the current claim in the count is affecting results

        System.out.println("========== FINAL RISK: " + risk + " ==========");
        // Round to 2 decimal places and cap between 1.0 and 5.0
        risk = Math.round(risk * 100.0) / 100.0;
        return Math.min(5.0, Math.max(1.0, risk));
    }
    private double calculateThirdPartyCompensation(Claim claim, PolicySubscription subscription) {
        String injuryType = claim.getInjuryType();
        if (injuryType == null) throw new RuntimeException("injuryType is required");
        double coverageAmount = subscription.getPolicy().getCoverageAmount() != null ? subscription.getPolicy().getCoverageAmount() : 0.0;
        switch (injuryType.toUpperCase()) {
            case "MINOR_INJURY":
                return 50000;
            case "SERIOUS_INJURY":
                return 150000;
            case "DEATH":
                return 500000;
            case "VEHICLE_DAMAGE":
                if (claim.getGarageEstimate() == null) throw new RuntimeException("garageEstimate is required for VEHICLE_DAMAGE");
                return Math.min(claim.getGarageEstimate(), coverageAmount);
            default:
                throw new RuntimeException("Unknown injuryType for third-party claim: " + injuryType);
        }
    }
    public List<Claim> getPendingClaims() {
        return claimRepo.findByStatus(ClaimStatus.PENDING);
    }
}

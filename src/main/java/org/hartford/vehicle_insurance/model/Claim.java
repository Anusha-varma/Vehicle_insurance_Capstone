package org.hartford.vehicle_insurance.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import org.hartford.vehicle_insurance.model.ClaimType;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subscription_id", nullable = false)
    private PolicySubscription policySubscription;

    @Column(nullable = false)
    private Double claimAmount;

    @Column(length = 500)
    private String reason;

    @Column(nullable = false)
    private LocalDate claimDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status;

    @Column
    private Double riskScore;

    @Enumerated(EnumType.STRING)
    private ClaimType claimType;

    private String thirdPartyName;
    private String thirdPartyVehicleNumber;
    private String injuryType;
    private Double garageEstimate;
    private String damageDescription;

    public Claim() {
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    public Claim(PolicySubscription policySubscription, Double claimAmount, String reason, LocalDate claimDate, ClaimStatus status) {
        this.policySubscription = policySubscription;
        this.claimAmount = claimAmount;
        this.reason = reason;
        this.claimDate = claimDate;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PolicySubscription getPolicySubscription() {
        return policySubscription;
    }

    public void setPolicySubscription(PolicySubscription policySubscription) {
        this.policySubscription = policySubscription;
    }

    public Double getClaimAmount() {
        return claimAmount;
    }

    public void setClaimAmount(Double claimAmount) {
        this.claimAmount = claimAmount;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDate getClaimDate() {
        return claimDate;
    }

    public void setClaimDate(LocalDate claimDate) {
        this.claimDate = claimDate;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public ClaimType getClaimType() {
        return claimType;
    }

    public void setClaimType(ClaimType claimType) {
        this.claimType = claimType;
    }

    public String getThirdPartyName() {
        return thirdPartyName;
    }

    public void setThirdPartyName(String thirdPartyName) {
        this.thirdPartyName = thirdPartyName;
    }

    public String getThirdPartyVehicleNumber() {
        return thirdPartyVehicleNumber;
    }

    public void setThirdPartyVehicleNumber(String thirdPartyVehicleNumber) {
        this.thirdPartyVehicleNumber = thirdPartyVehicleNumber;
    }

    public String getInjuryType() {
        return injuryType;
    }

    public void setInjuryType(String injuryType) {
        this.injuryType = injuryType;
    }

    public Double getGarageEstimate() {
        return garageEstimate;
    }

    public void setGarageEstimate(Double garageEstimate) {
        this.garageEstimate = garageEstimate;
    }

    public String getDamageDescription() {
        return damageDescription;
    }

    public void setDamageDescription(String damageDescription) {
        this.damageDescription = damageDescription;
    }

    @JsonProperty("customerName")
    public String getCustomerName() {
        if (policySubscription != null && policySubscription.getMyUser() != null) {
            return policySubscription.getMyUser().getUsername();
        }
        return null;
    }

    @JsonProperty("policyName")
    public String getPolicyName() {
        if (policySubscription != null && policySubscription.getPolicy() != null) {
            return policySubscription.getPolicy().getName();
        }
        return null;
    }

    @JsonProperty("riskScore")
    public Double getRiskScore() {
        return riskScore;
    }

    @JsonProperty("vehicleNumber")
    public String getVehicleNumber() {
        if (policySubscription != null) {
            return policySubscription.getVehicleNumber();
        }
        return null;
    }

    @JsonProperty("vehicleModel")
    public String getVehicleModel() {
        if (policySubscription != null) {
            return policySubscription.getVehicleModel();
        }
        return null;
    }

    @JsonProperty("vehicleYear")
    public Integer getVehicleYear() {
        if (policySubscription != null) {
            return policySubscription.getVehicleYear();
        }
        return null;
    }

    // Ensure claimType defaults to SELF if not set
    @PrePersist
    public void prePersist() {
        if (this.claimType == null) {
            this.claimType = ClaimType.SELF;
        }
    }
}

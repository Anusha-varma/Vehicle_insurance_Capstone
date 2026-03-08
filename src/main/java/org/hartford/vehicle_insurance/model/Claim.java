package org.hartford.vehicle_insurance.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "claims")
public class Claim {
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "subscription_id", nullable = false)
    private PolicySubscription policySubscription;

    @Column(nullable = false)
    private Double claimAmount;

    @Column(length = 500)
    private String reason;

    @Column(nullable = false)
    private LocalDate claimDate;

    @Column(nullable = false)
    private String status;

    public Claim() {
    }

    public Claim(PolicySubscription policySubscription, Double claimAmount, String reason, LocalDate claimDate, String status) {
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

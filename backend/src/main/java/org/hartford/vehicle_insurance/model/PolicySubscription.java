package org.hartford.vehicle_insurance.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "policy_subscriptions")
public class PolicySubscription {
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private MyUser myUser;

    @Column(nullable = false)
    private LocalDate startDate;

    public Long getUnderwriterId() {
        return underwriterId;
    }

    public void setUnderwriterId(Long underwriterId) {
        this.underwriterId = underwriterId;
    }

    public Long getClaimOfficerId() {
        return claimOfficerId;
    }

    public void setClaimOfficerId(Long claimOfficerId) {
        this.claimOfficerId = claimOfficerId;
    }

    private Long underwriterId;
    private Long claimOfficerId;
    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String status;

    private String vehicleNumber;

    private String vehicleModel;

    private Integer vehicleYear;

    private Double riskScore;

    @Column(name = "total_premium")
    private Double totalPremium;

    @Column(name="payment_status")
    private String paymentStatus; // PENDING / PAID

    @Column(name="transaction_id")
    private String transactionId;

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public Double getUnderwriterCommission() {
        return underwriterCommission;
    }

    public void setUnderwriterCommission(Double underwriterCommission) {
        this.underwriterCommission = underwriterCommission;
    }

    public Double getClaimOfficerCommission() {
        return claimOfficerCommission;
    }

    public void setClaimOfficerCommission(Double claimOfficerCommission) {
        this.claimOfficerCommission = claimOfficerCommission;
    }

    @Column(name="underwriter_commission")
    private Double underwriterCommission=0.0;

    @Column(name="claimofficer_commission")
    private Double claimOfficerCommission=0.0;
    public PolicySubscription() {
    }

    public PolicySubscription(Policy policy, MyUser myUser, LocalDate startDate, LocalDate endDate, String status) {
        this.policy = policy;
        this.myUser = myUser;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Policy getPolicy() {
        return policy;
    }

    public void setPolicy(Policy policy) {
        this.policy = policy;
    }

    public MyUser getMyUser() {
        return myUser;
    }

    public void setMyUser(MyUser myUser) {
        this.myUser = myUser;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getTotalPremium() {
        return totalPremium != null ? totalPremium : 0.0;
    }

    public void setTotalPremium(Double totalPremium) {
        this.totalPremium = totalPremium;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleModel() {
        return vehicleModel;
    }

    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }

    public Integer getVehicleYear() {
        return vehicleYear;
    }

    public void setVehicleYear(Integer vehicleYear) {
        this.vehicleYear = vehicleYear;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }
}

package org.hartford.vehicle_insurance.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "policies")
public class Policy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long policyId;

    @Column(nullable = false)
    private String name;  // e.g., "Third-Party Basic", "Comprehensive Plus"

    @Column(nullable = false)
    private String policyType;  // THIRD_PARTY / COMPREHENSIVE

    @Column(nullable = false)
    private String vehicleType;
    @Column(nullable = false)
    private Double basePremium;

    @Column(nullable = false)
    private Double coverageAmount;  // IDV / Sum Insured

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Boolean isActive;

    @ManyToMany
    @JoinTable(
        name = "policy_addon",
        joinColumns = @JoinColumn(name = "policy_id"),
        inverseJoinColumns = @JoinColumn(name = "addon_id")
    )
    private Set<AddOn> addOns = new HashSet<>();

//    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<PolicySubscription> policySubscriptions;

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    // Constructors
    public Policy() {
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public Policy(String name, String policyType, String vehicleType, Double basePremium, Double coverageAmount, String description, Boolean isActive) {
        this.name = name;
        this.policyType = policyType;
        this.vehicleType = vehicleType;
        this.basePremium = basePremium;
        this.coverageAmount = coverageAmount;
        this.description = description;
        this.isActive = isActive;
    }

    // Getters and Setters
    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPolicyType() {
        return policyType;
    }

    public void setPolicyType(String policyType) {
        this.policyType = policyType;
    }

    public Double getBasePremium() {
        return basePremium;
    }

    public void setBasePremium(Double basePremium) {
        this.basePremium = basePremium;
    }

    public Double getCoverageAmount() {
        return coverageAmount;
    }

    public void setCoverageAmount(Double coverageAmount) {
        this.coverageAmount = coverageAmount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Set<AddOn> getAddOns() {
        return addOns;
    }

    public void setAddOns(Set<AddOn> addOns) {
        this.addOns = addOns;
    }

//    public List<PolicySubscription> getPolicySubscriptions() {
//        return policySubscriptions;
//    }
//
//    public void setPolicySubscriptions(List<PolicySubscription> policySubscriptions) {
//        this.policySubscriptions = policySubscriptions;
//    }
}

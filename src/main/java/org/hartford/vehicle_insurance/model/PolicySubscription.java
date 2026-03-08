package org.hartford.vehicle_insurance.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "policy_subscriptions")
public class PolicySubscription {
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private MyUser myUser;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String status;

    @ManyToMany
    @JoinTable(
        name = "policy_subscription_addon",
        joinColumns = @JoinColumn(name = "subscription_id"),
        inverseJoinColumns = @JoinColumn(name = "addon_id")
    )
    private Set<AddOn> selectedAddOns = new HashSet<>();

    @Transient
    private Double totalPremium;

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

    public Set<AddOn> getSelectedAddOns() {
        return selectedAddOns;
    }

    public void setSelectedAddOns(Set<AddOn> selectedAddOns) {
        this.selectedAddOns = selectedAddOns;
    }

    public Double getTotalPremium() {
        if (policy == null) return 0.0;
        Double addOnTotal = selectedAddOns.stream()
            .mapToDouble(AddOn::getPrice)
            .sum();
        return policy.getBasePremium() + addOnTotal;
    }

    public void setTotalPremium(Double totalPremium) {
        this.totalPremium = totalPremium;
    }
}

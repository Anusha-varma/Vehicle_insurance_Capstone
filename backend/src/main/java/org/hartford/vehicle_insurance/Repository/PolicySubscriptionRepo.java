package org.hartford.vehicle_insurance.Repository;

import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.model.Policy;
import org.hartford.vehicle_insurance.model.PolicySubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface PolicySubscriptionRepo extends JpaRepository<PolicySubscription, Long> {

    boolean existsByPolicyAndMyUser(Policy policy, MyUser myUser);

    List<PolicySubscription> findByStatus(String status);

    List<PolicySubscription> findByMyUser(MyUser myUser);

    boolean existsByMyUserAndPolicyAndVehicleNumber(MyUser myUser, Policy policy, String vehicleNumber);

    boolean existsByVehicleNumberAndStatus(String vehicleNumber, String status);

    boolean existsByVehicleNumberAndStatusAndPolicy(String vehicleNumber, String status, Policy policy);

    PolicySubscription findTopByMyUserAndPolicyAndVehicleNumberAndStatusOrderByEndDateDesc(
            MyUser myUser, Policy policy, String vehicleNumber, String status
    );

    // Total revenue from paid premiums
    @Query("SELECT COALESCE(SUM(p.totalPremium),0) FROM PolicySubscription p WHERE p.paymentStatus='PAID'")
    Double getTotalRevenue();
    @Query("""
SELECT COALESCE(SUM(p.underwriterCommission),0)
FROM PolicySubscription p
WHERE p.underwriterId = :id
""")
    Double sumUnderwriterCommission(Long id);
    @Query("""
SELECT COALESCE(SUM(p.underwriterCommission),0)
FROM PolicySubscription p
""")
    Double getTotalUnderwriterCommission();

    @Query("""
SELECT COALESCE(SUM(p.claimOfficerCommission),0)
FROM PolicySubscription p
""")
    Double getTotalClaimOfficerCommission();

    // Revenue filtered by payment status
    @Query("SELECT SUM(p.totalPremium) FROM PolicySubscription p WHERE p.paymentStatus = :status")
    Double sumTotalPremiumByPaymentStatus(@Param("status") String status);

    // Underwriter commission filtered by payment status
    @Query("SELECT SUM(p.underwriterCommission) FROM PolicySubscription p WHERE p.paymentStatus = :status")
    Double sumUnderwriterCommissionByPaymentStatus(@Param("status") String status);
    @Query("""
SELECT COALESCE(SUM(p.claimOfficerCommission),0)
FROM PolicySubscription p
WHERE p.claimOfficerId = :id
""")
    Double sumClaimOfficerCommission(Long id);
    // Claim officer commission filtered by payment status
    @Query("SELECT SUM(p.claimOfficerCommission) FROM PolicySubscription p WHERE p.paymentStatus = :status")
    Double sumClaimOfficerCommissionByPaymentStatus(@Param("status") String status);

}
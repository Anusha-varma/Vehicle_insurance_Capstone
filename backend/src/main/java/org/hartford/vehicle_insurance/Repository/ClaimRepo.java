package org.hartford.vehicle_insurance.Repository;

import org.hartford.vehicle_insurance.model.Claim;
import org.hartford.vehicle_insurance.model.ClaimStatus;
import org.hartford.vehicle_insurance.model.MyUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ClaimRepo extends JpaRepository<Claim, Long> {
    List<Claim> findByStatus(ClaimStatus status);

    List<Claim> findByPolicySubscription_MyUser(MyUser user);

    List<Claim> findByPolicySubscriptionId(Long policySubscriptionId);
    @Query("""
SELECT COALESCE(SUM(p.claimOfficerCommission),0)
FROM PolicySubscription p
WHERE p.claimOfficerId = :id
""")
    Double sumClaimOfficerCommission(Long id);
}

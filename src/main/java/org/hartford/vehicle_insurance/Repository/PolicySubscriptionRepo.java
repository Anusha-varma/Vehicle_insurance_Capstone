package org.hartford.vehicle_insurance.Repository;

import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.model.Policy;
import org.hartford.vehicle_insurance.model.PolicySubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolicySubscriptionRepo extends JpaRepository<PolicySubscription, Long> {
    boolean existsByPolicyAndMyUser(Policy policy, MyUser myUser);
    List<PolicySubscription> findByStatus(String status);
    List<PolicySubscription> findByMyUser(MyUser myUser);

}

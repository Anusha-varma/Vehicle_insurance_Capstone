package org.hartford.vehicle_insurance.Repository;

import org.hartford.vehicle_insurance.model.Claim;
import org.hartford.vehicle_insurance.model.MyUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClaimRepo extends JpaRepository<Claim, Long> {
    List<Claim> findByStatus(String status);

    List<Claim> findByPolicySubscription_MyUser(MyUser user);
}

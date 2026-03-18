package org.hartford.vehicle_insurance.Repository;

import org.hartford.vehicle_insurance.model.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PolicyRepo extends JpaRepository<Policy,Long> {

}

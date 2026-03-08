package org.hartford.vehicle_insurance.Repository;

import org.hartford.vehicle_insurance.model.AddOn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddOnRepo extends JpaRepository<AddOn, Long> {
    List<AddOn> findByIsActiveTrue();
}

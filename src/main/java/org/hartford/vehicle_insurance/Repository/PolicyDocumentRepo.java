package org.hartford.vehicle_insurance.Repository;

import org.hartford.vehicle_insurance.model.PolicyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolicyDocumentRepo extends JpaRepository<PolicyDocument, Long> {
    List<PolicyDocument> findByPolicySubscriptionId(Long subscriptionId);
}

package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.PolicyRepo;
import org.hartford.vehicle_insurance.model.Policy;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
public class PolicyService {
    private final PolicyRepo policyRepo;

    public PolicyService(PolicyRepo policyRepo) {
        this.policyRepo = policyRepo;
    }

    public Policy createPolicy(Policy policy) {

        if (policy.getIsActive() == null) {
            policy.setIsActive(true);
        }return policyRepo.save(policy);
    }

    public List<Policy> getAllPolicies() {
        return policyRepo.findAll();
    }

    public Optional<Policy> getPolicyById(Long id) {
        return policyRepo.findById(id);
    }

    public Policy updatePolicy(Long id, Policy policy) {
        Optional<Policy> existingPolicy = policyRepo.findById(id);
        if (existingPolicy.isPresent()) {
            Policy policyToUpdate = existingPolicy.get();
            policyToUpdate.setName(policy.getName());
            policyToUpdate.setPolicyType(policy.getPolicyType());
            policyToUpdate.setVehicleType(policy.getVehicleType());
            policyToUpdate.setBasePremium(policy.getBasePremium());
            policyToUpdate.setCoverageAmount(policy.getCoverageAmount());
            policyToUpdate.setDescription(policy.getDescription());
            policyToUpdate.setActive(policy.getActive());
            return policyRepo.save(policyToUpdate);
        }
        return null;
    }

    public void deletePolicy(Long id) {
        policyRepo.deleteById(id);
    }
}

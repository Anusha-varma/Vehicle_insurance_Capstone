package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.Policy;
import org.hartford.vehicle_insurance.service.PolicyService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("policy")
@CrossOrigin("*")
public class PolicyController {
    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("create")
    public Policy createPolicy(@RequestBody Policy policy) {
        return policyService.createPolicy(policy);
    }

    @PreAuthorize("hasAnyRole('ADMIN','CUSTOMER')")
    @GetMapping("all")
    public List<Policy> getAllPolicies() {
        return policyService.getAllPolicies();
    }

    @PreAuthorize("hasAnyRole('ADMIN','CUSTOMER')")
    @GetMapping("{id}")
    public Optional<Policy> getPolicyById(@PathVariable Long id) {
        return policyService.getPolicyById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("{id}")
    public Policy updatePolicy(@PathVariable Long id, @RequestBody Policy policy) {
        return policyService.updatePolicy(id, policy);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("{id}")
    public void deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
    }
}

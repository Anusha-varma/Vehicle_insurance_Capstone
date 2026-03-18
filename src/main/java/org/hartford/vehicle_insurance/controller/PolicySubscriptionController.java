package org.hartford.vehicle_insurance.controller;
import org.hartford.vehicle_insurance.Repository.PolicySubscriptionRepo;
import org.hartford.vehicle_insurance.dto.PolicyApplicationRequest;
import org.hartford.vehicle_insurance.model.PolicySubscription;
import org.hartford.vehicle_insurance.service.PolicyDocumentService;
import org.hartford.vehicle_insurance.service.PolicySubscriptionService;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("policy")
@CrossOrigin("*")
public class PolicySubscriptionController {
    private final PolicySubscriptionService policySubscriptionService;
    private final PolicyDocumentService policyDocumentService;
    private final PolicySubscriptionRepo repo;
    public PolicySubscriptionController(PolicySubscriptionService policySubscriptionService, PolicyDocumentService policyDocumentService, PolicySubscriptionRepo repo) {
        this.policySubscriptionService = policySubscriptionService;
        this.policyDocumentService = policyDocumentService;
        this.repo = repo;
    }

    // Endpoint for multipart/form-data (with file uploads)
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping(value = "{policyId}/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PolicySubscription applyForPolicyWithFiles(
            @PathVariable Long policyId,
            @RequestPart("data") PolicyApplicationRequest request,
            @RequestPart(value = "rcFile", required = false) MultipartFile rcFile,
            @RequestPart(value = "licenseFile", required = false) MultipartFile licenseFile,
            @RequestPart(value = "vehiclePhoto", required = false) MultipartFile vehiclePhoto,
            @RequestPart(value = "idProof", required = false) MultipartFile idProof) {

        PolicySubscription subscription = createSubscription(policyId, request);

        if (rcFile != null && !rcFile.isEmpty()) {
            policyDocumentService.uploadDocument(subscription.getId(), rcFile);
        }

        if (licenseFile != null && !licenseFile.isEmpty()) {
            policyDocumentService.uploadDocument(subscription.getId(), licenseFile);
        }

        if (vehiclePhoto != null && !vehiclePhoto.isEmpty()) {
            policyDocumentService.uploadDocument(subscription.getId(), vehiclePhoto);
        }

        if (idProof != null && !idProof.isEmpty()) {
            policyDocumentService.uploadDocument(subscription.getId(), idProof);
        }

        return subscription;
    }

    // Endpoint for JSON (without file uploads)
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping(value = "{policyId}/apply", consumes = MediaType.APPLICATION_JSON_VALUE)
    public PolicySubscription applyForPolicyJson(
            @PathVariable Long policyId,
            @RequestBody PolicyApplicationRequest request) {

        System.out.println("DEBUG [JSON]: Received request - vehicleNumber=" + request.getVehicleNumber()
                + ", vehicleModel=" + request.getVehicleModel()
                + ", vehicleYear=" + request.getVehicleYear());

        return createSubscription(policyId, request);
    }

    private PolicySubscription createSubscription(Long policyId, PolicyApplicationRequest request) {
        PolicySubscription subscription = new PolicySubscription();
        subscription.setStartDate(request.getStartDate());
        subscription.setEndDate(request.getEndDate());
        subscription.setVehicleNumber(request.getVehicleNumber());
        subscription.setVehicleModel(request.getVehicleModel());
        subscription.setVehicleYear(request.getVehicleYear());

        return policySubscriptionService.applyPolicy(
                policyId,
                subscription
        );
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/my")
    public List<PolicySubscription> getMySubscriptions() {
        return policySubscriptionService.getMySubscriptions();
    }
    @PutMapping("/pay-premium/{id}")
    public PolicySubscription payPremium(@PathVariable Long id,
                                         @RequestParam String transactionId) {

        return policySubscriptionService.payPremium(id, transactionId);

    }
    // Endpoint to update vehicle details and recalculate risk score
    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping("/{subscriptionId}/vehicle-details")
    public PolicySubscription updateVehicleDetails(
            @PathVariable Long subscriptionId,
            @RequestBody PolicyApplicationRequest request) {

        System.out.println("DEBUG [Update Vehicle]: subscriptionId=" + subscriptionId
                + ", vehicleNumber=" + request.getVehicleNumber()
                + ", vehicleModel=" + request.getVehicleModel()
                + ", vehicleYear=" + request.getVehicleYear());

        return policySubscriptionService.updateVehicleDetails(
                subscriptionId,
                request.getVehicleNumber(),
                request.getVehicleModel(),
                request.getVehicleYear()
        );
    }

    // NEW ENDPOINT: Renew Policy Subscription
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/{subscriptionId}/renew")
    public PolicySubscription renewPolicySubscription(@PathVariable Long subscriptionId) {
        return policySubscriptionService.renewSubscription(subscriptionId);
    }
}

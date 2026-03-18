package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.service.MyUserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin("*")
public class AdminController {

    private final MyUserService myUserService;

    public AdminController(MyUserService myUserService) {
        this.myUserService = myUserService;
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create-claim-officer")
    public MyUser createClaimOfficer(@RequestBody MyUser user) {
        return myUserService.createClaimOfficer(user);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<MyUser> getAllUsers() {
        return myUserService.getAllUsers();
    }
    @GetMapping("/revenue")
    public Double getTotalRevenue() {
        return myUserService.getTotalRevenue();
    }

    @GetMapping("/underwriter-commission")
    public Double getUnderwriterCommission() {
        return myUserService.getUnderwriterCommission();
    }

    @GetMapping("/claimofficer-commission")
    public Double getClaimOfficerCommission() {
        return myUserService.getClaimOfficerCommission();
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create-underwriter")
    public MyUser createUnderwriter(@RequestBody MyUser user) {
        return myUserService.createUnderwriter(user);
    }
}
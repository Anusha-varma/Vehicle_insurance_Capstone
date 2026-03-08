package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.service.MyUserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
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
}
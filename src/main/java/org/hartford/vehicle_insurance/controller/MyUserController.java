package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.Config.JwtRequest;
import org.hartford.vehicle_insurance.Config.JwtResponse;
import org.hartford.vehicle_insurance.service.MyUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class MyUserController {

    private final MyUserService myUserService;

    public MyUserController(MyUserService myUserService) {
        this.myUserService = myUserService;
    }

    // ✅ Register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody MyUser user) {
        MyUser saved = myUserService.register(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ✅ Login (JWT)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody JwtRequest req) {
        try {
            String token = myUserService.login(req.getUsername(), req.getPassword());
            return ResponseEntity.ok(new JwtResponse(token));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }
    }
}
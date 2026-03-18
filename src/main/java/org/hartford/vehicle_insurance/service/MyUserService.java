package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.MyUserRepo;
import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Lazy;
import org.hartford.vehicle_insurance.Repository.PolicySubscriptionRepo;
import java.util.List;

@Component
public class MyUserService implements UserDetailsService {
    private final PolicySubscriptionRepo policySubscriptionRepo;
    private final AuthenticationManager authManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MyUserRepo myUserRepo;

    public MyUserService(
            @Lazy AuthenticationManager authManager,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            MyUserRepo myUserRepo,
            PolicySubscriptionRepo policySubscriptionRepo) {

        this.authManager = authManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.myUserRepo = myUserRepo;
        this.policySubscriptionRepo = policySubscriptionRepo;
    }

    public MyUser register(MyUser myUser) {
        myUser.setId(null);
        myUser.setPassword(passwordEncoder.encode(myUser.getPassword()));
        if (myUser.getRoles() == null) {
            myUser.setRoles("CUSTOMER");
        }
        // email and phoneNumber are already set from request body
        return myUserRepo.save(myUser);
    }

    public String login(String username, String password) {
        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(username, password);
        authManager.authenticate(token);   // now works
        MyUser user = myUserRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return jwtUtil.generateToken(username, user.getRoles());
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        MyUser mu = myUserRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return User.withUsername(mu.getUsername())
                .password(mu.getPassword())
                .roles(mu.getRoles())
                .build();
    }


    public MyUser createClaimOfficer(MyUser myUser) {
        myUser.setId(null);
        myUser.setPassword(passwordEncoder.encode(myUser.getPassword()));
        myUser.setRoles("CLAIM_OFFICER");
        return myUserRepo.save(myUser);
    }
    public List<MyUser> getAllUsers() {
        return myUserRepo.findAll();
    }
    public MyUser createUnderwriter(MyUser myUser) {
        myUser.setId(null);
        myUser.setPassword(passwordEncoder.encode(myUser.getPassword()));
        myUser.setRoles("UNDERWRITER");
        return myUserRepo.save(myUser);
    }
    public Double getTotalRevenue() {
        return policySubscriptionRepo.getTotalRevenue();
    }

    public Double getUnderwriterCommission() {
        return policySubscriptionRepo.getTotalUnderwriterCommission();
    }

    public Double getClaimOfficerCommission() {
        return policySubscriptionRepo.getTotalClaimOfficerCommission();
    }

    public MyUser findByUsername(String username) {
        return myUserRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}

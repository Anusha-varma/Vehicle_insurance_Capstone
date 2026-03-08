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

@Component
public class MyUserService implements UserDetailsService {

    @Autowired
    @Lazy
    private AuthenticationManager authManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;
    private final MyUserRepo myUserRepo;

    public MyUserService(MyUserRepo myUserRepo) {
        this.myUserRepo = myUserRepo;
    }

    public MyUser register(MyUser myUser) {
        myUser.setId(null);
        myUser.setPassword(passwordEncoder.encode(myUser.getPassword()));
            myUser.setRoles("CUSTOMER");

        return myUserRepo.save(myUser);
    }

    public String login(String username, String password) {
        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(username, password);
        authManager.authenticate(token);   // now works
        return jwtUtil.generateToken(username);
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
}
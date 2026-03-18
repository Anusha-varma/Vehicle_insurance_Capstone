package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.Repository.MyUserRepo;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;
import org.hartford.vehicle_insurance.security.JwtUtil;

@ExtendWith(MockitoExtension.class)
class MyUserServiceTest {
    @Mock
    private MyUserRepo myUserRepo;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authManager;
    @Mock
    private JwtUtil jwtUtil;
    private MyUserService myUserService;

    @BeforeEach
    void setUp() {
       // myUserService = new MyUserService(authManager, passwordEncoder, jwtUtil, myUserRepo);
    }

    @Test
    void register_shouldReturnUser() {
        MyUser user = new MyUser();
        user.setPassword("plainPassword");
        assertNotNull(passwordEncoder, "passwordEncoder mock should not be null");
        when(passwordEncoder.encode(any(CharSequence.class))).thenReturn("encoded");
        when(myUserRepo.save(any(MyUser.class))).thenReturn(user);
        MyUser result = myUserService.register(user);
        assertNotNull(result);
    }

    @Test
    void login_shouldReturnToken() {
        MyUser user = new MyUser();
        user.setUsername("user");
        user.setPassword("encoded");
        user.setRoles("CUSTOMER");
        org.springframework.security.core.Authentication mockAuth = mock(org.springframework.security.core.Authentication.class);
        when(authManager.authenticate(any())).thenReturn(mockAuth);
        when(myUserRepo.findByUsername(anyString())).thenReturn(java.util.Optional.of(user));
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("token");
        String token = myUserService.login("user", "pass");
        assertEquals("token", token);
    }

    @Test
    void loadUserByUsername_shouldReturnUserDetails() {
        MyUser user = new MyUser();
        user.setUsername("user");
        user.setPassword("encoded");
        user.setRoles("CUSTOMER");
        when(myUserRepo.findByUsername(anyString())).thenReturn(java.util.Optional.of(user));
        org.springframework.security.core.userdetails.UserDetails details = myUserService.loadUserByUsername("user");
        assertEquals("user", details.getUsername());
        assertNotNull(details.getPassword());
        assertEquals("encoded", details.getPassword());
        assertTrue(details.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER")));
    }

    @Test
    void createClaimOfficer_shouldReturnClaimOfficer() {
        MyUser user = new MyUser();
        user.setPassword("plainPassword");
        when(passwordEncoder.encode(any(CharSequence.class))).thenReturn("encoded");
        when(myUserRepo.save(any(MyUser.class))).thenAnswer(invocation -> {
            MyUser u = invocation.getArgument(0);
            u.setId(1L);
            return u;
        });
        MyUser result = myUserService.createClaimOfficer(user);
        assertEquals("CLAIM_OFFICER", result.getRoles());
        assertEquals("encoded", result.getPassword());
        assertNotNull(result.getId());
    }

    @Test
    void getAllUsers_shouldReturnList() {
        when(myUserRepo.findAll()).thenReturn(java.util.Collections.singletonList(new MyUser()));
        java.util.List<MyUser> result = myUserService.getAllUsers();
        assertFalse(result.isEmpty());
    }

    @Test
    void createUnderwriter_shouldReturnUnderwriter() {
        MyUser user = new MyUser();
        user.setPassword("plainPassword");
        when(passwordEncoder.encode(any(CharSequence.class))).thenReturn("encoded");
        when(myUserRepo.save(any(MyUser.class))).thenAnswer(invocation -> {
            MyUser u = invocation.getArgument(0);
            u.setId(2L);
            return u;
        });
        MyUser result = myUserService.createUnderwriter(user);
        assertEquals("UNDERWRITER", result.getRoles());
        assertEquals("encoded", result.getPassword());
        assertNotNull(result.getId());
    }
}

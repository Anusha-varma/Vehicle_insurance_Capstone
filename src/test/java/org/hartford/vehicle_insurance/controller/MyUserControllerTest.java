package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.service.MyUserService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MyUserControllerTest {
    @Mock
    private MyUserService myUserService;
    @InjectMocks
    private MyUserController myUserController;

    @Test
    void register_shouldReturnCreated() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(myUserController).build();
        MyUser user = new MyUser();
        when(myUserService.register(any(MyUser.class))).thenReturn(user);
        mockMvc.perform(post("/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isCreated());
    }

    @Test
    void login_shouldReturnOk() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(myUserController).build();
        // Mock JwtRequest and JwtResponse
        String username = "test";
        String password = "pass";
        String token = "token";
        org.hartford.vehicle_insurance.Config.JwtRequest req = new org.hartford.vehicle_insurance.Config.JwtRequest();
        req.setUsername(username);
        req.setPassword(password);
        when(myUserService.login(username, password)).thenReturn(token);
        org.springframework.security.core.userdetails.User userDetails = new org.springframework.security.core.userdetails.User(username, password, java.util.Collections.singletonList(() -> "ROLE_USER"));
        when(myUserService.loadUserByUsername(username)).thenReturn(userDetails);
        mockMvc.perform(post("/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"test\",\"password\":\"pass\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void login_shouldReturnUnauthorized_whenInvalidCredentials() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(myUserController).build();
        when(myUserService.login(any(String.class), any(String.class))).thenReturn(null);
        mockMvc.perform(post("/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"wrong\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized());
    }
}

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.List;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {
    @Mock
    private MyUserService myUserService;
    @InjectMocks
    private AdminController adminController;

    @Test
    void createClaimOfficer_shouldReturnUser() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
        MyUser user = new MyUser();
        when(myUserService.createClaimOfficer(any(MyUser.class))).thenReturn(user);
        mockMvc.perform(post("/admin/create-claim-officer")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllUsers_shouldReturnUserList() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
        MyUser user1 = new MyUser();
        MyUser user2 = new MyUser();
        List<MyUser> users = Arrays.asList(user1, user2);
        when(myUserService.getAllUsers()).thenReturn(users);
        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isOk());
    }

    @Test
    void createUnderwriter_shouldReturnUser() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
        MyUser user = new MyUser();
        when(myUserService.createUnderwriter(any(MyUser.class))).thenReturn(user);
        mockMvc.perform(post("/admin/create-underwriter")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }
}

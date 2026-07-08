package com.company.weeklyreport.controller;

import com.company.weeklyreport.WeeklyReportApplication;
import com.company.weeklyreport.dto.user.UserResponse;
import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = WeeklyReportApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @Test
    void testListUsers_Manager_Success() throws Exception {
        User managerUser = User.builder().email("manager@example.com").role(Role.MANAGER).build();
        User testUser = User.builder().id(UUID.randomUUID()).firstName("Member").lastName("One").email("m1@example.com").role(Role.MEMBER).build();

        when(userRepository.findAll()).thenReturn(List.of(testUser));

        mockMvc.perform(get("/api/users")
                        .with(user(managerUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("m1@example.com"));
    }

    @Test
    void testListUsers_Member_Forbidden() throws Exception {
        User memberUser = User.builder().email("member@example.com").role(Role.MEMBER).build();

        mockMvc.perform(get("/api/users")
                        .with(user(memberUser)))
                .andExpect(status().isForbidden());
    }
}

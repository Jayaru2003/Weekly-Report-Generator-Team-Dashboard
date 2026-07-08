package com.company.weeklyreport.controller;

import com.company.weeklyreport.WeeklyReportApplication;
import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = WeeklyReportApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testPing_Authenticated_Success() throws Exception {
        User memberUser = User.builder().email("member@example.com").role(Role.MEMBER).build();

        mockMvc.perform(get("/api/test/ping")
                        .with(user(memberUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("pong"));
    }

    @Test
    void testPing_Unauthenticated_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/test/ping"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testManagerPing_Manager_Success() throws Exception {
        User managerUser = User.builder().email("manager@example.com").role(Role.MANAGER).build();

        mockMvc.perform(get("/api/test/manager-only")
                        .with(user(managerUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("manager-pong"));
    }

    @Test
    void testManagerPing_Member_Forbidden() throws Exception {
        User memberUser = User.builder().email("member@example.com").role(Role.MEMBER).build();

        mockMvc.perform(get("/api/test/manager-only")
                        .with(user(memberUser)))
                .andExpect(status().isForbidden());
    }
}

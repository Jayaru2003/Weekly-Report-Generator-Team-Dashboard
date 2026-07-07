package com.company.weeklyreport.controller;

import com.company.weeklyreport.WeeklyReportApplication;
import com.company.weeklyreport.dto.dashboard.DashboardSummaryResponse;
import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.ArrayList;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = WeeklyReportApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @Test
    void testGetSummary_Manager_Success() throws Exception {
        User managerUser = User.builder().email("manager@example.com").role(Role.MANAGER).build();
        DashboardSummaryResponse response = new DashboardSummaryResponse(10L, 5L, 100.0, 0L);

        when(dashboardService.getSummary(any(), any())).thenReturn(response);

        mockMvc.perform(get("/api/dashboard/summary")
                        .with(user(managerUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalReportsSubmitted").value(10))
                .andExpect(jsonPath("$.complianceRate").value(100.0));
    }

    @Test
    void testGetSummary_Member_Forbidden() throws Exception {
        User memberUser = User.builder().email("member@example.com").role(Role.MEMBER).build();

        mockMvc.perform(get("/api/dashboard/summary")
                        .with(user(memberUser)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetReports_Manager_Success() throws Exception {
        User managerUser = User.builder().email("manager@example.com").role(Role.MANAGER).build();

        when(dashboardService.getReports(any(), any(), any(), any(), any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/api/dashboard/reports")
                        .with(user(managerUser)))
                .andExpect(status().isOk());
    }
}

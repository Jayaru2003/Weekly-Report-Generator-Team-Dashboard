package com.company.weeklyreport.controller;

import com.company.weeklyreport.WeeklyReportApplication;
import com.company.weeklyreport.dto.report.RejectRequest;
import com.company.weeklyreport.dto.report.ReportRequest;
import com.company.weeklyreport.dto.report.ReportResponse;
import com.company.weeklyreport.entity.ReportStatus;
import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.service.ReportService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = WeeklyReportApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportService reportService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateReport_Success() throws Exception {
        User memberUser = User.builder().email("member@example.com").role(Role.MEMBER).build();
        ReportRequest request = new ReportRequest(UUID.randomUUID(), LocalDate.now(), LocalDate.now().plusDays(6), "C", "P", "B", 40.0f, "N");
        ReportResponse response = new ReportResponse(UUID.randomUUID(), memberUser.getId() != null ? memberUser.getId() : UUID.randomUUID(), request.projectId(), "Alpha Project", request.weekStartDate(), request.weekEndDate(), "C", "P", "B", 40.0f, "N", ReportStatus.DRAFT, null, null, null, null, java.time.Instant.now(), java.time.Instant.now());

        when(reportService.createReport(any(ReportRequest.class), any(User.class))).thenReturn(response);

        mockMvc.perform(post("/api/reports")
                        .with(user(memberUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void testSubmitReport_Success() throws Exception {
        User memberUser = User.builder().email("member@example.com").role(Role.MEMBER).build();
        UUID reportId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        ReportResponse response = new ReportResponse(reportId, memberUser.getId() != null ? memberUser.getId() : UUID.randomUUID(), projectId, "Alpha Project", LocalDate.now(), LocalDate.now().plusDays(6), "C", "P", "B", 40.0f, "N", ReportStatus.SUBMITTED, java.time.Instant.now(), null, null, null, java.time.Instant.now(), java.time.Instant.now());

        when(reportService.submitReport(eq(reportId), any(User.class))).thenReturn(response);

        mockMvc.perform(post("/api/reports/" + reportId + "/submit")
                        .with(user(memberUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    void testApproveReport_Manager_Success() throws Exception {
        User managerUser = User.builder().email("manager@example.com").role(Role.MANAGER).build();
        UUID reportId = UUID.randomUUID();
        UUID memberUserId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        ReportResponse response = new ReportResponse(reportId, memberUserId, projectId, "Alpha Project", LocalDate.now(), LocalDate.now().plusDays(6), "C", "P", "B", 40.0f, "N", ReportStatus.APPROVED, java.time.Instant.now(), java.time.Instant.now(), managerUser.getId(), "Manager", java.time.Instant.now(), java.time.Instant.now());

        when(reportService.approveReport(eq(reportId), any(User.class))).thenReturn(response);

        mockMvc.perform(post("/api/reports/" + reportId + "/approve")
                        .with(user(managerUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void testApproveReport_Member_Forbidden() throws Exception {
        User memberUser = User.builder().email("member@example.com").role(Role.MEMBER).build();
        UUID reportId = UUID.randomUUID();

        mockMvc.perform(post("/api/reports/" + reportId + "/approve")
                        .with(user(memberUser)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testRejectReport_Manager_Success() throws Exception {
        User managerUser = User.builder().email("manager@example.com").role(Role.MANAGER).build();
        UUID reportId = UUID.randomUUID();
        UUID memberUserId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        RejectRequest request = new RejectRequest("Fix details");
        ReportResponse response = new ReportResponse(reportId, memberUserId, projectId, "Alpha Project", LocalDate.now(), LocalDate.now().plusDays(6), "C", "P", "B", 40.0f, "N", ReportStatus.REJECTED, java.time.Instant.now(), java.time.Instant.now(), managerUser.getId(), "Manager", java.time.Instant.now(), java.time.Instant.now());

        when(reportService.rejectReport(eq(reportId), eq("Fix details"), any(User.class))).thenReturn(response);

        mockMvc.perform(post("/api/reports/" + reportId + "/reject")
                        .with(user(managerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    void testGetMyReports_Success() throws Exception {
        User memberUser = User.builder().email("member@example.com").role(Role.MEMBER).build();
        when(reportService.getMyReports(any(User.class), any(), any(), any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/api/reports/me")
                        .with(user(memberUser)))
                .andExpect(status().isOk());
    }
}

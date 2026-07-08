package com.company.weeklyreport.controller;

import com.company.weeklyreport.WeeklyReportApplication;
import com.company.weeklyreport.dto.project.ProjectRequest;
import com.company.weeklyreport.dto.project.ProjectResponse;
import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.service.ProjectService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = WeeklyReportApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProjectService projectService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testListProjects_Authenticated_Success() throws Exception {
        User memberUser = User.builder().email("member@example.com").role(Role.MEMBER).build();
        ProjectResponse projectResponse = new ProjectResponse(UUID.randomUUID(), "Alpha", "Desc", true, java.time.Instant.now(), java.util.List.of());

        when(projectService.listActiveProjects()).thenReturn(List.of(projectResponse));

        mockMvc.perform(get("/api/projects")
                        .with(user(memberUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Alpha"));
    }

    @Test
    void testCreateProject_Manager_Success() throws Exception {
        User managerUser = User.builder().email("manager@example.com").role(Role.MANAGER).build();
        ProjectRequest request = new ProjectRequest("Beta", "Beta desc");
        ProjectResponse response = new ProjectResponse(UUID.randomUUID(), "Beta", "Beta desc", true, java.time.Instant.now(), java.util.List.of());

        when(projectService.createProject(any(ProjectRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/projects")
                        .with(user(managerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Beta"));
    }

    @Test
    void testCreateProject_Member_Forbidden() throws Exception {
        User memberUser = User.builder().email("member@example.com").role(Role.MEMBER).build();
        ProjectRequest request = new ProjectRequest("Beta", "Beta desc");

        mockMvc.perform(post("/api/projects")
                        .with(user(memberUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testDeleteProject_Manager_Success() throws Exception {
        User managerUser = User.builder().email("manager@example.com").role(Role.MANAGER).build();
        UUID id = UUID.randomUUID();

        doNothing().when(projectService).softDeleteProject(id);

        mockMvc.perform(delete("/api/projects/" + id)
                        .with(user(managerUser)))
                .andExpect(status().isNoContent());
    }

    @Test
    void testUpdateProjectMembers_Manager_Success() throws Exception {
        User managerUser = User.builder().email("manager@example.com").role(Role.MANAGER).build();
        UUID id = UUID.randomUUID();
        List<UUID> members = List.of(UUID.randomUUID());

        doNothing().when(projectService).updateProjectMembers(eq(id), any(List.class));

        mockMvc.perform(put("/api/projects/" + id + "/members")
                        .with(user(managerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(members)))
                .andExpect(status().isOk());
    }
}

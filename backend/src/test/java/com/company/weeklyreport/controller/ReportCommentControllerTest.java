package com.company.weeklyreport.controller;

import com.company.weeklyreport.WeeklyReportApplication;
import com.company.weeklyreport.dto.comment.CommentRequest;
import com.company.weeklyreport.dto.comment.CommentResponse;
import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.service.CommentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = WeeklyReportApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReportCommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CommentService commentService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testAddComment_Manager_Success() throws Exception {
        User managerUser = User.builder().id(UUID.randomUUID()).email("manager@example.com").role(Role.MANAGER).build();
        UUID reportId = UUID.randomUUID();
        CommentRequest request = new CommentRequest("Fix the layout");
        CommentResponse response = new CommentResponse(UUID.randomUUID(), reportId, managerUser.getId(), "Manager One", "Fix the layout", Instant.now());

        when(commentService.addComment(eq(reportId), eq("Fix the layout"), any(User.class))).thenReturn(response);

        mockMvc.perform(post("/api/reports/" + reportId + "/comments")
                        .with(user(managerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Fix the layout"));
    }

    @Test
    void testAddComment_Member_Forbidden() throws Exception {
        User memberUser = User.builder().email("member@example.com").role(Role.MEMBER).build();
        UUID reportId = UUID.randomUUID();
        CommentRequest request = new CommentRequest("Fix the layout");

        mockMvc.perform(post("/api/reports/" + reportId + "/comments")
                        .with(user(memberUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetComments_Success() throws Exception {
        User memberUser = User.builder().email("member@example.com").role(Role.MEMBER).build();
        UUID reportId = UUID.randomUUID();
        CommentResponse response = new CommentResponse(UUID.randomUUID(), reportId, UUID.randomUUID(), "Manager One", "Fix the layout", Instant.now());

        when(commentService.getComments(eq(reportId), any(User.class))).thenReturn(List.of(response));

        mockMvc.perform(get("/api/reports/" + reportId + "/comments")
                        .with(user(memberUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("Fix the layout"));
    }
}

package com.company.weeklyreport.service;

import com.company.weeklyreport.dto.dashboard.*;
import com.company.weeklyreport.entity.*;
import com.company.weeklyreport.repository.UserRepository;
import com.company.weeklyreport.repository.WeeklyReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class DashboardServiceTest {

    @Mock
    private WeeklyReportRepository reportRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private User member;
    private Project project;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        member = User.builder()
                .id(UUID.randomUUID())
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .role(Role.MEMBER)
                .userProjects(new ArrayList<>())
                .build();

        project = Project.builder()
                .id(UUID.randomUUID())
                .name("Alpha Project")
                .build();
    }

    @Test
    void testGetSummary() {
        LocalDate week = LocalDate.now();
        when(userRepository.countMembersWithAtLeastOneProject()).thenReturn(5L);
        when(reportRepository.countByWeekStartDateAndStatusIn(any(LocalDate.class), any())).thenReturn(3L);
        when(reportRepository.countDistinctUsersSubmittedForWeek(any(LocalDate.class))).thenReturn(3L);
        when(reportRepository.countOpenBlockers(any(LocalDate.class))).thenReturn(2L);

        DashboardSummaryResponse summary = dashboardService.getSummary(week, null);

        assertNotNull(summary);
        assertEquals(3L, summary.totalReportsSubmitted());
        assertEquals(5L, summary.totalTeamMembers());
        assertEquals(60.0, summary.complianceRate());
        assertEquals(2L, summary.openBlockersCount());
    }

    @Test
    void testGetSummary_WithProject() {
        LocalDate week = LocalDate.now();
        UUID projectId = project.getId();
        when(userRepository.countMembersByProjectId(projectId)).thenReturn(4L);
        when(reportRepository.countByWeekStartDateAndProjectIdAndStatusIn(any(LocalDate.class), eq(projectId), any())).thenReturn(2L);
        when(reportRepository.countDistinctUsersSubmittedForWeekAndProject(any(LocalDate.class), eq(projectId))).thenReturn(2L);
        when(reportRepository.countOpenBlockersForProject(any(LocalDate.class), eq(projectId))).thenReturn(1L);

        DashboardSummaryResponse summary = dashboardService.getSummary(week, projectId);

        assertNotNull(summary);
        assertEquals(2L, summary.totalReportsSubmitted());
        assertEquals(4L, summary.totalTeamMembers());
        assertEquals(50.0, summary.complianceRate());
        assertEquals(1L, summary.openBlockersCount());
    }

    @Test
    void testGetActivityFeed() {
        WeeklyReport report = WeeklyReport.builder()
                .user(member)
                .project(project)
                .submittedAt(java.time.Instant.now())
                .build();
        when(reportRepository.findRecentSubmissions(any())).thenReturn(List.of(report));

        List<ActivityFeedResponse> activityFeed = dashboardService.getActivityFeed(5);

        assertFalse(activityFeed.isEmpty());
        assertEquals(1, activityFeed.size());
        assertEquals("John Doe", activityFeed.get(0).userName());
        assertEquals("Alpha Project", activityFeed.get(0).projectName());
    }
}

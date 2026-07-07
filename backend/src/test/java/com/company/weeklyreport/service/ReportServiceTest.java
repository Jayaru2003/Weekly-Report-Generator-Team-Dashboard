package com.company.weeklyreport.service;

import com.company.weeklyreport.dto.report.ReportRequest;
import com.company.weeklyreport.dto.report.ReportResponse;
import com.company.weeklyreport.entity.*;
import com.company.weeklyreport.repository.ProjectRepository;
import com.company.weeklyreport.repository.ReportCommentRepository;
import com.company.weeklyreport.repository.UserProjectRepository;
import com.company.weeklyreport.repository.WeeklyReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ReportServiceTest {

    @Mock
    private WeeklyReportRepository reportRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserProjectRepository userProjectRepository;

    @Mock
    private ReportCommentRepository commentRepository;

    @InjectMocks
    private ReportService reportService;

    private User manager;
    private User member;
    private Project project;
    private WeeklyReport report;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        manager = User.builder()
                .id(UUID.randomUUID())
                .firstName("Mgr")
                .role(Role.MANAGER)
                .build();

        member = User.builder()
                .id(UUID.randomUUID())
                .firstName("Mem")
                .role(Role.MEMBER)
                .build();

        project = Project.builder()
                .id(UUID.randomUUID())
                .name("Alpha Project")
                .build();

        report = WeeklyReport.builder()
                .id(UUID.randomUUID())
                .user(member)
                .project(project)
                .weekStartDate(LocalDate.now())
                .weekEndDate(LocalDate.now().plusDays(6))
                .status(ReportStatus.DRAFT)
                .build();
    }

    @Test
    void testCreateReport_Success() {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(6);
        ReportRequest request = new ReportRequest(project.getId(), start, end, "Completed task", "Planned task", "Blocker", 40.0f, "Notes");

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userProjectRepository.existsByUserIdAndProjectId(member.getId(), project.getId())).thenReturn(true);
        when(reportRepository.findByUserIdAndProjectIdAndWeekStartDate(eq(member.getId()), eq(project.getId()), any(LocalDate.class))).thenReturn(Optional.empty());

        WeeklyReport saved = WeeklyReport.builder()
                .id(UUID.randomUUID())
                .user(member)
                .project(project)
                .weekStartDate(start)
                .weekEndDate(end)
                .status(ReportStatus.DRAFT)
                .build();
        when(reportRepository.save(any(WeeklyReport.class))).thenReturn(saved);

        ReportResponse response = reportService.createReport(request, member);

        assertNotNull(response);
        assertEquals(ReportStatus.DRAFT, response.status());
        verify(reportRepository).save(any(WeeklyReport.class));
    }

    @Test
    void testCreateReport_NotAssignedToProject() {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(6);
        ReportRequest request = new ReportRequest(project.getId(), start, end, "Completed task", "Planned task", "Blocker", 40.0f, "Notes");

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userProjectRepository.existsByUserIdAndProjectId(member.getId(), project.getId())).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> reportService.createReport(request, member));
        verify(reportRepository, never()).save(any(WeeklyReport.class));
    }

    @Test
    void testUpdateReport_Success() {
        UUID reportId = report.getId();
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(6);
        ReportRequest request = new ReportRequest(project.getId(), start, end, "Updated Completed task", "Updated Planned task", "Updated Blocker", 40.0f, "Updated Notes");

        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userProjectRepository.existsByUserIdAndProjectId(member.getId(), project.getId())).thenReturn(true);
        when(reportRepository.save(any(WeeklyReport.class))).thenReturn(report);

        ReportResponse response = reportService.updateReport(reportId, request, member);

        assertNotNull(response);
        verify(reportRepository).save(report);
    }

    @Test
    void testUpdateReport_SubmittedReport_Conflict() {
        report.setStatus(ReportStatus.SUBMITTED);
        UUID reportId = report.getId();
        ReportRequest request = new ReportRequest(project.getId(), LocalDate.now(), LocalDate.now().plusDays(6), "C", "P", "B", 40.0f, "N");

        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));

        assertThrows(ResponseStatusException.class, () -> reportService.updateReport(reportId, request, member));
        verify(reportRepository, never()).save(any(WeeklyReport.class));
    }

    @Test
    void testSubmitReport_Success() {
        UUID reportId = report.getId();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));
        when(reportRepository.save(any(WeeklyReport.class))).thenReturn(report);

        ReportResponse response = reportService.submitReport(reportId, member);

        assertNotNull(response);
        assertEquals(ReportStatus.SUBMITTED, response.status());
        verify(reportRepository).save(report);
    }

    @Test
    void testApproveReport_Success() {
        report.setStatus(ReportStatus.SUBMITTED);
        UUID reportId = report.getId();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));
        when(reportRepository.save(any(WeeklyReport.class))).thenReturn(report);

        ReportResponse response = reportService.approveReport(reportId, manager);

        assertNotNull(response);
        assertEquals(ReportStatus.APPROVED, response.status());
        verify(reportRepository).save(report);
    }

    @Test
    void testRejectReport_Success() {
        report.setStatus(ReportStatus.SUBMITTED);
        UUID reportId = report.getId();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));
        when(reportRepository.save(any(WeeklyReport.class))).thenReturn(report);

        ReportResponse response = reportService.rejectReport(reportId, "Please fix hours", manager);

        assertNotNull(response);
        assertEquals(ReportStatus.REJECTED, response.status());
        verify(reportRepository).save(report);
        verify(commentRepository).save(any(ReportComment.class));
    }
}

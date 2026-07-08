package com.weeklyreport;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import com.company.weeklyreport.WeeklyReportApplication;
import com.company.weeklyreport.service.DashboardService;
import com.company.weeklyreport.service.ReportService;
import com.company.weeklyreport.service.CommentService;
import com.company.weeklyreport.repository.UserRepository;
import com.company.weeklyreport.repository.ProjectRepository;
import com.company.weeklyreport.repository.WeeklyReportRepository;
import com.company.weeklyreport.repository.UserProjectRepository;
import com.company.weeklyreport.repository.ReportCommentRepository;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.entity.Project;
import com.company.weeklyreport.entity.WeeklyReport;
import com.company.weeklyreport.entity.UserProject;
import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.ReportStatus;
import com.company.weeklyreport.dto.report.ReportResponse;
import com.company.weeklyreport.dto.comment.CommentResponse;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = WeeklyReportApplication.class)
@AutoConfigureMockMvc
// @ActiveProfiles("test")
class WeeklyReportApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @Transactional
    void testCommentControllerRealIntegration() throws Exception {
        System.out.println("Testing real DB integration of ReportCommentController...");
        // 1. Create a dummy user
        User user = User.builder()
                .firstName("Test")
                .lastName("User")
                .email("test.comments." + UUID.randomUUID() + "@example.com")
                .passwordHash("password")
                .role(Role.MANAGER)
                .build();
        user = userRepository.save(user);

        // 2. Create a dummy project
        Project project = Project.builder()
                .name("Test Project " + UUID.randomUUID())
                .description("Desc")
                .isActive(true)
                .build();
        project = projectRepository.save(project);

        // 3. Create a weekly report draft
        WeeklyReport report = WeeklyReport.builder()
                .user(user)
                .project(project)
                .weekStartDate(LocalDate.now())
                .weekEndDate(LocalDate.now().plusDays(6))
                .tasksCompleted("Completed task 1")
                .tasksPlanned("Planned task 1")
                .blockers("None")
                .hoursWorked(40.0f)
                .status(ReportStatus.SUBMITTED)
                .build();
        report = weeklyReportRepository.save(report);

        // 4. Perform MockMvc call
        mockMvc.perform(get("/api/reports/" + report.getId() + "/comments")
                        .with(user(user)))
                .andExpect(status().isOk());

        System.out.println("Real DB integration of ReportCommentController test passed!");
    }

    @Test
    @Transactional
    void testListReports() {
        try {
            System.out.println(">>> LISTING REAL DB REPORTS <<<");
            weeklyReportRepository.findAll().forEach(r -> {
                System.out.println("Report ID: " + r.getId() + ", User Name: " + r.getUser().getFirstName() + " " + r.getUser().getLastName() + ", Project Name: " + r.getProject().getName() + ", Status: " + r.getStatus() + ", Week Start: " + r.getWeekStartDate());
            });
            System.out.println(">>> END OF LISTING REAL DB REPORTS <<<");
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private WeeklyReportRepository weeklyReportRepository;

    @Autowired
    private UserProjectRepository userProjectRepository;

    @Autowired
    private ReportCommentRepository reportCommentRepository;

    @Test
    void contextLoads() {
        // Verifies that the Spring application context starts up without errors.
    }

    @Test
    void testDashboardQueries() {
        LocalDate now = LocalDate.now();
        System.out.println("Testing getSummary...");
        dashboardService.getSummary(now, null);

        System.out.println("Testing getSubmissionStatus...");
        dashboardService.getSubmissionStatus(now, null);

        System.out.println("Testing getWorkloadByProject...");
        dashboardService.getWorkloadByProject(now, null);

        System.out.println("Testing getReports...");
        dashboardService.getReports(now, null, null, null, null);

        System.out.println("Testing getTrends...");
        dashboardService.getTrends(null, null, null, null);

        System.out.println("Testing getActivityFeed...");
        dashboardService.getActivityFeed(10);
        
        System.out.println("All dashboard service queries executed successfully!");
    }

    @Test
    @Transactional
    void testSubmitReport() {
        System.out.println("Testing submitReport lifecycle...");
        
        // 1. Create a dummy user
        User user = User.builder()
                .firstName("Test")
                .lastName("User")
                .email("test.submit." + UUID.randomUUID() + "@example.com")
                .passwordHash("password")
                .role(Role.MEMBER)
                .build();
        user = userRepository.save(user);

        // 2. Create a dummy project
        Project project = Project.builder()
                .name("Test Project " + UUID.randomUUID())
                .description("Desc")
                .isActive(true)
                .build();
        project = projectRepository.save(project);

        // Assign user to project
        UserProject userProject = UserProject.builder()
                .user(user)
                .project(project)
                .assignedDate(LocalDate.now())
                .build();
        userProjectRepository.save(userProject);

        // 3. Create a weekly report draft
        WeeklyReport report = WeeklyReport.builder()
                .user(user)
                .project(project)
                .weekStartDate(LocalDate.now())
                .weekEndDate(LocalDate.now().plusDays(6))
                .tasksCompleted("Completed task 1")
                .tasksPlanned("Planned task 1")
                .blockers("None")
                .hoursWorked(40.0f)
                .status(ReportStatus.DRAFT)
                .build();
        report = weeklyReportRepository.save(report);

        assertEquals(ReportStatus.DRAFT, report.getStatus());

        // 4. Submit the report via service
        ReportResponse response = reportService.submitReport(report.getId(), user);
        
        // 5. Assert status returned in response is SUBMITTED
        assertEquals(ReportStatus.SUBMITTED, response.status());
        assertNotNull(response.submittedAt());

        // 6. Reload from DB and assert status is SUBMITTED
        WeeklyReport updatedReport = weeklyReportRepository.findById(report.getId()).orElse(null);
        assertNotNull(updatedReport);
        assertEquals(ReportStatus.SUBMITTED, updatedReport.getStatus());
        assertNotNull(updatedReport.getSubmittedAt());
        
        System.out.println("Report submit lifecycle test passed!");
    }

    @Test
    @Transactional
    void testApprovalWorkflow() {
        System.out.println("Testing approval workflow lifecycle...");

        // Setup: create manager
        User manager = User.builder()
                .firstName("Manager")
                .lastName("One")
                .email("mgr." + UUID.randomUUID() + "@example.com")
                .passwordHash("password")
                .role(Role.MANAGER)
                .build();
        manager = userRepository.save(manager);

        // Setup: create member + project + assignment
        User member = User.builder()
                .firstName("Member")
                .lastName("One")
                .email("member." + UUID.randomUUID() + "@example.com")
                .passwordHash("password")
                .role(Role.MEMBER)
                .build();
        member = userRepository.save(member);

        Project project = Project.builder()
                .name("Approval Test Project " + UUID.randomUUID())
                .description("Desc")
                .isActive(true)
                .build();
        project = projectRepository.save(project);

        userProjectRepository.save(UserProject.builder()
                .user(member).project(project).assignedDate(LocalDate.now()).build());

        // 1. Create & submit a report
        WeeklyReport report = WeeklyReport.builder()
                .user(member).project(project)
                .weekStartDate(LocalDate.now())
                .weekEndDate(LocalDate.now().plusDays(6))
                .tasksCompleted("Done")
                .tasksPlanned("Planned")
                .blockers("None")
                .hoursWorked(40.0f)
                .status(ReportStatus.DRAFT)
                .build();
        report = weeklyReportRepository.save(report);
        reportService.submitReport(report.getId(), member);
        assertEquals(ReportStatus.SUBMITTED, weeklyReportRepository.findById(report.getId()).get().getStatus());

        // 2. Approve the report
        ReportResponse approved = reportService.approveReport(report.getId(), manager);
        assertEquals(ReportStatus.APPROVED, approved.status());
        assertNotNull(approved.reviewedAt());
        assertEquals(manager.getId(), approved.reviewedById());
        System.out.println("Approve test passed!");

        // 3. Create a second report for the reject/resubmit flow
        WeeklyReport report2 = WeeklyReport.builder()
                .user(member).project(project)
                .weekStartDate(LocalDate.now().plusWeeks(1))
                .weekEndDate(LocalDate.now().plusWeeks(1).plusDays(6))
                .tasksCompleted("Done 2")
                .tasksPlanned("Planned 2")
                .blockers("None")
                .hoursWorked(40.0f)
                .status(ReportStatus.SUBMITTED)
                .build();
        report2 = weeklyReportRepository.save(report2);

        // 4. Reject report2 with a comment
        ReportResponse rejected = reportService.rejectReport(report2.getId(), "Please add more details", manager);
        assertEquals(ReportStatus.REJECTED, rejected.status());
        assertNotNull(rejected.reviewedAt());

        // 5. Verify comment was saved
        java.util.List<CommentResponse> comments = commentService.getComments(report2.getId(), manager);
        assertFalse(comments.isEmpty());
        assertEquals("Please add more details", comments.get(0).content());
        System.out.println("Reject + comment test passed!");

        // 6. Member edits the rejected report and resubmits
        WeeklyReport dbReport2 = weeklyReportRepository.findById(report2.getId()).get();
        dbReport2.setTasksCompleted("Done 2 - revised");
        weeklyReportRepository.save(dbReport2);
        ReportResponse resubmitted = reportService.submitReport(report2.getId(), member);
        assertEquals(ReportStatus.SUBMITTED, resubmitted.status());
        assertNull(resubmitted.reviewedAt());
        assertNull(resubmitted.reviewedById());
        System.out.println("Resubmit after rejection test passed!");

        System.out.println("Full approval workflow test passed!");
    }
}

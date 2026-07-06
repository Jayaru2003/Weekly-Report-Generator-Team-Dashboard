package com.company.weeklyreport.controller;

import com.company.weeklyreport.dto.dashboard.*;
import com.company.weeklyreport.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/reports")
    public List<TeamReportResponse> getReports(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate week,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return dashboardService.getReports(week, userId, projectId, startDate, endDate);
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate week,
            @RequestParam(required = false) UUID projectId) {
        return dashboardService.getSummary(week, projectId);
    }

    @GetMapping("/trends")
    public List<TrendDataResponse> getTrends(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) UUID projectId) {
        return dashboardService.getTrends(startDate, endDate, userId, projectId);
    }

    @GetMapping("/submission-status")
    public List<SubmissionStatusResponse> getSubmissionStatus(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate week,
            @RequestParam(required = false) UUID projectId) {
        return dashboardService.getSubmissionStatus(week, projectId);
    }

    @GetMapping("/workload-by-project")
    public List<WorkloadByProjectResponse> getWorkloadByProject(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate week,
            @RequestParam(required = false) UUID projectId) {
        return dashboardService.getWorkloadByProject(week, projectId);
    }

    @GetMapping("/activity-feed")
    public List<ActivityFeedResponse> getActivityFeed(
            @RequestParam(defaultValue = "10") int limit) {
        return dashboardService.getActivityFeed(limit);
    }
}

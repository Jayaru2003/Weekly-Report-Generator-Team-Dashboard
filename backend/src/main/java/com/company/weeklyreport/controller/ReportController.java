package com.company.weeklyreport.controller;

import com.company.weeklyreport.dto.report.RejectRequest;
import com.company.weeklyreport.dto.report.ReportRequest;
import com.company.weeklyreport.dto.report.ReportResponse;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for WeeklyReport management.
 *
 * <ul>
 *   <li>POST /api/reports                — create draft report</li>
 *   <li>PUT  /api/reports/{id}           — edit own draft/rejected report</li>
 *   <li>POST /api/reports/{id}/submit    — submit own report</li>
 *   <li>POST /api/reports/{id}/approve   — MANAGER: approve a submitted report</li>
 *   <li>POST /api/reports/{id}/reject    — MANAGER: reject a submitted report with comment</li>
 *   <li>GET  /api/reports/me             — list own reports (with optional filters)</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReportResponse createReport(
            @Valid @RequestBody ReportRequest request,
            @AuthenticationPrincipal User principal) {
        return reportService.createReport(request, principal);
    }

    @PutMapping("/{id}")
    public ReportResponse updateReport(
            @PathVariable UUID id,
            @Valid @RequestBody ReportRequest request,
            @AuthenticationPrincipal User principal) {
        return reportService.updateReport(id, request, principal);
    }

    @PostMapping("/{id}/submit")
    public ReportResponse submitReport(
            @PathVariable UUID id,
            @AuthenticationPrincipal User principal) {
        return reportService.submitReport(id, principal);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ReportResponse approveReport(
            @PathVariable UUID id,
            @AuthenticationPrincipal User principal) {
        return reportService.approveReport(id, principal);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ReportResponse rejectReport(
            @PathVariable UUID id,
            @Valid @RequestBody RejectRequest request,
            @AuthenticationPrincipal User principal) {
        return reportService.rejectReport(id, request.comment(), principal);
    }

    @GetMapping("/me")
    public List<ReportResponse> getMyReports(
            @AuthenticationPrincipal User principal,
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekEnd) {
        return reportService.getMyReports(principal, projectId, weekStart, weekEnd);
    }
}

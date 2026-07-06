package com.company.weeklyreport.service;

import com.company.weeklyreport.dto.report.ReportRequest;
import com.company.weeklyreport.dto.report.ReportResponse;
import com.company.weeklyreport.entity.Project;
import com.company.weeklyreport.entity.ReportStatus;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.entity.WeeklyReport;
import com.company.weeklyreport.repository.ProjectRepository;
import com.company.weeklyreport.repository.WeeklyReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Business logic for WeeklyReport management.
 * All write operations are scoped to the authenticated user (ownership check).
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final WeeklyReportRepository reportRepository;
    private final ProjectRepository      projectRepository;

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public ReportResponse createReport(ReportRequest request, User principal) {
        validateDates(request.weekStartDate(), request.weekEndDate());

        Project project = findProjectOrThrow(request.projectId());

        WeeklyReport report = WeeklyReport.builder()
                .user(principal)
                .project(project)
                .weekStartDate(request.weekStartDate())
                .weekEndDate(request.weekEndDate())
                .tasksCompleted(request.tasksCompleted())
                .tasksPlanned(request.tasksPlanned())
                .blockers(request.blockers())
                .hoursWorked(request.hoursWorked())
                .notes(request.notes())
                .status(ReportStatus.DRAFT)
                .build();

        return ReportResponse.from(reportRepository.save(report));
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Transactional
    public ReportResponse updateReport(UUID id, ReportRequest request, User principal) {
        WeeklyReport report = findOrThrow(id);
        checkOwnership(report, principal);

        if (report.getStatus() == ReportStatus.SUBMITTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Submitted reports cannot be edited");
        }

        validateDates(request.weekStartDate(), request.weekEndDate());
        Project project = findProjectOrThrow(request.projectId());

        report.setProject(project);
        report.setWeekStartDate(request.weekStartDate());
        report.setWeekEndDate(request.weekEndDate());
        report.setTasksCompleted(request.tasksCompleted());
        report.setTasksPlanned(request.tasksPlanned());
        report.setBlockers(request.blockers());
        report.setHoursWorked(request.hoursWorked());
        report.setNotes(request.notes());

        return ReportResponse.from(reportRepository.save(report));
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    @Transactional
    public ReportResponse submitReport(UUID id, User principal) {
        WeeklyReport report = findOrThrow(id);
        checkOwnership(report, principal);

        if (report.getStatus() == ReportStatus.SUBMITTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Report is already submitted");
        }

        report.setStatus(ReportStatus.SUBMITTED);
        report.setSubmittedAt(Instant.now());

        return ReportResponse.from(reportRepository.save(report));
    }

    // ── Query ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ReportResponse> getMyReports(
            User principal,
            UUID projectId,
            LocalDate weekStart,
            LocalDate weekEnd) {

        return reportRepository
                .findByFilters(principal.getId(), projectId, weekStart, weekEnd)
                .stream()
                .map(ReportResponse::from)
                .toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private WeeklyReport findOrThrow(UUID id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found: " + id));
    }

    private Project findProjectOrThrow(UUID projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Project not found: " + projectId));
    }

    private void checkOwnership(WeeklyReport report, User principal) {
        if (!report.getUser().getId().equals(principal.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have permission to access this report");
        }
    }

    private void validateDates(LocalDate start, LocalDate end) {
        if (!end.isAfter(start)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Week end date must be after week start date");
        }
    }
}

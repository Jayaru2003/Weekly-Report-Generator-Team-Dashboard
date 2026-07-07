package com.company.weeklyreport.service;

import com.company.weeklyreport.dto.report.ReportRequest;
import com.company.weeklyreport.dto.report.ReportResponse;
import com.company.weeklyreport.entity.*;
import com.company.weeklyreport.repository.ProjectRepository;
import com.company.weeklyreport.repository.ReportCommentRepository;
import com.company.weeklyreport.repository.UserProjectRepository;
import com.company.weeklyreport.repository.WeeklyReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;
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
    private final UserProjectRepository  userProjectRepository;
    private final ReportCommentRepository commentRepository;

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public ReportResponse createReport(ReportRequest request, User principal) {
        validateDates(request.weekStartDate(), request.weekEndDate());

        Project project = findProjectOrThrow(request.projectId());

        // Validate project assignment for members
        if (principal.getRole() == Role.MEMBER) {
            boolean isAssigned = userProjectRepository.existsByUserIdAndProjectId(principal.getId(), project.getId());
            if (!isAssigned) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not assigned to project: " + project.getName());
            }
        }

        LocalDate normalizedStart = request.weekStartDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate normalizedEnd = normalizedStart.plusDays(6);

        // Check if report already exists for this week and project
        Optional<WeeklyReport> existing = reportRepository.findByUserIdAndProjectIdAndWeekStartDate(
                principal.getId(), project.getId(), normalizedStart);
        if (existing.isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A report already exists for this week and project");
        }

        WeeklyReport report = WeeklyReport.builder()
                .user(principal)
                .project(project)
                .weekStartDate(normalizedStart)
                .weekEndDate(normalizedEnd)
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

        // Allow editing of DRAFT or REJECTED reports only
        if (report.getStatus() == ReportStatus.SUBMITTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Submitted reports cannot be edited");
        }
        if (report.getStatus() == ReportStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Approved reports cannot be edited");
        }

        validateDates(request.weekStartDate(), request.weekEndDate());
        Project project = findProjectOrThrow(request.projectId());

        // Validate project assignment for members
        if (principal.getRole() == Role.MEMBER) {
            boolean isAssigned = userProjectRepository.existsByUserIdAndProjectId(principal.getId(), project.getId());
            if (!isAssigned) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not assigned to project: " + project.getName());
            }
        }

        LocalDate normalizedStart = request.weekStartDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate normalizedEnd = normalizedStart.plusDays(6);

        // Check if updating to a week and project that conflicts with another report
        Optional<WeeklyReport> existing = reportRepository.findByUserIdAndProjectIdAndWeekStartDate(
                principal.getId(), project.getId(), normalizedStart);
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A report already exists for this week and project");
        }

        report.setProject(project);
        report.setWeekStartDate(normalizedStart);
        report.setWeekEndDate(normalizedEnd);
        report.setTasksCompleted(request.tasksCompleted());
        report.setTasksPlanned(request.tasksPlanned());
        report.setBlockers(request.blockers());
        report.setHoursWorked(request.hoursWorked());
        report.setNotes(request.notes());

        // If editing a rejected report, clear review fields and change status to DRAFT
        if (report.getStatus() == ReportStatus.REJECTED) {
            report.setReviewedAt(null);
            report.setReviewedBy(null);
            report.setStatus(ReportStatus.DRAFT);
        }

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
        if (report.getStatus() == ReportStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Approved reports cannot be resubmitted");
        }

        // Clear any previous review data when resubmitting from REJECTED
        report.setReviewedAt(null);
        report.setReviewedBy(null);
        report.setStatus(ReportStatus.SUBMITTED);
        report.setSubmittedAt(Instant.now());

        return ReportResponse.from(reportRepository.save(report));
    }

    // ── Approve ───────────────────────────────────────────────────────────────

    @Transactional
    public ReportResponse approveReport(UUID id, User manager) {
        WeeklyReport report = findOrThrow(id);

        if (report.getStatus() != ReportStatus.SUBMITTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only submitted reports can be approved. Current status: " + report.getStatus());
        }

        report.setStatus(ReportStatus.APPROVED);
        report.setReviewedAt(Instant.now());
        report.setReviewedBy(manager);

        return ReportResponse.from(reportRepository.save(report));
    }

    // ── Reject ────────────────────────────────────────────────────────────────

    @Transactional
    public ReportResponse rejectReport(UUID id, String comment, User manager) {
        WeeklyReport report = findOrThrow(id);

        if (report.getStatus() != ReportStatus.SUBMITTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only submitted reports can be rejected. Current status: " + report.getStatus());
        }

        report.setStatus(ReportStatus.REJECTED);
        report.setReviewedAt(Instant.now());
        report.setReviewedBy(manager);

        WeeklyReport savedReport = reportRepository.save(report);

        // Save the rejection comment
        ReportComment rejectionComment = ReportComment.builder()
                .report(savedReport)
                .author(manager)
                .content(comment)
                .build();
        commentRepository.save(rejectionComment);

        return ReportResponse.from(savedReport);
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

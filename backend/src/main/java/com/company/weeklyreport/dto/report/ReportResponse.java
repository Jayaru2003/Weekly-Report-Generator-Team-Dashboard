package com.company.weeklyreport.dto.report;

import com.company.weeklyreport.entity.ReportStatus;
import com.company.weeklyreport.entity.WeeklyReport;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Response payload for WeeklyReport endpoints.
 * Includes projectName so the frontend avoids a second lookup.
 * Includes reviewedAt / reviewedByName for the approval workflow.
 */
public record ReportResponse(
        UUID         id,
        UUID         userId,
        UUID         projectId,
        String       projectName,
        LocalDate    weekStartDate,
        LocalDate    weekEndDate,
        String       tasksCompleted,
        String       tasksPlanned,
        String       blockers,
        Float        hoursWorked,
        String       notes,
        ReportStatus status,
        Instant      submittedAt,
        Instant      reviewedAt,
        UUID         reviewedById,
        String       reviewedByName,
        Instant      createdAt,
        Instant      updatedAt
) {
    /** Convenience factory — maps entity to DTO. */
    public static ReportResponse from(WeeklyReport r) {
        return new ReportResponse(
                r.getId(),
                r.getUser().getId(),
                r.getProject().getId(),
                r.getProject().getName(),
                r.getWeekStartDate(),
                r.getWeekEndDate(),
                r.getTasksCompleted(),
                r.getTasksPlanned(),
                r.getBlockers(),
                r.getHoursWorked(),
                r.getNotes(),
                r.getStatus(),
                r.getSubmittedAt(),
                r.getReviewedAt(),
                r.getReviewedBy() != null ? r.getReviewedBy().getId() : null,
                r.getReviewedBy() != null
                        ? r.getReviewedBy().getFirstName() + " " + r.getReviewedBy().getLastName()
                        : null,
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }
}

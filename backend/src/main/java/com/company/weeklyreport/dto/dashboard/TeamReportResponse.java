package com.company.weeklyreport.dto.dashboard;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TeamReportResponse(
    UUID reportId,
    UUID userId,
    String firstName,
    String lastName,
    String email,
    UUID projectId,
    String projectName,
    LocalDate weekStartDate,
    LocalDate weekEndDate,
    String tasksCompleted,
    String tasksPlanned,
    String blockers,
    Float hoursWorked,
    String notes,
    String status, // "SUBMITTED", "PENDING", "LATE"
    Instant submittedAt
) {}

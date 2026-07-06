package com.company.weeklyreport.dto.report;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Request body for creating or updating a WeeklyReport.
 * weekEndDate must be after weekStartDate — validated in ReportService.
 */
public record ReportRequest(

        @NotNull(message = "Project ID is required")
        UUID projectId,

        @NotNull(message = "Week start date is required")
        LocalDate weekStartDate,

        @NotNull(message = "Week end date is required")
        LocalDate weekEndDate,

        @NotBlank(message = "Tasks completed is required")
        String tasksCompleted,

        @NotBlank(message = "Tasks planned is required")
        String tasksPlanned,

        @NotBlank(message = "Blockers field is required")
        String blockers,

        @Min(value = 0, message = "Hours worked must be zero or positive")
        Float hoursWorked,

        String notes
) {}

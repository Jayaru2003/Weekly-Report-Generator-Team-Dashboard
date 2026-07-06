package com.company.weeklyreport.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Core aggregate of the application.
 * Each WeeklyReport belongs to exactly one User and one Project,
 * covering a calendar week identified by week_start_date / week_end_date.
 */
@Entity
@Table(
    name = "weekly_reports",
    indexes = {
        @Index(name = "idx_report_user",    columnList = "user_id"),
        @Index(name = "idx_report_project", columnList = "project_id"),
        @Index(name = "idx_report_week",    columnList = "week_start_date")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyReport {

    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false,
            columnDefinition = "uuid")
    private UUID id;

    // ── Relationships ────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_report_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_report_project"))
    private Project project;

    // ── Temporal fields ──────────────────────────────────────────────────────

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Column(name = "week_end_date", nullable = false)
    private LocalDate weekEndDate;

    // ── Report content fields ────────────────────────────────────────────────

    /**
     * Free-form text describing tasks the member completed this week.
     */
    @Column(name = "tasks_completed", nullable = false,
            columnDefinition = "TEXT")
    private String tasksCompleted;

    /**
     * Free-form text describing tasks planned for the following week.
     */
    @Column(name = "tasks_planned", nullable = false,
            columnDefinition = "TEXT")
    private String tasksPlanned;

    /**
     * Free-form text describing any blockers or impediments.
     */
    @Column(name = "blockers", nullable = false,
            columnDefinition = "TEXT")
    private String blockers;

    /**
     * Optional: total hours worked during the week.
     */
    @Column(name = "hours_worked")
    private Float hoursWorked;

    /**
     * Optional: miscellaneous notes.
     */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // ── Status & audit ───────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private ReportStatus status = ReportStatus.DRAFT;

    /**
     * Populated when the member submits the report (status -> SUBMITTED).
     */
    @Column(name = "submitted_at")
    private Instant submittedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

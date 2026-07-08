package com.company.weeklyreport.repository;

import org.springframework.data.domain.Pageable;
import com.company.weeklyreport.dto.dashboard.WorkloadByProjectResponse;
import com.company.weeklyreport.entity.ReportStatus;
import com.company.weeklyreport.entity.WeeklyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, UUID> {

    List<WeeklyReport> findByUserId(UUID userId);

    List<WeeklyReport> findByProjectId(UUID projectId);

    List<WeeklyReport> findByUserIdAndProjectId(UUID userId, UUID projectId);

    List<WeeklyReport> findByStatus(ReportStatus status);

    Optional<WeeklyReport> findByUserIdAndProjectIdAndWeekStartDate(
            UUID userId, UUID projectId, LocalDate weekStartDate);

    List<WeeklyReport> findByWeekStartDateBetween(
            LocalDate from, LocalDate to);

    List<WeeklyReport> findByWeekStartDate(LocalDate weekStartDate);

    long countByWeekStartDateAndStatusIn(LocalDate weekStartDate, List<ReportStatus> statuses);

    long countByWeekStartDateAndProjectIdAndStatusIn(LocalDate weekStartDate, UUID projectId, List<ReportStatus> statuses);

    // Native queries — no nullable UUID params, so PostgreSQL can infer types correctly
    @Query(value = "SELECT COUNT(DISTINCT user_id) FROM public.weekly_reports WHERE week_start_date = :week AND status IN ('SUBMITTED', 'APPROVED')", nativeQuery = true)
    long countDistinctUsersSubmittedForWeek(@Param("week") LocalDate week);

    @Query(value = "SELECT COUNT(DISTINCT user_id) FROM public.weekly_reports WHERE week_start_date = :week AND project_id = :projectId AND status IN ('SUBMITTED', 'APPROVED')", nativeQuery = true)
    long countDistinctUsersSubmittedForWeekAndProject(@Param("week") LocalDate week, @Param("projectId") UUID projectId);

    @Query(value = "SELECT COUNT(*) FROM public.weekly_reports WHERE week_start_date = :week AND status IN ('SUBMITTED', 'REJECTED') AND blockers IS NOT NULL AND TRIM(blockers) != '' AND LOWER(TRIM(blockers)) != 'none' AND LOWER(TRIM(blockers)) != 'n/a'", nativeQuery = true)
    long countOpenBlockers(@Param("week") LocalDate week);

    @Query(value = "SELECT COUNT(*) FROM public.weekly_reports WHERE week_start_date = :week AND project_id = :projectId AND status IN ('SUBMITTED', 'REJECTED') AND blockers IS NOT NULL AND TRIM(blockers) != '' AND LOWER(TRIM(blockers)) != 'none' AND LOWER(TRIM(blockers)) != 'n/a'", nativeQuery = true)
    long countOpenBlockersForProject(@Param("week") LocalDate week, @Param("projectId") UUID projectId);

    @Query("""
        SELECT new com.company.weeklyreport.dto.dashboard.WorkloadByProjectResponse(
            r.project.name,
            COUNT(r),
            COALESCE(SUM(r.hoursWorked), 0.0)
        )
        FROM WeeklyReport r
        WHERE r.weekStartDate = :week
          AND r.status IN ('SUBMITTED', 'APPROVED')
          AND (:projectId IS NULL OR r.project.id = :projectId)
        GROUP BY r.project.name
    """)
    List<WorkloadByProjectResponse> getWorkloadByProject(@Param("week") LocalDate week, @Param("projectId") UUID projectId);

    @Query("""
        SELECT new com.company.weeklyreport.dto.dashboard.WorkloadByProjectResponse(
            CONCAT(r.user.firstName, ' ', r.user.lastName),
            COUNT(r),
            COALESCE(SUM(r.hoursWorked), 0.0)
        )
        FROM WeeklyReport r
        WHERE r.weekStartDate = :week
          AND r.status IN ('SUBMITTED', 'APPROVED')
          AND r.project.id = :projectId
        GROUP BY r.user.id, r.user.firstName, r.user.lastName
    """)
    List<WorkloadByProjectResponse> getWorkloadByMemberForProject(@Param("week") LocalDate week, @Param("projectId") UUID projectId);

    List<WeeklyReport> findByWeekStartDateAndProjectId(LocalDate weekStartDate, UUID projectId);

    @Query("""
        SELECT r FROM WeeklyReport r
        WHERE r.status IN :statuses
          AND r.weekStartDate >= :startDate
          AND r.weekEndDate <= :endDate
          AND (:userId IS NULL OR r.user.id = :userId)
          AND (:projectId IS NULL OR r.project.id = :projectId)
        ORDER BY r.weekStartDate ASC
    """)
    List<WeeklyReport> findByTrendsFilter(
            @Param("statuses") List<ReportStatus> statuses,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("userId") UUID userId,
            @Param("projectId") UUID projectId
    );

    @Query("""
        SELECT r FROM WeeklyReport r
        WHERE r.status IN ('SUBMITTED', 'APPROVED', 'REJECTED')
        ORDER BY r.submittedAt DESC
    """)
    List<WeeklyReport> findRecentSubmissions(Pageable pageable);

    // Used for trend analysis: all submitted reports between a date range
    List<WeeklyReport> findByStatusAndWeekStartDateGreaterThanEqualAndWeekEndDateLessThanEqualOrderByWeekStartDateAsc(
            ReportStatus status, LocalDate startDate, LocalDate endDate);

    // Used for submitted reports of a specific user in a date range (trends with filter)
    List<WeeklyReport> findByStatusAndUserIdAndWeekStartDateGreaterThanEqualAndWeekEndDateLessThanEqualOrderByWeekStartDateAsc(
            ReportStatus status, UUID userId, LocalDate startDate, LocalDate endDate);

    /**
     * Flexible filter: userId is always required; projectId, weekStart, weekEnd
     * are optional (pass null to skip that filter).
     * Results are sorted by weekStartDate descending.
     */
    @Query("""
            SELECT r FROM WeeklyReport r
            WHERE r.user.id = :userId
              AND (:projectId  IS NULL OR r.project.id   = :projectId)
              AND (:weekStart  IS NULL OR r.weekStartDate >= :weekStart)
              AND (:weekEnd    IS NULL OR r.weekEndDate   <= :weekEnd)
            ORDER BY r.weekStartDate DESC
            """)
    List<WeeklyReport> findByFilters(
            @Param("userId")    UUID userId,
            @Param("projectId") UUID projectId,
            @Param("weekStart") LocalDate weekStart,
            @Param("weekEnd")   LocalDate weekEnd
    );
}

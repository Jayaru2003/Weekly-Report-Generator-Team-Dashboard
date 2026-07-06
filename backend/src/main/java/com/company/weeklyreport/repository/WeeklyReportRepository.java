package com.company.weeklyreport.repository;

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

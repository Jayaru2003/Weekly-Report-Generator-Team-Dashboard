package com.weeklyreport.repository;

import com.weeklyreport.entity.ReportStatus;
import com.weeklyreport.entity.WeeklyReport;
import org.springframework.data.jpa.repository.JpaRepository;
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
}

package com.company.weeklyreport.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * One-time schema migration to extend the weekly_reports status check constraint
 * to include APPROVED and REJECTED (added in the approval workflow feature).
 *
 * This runs at startup and is idempotent — it drops and recreates the constraint
 * safely so repeated restarts have no side effects.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StatusConstraintMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute(
                "ALTER TABLE public.weekly_reports " +
                "DROP CONSTRAINT IF EXISTS weekly_reports_status_check"
            );
            jdbcTemplate.execute(
                "ALTER TABLE public.weekly_reports " +
                "ADD CONSTRAINT weekly_reports_status_check " +
                "CHECK (status IN ('DRAFT','SUBMITTED','APPROVED','REJECTED'))"
            );
            log.info("StatusConstraintMigration: weekly_reports_status_check updated successfully.");
        } catch (Exception e) {
            log.warn("StatusConstraintMigration: could not update constraint (may already be correct): {}", e.getMessage());
        }
    }
}

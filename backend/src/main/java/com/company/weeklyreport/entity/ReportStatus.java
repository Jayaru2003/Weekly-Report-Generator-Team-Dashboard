package com.company.weeklyreport.entity;

/**
 * ReportStatus enum for the lifecycle of a weekly report.
 * DRAFT     — report is still being edited and has not been submitted.
 * SUBMITTED — report has been finalized and submitted by the member.
 * APPROVED  — a manager has reviewed and approved the report.
 * REJECTED  — a manager has reviewed and rejected the report; member can revise.
 */
public enum ReportStatus {
    DRAFT,
    SUBMITTED,
    APPROVED,
    REJECTED
}

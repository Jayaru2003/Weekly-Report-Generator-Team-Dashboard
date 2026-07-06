package com.company.weeklyreport.dto.dashboard;

public record DashboardSummaryResponse(
    long totalReportsSubmitted,
    long totalTeamMembers,
    double complianceRate,
    long openBlockersCount
) {}

package com.company.weeklyreport.dto.dashboard;

public record WorkloadByProjectResponse(
    String projectName,
    Long reportCount,
    Double totalHours
) {}

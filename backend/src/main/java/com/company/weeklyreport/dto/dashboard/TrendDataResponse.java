package com.company.weeklyreport.dto.dashboard;

import java.time.LocalDate;

public record TrendDataResponse(
    LocalDate weekStartDate,
    int tasksCompletedCount
) {}

package com.company.weeklyreport.dto.dashboard;

import java.time.Instant;

public record ActivityFeedResponse(
    String userName,
    String projectName,
    Instant submittedAt
) {}

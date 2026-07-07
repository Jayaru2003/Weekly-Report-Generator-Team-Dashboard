package com.company.weeklyreport.dto.dashboard;

import java.util.UUID;

public record SubmissionStatusResponse(
    UUID userId,
    String userName,
    String status // "SUBMITTED", "PENDING", "LATE"
) {}

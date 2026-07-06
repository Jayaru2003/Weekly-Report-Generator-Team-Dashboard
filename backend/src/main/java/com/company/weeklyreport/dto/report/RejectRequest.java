package com.company.weeklyreport.dto.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for POST /api/reports/{id}/reject.
 * A rejection must include a mandatory comment explaining the reason.
 */
public record RejectRequest(
        @NotBlank(message = "Rejection comment is required")
        @Size(max = 1000, message = "Comment must be at most 1000 characters")
        String comment
) {}

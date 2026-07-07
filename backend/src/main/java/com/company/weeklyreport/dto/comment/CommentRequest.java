package com.company.weeklyreport.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for POST /api/reports/{id}/comments.
 */
public record CommentRequest(
        @NotBlank(message = "Comment content is required")
        @Size(max = 1000, message = "Comment must be at most 1000 characters")
        String content
) {}

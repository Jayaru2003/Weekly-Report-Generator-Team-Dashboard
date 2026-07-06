package com.company.weeklyreport.dto.comment;

import com.company.weeklyreport.entity.ReportComment;

import java.time.Instant;
import java.util.UUID;

/**
 * Response payload for a single ReportComment.
 */
public record CommentResponse(
        UUID    id,
        UUID    reportId,
        UUID    authorId,
        String  authorName,
        String  content,
        Instant createdAt
) {
    public static CommentResponse from(ReportComment c) {
        return new CommentResponse(
                c.getId(),
                c.getReport().getId(),
                c.getAuthor().getId(),
                c.getAuthor().getFirstName() + " " + c.getAuthor().getLastName(),
                c.getContent(),
                c.getCreatedAt()
        );
    }
}

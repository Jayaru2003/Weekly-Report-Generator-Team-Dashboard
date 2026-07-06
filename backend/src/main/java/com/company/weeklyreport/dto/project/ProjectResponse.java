package com.company.weeklyreport.dto.project;

import com.company.weeklyreport.entity.Project;

import java.time.Instant;
import java.util.UUID;

/**
 * Response payload for Project endpoints.
 */
public record ProjectResponse(
        UUID    id,
        String  name,
        String  description,
        Boolean isActive,
        Instant createdAt
) {
    /** Convenience factory — maps entity to DTO. */
    public static ProjectResponse from(Project p) {
        return new ProjectResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getIsActive(),
                p.getCreatedAt()
        );
    }
}

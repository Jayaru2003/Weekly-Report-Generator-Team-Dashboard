package com.company.weeklyreport.dto.project;

import com.company.weeklyreport.dto.user.UserResponse;
import com.company.weeklyreport.entity.Project;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response payload for Project endpoints.
 */
public record ProjectResponse(
        UUID    id,
        String  name,
        String  description,
        Boolean isActive,
        Instant createdAt,
        List<UserResponse> members
) {
    /** Convenience factory — maps entity to DTO. */
    public static ProjectResponse from(Project p) {
        List<UserResponse> memberList = p.getUserProjects() != null
                ? p.getUserProjects().stream()
                        .map(up -> UserResponse.from(up.getUser()))
                        .toList()
                : List.of();
        return new ProjectResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getIsActive(),
                p.getCreatedAt(),
                memberList
        );
    }
}

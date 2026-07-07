package com.company.weeklyreport.dto.user;

import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.User;

import java.util.UUID;

/**
 * DTO representing user details.
 */
public record UserResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        Role role
) {
    public static UserResponse from(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );
    }
}

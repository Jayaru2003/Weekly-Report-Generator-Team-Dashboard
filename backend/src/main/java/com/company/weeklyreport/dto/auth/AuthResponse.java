package com.company.weeklyreport.dto.auth;

import com.company.weeklyreport.entity.Role;

import java.util.UUID;

/**
 * Response payload for both {@code /api/auth/register} and {@code /api/auth/login}.
 * Contains the signed JWT and minimal user information for the frontend session.
 */
public record AuthResponse(
        String token,
        UUID   id,
        String firstName,
        String lastName,
        String email,
        Role   role
) {}

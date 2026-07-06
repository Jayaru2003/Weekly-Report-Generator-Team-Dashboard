package com.company.weeklyreport.controller;

import com.company.weeklyreport.dto.auth.AuthResponse;
import com.company.weeklyreport.dto.auth.LoginRequest;
import com.company.weeklyreport.dto.auth.RegisterRequest;
import com.company.weeklyreport.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication endpoints — these are publicly accessible (no token required).
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user account.
     *
     * @param request body with firstName, lastName, email, password, role
     * @return 201 Created with JWT + user info
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    /**
     * Authenticate an existing user.
     *
     * @param request body with email + password
     * @return 200 OK with JWT + user info
     */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}

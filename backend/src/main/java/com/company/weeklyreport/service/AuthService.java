package com.company.weeklyreport.service;

import com.company.weeklyreport.dto.auth.AuthResponse;
import com.company.weeklyreport.dto.auth.LoginRequest;
import com.company.weeklyreport.dto.auth.RegisterRequest;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.repository.UserRepository;
import com.company.weeklyreport.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Handles user registration and login business logic.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService      jwtService;

    // ── Register ──────────────────────────────────────────────────────────────

    /**
     * Registers a new user.
     *
     * @throws ResponseStatusException 409 if email is already registered.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this email address already exists");
        }

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return toResponse(token, user);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    /**
     * Authenticates an existing user.
     *
     * @throws ResponseStatusException 401 if credentials are invalid.
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        return toResponse(token, user);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private AuthResponse toResponse(String token, User user) {
        return new AuthResponse(
                token,
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );
    }
}

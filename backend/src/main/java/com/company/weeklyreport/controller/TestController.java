package com.company.weeklyreport.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Temporary smoke-test controller for verifying JWT authentication end-to-end.
 *
 * <p>{@code GET /api/test/ping} — requires a valid JWT; returns {@code {"message":"pong"}}.
 * <p>{@code GET /api/test/manager-only} — requires MANAGER role.
 *
 * <p>These endpoints can be removed once real feature controllers are in place.
 */
@RestController
@RequestMapping("/api/test")
public class TestController {

    /** Returns "pong" for any authenticated user (any role). */
    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("message", "pong");
    }

    /** Returns "manager-pong" only for users with the MANAGER role. */
    @GetMapping("/manager-only")
    @PreAuthorize("hasRole('MANAGER')")
    public Map<String, String> managerPing() {
        return Map.of("message", "manager-pong");
    }
}

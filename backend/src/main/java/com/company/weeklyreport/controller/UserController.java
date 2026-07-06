package com.company.weeklyreport.controller;

import com.company.weeklyreport.dto.user.UserResponse;
import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for retrieving user accounts.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public List<UserResponse> listUsers(@RequestParam(required = false) Role role) {
        if (role != null) {
            return userRepository.findByRole(role).stream()
                    .map(UserResponse::from)
                    .toList();
        }
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }
}

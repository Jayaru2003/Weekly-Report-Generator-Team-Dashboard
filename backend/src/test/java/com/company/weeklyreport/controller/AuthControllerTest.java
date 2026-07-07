package com.company.weeklyreport.controller;

import com.company.weeklyreport.WeeklyReportApplication;
import com.company.weeklyreport.dto.auth.LoginRequest;
import com.company.weeklyreport.dto.auth.RegisterRequest;
import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = WeeklyReportApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void testRegister_Success() throws Exception {
        RegisterRequest request = new RegisterRequest("Alice", "Smith", "alice.smith@example.com", "securepass123", Role.MEMBER);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("alice.smith@example.com"))
                .andExpect(jsonPath("$.role").value("MEMBER"));
    }

    @Test
    void testRegister_ValidationFailure() throws Exception {
        // Empty fields to trigger validation failure
        RegisterRequest request = new RegisterRequest("", "", "invalidemail", "", Role.MEMBER);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testLogin_Success() throws Exception {
        // Register a user first
        com.company.weeklyreport.entity.User user = com.company.weeklyreport.entity.User.builder()
                .firstName("Bob")
                .lastName("Jones")
                .email("bob.jones@example.com")
                .passwordHash(passwordEncoder.encode("bobpassword"))
                .role(Role.MEMBER)
                .build();
        userRepository.save(user);

        LoginRequest request = new LoginRequest("bob.jones@example.com", "bobpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("bob.jones@example.com"));
    }

    @Test
    void testLogin_Unauthorized() throws Exception {
        LoginRequest request = new LoginRequest("nonexistent@example.com", "wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}

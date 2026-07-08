package com.company.weeklyreport.service;

import com.company.weeklyreport.dto.auth.AuthResponse;
import com.company.weeklyreport.dto.auth.LoginRequest;
import com.company.weeklyreport.dto.auth.RegisterRequest;
import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.repository.UserRepository;
import com.company.weeklyreport.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest("Jane", "Doe", "jane.doe@example.com", "password123", Role.MEMBER);
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encodedPassword");
        
        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .role(request.role())
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("dummyToken");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("dummyToken", response.token());
        assertEquals("jane.doe@example.com", response.email());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegister_DuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Jane", "Doe", "jane.doe@example.com", "password123", Role.MEMBER);
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest("jane.doe@example.com", "password123");
        User user = User.builder()
                .id(UUID.randomUUID())
                .firstName("Jane")
                .lastName("Doe")
                .email(request.email())
                .passwordHash("encodedPassword")
                .role(Role.MEMBER)
                .build();

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPasswordHash())).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("dummyToken");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("dummyToken", response.token());
        assertEquals(user.getEmail(), response.email());
    }

    @Test
    void testLogin_UserNotFound() {
        LoginRequest request = new LoginRequest("notfound@example.com", "password");
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> authService.login(request));
    }

    @Test
    void testLogin_WrongPassword() {
        LoginRequest request = new LoginRequest("jane.doe@example.com", "wrongpassword");
        User user = User.builder()
                .email(request.email())
                .passwordHash("encodedPassword")
                .build();

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPasswordHash())).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> authService.login(request));
    }
}

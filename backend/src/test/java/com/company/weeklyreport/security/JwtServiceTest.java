package com.company.weeklyreport.security;

import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class JwtServiceTest {

    private JwtProperties jwtProperties;
    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtProperties = Mockito.mock(JwtProperties.class);
        // Minimum 256-bit secret key (32 bytes)
        when(jwtProperties.getSecret()).thenReturn("5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437");
        when(jwtProperties.getExpirationMs()).thenReturn(3600000L); // 1 hour
        jwtService = new JwtService(jwtProperties);

        testUser = User.builder()
                .id(UUID.randomUUID())
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .role(Role.MEMBER)
                .build();
    }

    @Test
    void testGenerateAndParseToken() {
        String token = jwtService.generateToken(testUser);
        assertNotNull(token);

        String email = jwtService.extractEmail(token);
        assertEquals(testUser.getEmail(), email);

        String userIdStr = jwtService.extractUserId(token);
        assertEquals(testUser.getId().toString(), userIdStr);

        String roleStr = jwtService.extractRole(token);
        assertEquals(testUser.getRole().name(), roleStr);
    }

    @Test
    void testIsTokenValid() {
        String token = jwtService.generateToken(testUser);
        assertTrue(jwtService.isTokenValid(token, testUser));
    }
}

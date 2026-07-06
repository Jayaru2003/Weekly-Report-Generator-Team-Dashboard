package com.company.weeklyreport.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds JWT configuration from application.yml under the prefix "application.jwt".
 */
@Component
@ConfigurationProperties(prefix = "application.jwt")
@Getter
@Setter
public class JwtProperties {

    /** HMAC-SHA256 signing secret — must be at least 256 bits (32 bytes). */
    private String secret;

    /** Token lifetime in milliseconds. Default: 86 400 000 (24 hours). */
    private long expirationMs = 86_400_000L;
}

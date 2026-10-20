package br.com.sorveteria.access.application;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.Set;

public record UserPrincipal(
        Long userId,
        String login,
        String displayName,
        long authorizationVersion,
        boolean mustChangePassword,
        Set<String> roles,
        Set<String> permissions,
        Instant authenticatedAt,
        Instant absoluteExpiresAt) implements Serializable {
    @Serial private static final long serialVersionUID = 1L;
}


package br.com.sorveteria.access.application;

import br.com.sorveteria.access.domain.Permission;
import br.com.sorveteria.access.domain.Role;
import br.com.sorveteria.access.domain.User;
import br.com.sorveteria.access.infrastructure.UserRepository;
import br.com.sorveteria.audit.application.AuditRecorder;
import br.com.sorveteria.audit.infrastructure.AuditEventEntity;
import br.com.sorveteria.platform.config.ApplicationProperties;
import br.com.sorveteria.platform.web.ApiException;
import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SessionService {
    private final UserRepository users;
    private final PasswordService passwords;
    private final AuthenticationThrottleService throttle;
    private final AuthenticationAuditService deniedAudit;
    private final AuditRecorder audit;
    private final ApplicationProperties properties;
    private final Clock clock = Clock.systemUTC();
    private final String dummyHash;

    public SessionService(UserRepository users, PasswordService passwords,
            AuthenticationThrottleService throttle, AuthenticationAuditService deniedAudit,
            AuditRecorder audit, ApplicationProperties properties) {
        this.users = users;
        this.passwords = passwords;
        this.throttle = throttle;
        this.deniedAudit = deniedAudit;
        this.audit = audit;
        this.properties = properties;
        this.dummyHash = passwords.hash("LocalDummyPassword!2026".toCharArray());
    }

    @Transactional
    public UserPrincipal authenticate(String login, char[] password, String origin, UUID correlationId) {
        AuthenticationThrottleService.Decision initial = throttle.check(login, origin);
        if (!initial.allowed()) {
            deniedAudit.denied("AUTHENTICATION_THROTTLED", null, null, null,
                    "RATE_LIMIT", correlationId, origin);
            throw new TooManyAttemptsException(initial.retryAfterSeconds());
        }
        Optional<User> candidate;
        try { candidate = users.findByLoginKey(User.normalizeLogin(login)); }
        catch (IllegalArgumentException ignored) { candidate = Optional.empty(); }
        User user = candidate.orElse(null);
        String expected = user == null ? dummyHash : user.getPasswordHash();
        boolean matches = passwords.matches(password, expected);
        Instant now = clock.instant();
        boolean usable = matches && user != null && user.isActive()
                && (!user.isMustChangePassword()
                    || user.getTemporaryPasswordExpiresAt() != null
                    && user.getTemporaryPasswordExpiresAt().isAfter(now));
        if (!usable) {
            AuthenticationThrottleService.Decision after = throttle.failure(login, origin);
            deniedAudit.denied("AUTHENTICATION_FAILED", user == null ? null : user.getId(),
                    user == null ? null : user.getLoginKey(), user == null ? null : user.getDisplayName(),
                    "INVALID_CREDENTIALS", correlationId, origin);
            if (!after.allowed()) throw new TooManyAttemptsException(after.retryAfterSeconds());
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
                    "Login ou senha inválidos.");
        }
        throttle.success(login, origin);
        UserPrincipal principal = principal(user, now);
        audit.record(new AuditRecorder.Event("AUTHENTICATION_SUCCEEDED", AuditEventEntity.Outcome.SUCCEEDED,
                user.getId(), user.getLoginKey(), user.getDisplayName(), "SESSION", null, null,
                correlationId, AuditEventEntity.OriginType.NETWORK, origin, Map.of(), Map.of()));
        return principal;
    }

    @Transactional(readOnly = true)
    public UserPrincipal refresh(UserPrincipal current) {
        User user = users.findById(current.userId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "SESSION_REVOKED", "Sessão encerrada."));
        Instant now = clock.instant();
        if (!user.isActive() || current.authorizationVersion() != user.getAuthorizationVersion()
                || !current.absoluteExpiresAt().isAfter(now)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "SESSION_REVOKED", "Sessão encerrada.");
        }
        if (user.isMustChangePassword() && (user.getTemporaryPasswordExpiresAt() == null
                || !user.getTemporaryPasswordExpiresAt().isAfter(now))) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "TEMPORARY_PASSWORD_EXPIRED", "Senha temporária expirada.");
        }
        return principal(user, current.authenticatedAt());
    }

    public void save(UserPrincipal principal, jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response) {
        var authorities = principal.permissions().stream().map(SimpleGrantedAuthority::new).toList();
        var authentication = UsernamePasswordAuthenticationToken.authenticated(principal, null, authorities);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        new HttpSessionSecurityContextRepository().saveContext(context, request, response);
        request.getSession().setMaxInactiveInterval(30 * 60);
    }

    private UserPrincipal principal(User user, Instant authenticatedAt) {
        Set<String> roles = user.getRoles().stream().map(Role::getCode).collect(Collectors.toUnmodifiableSet());
        Set<String> permissions = user.getRoles().stream().flatMap(role -> role.getPermissions().stream())
                .map(Permission::getCode).collect(Collectors.toUnmodifiableSet());
        return new UserPrincipal(user.getId(), user.getLoginKey(), user.getDisplayName(),
                user.getAuthorizationVersion(), user.isMustChangePassword(), roles, permissions,
                authenticatedAt, authenticatedAt.plus(properties.security().absoluteSessionTimeout()));
    }
}


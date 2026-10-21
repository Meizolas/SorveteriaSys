package br.com.sorveteria.access.application;

import br.com.sorveteria.access.domain.Permission;
import br.com.sorveteria.access.domain.Role;
import br.com.sorveteria.access.domain.User;
import br.com.sorveteria.access.infrastructure.UserRepository;
import br.com.sorveteria.audit.application.AuditRecorder;
import br.com.sorveteria.audit.infrastructure.AuditEventEntity;
import br.com.sorveteria.platform.web.ApiException;
import java.time.Clock;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChangePasswordService {
  private final UserRepository users;
  private final PasswordService passwords;
  private final AuditRecorder audit;
  private final Clock clock = Clock.systemUTC();

  public ChangePasswordService(
      UserRepository users, PasswordService passwords, AuditRecorder audit) {
    this.users = users;
    this.passwords = passwords;
    this.audit = audit;
  }

  @Transactional
  public UserPrincipal change(
      UserPrincipal current,
      char[] oldPassword,
      char[] newPassword,
      UUID correlationId,
      String origin) {
    User user =
        users
            .findById(current.userId())
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.UNAUTHORIZED, "SESSION_REVOKED", "Sessão encerrada."));
    if (!passwords.matches(oldPassword, user.getPasswordHash())) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "CURRENT_PASSWORD_INVALID", "A senha atual não confere.");
    }
    user.changePassword(passwords.hash(newPassword), clock.instant());
    users.save(user);
    audit.record(
        new AuditRecorder.Event(
            "PASSWORD_CHANGED",
            AuditEventEntity.Outcome.SUCCEEDED,
            user.getId(),
            user.getLoginKey(),
            user.getDisplayName(),
            "USER",
            user.getId().toString(),
            null,
            correlationId,
            AuditEventEntity.OriginType.NETWORK,
            origin,
            Map.of("mustChangePassword", current.mustChangePassword()),
            Map.of("mustChangePassword", false)));
    Set<String> roles =
        user.getRoles().stream().map(Role::getCode).collect(Collectors.toUnmodifiableSet());
    Set<String> permissions =
        user.getRoles().stream()
            .flatMap(role -> role.getPermissions().stream())
            .map(Permission::getCode)
            .collect(Collectors.toUnmodifiableSet());
    return new UserPrincipal(
        user.getId(),
        user.getLoginKey(),
        user.getDisplayName(),
        user.getAuthorizationVersion(),
        false,
        roles,
        permissions,
        current.authenticatedAt(),
        current.absoluteExpiresAt());
  }
}

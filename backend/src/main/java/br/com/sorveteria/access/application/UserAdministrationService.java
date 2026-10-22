package br.com.sorveteria.access.application;

import br.com.sorveteria.access.domain.Role;
import br.com.sorveteria.access.domain.User;
import br.com.sorveteria.access.infrastructure.RoleRepository;
import br.com.sorveteria.access.infrastructure.UserRepository;
import br.com.sorveteria.audit.application.AuditRecorder;
import br.com.sorveteria.audit.infrastructure.AuditEventEntity;
import br.com.sorveteria.platform.web.ApiException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserAdministrationService {
  private static final Duration TEMPORARY_PASSWORD_LIFETIME = Duration.ofHours(24);
  private final UserRepository users;
  private final RoleRepository roles;
  private final RoleAssignmentService roleAssignments;
  private final PasswordService passwords;
  private final AuditRecorder audit;
  private final Clock clock = Clock.systemUTC();

  public UserAdministrationService(UserRepository users, RoleRepository roles,
      RoleAssignmentService roleAssignments, PasswordService passwords, AuditRecorder audit) {
    this.users = users;
    this.roles = roles;
    this.roleAssignments = roleAssignments;
    this.passwords = passwords;
    this.audit = audit;
  }

  @Transactional(readOnly = true)
  public List<User> listUsers() {
    return users.findAll().stream()
        .sorted(Comparator.comparing(User::getDisplayName, String.CASE_INSENSITIVE_ORDER))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<Role> listRoles() {
    return roles.findAll().stream().sorted(Comparator.comparing(Role::getDisplayName)).toList();
  }

  @Transactional
  public User create(String login, String displayName, char[] temporaryPassword,
      Set<String> roleCodes, UserPrincipal actor, UUID correlationId, String sourceAddress) {
    String loginKey = normalizeLogin(login);
    validateName(displayName);
    if (users.existsByLoginKey(loginKey)) {
      throw new ApiException(HttpStatus.CONFLICT, "LOGIN_ALREADY_EXISTS",
          "Já existe um usuário com este login.");
    }
    Instant now = clock.instant();
    User user;
    try {
      user = User.temporary(login, displayName, passwords.hash(temporaryPassword),
          now.plus(TEMPORARY_PASSWORD_LIFETIME), actor.userId(), now);
    } catch (IllegalArgumentException exception) {
      throw invalid(exception);
    }
    user.replaceRoles(roleAssignments.resolve(roleCodes), actor.userId(), now);
    User saved = users.save(user);
    record("USER_CREATED", saved, actor, correlationId, sourceAddress, Map.of(), snapshot(saved));
    return saved;
  }

  @Transactional
  public User update(Long id, String login, String displayName, boolean active,
      Set<String> roleCodes, long version, UserPrincipal actor, UUID correlationId,
      String sourceAddress) {
    User user = find(id);
    if (user.getVersion() != version) {
      throw new ApiException(HttpStatus.CONFLICT, "STALE_USER",
          "O usuário foi alterado por outra operação. Atualize a lista e tente novamente.");
    }
    if (user.getId().equals(actor.userId()) && !active) {
      throw new ApiException(HttpStatus.CONFLICT, "SELF_DEACTIVATION",
          "Você não pode inativar seu próprio usuário.");
    }
    String loginKey = normalizeLogin(login);
    validateName(displayName);
    users.findByLoginKey(loginKey).filter(found -> !found.getId().equals(id)).ifPresent(found -> {
      throw new ApiException(HttpStatus.CONFLICT, "LOGIN_ALREADY_EXISTS",
          "Já existe um usuário com este login.");
    });
    Map<String, ?> before = snapshot(user);
    Instant now = clock.instant();
    Set<Role> nextRoles = roleAssignments.resolve(roleCodes);
    roleAssignments.replace(user, nextRoles, actor, now, active);
    user.updateIdentity(login, displayName, actor.userId(), now);
    if (user.isActive() != active) {
      user.setActive(active, actor.userId(), now);
    }
    User saved = users.save(user);
    record("USER_UPDATED", saved, actor, correlationId, sourceAddress, before, snapshot(saved));
    return saved;
  }

  @Transactional
  public User issueTemporaryPassword(Long id, char[] temporaryPassword, UserPrincipal actor,
      UUID correlationId, String sourceAddress) {
    User user = find(id);
    Map<String, ?> before = snapshot(user);
    Instant now = clock.instant();
    try {
      user.issueTemporaryPassword(passwords.hash(temporaryPassword),
          now.plus(TEMPORARY_PASSWORD_LIFETIME), actor.userId(), now);
    } catch (IllegalArgumentException exception) {
      throw invalid(exception);
    }
    User saved = users.save(user);
    record("TEMPORARY_PASSWORD_ISSUED", saved, actor, correlationId, sourceAddress,
        before, snapshot(saved));
    return saved;
  }

  private User find(Long id) {
    return users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
        "USER_NOT_FOUND", "Usuário não encontrado."));
  }

  private String normalizeLogin(String login) {
    try {
      return User.normalizeLogin(login);
    } catch (IllegalArgumentException exception) {
      throw invalid(exception);
    }
  }

  private void validateName(String name) {
    if (name == null || name.isBlank() || name.trim().length() > 120) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_USER", "Nome inválido.");
    }
  }

  private ApiException invalid(IllegalArgumentException exception) {
    return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_USER", exception.getMessage());
  }

  private Map<String, Object> snapshot(User user) {
    Map<String, Object> value = new LinkedHashMap<>();
    value.put("login", user.getLoginKey());
    value.put("displayName", user.getDisplayName());
    value.put("active", user.isActive());
    value.put("mustChange", user.isMustChangePassword());
    value.put("roles", user.getRoles().stream().map(Role::getCode).sorted().toList());
    return value;
  }

  private void record(String action, User target, UserPrincipal actor, UUID correlationId,
      String sourceAddress, Map<String, ?> before, Map<String, ?> after) {
    audit.record(new AuditRecorder.Event(action, AuditEventEntity.Outcome.SUCCEEDED,
        actor.userId(), actor.login(), actor.displayName(), "USER", target.getId().toString(),
        null, correlationId, AuditEventEntity.OriginType.NETWORK, sourceAddress, before, after));
  }
}

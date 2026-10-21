package br.com.sorveteria.access.application;

import br.com.sorveteria.access.domain.Role;
import br.com.sorveteria.access.domain.User;
import br.com.sorveteria.access.infrastructure.InstallationState;
import br.com.sorveteria.access.infrastructure.InstallationStateRepository;
import br.com.sorveteria.access.infrastructure.RoleRepository;
import br.com.sorveteria.access.infrastructure.UserRepository;
import br.com.sorveteria.audit.application.AuditRecorder;
import br.com.sorveteria.audit.infrastructure.AuditEventEntity;
import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminProvisioningService {
  private final InstallationStateRepository installations;
  private final UserRepository users;
  private final RoleRepository roles;
  private final PasswordService passwords;
  private final AuditRecorder audit;
  private final JdbcTemplate jdbc;
  private final Clock clock = Clock.systemUTC();

  public AdminProvisioningService(
      InstallationStateRepository installations,
      UserRepository users,
      RoleRepository roles,
      PasswordService passwords,
      AuditRecorder audit,
      JdbcTemplate jdbc) {
    this.installations = installations;
    this.users = users;
    this.roles = roles;
    this.passwords = passwords;
    this.audit = audit;
    this.jdbc = jdbc;
  }

  @Transactional
  public Long provision(String login, String displayName, char[] password, UUID correlationId) {
    InstallationState state =
        installations
            .lockSingleton()
            .orElseThrow(() -> new IllegalStateException("Estado da instalação ausente"));
    if (state.isInitialAdminProvisioned() || users.countActiveByRoleCode("ADMINISTRATOR") > 0) {
      throw new IllegalStateException("Administrador inicial já provisionado");
    }
    Instant now = clock.instant();
    Role administrator =
        roles
            .findByCode("ADMINISTRATOR")
            .orElseThrow(() -> new IllegalStateException("Perfil Administrador ausente"));
    User user = User.permanentAdministrator(login, displayName, passwords.hash(password), now);
    user = users.save(user);
    jdbc.update(
        "INSERT INTO user_role (user_id, role_id, assigned_at, assigned_by) VALUES (?, ?, ?, NULL)",
        user.getId(),
        administrator.getId(),
        java.sql.Timestamp.from(now));
    state.provisioned(user.getId(), now);
    installations.save(state);
    audit.record(
        new AuditRecorder.Event(
            "INITIAL_ADMIN_PROVISIONED",
            AuditEventEntity.Outcome.SUCCEEDED,
            null,
            null,
            null,
            "USER",
            user.getId().toString(),
            null,
            correlationId,
            AuditEventEntity.OriginType.LOCAL_TTY,
            null,
            Map.of(),
            Map.of("login", user.getLoginKey(), "role", "ADMINISTRATOR")));
    return user.getId();
  }
}

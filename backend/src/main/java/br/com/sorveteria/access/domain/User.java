package br.com.sorveteria.access.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Entity
@Table(name = "app_user")
public class User {
  private static final Pattern LOGIN = Pattern.compile("[a-z0-9._-]{3,64}");

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "login_display", nullable = false, length = 64)
  private String loginDisplay;

  @Column(name = "login_key", nullable = false, unique = true, length = 64)
  private String loginKey;

  @Column(name = "display_name", nullable = false, length = 120)
  private String displayName;

  @Column(name = "password_hash", nullable = false, length = 255)
  private String passwordHash;

  @Column(name = "must_change_password", nullable = false)
  private boolean mustChangePassword;

  @Column(name = "temporary_password_expires_at")
  private Instant temporaryPasswordExpiresAt;

  @Column(nullable = false)
  private boolean active;

  @Column(name = "authorization_version", nullable = false)
  private long authorizationVersion;

  @Version
  @Column(nullable = false)
  private long version;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @Column(name = "created_by")
  private Long createdBy;

  @Column(name = "updated_by")
  private Long updatedBy;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "user_role",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "role_id"))
  private Set<Role> roles = new LinkedHashSet<>();

  protected User() {}

  public static User permanentAdministrator(
      String login, String displayName, String passwordHash, Instant now) {
    User user = base(login, displayName, passwordHash, now);
    user.mustChangePassword = false;
    user.temporaryPasswordExpiresAt = null;
    return user;
  }

  public static User temporary(
      String login,
      String displayName,
      String passwordHash,
      Instant expiresAt,
      Long actor,
      Instant now) {
    User user = base(login, displayName, passwordHash, now);
    user.mustChangePassword = true;
    user.temporaryPasswordExpiresAt = expiresAt;
    user.createdBy = actor;
    user.updatedBy = actor;
    return user;
  }

  private static User base(String login, String displayName, String passwordHash, Instant now) {
    User user = new User();
    user.loginDisplay = login.trim();
    user.loginKey = normalizeLogin(login);
    user.displayName = displayName.trim();
    user.passwordHash = passwordHash;
    user.active = true;
    user.createdAt = now;
    user.updatedAt = now;
    return user;
  }

  public static String normalizeLogin(String raw) {
    if (raw == null) {
      throw new IllegalArgumentException("Login obrigatório");
    }
    String normalized = raw.trim().toLowerCase(Locale.ROOT);
    if (!LOGIN.matcher(normalized).matches()) {
      throw new IllegalArgumentException("Login inválido");
    }
    return normalized;
  }

  public void addRole(Role role, Long actor, Instant now) {
    roles.add(role);
    updatedBy = actor;
    updatedAt = now;
    authorizationVersion++;
  }

  public void replaceRoles(Set<Role> value, Long actor, Instant now) {
    roles.clear();
    roles.addAll(value);
    updatedBy = actor;
    updatedAt = now;
    authorizationVersion++;
  }

  public void updateIdentity(String login, String name, Long actor, Instant now) {
    loginDisplay = login.trim();
    loginKey = normalizeLogin(login);
    displayName = name.trim();
    updatedBy = actor;
    updatedAt = now;
  }

  public void setActive(boolean value, Long actor, Instant now) {
    active = value;
    updatedBy = actor;
    updatedAt = now;
    authorizationVersion++;
  }

  public void issueTemporaryPassword(String hash, Instant expiresAt, Long actor, Instant now) {
    passwordHash = hash;
    mustChangePassword = true;
    temporaryPasswordExpiresAt = expiresAt;
    updatedBy = actor;
    updatedAt = now;
    authorizationVersion++;
  }

  public void changePassword(String hash, Instant now) {
    passwordHash = hash;
    mustChangePassword = false;
    temporaryPasswordExpiresAt = null;
    updatedBy = id;
    updatedAt = now;
    authorizationVersion++;
  }

  public Long getId() {
    return id;
  }

  public String getLoginDisplay() {
    return loginDisplay;
  }

  public String getLoginKey() {
    return loginKey;
  }

  public String getDisplayName() {
    return displayName;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public boolean isMustChangePassword() {
    return mustChangePassword;
  }

  public Instant getTemporaryPasswordExpiresAt() {
    return temporaryPasswordExpiresAt;
  }

  public boolean isActive() {
    return active;
  }

  public long getAuthorizationVersion() {
    return authorizationVersion;
  }

  public long getVersion() {
    return version;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public Set<Role> getRoles() {
    return Set.copyOf(roles);
  }
}

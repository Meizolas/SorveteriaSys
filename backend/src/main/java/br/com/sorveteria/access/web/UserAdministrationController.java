package br.com.sorveteria.access.web;

import br.com.sorveteria.access.application.AccessPermissions;
import br.com.sorveteria.access.application.UserAdministrationService;
import br.com.sorveteria.access.application.UserPrincipal;
import br.com.sorveteria.access.domain.Role;
import br.com.sorveteria.access.domain.User;
import br.com.sorveteria.platform.observability.CorrelationFilter;
import br.com.sorveteria.platform.web.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class UserAdministrationController {
  private final UserAdministrationService service;

  public UserAdministrationController(UserAdministrationService service) {
    this.service = service;
  }

  @GetMapping("/users")
  @PreAuthorize("hasAuthority('" + AccessPermissions.USER_READ + "')")
  List<UserView> users() {
    return service.listUsers().stream().map(UserView::from).toList();
  }

  @GetMapping("/roles")
  @PreAuthorize("hasAuthority('" + AccessPermissions.USER_READ + "')")
  List<RoleView> roles() {
    return service.listRoles().stream().map(RoleView::from).toList();
  }

  @PostMapping("/users")
  @PreAuthorize("hasAuthority('" + AccessPermissions.USER_WRITE
      + "') and hasAuthority('" + AccessPermissions.ROLE_ASSIGN + "')")
  UserView create(@Valid @RequestBody CreateUserRequest input, Authentication authentication,
      HttpServletRequest request) {
    User created = service.create(input.login(), input.displayName(), input.temporaryPassword().toCharArray(),
        input.roles(), principal(authentication), CorrelationFilter.correlationId(request),
        request.getRemoteAddr());
    return UserView.from(created);
  }

  @PatchMapping("/users/{id}")
  @PreAuthorize("hasAuthority('" + AccessPermissions.USER_WRITE
      + "') and hasAuthority('" + AccessPermissions.ROLE_ASSIGN + "')")
  UserView update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest input,
      Authentication authentication, HttpServletRequest request) {
    return UserView.from(service.update(id, input.login(), input.displayName(), input.active(),
        input.roles(), input.version(), principal(authentication),
        CorrelationFilter.correlationId(request), request.getRemoteAddr()));
  }

  @PostMapping("/users/{id}/temporary-password")
  @PreAuthorize("hasAuthority('" + AccessPermissions.USER_WRITE + "')")
  UserView temporaryPassword(@PathVariable Long id,
      @Valid @RequestBody TemporaryPasswordRequest input, Authentication authentication,
      HttpServletRequest request) {
    return UserView.from(service.issueTemporaryPassword(id, input.temporaryPassword().toCharArray(),
        principal(authentication), CorrelationFilter.correlationId(request), request.getRemoteAddr()));
  }

  private UserPrincipal principal(Authentication authentication) {
    if (authentication.getPrincipal() instanceof UserPrincipal value) {
      return value;
    }
    throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTHENTICATION_REQUIRED",
        "Autenticação necessária.");
  }

  public record CreateUserRequest(@NotBlank @Size(max = 64) String login,
      @NotBlank @Size(max = 120) String displayName,
      @NotBlank @Size(min = 12, max = 128) String temporaryPassword,
      @NotEmpty Set<String> roles) { }

  public record UpdateUserRequest(@NotBlank @Size(max = 64) String login,
      @NotBlank @Size(max = 120) String displayName, boolean active,
      @NotEmpty Set<String> roles, long version) { }

  public record TemporaryPasswordRequest(
      @NotBlank @Size(min = 12, max = 128) String temporaryPassword) { }

  public record RoleView(String code, String displayName) {
    static RoleView from(Role role) {
      return new RoleView(role.getCode(), role.getDisplayName());
    }
  }

  public record UserView(Long id, String login, String displayName, boolean active,
      boolean mustChangePassword, Instant temporaryPasswordExpiresAt, List<String> roles,
      long version, Instant createdAt, Instant updatedAt) {
    static UserView from(User user) {
      return new UserView(user.getId(), user.getLoginDisplay(), user.getDisplayName(),
          user.isActive(), user.isMustChangePassword(), user.getTemporaryPasswordExpiresAt(),
          user.getRoles().stream().map(Role::getCode).sorted().toList(), user.getVersion(),
          user.getCreatedAt(), user.getUpdatedAt());
    }
  }
}

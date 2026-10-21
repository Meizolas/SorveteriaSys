package br.com.sorveteria.access.web;

import br.com.sorveteria.access.application.ChangePasswordService;
import br.com.sorveteria.access.application.SessionService;
import br.com.sorveteria.access.application.UserPrincipal;
import br.com.sorveteria.platform.observability.CorrelationFilter;
import br.com.sorveteria.platform.web.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/session")
public class SessionController {
  private final SessionService sessions;
  private final ChangePasswordService passwordChanges;

  public SessionController(SessionService sessions, ChangePasswordService passwordChanges) {
    this.sessions = sessions;
    this.passwordChanges = passwordChanges;
  }

  @GetMapping("/csrf")
  CsrfView csrf(CsrfToken token) {
    return new CsrfView(token.getHeaderName(), token.getToken());
  }

  @PostMapping
  SessionView login(
      @Valid @RequestBody LoginRequest input,
      HttpServletRequest request,
      HttpServletResponse response) {
    UserPrincipal principal =
        sessions.authenticate(
            input.login(),
            input.password().toCharArray(),
            request.getRemoteAddr(),
            CorrelationFilter.correlationId(request));
    sessions.save(principal, request, response);
    return view(principal);
  }

  @GetMapping
  SessionView current(Authentication authentication) {
    if (authentication == null
        || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
      throw new ApiException(
          HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Autenticação necessária.");
    }
    return view(principal);
  }

  @DeleteMapping
  ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
    var session = request.getSession(false);
    if (session != null) {
      session.invalidate();
    }
    response.addHeader("Set-Cookie", "SORV_SESSION=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/password")
  SessionView changePassword(
      @Valid @RequestBody PasswordChangeRequest input,
      Authentication authentication,
      HttpServletRequest request,
      HttpServletResponse response) {
    if (authentication == null
        || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
      throw new ApiException(
          HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Autenticação necessária.");
    }
    UserPrincipal updated =
        passwordChanges.change(
            principal,
            input.currentPassword().toCharArray(),
            input.newPassword().toCharArray(),
            CorrelationFilter.correlationId(request),
            request.getRemoteAddr());
    request.changeSessionId();
    sessions.save(updated, request, response);
    return view(updated);
  }

  private SessionView view(UserPrincipal principal) {
    Instant idle = Instant.now().plusSeconds(30 * 60L);
    return new SessionView(
        new UserView(
            principal.userId().toString(),
            principal.login(),
            principal.displayName(),
            true,
            principal.mustChangePassword(),
            principal.roles()),
        principal.permissions(),
        principal.authenticatedAt(),
        idle,
        principal.absoluteExpiresAt());
  }

  public record LoginRequest(
      @NotBlank @Size(max = 64) String login, @NotBlank @Size(max = 128) String password) {}

  public record PasswordChangeRequest(
      @NotBlank @Size(max = 128) String currentPassword,
      @NotBlank @Size(min = 12, max = 128) String newPassword) {}

  public record CsrfView(String headerName, String token) {}

  public record UserView(
      String id,
      String login,
      String displayName,
      boolean active,
      boolean mustChangePassword,
      Set<String> roles) {}

  public record SessionView(
      UserView user,
      Set<String> permissions,
      Instant authenticatedAt,
      Instant idleExpiresAt,
      Instant absoluteExpiresAt) {}
}

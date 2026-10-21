package br.com.sorveteria.platform.security;

import br.com.sorveteria.access.application.SessionService;
import br.com.sorveteria.access.application.UserPrincipal;
import br.com.sorveteria.platform.web.ApiException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class SessionValidationFilter extends OncePerRequestFilter {
  private static final Set<String> PASSWORD_CHANGE_PATHS =
      Set.of("/api/v1/session", "/api/v1/session/password", "/api/v1/session/csrf");
  private final SessionService sessions;

  public SessionValidationFilter(SessionService sessions) {
    this.sessions = sessions;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    var authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal current) {
      try {
        UserPrincipal fresh = sessions.refresh(current);
        if (fresh.mustChangePassword()
            && !PASSWORD_CHANGE_PATHS.contains(request.getRequestURI())) {
          throw new ApiException(
              org.springframework.http.HttpStatus.FORBIDDEN,
              "PASSWORD_CHANGE_REQUIRED",
              "Troque a senha antes de continuar.");
        }
        var refreshed =
            UsernamePasswordAuthenticationToken.authenticated(
                fresh,
                null,
                fresh.permissions().stream()
                    .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                    .toList());
        SecurityContextHolder.getContext().setAuthentication(refreshed);
        new HttpSessionSecurityContextRepository()
            .saveContext(SecurityContextHolder.getContext(), request, response);
      } catch (ApiException exception) {
        request.getSession(false).invalidate();
        SecurityContextHolder.clearContext();
        response.sendError(exception.status().value());
        return;
      }
    }
    chain.doFilter(request, response);
  }
}

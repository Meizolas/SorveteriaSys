package br.com.sorveteria.access.application;

import br.com.sorveteria.access.domain.Role;
import br.com.sorveteria.access.domain.User;
import br.com.sorveteria.access.infrastructure.RoleRepository;
import br.com.sorveteria.access.infrastructure.UserRepository;
import br.com.sorveteria.platform.web.ApiException;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class RoleAssignmentService {
  private static final Set<String> FIXED_ROLES = Set.of("ADMINISTRATOR", "OPERATOR");
  private final RoleRepository roles;
  private final UserRepository users;

  public RoleAssignmentService(RoleRepository roles, UserRepository users) {
    this.roles = roles;
    this.users = users;
  }

  public Set<Role> resolve(Set<String> codes) {
    if (codes == null || codes.isEmpty() || !FIXED_ROLES.containsAll(codes)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ROLES",
          "Selecione ao menos um perfil válido.");
    }
    Set<Role> resolved = new LinkedHashSet<>(roles.findAllByCodeIn(codes));
    if (resolved.size() != codes.size()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ROLES", "Perfil inválido.");
    }
    return resolved;
  }

  public void replace(User target, Set<Role> nextRoles, UserPrincipal actor, Instant now,
      boolean nextActive) {
    boolean wasAdministrator = hasRole(target, "ADMINISTRATOR");
    boolean willBeAdministrator = nextRoles.stream()
        .anyMatch(role -> "ADMINISTRATOR".equals(role.getCode()));
    if (target.getId().equals(actor.userId()) && !willBeAdministrator) {
      throw new ApiException(HttpStatus.CONFLICT, "SELF_ADMIN_REMOVAL",
          "Você não pode remover seu próprio perfil de Administrador.");
    }
    if (target.isActive() && wasAdministrator && (!nextActive || !willBeAdministrator)
        && users.countActiveByRoleCode("ADMINISTRATOR") <= 1) {
      throw new ApiException(HttpStatus.CONFLICT, "LAST_ADMINISTRATOR",
          "A operação deixaria o sistema sem um Administrador ativo.");
    }
    target.replaceRoles(nextRoles, actor.userId(), now);
  }

  private boolean hasRole(User user, String code) {
    return user.getRoles().stream().anyMatch(role -> code.equals(role.getCode()));
  }
}

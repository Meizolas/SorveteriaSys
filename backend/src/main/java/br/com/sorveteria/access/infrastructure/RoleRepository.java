package br.com.sorveteria.access.infrastructure;

import br.com.sorveteria.access.domain.Role;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByCode(String code);
    List<Role> findAllByCodeIn(Collection<String> codes);
}


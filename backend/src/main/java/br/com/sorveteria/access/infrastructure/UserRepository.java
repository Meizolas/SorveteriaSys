package br.com.sorveteria.access.infrastructure;

import br.com.sorveteria.access.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByLoginKey(String loginKey);
    boolean existsByLoginKey(String loginKey);

    @Query("select count(u) from User u join u.roles r where u.active = true and r.code = :code")
    long countActiveByRoleCode(@Param("code") String code);
}


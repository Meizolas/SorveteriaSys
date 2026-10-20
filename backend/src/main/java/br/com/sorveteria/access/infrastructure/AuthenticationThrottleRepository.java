package br.com.sorveteria.access.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthenticationThrottleRepository extends JpaRepository<AuthenticationThrottleEntity, byte[]> { }


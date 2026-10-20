package br.com.sorveteria.audit.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditEventJpaRepository extends JpaRepository<AuditEventEntity, Long> { }


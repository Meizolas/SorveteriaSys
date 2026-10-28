package br.com.sorveteria.audit.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AuditEventJpaRepository extends JpaRepository<AuditEventEntity, Long>,
        JpaSpecificationExecutor<AuditEventEntity> { }


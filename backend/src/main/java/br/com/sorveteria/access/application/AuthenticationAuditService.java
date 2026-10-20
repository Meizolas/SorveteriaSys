package br.com.sorveteria.access.application;

import br.com.sorveteria.audit.application.AuditRecorder;
import br.com.sorveteria.audit.infrastructure.AuditEventEntity;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationAuditService {
    private final AuditRecorder audit;
    public AuthenticationAuditService(AuditRecorder audit) { this.audit = audit; }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void denied(String action, Long actorId, String login, String name, String reason,
            UUID correlationId, String origin) {
        audit.record(new AuditRecorder.Event(action, AuditEventEntity.Outcome.DENIED,
                actorId, login, name, "SESSION", null, reason, correlationId,
                AuditEventEntity.OriginType.NETWORK, origin, Map.of(), Map.of()));
    }
}


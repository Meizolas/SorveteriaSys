package br.com.sorveteria.audit.application;

import br.com.sorveteria.audit.infrastructure.AuditEventEntity;
import br.com.sorveteria.audit.infrastructure.AuditEventJpaRepository;
import java.nio.ByteBuffer;
import java.time.Clock;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AuditRecorder {
    private static final Set<String> FORBIDDEN_KEYS = Set.of(
            "password", "passwordHash", "cookie", "csrf", "token", "credential", "secret");

    private final AuditEventJpaRepository repository;
    private final Clock clock;

    public AuditRecorder(AuditEventJpaRepository repository) {
        this(repository, Clock.systemUTC());
    }

    AuditRecorder(AuditEventJpaRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    public AuditEventEntity record(Event event) {
        assertAllowlisted(event.before());
        assertAllowlisted(event.after());
        AuditEventEntity entity = new AuditEventEntity(clock.instant(), event.action(), event.outcome());
        entity.setActor(event.actorId(), event.actorLogin(), event.actorName());
        entity.setTarget(event.targetType(), event.targetId());
        entity.setReason(event.reason());
        entity.setCorrelationId(uuidBytes(event.correlationId()));
        entity.setChanges(toJson(event.before()), toJson(event.after()));
        entity.setOrigin(event.originType(), event.sourceAddress());
        return repository.save(entity);
    }

    private void assertAllowlisted(Map<String, ?> changes) {
        if (changes == null) { return; }
        changes.keySet().forEach(key -> {
            String normalized = key.replace("_", "").toLowerCase();
            boolean forbidden = FORBIDDEN_KEYS.stream().anyMatch(normalized::contains);
            if (forbidden) { throw new IllegalArgumentException("Campo sigiloso não pode ser auditado"); }
        });
    }

    private String toJson(Map<String, ?> value) {
        if (value == null || value.isEmpty()) { return null; }
        return value.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(item -> "\"" + escape(item.getKey()) + "\":\"" + escape(String.valueOf(item.getValue())) + "\"")
                .collect(java.util.stream.Collectors.joining(",", "{", "}"));
    }

    private String escape(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\""); }

    private byte[] uuidBytes(UUID id) {
        return ByteBuffer.allocate(16).putLong(id.getMostSignificantBits()).putLong(id.getLeastSignificantBits()).array();
    }

    public record Event(
            String action,
            AuditEventEntity.Outcome outcome,
            Long actorId,
            String actorLogin,
            String actorName,
            String targetType,
            String targetId,
            String reason,
            UUID correlationId,
            AuditEventEntity.OriginType originType,
            String sourceAddress,
            Map<String, ?> before,
            Map<String, ?> after) { }
}


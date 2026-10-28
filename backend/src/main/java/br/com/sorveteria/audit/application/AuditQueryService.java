package br.com.sorveteria.audit.application;

import br.com.sorveteria.audit.infrastructure.AuditEventEntity;
import br.com.sorveteria.audit.infrastructure.AuditEventEntity.Outcome;
import br.com.sorveteria.audit.infrastructure.AuditEventRepository;
import br.com.sorveteria.audit.infrastructure.AuditEventRepository.Filter;
import br.com.sorveteria.platform.web.ApiException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Service
public class AuditQueryService {
  private static final int MAX_LIMIT = 100;
  private static final Duration MAX_RANGE = Duration.ofDays(366);
  private final AuditEventRepository events;
  private final ObjectMapper mapper;

  public AuditQueryService(AuditEventRepository events, ObjectMapper mapper) {
    this.events = events;
    this.mapper = mapper;
  }

  @Transactional(readOnly = true)
  public AuditPage search(Instant from, Instant to, Long actorUserId, String action,
      Outcome outcome, String cursor, int requestedLimit) {
    validatePeriod(from, to);
    int limit = Math.max(1, Math.min(requestedLimit, MAX_LIMIT));
    Cursor decoded = decode(cursor);
    String cleanAction = action == null || action.isBlank() ? null : action.trim();
    List<AuditEventEntity> found = events.search(new Filter(from, to, actorUserId, cleanAction,
        outcome, decoded == null ? null : decoded.time(), decoded == null ? null : decoded.id()),
        limit + 1);
    boolean hasMore = found.size() > limit;
    List<AuditEventEntity> page = hasMore ? found.subList(0, limit) : found;
    List<AuditEvent> items = page.stream().map(this::view).toList();
    String nextCursor = hasMore ? encode(page.get(page.size() - 1)) : null;
    return new AuditPage(items, nextCursor);
  }

  private void validatePeriod(Instant from, Instant to) {
    if (from == null || to == null || from.isAfter(to)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_AUDIT_PERIOD",
          "Informe um período de auditoria válido.");
    }
    if (Duration.between(from, to).compareTo(MAX_RANGE) > 0) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "AUDIT_PERIOD_TOO_LARGE",
          "O período máximo de consulta é de 366 dias.");
    }
  }

  private AuditEvent view(AuditEventEntity event) {
    Map<String, Object> changes = new LinkedHashMap<>();
    changes.put("before", json(event.getBeforeJson()));
    changes.put("after", json(event.getAfterJson()));
    String origin = event.getOriginType() == AuditEventEntity.OriginType.LOCAL_TTY
        ? "LOCAL_TTY" : event.getSourceAddress();
    return new AuditEvent(event.getId().toString(), event.getOccurredAt(), event.getAction(),
        event.getOutcome(), origin, value(event.getActorUserId()), event.getActorLoginSnapshot(),
        event.getActorNameSnapshot(), event.getTargetType(), event.getTargetId(), event.getReason(),
        uuid(event.getCorrelationId()).toString(), changes);
  }

  private Map<String, Object> json(String value) {
    if (value == null || value.isBlank()) {
      return Map.of();
    }
    try {
      return mapper.readValue(value, new TypeReference<>() { });
    } catch (RuntimeException exception) {
      return Map.of("status", "indisponível");
    }
  }

  private String value(Long value) { return value == null ? null : value.toString(); }

  private UUID uuid(byte[] bytes) {
    ByteBuffer buffer = ByteBuffer.wrap(bytes);
    return new UUID(buffer.getLong(), buffer.getLong());
  }

  private String encode(AuditEventEntity event) {
    String raw = event.getOccurredAt() + "|" + event.getId();
    return Base64.getUrlEncoder().withoutPadding()
        .encodeToString(raw.getBytes(StandardCharsets.UTF_8));
  }

  private Cursor decode(String cursor) {
    if (cursor == null || cursor.isBlank()) {
      return null;
    }
    try {
      String raw = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
      int separator = raw.lastIndexOf('|');
      return new Cursor(Instant.parse(raw.substring(0, separator)),
          Long.parseLong(raw.substring(separator + 1)));
    } catch (RuntimeException exception) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_CURSOR", "Cursor inválido.");
    }
  }

  private record Cursor(Instant time, Long id) { }

  public record AuditPage(List<AuditEvent> items, String nextCursor) { }

  public record AuditEvent(String id, Instant occurredAt, String action, Outcome outcome,
      String origin, String actorUserId, String actorLogin, String actorName, String targetType,
      String targetId, String reason, String correlationId, Map<String, Object> changes) { }
}

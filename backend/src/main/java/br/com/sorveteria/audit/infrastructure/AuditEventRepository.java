package br.com.sorveteria.audit.infrastructure;

import br.com.sorveteria.audit.infrastructure.AuditEventEntity.Outcome;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

@Repository
public class AuditEventRepository {
  private final AuditEventJpaRepository repository;

  public AuditEventRepository(AuditEventJpaRepository repository) {
    this.repository = repository;
  }

  public List<AuditEventEntity> search(Filter filter, int size) {
    Sort sort = Sort.by(Sort.Order.desc("occurredAt"), Sort.Order.desc("id"));
    return repository.findAll((root, query, builder) -> {
      List<Predicate> predicates = new ArrayList<>();
      predicates.add(builder.greaterThanOrEqualTo(root.get("occurredAt"), filter.from()));
      predicates.add(builder.lessThanOrEqualTo(root.get("occurredAt"), filter.to()));
      if (filter.actorUserId() != null) {
        predicates.add(builder.equal(root.get("actorUserId"), filter.actorUserId()));
      }
      if (filter.action() != null) {
        predicates.add(builder.equal(root.get("action"), filter.action()));
      }
      if (filter.outcome() != null) {
        predicates.add(builder.equal(root.get("outcome"), filter.outcome()));
      }
      if (filter.cursorTime() != null && filter.cursorId() != null) {
        predicates.add(builder.or(
            builder.lessThan(root.get("occurredAt"), filter.cursorTime()),
            builder.and(builder.equal(root.get("occurredAt"), filter.cursorTime()),
                builder.lessThan(root.get("id"), filter.cursorId()))));
      }
      return builder.and(predicates.toArray(Predicate[]::new));
    }, PageRequest.of(0, size, sort)).getContent();
  }

  public record Filter(Instant from, Instant to, Long actorUserId, String action, Outcome outcome,
      Instant cursorTime, Long cursorId) { }
}

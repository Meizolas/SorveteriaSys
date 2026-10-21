package br.com.sorveteria.audit.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "audit_event")
public class AuditEventEntity {
  public enum Outcome {
    SUCCEEDED,
    DENIED,
    FAILED
  }

  public enum OriginType {
    LOCAL_TTY,
    NETWORK
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "occurred_at", nullable = false, updatable = false)
  private Instant occurredAt;

  @Column(nullable = false, updatable = false, length = 80)
  private String action;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, updatable = false)
  private Outcome outcome;

  @Column(name = "actor_user_id", updatable = false)
  private Long actorUserId;

  @Column(name = "actor_login_snapshot", updatable = false, length = 64)
  private String actorLoginSnapshot;

  @Column(name = "actor_name_snapshot", updatable = false, length = 120)
  private String actorNameSnapshot;

  @Column(name = "target_type", updatable = false, length = 80)
  private String targetType;

  @Column(name = "target_id", updatable = false, length = 80)
  private String targetId;

  @Column(updatable = false, length = 500)
  private String reason;

  @Column(
      name = "correlation_id",
      nullable = false,
      updatable = false,
      columnDefinition = "BINARY(16)")
  private byte[] correlationId;

  @Column(name = "before_json", updatable = false, columnDefinition = "JSON")
  private String beforeJson;

  @Column(name = "after_json", updatable = false, columnDefinition = "JSON")
  private String afterJson;

  @Enumerated(EnumType.STRING)
  @Column(name = "origin_type", nullable = false, updatable = false)
  private OriginType originType;

  @Column(name = "source_address", updatable = false, length = 45)
  private String sourceAddress;

  protected AuditEventEntity() {}

  public AuditEventEntity(Instant occurredAt, String action, Outcome outcome) {
    this.occurredAt = occurredAt;
    this.action = action;
    this.outcome = outcome;
  }

  public Long getId() {
    return id;
  }

  public Instant getOccurredAt() {
    return occurredAt;
  }

  public String getAction() {
    return action;
  }

  public Outcome getOutcome() {
    return outcome;
  }

  public Long getActorUserId() {
    return actorUserId;
  }

  public String getActorLoginSnapshot() {
    return actorLoginSnapshot;
  }

  public String getActorNameSnapshot() {
    return actorNameSnapshot;
  }

  public String getTargetType() {
    return targetType;
  }

  public String getTargetId() {
    return targetId;
  }

  public String getReason() {
    return reason;
  }

  public byte[] getCorrelationId() {
    return correlationId == null ? null : correlationId.clone();
  }

  public String getBeforeJson() {
    return beforeJson;
  }

  public String getAfterJson() {
    return afterJson;
  }

  public OriginType getOriginType() {
    return originType;
  }

  public String getSourceAddress() {
    return sourceAddress;
  }

  public void setActor(Long id, String login, String name) {
    actorUserId = id;
    actorLoginSnapshot = login;
    actorNameSnapshot = name;
  }

  public void setTarget(String type, String id) {
    targetType = type;
    targetId = id;
  }

  public void setReason(String value) {
    reason = value;
  }

  public void setCorrelationId(byte[] value) {
    correlationId = value.clone();
  }

  public void setChanges(String before, String after) {
    beforeJson = before;
    afterJson = after;
  }

  public void setOrigin(OriginType type, String address) {
    originType = type;
    sourceAddress = address;
  }
}

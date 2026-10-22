package br.com.sorveteria.cash.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "cash_movement")
public class CashMovement {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "cash_shift_id")
  private CashShift shift;

  @Column(name = "movement_type", nullable = false, length = 24)
  private String movementType;

  @Column(nullable = false, precision = 13, scale = 2)
  private BigDecimal amount;

  @Column(nullable = false, length = 240)
  private String reason;

  @Column(name = "sale_id")
  private Long saleId;

  @Column(name = "actor_user_id", nullable = false)
  private Long actorUserId;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  protected CashMovement() {}

  public CashMovement(
      CashShift shift,
      String type,
      BigDecimal amount,
      String reason,
      Long saleId,
      Long actorUserId,
      Instant createdAt) {
    this.shift = shift;
    this.movementType = type;
    this.amount = amount;
    this.reason = reason;
    this.saleId = saleId;
    this.actorUserId = actorUserId;
    this.createdAt = createdAt;
  }

  public Long getId() {
    return id;
  }

  public String getMovementType() {
    return movementType;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public String getReason() {
    return reason;
  }

  public Long getSaleId() {
    return saleId;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}

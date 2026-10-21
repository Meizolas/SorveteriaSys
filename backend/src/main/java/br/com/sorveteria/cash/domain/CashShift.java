package br.com.sorveteria.cash.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "cash_shift")
public class CashShift {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, length = 16)
  private String code;

  @Column(name = "operator_user_id", nullable = false)
  private Long operatorUserId;

  @Column(nullable = false, length = 16)
  private String status;

  @Column(name = "opening_amount", nullable = false, precision = 13, scale = 2)
  private BigDecimal openingAmount;

  @Column(name = "counted_amount", precision = 13, scale = 2)
  private BigDecimal countedAmount;

  @Column(name = "difference_amount", precision = 13, scale = 2)
  private BigDecimal differenceAmount;

  @Column(name = "closing_reason", length = 240)
  private String closingReason;

  @Column(name = "opened_at", nullable = false, updatable = false)
  private Instant openedAt;

  @Column(name = "closed_at")
  private Instant closedAt;

  @Version private long version;

  protected CashShift() {}

  public CashShift(Long operatorUserId, BigDecimal openingAmount, Instant openedAt) {
    this.operatorUserId = operatorUserId;
    this.openingAmount = openingAmount;
    this.openedAt = openedAt;
    this.status = "OPEN";
  }

  public void assignCode() {
    this.code = "CX" + String.format("%06d", id);
  }

  public void close(BigDecimal counted, BigDecimal difference, String reason, Instant at) {
    status = "CLOSED";
    countedAmount = counted;
    differenceAmount = difference;
    closingReason = reason;
    closedAt = at;
  }

  public Long getId() {
    return id;
  }

  public String getCode() {
    return code;
  }

  public Long getOperatorUserId() {
    return operatorUserId;
  }

  public String getStatus() {
    return status;
  }

  public BigDecimal getOpeningAmount() {
    return openingAmount;
  }

  public BigDecimal getCountedAmount() {
    return countedAmount;
  }

  public BigDecimal getDifferenceAmount() {
    return differenceAmount;
  }

  public String getClosingReason() {
    return closingReason;
  }

  public Instant getOpenedAt() {
    return openedAt;
  }

  public Instant getClosedAt() {
    return closedAt;
  }
}

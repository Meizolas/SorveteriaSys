package br.com.sorveteria.sales.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payment")
public class Payment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "sale_id")
  private Sale sale;

  @Column(nullable = false, length = 16)
  private String method;

  @Column(name = "received_amount", nullable = false, precision = 13, scale = 2)
  private BigDecimal receivedAmount;

  @Column(name = "applied_amount", nullable = false, precision = 13, scale = 2)
  private BigDecimal appliedAmount;

  @Column(name = "change_amount", nullable = false, precision = 13, scale = 2)
  private BigDecimal changeAmount;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  protected Payment() {}

  public Payment(
      Sale sale,
      String method,
      BigDecimal received,
      BigDecimal applied,
      BigDecimal change,
      Instant now) {
    this.sale = sale;
    this.method = method;
    this.receivedAmount = received;
    this.appliedAmount = applied;
    this.changeAmount = change;
    this.createdAt = now;
  }

  public String getMethod() {
    return method;
  }

  public BigDecimal getReceivedAmount() {
    return receivedAmount;
  }

  public BigDecimal getAppliedAmount() {
    return appliedAmount;
  }

  public BigDecimal getChangeAmount() {
    return changeAmount;
  }
}

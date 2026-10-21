package br.com.sorveteria.sales.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sale")
public class Sale {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, length = 16)
  private String code;

  @Column(name = "idempotency_key", nullable = false, unique = true, length = 36)
  private String idempotencyKey;

  @Column(name = "request_fingerprint", nullable = false, length = 64)
  private String requestFingerprint;

  @Column(name = "operator_user_id", nullable = false)
  private Long operatorUserId;

  @Column(nullable = false, length = 16)
  private String status;

  @Column(nullable = false, precision = 13, scale = 2)
  private BigDecimal subtotal;

  @Column(nullable = false, precision = 13, scale = 2)
  private BigDecimal discount;

  @Column(nullable = false, precision = 13, scale = 2)
  private BigDecimal total;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL)
  private List<SaleItem> items = new ArrayList<>();

  @OneToOne(mappedBy = "sale", cascade = CascadeType.ALL)
  private Payment payment;

  protected Sale() {}

  public Sale(String key, String fingerprint, Long operator, BigDecimal total, Instant now) {
    this.idempotencyKey = key;
    this.requestFingerprint = fingerprint;
    this.operatorUserId = operator;
    this.status = "COMPLETED";
    this.subtotal = total;
    this.discount = BigDecimal.ZERO.setScale(2);
    this.total = total;
    this.createdAt = now;
  }

  public void assignCode() {
    this.code = "V" + String.format("%06d", id);
  }

  public void addItem(SaleItem item) {
    items.add(item);
  }

  public void setPayment(Payment value) {
    payment = value;
  }

  public Long getId() {
    return id;
  }

  public String getCode() {
    return code;
  }

  public String getIdempotencyKey() {
    return idempotencyKey;
  }

  public String getRequestFingerprint() {
    return requestFingerprint;
  }

  public Long getOperatorUserId() {
    return operatorUserId;
  }

  public BigDecimal getTotal() {
    return total;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public List<SaleItem> getItems() {
    return List.copyOf(items);
  }

  public Payment getPayment() {
    return payment;
  }
}

package br.com.sorveteria.inventory.domain;

import br.com.sorveteria.catalog.domain.Product;
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
@Table(name = "stock_movement")
public class StockMovement {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "product_id")
  private Product product;

  @Column(name = "movement_type", nullable = false, length = 24)
  private String movementType;

  @Column(nullable = false, precision = 13, scale = 3)
  private BigDecimal quantity;

  @Column(name = "previous_quantity", nullable = false, precision = 13, scale = 3)
  private BigDecimal previousQuantity;

  @Column(name = "resulting_quantity", nullable = false, precision = 13, scale = 3)
  private BigDecimal resultingQuantity;

  @Column(nullable = false, length = 240)
  private String reason;

  @Column(name = "actor_user_id", nullable = false)
  private Long actorUserId;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  protected StockMovement() {}

  public StockMovement(
      Product product,
      String type,
      BigDecimal quantity,
      BigDecimal previous,
      BigDecimal resulting,
      String reason,
      Long actor,
      Instant now) {
    this.product = product;
    this.movementType = type;
    this.quantity = quantity;
    this.previousQuantity = previous;
    this.resultingQuantity = resulting;
    this.reason = reason.trim();
    this.actorUserId = actor;
    this.createdAt = now;
  }
}

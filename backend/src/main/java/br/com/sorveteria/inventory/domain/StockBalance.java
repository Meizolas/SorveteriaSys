package br.com.sorveteria.inventory.domain;

import br.com.sorveteria.catalog.domain.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "stock_balance")
public class StockBalance {
    @Id @Column(name = "product_id") private Long productId;
    @MapsId @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id") private Product product;
    @Column(nullable = false, precision = 13, scale = 3) private BigDecimal quantity;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @Version @Column(nullable = false) private long version;

    protected StockBalance() { }
    public StockBalance(Product product, Instant now) {
        this.product = product; this.quantity = BigDecimal.ZERO.setScale(3); this.updatedAt = now;
    }
    public BigDecimal apply(BigDecimal delta, Instant now) {
        BigDecimal previous = quantity; BigDecimal result = previous.add(delta).setScale(3);
        if (result.signum() < 0) throw new IllegalArgumentException("Estoque insuficiente para o ajuste.");
        quantity = result; updatedAt = now; return previous;
    }
    public BigDecimal getQuantity() { return quantity; }
}

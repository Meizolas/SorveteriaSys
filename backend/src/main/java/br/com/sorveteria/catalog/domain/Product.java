package br.com.sorveteria.catalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "product")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "category_id")
    private ProductCategory category;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, unique = true, length = 40) private String sku;
    @Column(nullable = false, length = 16) private String unit;
    @Column(name = "sale_price", nullable = false, precision = 13, scale = 2) private BigDecimal salePrice;
    @Column(nullable = false) private boolean active;
    @Column(name = "tracks_stock", nullable = false) private boolean tracksStock;
    @Column(name = "minimum_stock", nullable = false, precision = 13, scale = 3) private BigDecimal minimumStock;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @Version @Column(nullable = false) private long version;

    protected Product() { }
    public Product(ProductCategory category, String name, String sku, BigDecimal price,
            boolean tracksStock, BigDecimal minimumStock, Instant now) {
        this.category = category; this.name = name.trim(); this.sku = sku.trim().toUpperCase();
        this.unit = "UNIT"; this.salePrice = price; this.active = true; this.tracksStock = tracksStock;
        this.minimumStock = minimumStock; this.createdAt = now; this.updatedAt = now;
    }
    public void update(ProductCategory newCategory, String newName, BigDecimal price,
            boolean newActive, boolean stockControl, BigDecimal minimum, Instant now) {
        category = newCategory; name = newName.trim(); salePrice = price; active = newActive;
        tracksStock = stockControl; minimumStock = minimum; updatedAt = now;
    }
    public Long getId() { return id; }
    public ProductCategory getCategory() { return category; }
    public String getName() { return name; }
    public String getSku() { return sku; }
    public String getUnit() { return unit; }
    public BigDecimal getSalePrice() { return salePrice; }
    public boolean isActive() { return active; }
    public boolean isTracksStock() { return tracksStock; }
    public BigDecimal getMinimumStock() { return minimumStock; }
    public long getVersion() { return version; }
}

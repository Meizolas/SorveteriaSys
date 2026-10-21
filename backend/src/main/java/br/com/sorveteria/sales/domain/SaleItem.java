package br.com.sorveteria.sales.domain;

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

@Entity
@Table(name = "sale_item")
public class SaleItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "sale_id")
  private Sale sale;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "product_id")
  private Product product;

  @Column(name = "product_sku", nullable = false, length = 40)
  private String productSku;

  @Column(name = "product_name", nullable = false, length = 120)
  private String productName;

  @Column(nullable = false, length = 16)
  private String unit;

  @Column(name = "unit_price", nullable = false, precision = 13, scale = 2)
  private BigDecimal unitPrice;

  @Column(nullable = false, precision = 13, scale = 3)
  private BigDecimal quantity;

  @Column(name = "line_total", nullable = false, precision = 13, scale = 2)
  private BigDecimal lineTotal;

  protected SaleItem() {}

  public SaleItem(Sale sale, Product product, BigDecimal quantity) {
    this.sale = sale;
    this.product = product;
    this.productSku = product.getSku();
    this.productName = product.getName();
    this.unit = product.getUnit();
    this.unitPrice = product.getSalePrice().setScale(2);
    this.quantity = quantity.setScale(3);
    this.lineTotal = unitPrice.multiply(quantity).setScale(2);
  }

  public Long getProductId() {
    return product.getId();
  }

  public String getProductSku() {
    return productSku;
  }

  public String getProductName() {
    return productName;
  }

  public BigDecimal getUnitPrice() {
    return unitPrice;
  }

  public BigDecimal getQuantity() {
    return quantity;
  }

  public BigDecimal getLineTotal() {
    return lineTotal;
  }
}

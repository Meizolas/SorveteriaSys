package br.com.sorveteria.catalog.application;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("development")
@ConditionalOnProperty(name = "sorveteria.demo.enabled", havingValue = "true")
public class DemoCatalogProvisioning implements ApplicationRunner {
  private static final List<String> CATEGORIES =
      List.of("Sorvetes", "Especiais", "Bebidas", "Picolés", "Açaí", "Complementos");

  private static final List<DemoProduct> PRODUCTS =
      List.of(
          product("Sorvetes", "Casquinha Tradicional", "SOR-001", "8.50", "42", "15"),
          product("Sorvetes", "Copo 300 ml", "SOR-002", "14.00", "28", "10"),
          product("Sorvetes", "Cascão Duplo", "SOR-003", "16.90", "19", "8"),
          product("Sorvetes", "Taça Três Sabores", "SOR-004", "22.90", "14", "6"),
          product("Especiais", "Sundae Chocolate", "ESP-001", "18.90", "8", "10"),
          product("Especiais", "Banana Split", "ESP-002", "27.90", "11", "5"),
          product("Especiais", "Petit Gateau com Sorvete", "ESP-003", "29.90", "7", "4"),
          product("Bebidas", "Milk-shake Morango", "BEB-001", "21.50", "16", "8"),
          product("Bebidas", "Água Mineral", "BEB-002", "4.50", "36", "12"),
          product("Bebidas", "Milk-shake Chocolate", "BEB-003", "21.50", "6", "8"),
          product("Picolés", "Picolé de Frutas", "PIC-001", "6.00", "55", "20"),
          product("Picolés", "Picolé Premium", "PIC-002", "9.50", "24", "12"),
          product("Açaí", "Açaí 500 ml", "ACA-001", "24.90", "6", "10"),
          product("Açaí", "Açaí 300 ml", "ACA-002", "17.90", "18", "8"),
          product("Complementos", "Calda Extra", "COM-001", "3.00", "30", "10"),
          product("Complementos", "Porção de Granola", "COM-002", "4.00", "9", "10"),
          product("Complementos", "Canudo Wafer", "COM-003", "2.50", "40", "15"));

  private final JdbcTemplate jdbc;

  public DemoCatalogProvisioning(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments arguments) {
    CATEGORIES.forEach(this::insertCategoryIfMissing);
    PRODUCTS.forEach(this::insertProductIfMissing);
  }

  static List<String> demoCategories() {
    return CATEGORIES;
  }

  static List<DemoProduct> demoProducts() {
    return PRODUCTS;
  }

  private void insertCategoryIfMissing(String name) {
    jdbc.update(
        "INSERT INTO product_category(name,active,created_at,updated_at) "
            + "SELECT ?,1,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6) WHERE NOT EXISTS "
            + "(SELECT 1 FROM product_category WHERE name=?)",
        name,
        name);
  }

  private void insertProductIfMissing(DemoProduct product) {
    jdbc.update(
        "INSERT INTO product(category_id,name,sku,unit,sale_price,active,tracks_stock,"
            + "minimum_stock,created_at,updated_at) SELECT c.id,?,?, 'UNIT',?,1,1,?,"
            + "UTC_TIMESTAMP(6),UTC_TIMESTAMP(6) FROM product_category c WHERE c.name=? "
            + "AND NOT EXISTS (SELECT 1 FROM product WHERE sku=?)",
        product.name(),
        product.sku(),
        product.price(),
        product.minimumStock(),
        product.category(),
        product.sku());
    jdbc.update(
        "INSERT INTO stock_balance(product_id,quantity,updated_at) SELECT p.id,?,UTC_TIMESTAMP(6) "
            + "FROM product p WHERE p.sku=? AND NOT EXISTS "
            + "(SELECT 1 FROM stock_balance b WHERE b.product_id=p.id)",
        product.initialStock(),
        product.sku());
  }

  private static DemoProduct product(
      String category, String name, String sku, String price, String stock, String minimum) {
    return new DemoProduct(
        category,
        name,
        sku,
        new BigDecimal(price),
        new BigDecimal(stock).setScale(3),
        new BigDecimal(minimum).setScale(3));
  }

  record DemoProduct(
      String category,
      String name,
      String sku,
      BigDecimal price,
      BigDecimal initialStock,
      BigDecimal minimumStock) {}
}

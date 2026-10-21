package br.com.sorveteria.catalog.application;

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
    private final JdbcTemplate jdbc;
    public DemoCatalogProvisioning(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override @Transactional
    public void run(ApplicationArguments arguments) {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM product_category", Long.class);
        if (count != null && count > 0) return;
        jdbc.update("INSERT INTO product_category(name,active,created_at,updated_at) VALUES "
                + "('Sorvetes',1,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6)),"
                + "('Especiais',1,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6)),"
                + "('Bebidas',1,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6)),"
                + "('Picolés',1,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6)),"
                + "('Açaí',1,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6))");
        insert("Sorvetes", "Casquinha Tradicional", "SOR-001", "8.50", "42.000", "15.000");
        insert("Sorvetes", "Copo 300 ml", "SOR-002", "14.00", "28.000", "10.000");
        insert("Especiais", "Sundae Chocolate", "ESP-001", "18.90", "8.000", "10.000");
        insert("Bebidas", "Milk-shake Morango", "BEB-001", "21.50", "16.000", "8.000");
        insert("Picolés", "Picolé de Frutas", "PIC-001", "6.00", "55.000", "20.000");
        insert("Açaí", "Açaí 500 ml", "ACA-001", "24.90", "6.000", "10.000");
        insert("Bebidas", "Água Mineral", "BEB-002", "4.50", "36.000", "12.000");
    }
    private void insert(String category, String name, String sku, String price, String stock, String minimum) {
        jdbc.update("INSERT INTO product(category_id,name,sku,unit,sale_price,active,tracks_stock,"
                + "minimum_stock,created_at,updated_at) SELECT id,?,?, 'UNIT',?,1,1,?,UTC_TIMESTAMP(6),"
                + "UTC_TIMESTAMP(6) FROM product_category WHERE name=?", name, sku, price, minimum, category);
        jdbc.update("INSERT INTO stock_balance(product_id,quantity,updated_at) SELECT id,?,UTC_TIMESTAMP(6) "
                + "FROM product WHERE sku=?", stock, sku);
    }
}

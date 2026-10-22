package br.com.sorveteria.inventory.application;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryHistoryService {
  private final JdbcTemplate jdbc;

  public InventoryHistoryService(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Transactional(readOnly = true)
  public List<MovementView> recent() {
    return jdbc.query(
        "SELECT sm.id, sm.product_id, p.name product_name, p.sku, sm.movement_type, "
            + "sm.quantity, sm.previous_quantity, sm.resulting_quantity, sm.reason, "
            + "u.display_name actor, sm.created_at FROM stock_movement sm "
            + "JOIN product p ON p.id = sm.product_id "
            + "JOIN app_user u ON u.id = sm.actor_user_id "
            + "ORDER BY sm.created_at DESC, sm.id DESC LIMIT 100",
        (result, row) ->
            new MovementView(
                result.getLong("id"),
                result.getLong("product_id"),
                result.getString("product_name"),
                result.getString("sku"),
                result.getString("movement_type"),
                result.getBigDecimal("quantity"),
                result.getBigDecimal("previous_quantity"),
                result.getBigDecimal("resulting_quantity"),
                result.getString("reason"),
                result.getString("actor"),
                result.getTimestamp("created_at").toInstant()));
  }

  public record MovementView(
      Long id,
      Long productId,
      String productName,
      String sku,
      String type,
      BigDecimal quantity,
      BigDecimal previousQuantity,
      BigDecimal resultingQuantity,
      String reason,
      String actor,
      Instant createdAt) {}
}

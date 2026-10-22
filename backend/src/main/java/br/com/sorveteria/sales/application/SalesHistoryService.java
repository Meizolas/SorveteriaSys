package br.com.sorveteria.sales.application;

import br.com.sorveteria.platform.web.ApiException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SalesHistoryService {
  private final JdbcTemplate jdbc;

  public SalesHistoryService(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Transactional(readOnly = true)
  public List<SaleSummary> list() {
    return jdbc.query(
        "SELECT s.id, s.code, s.created_at, s.status, s.total, s.canceled_at, s.cancellation_reason, p.method, u.display_name, "
            + "COUNT(si.id) item_count FROM sale s JOIN payment p ON p.sale_id = s.id "
            + "JOIN app_user u ON u.id = s.operator_user_id LEFT JOIN sale_item si "
            + "ON si.sale_id = s.id GROUP BY s.id, s.code, s.created_at, s.status, s.total, "
            + "s.canceled_at, s.cancellation_reason, p.method, u.display_name ORDER BY s.created_at DESC, s.id DESC LIMIT 100",
        (result, row) ->
            new SaleSummary(
                result.getLong("id"),
                result.getString("code"),
                result.getTimestamp("created_at").toInstant(),
                result.getString("status"),
                result.getBigDecimal("total"),
                result.getString("method"),
                result.getString("display_name"),
                result.getLong("item_count"),
                result.getTimestamp("canceled_at") == null ? null : result.getTimestamp("canceled_at").toInstant(),
                result.getString("cancellation_reason")));
  }

  @Transactional(readOnly = true)
  public SaleDetail detail(Long id) {
    List<SaleDetailRow> sales =
        jdbc.query(
            "SELECT s.id, s.code, s.created_at, s.status, s.total, s.canceled_at, s.cancellation_reason, p.method, "
                + "p.received_amount, p.change_amount, u.display_name FROM sale s "
                + "JOIN payment p ON p.sale_id = s.id JOIN app_user u ON u.id = "
                + "s.operator_user_id WHERE s.id = ?",
            (result, row) ->
                new SaleDetailRow(
                    result.getLong("id"),
                    result.getString("code"),
                    result.getTimestamp("created_at").toInstant(),
                    result.getString("status"),
                    result.getBigDecimal("total"),
                    result.getString("method"),
                    result.getBigDecimal("received_amount"),
                    result.getBigDecimal("change_amount"),
                    result.getString("display_name"),
                    result.getTimestamp("canceled_at") == null ? null : result.getTimestamp("canceled_at").toInstant(),
                    result.getString("cancellation_reason")),
            id);
    if (sales.isEmpty()) {
      throw new ApiException(HttpStatus.NOT_FOUND, "SALE_NOT_FOUND", "Venda não encontrada.");
    }
    SaleDetailRow sale = sales.getFirst();
    List<SaleItemView> items =
        jdbc.query(
            "SELECT product_id, product_sku, product_name, unit_price, quantity, line_total "
                + "FROM sale_item WHERE sale_id = ? ORDER BY id",
            (result, row) ->
                new SaleItemView(
                    result.getLong("product_id"),
                    result.getString("product_sku"),
                    result.getString("product_name"),
                    result.getBigDecimal("unit_price"),
                    result.getBigDecimal("quantity"),
                    result.getBigDecimal("line_total")),
            id);
    return new SaleDetail(
        sale.id(), sale.code(), sale.completedAt(), sale.status(), sale.total(), sale.paymentMethod(),
        sale.receivedAmount(), sale.changeAmount(), sale.operator(), items,
        sale.canceledAt(), sale.cancellationReason());
  }

  private record SaleDetailRow(
      Long id,
      String code,
      Instant completedAt,
      String status,
      BigDecimal total,
      String paymentMethod,
      BigDecimal receivedAmount,
      BigDecimal changeAmount,
      String operator,
      Instant canceledAt,
      String cancellationReason) {}

  public record SaleSummary(
      Long id,
      String code,
      Instant completedAt,
      String status,
      BigDecimal total,
      String paymentMethod,
      String operator,
      long itemCount,
      Instant canceledAt,
      String cancellationReason) {}

  public record SaleDetail(
      Long id,
      String code,
      Instant completedAt,
      String status,
      BigDecimal total,
      String paymentMethod,
      BigDecimal receivedAmount,
      BigDecimal changeAmount,
      String operator,
      List<SaleItemView> items,
      Instant canceledAt,
      String cancellationReason) {}

  public record SaleItemView(
      Long productId,
      String sku,
      String name,
      BigDecimal unitPrice,
      BigDecimal quantity,
      BigDecimal lineTotal) {}
}

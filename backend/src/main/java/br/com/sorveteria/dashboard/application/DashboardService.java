package br.com.sorveteria.dashboard.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {
  private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");
  private final JdbcTemplate jdbc;

  public DashboardService(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Transactional(readOnly = true)
  public DashboardView overview() {
    LocalDate today = LocalDate.now(BUSINESS_ZONE);
    Instant start = today.atStartOfDay(BUSINESS_ZONE).toInstant();
    Instant end = today.plusDays(1).atStartOfDay(BUSINESS_ZONE).toInstant();
    List<SalePoint> sales = sales(start, end);
    BigDecimal revenue =
        sales.stream().map(SalePoint::total).reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2);
    long count = sales.size();
    BigDecimal average =
        count == 0
            ? BigDecimal.ZERO.setScale(2)
            : revenue.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
    return new DashboardView(
        today,
        revenue,
        count,
        average,
        hourly(sales),
        recent(start, end),
        currentCash(),
        lowStockCount(),
        lowStock());
  }

  private List<SalePoint> sales(Instant start, Instant end) {
    return jdbc.query(
        "SELECT created_at, total FROM sale WHERE status = 'COMPLETED' "
            + "AND created_at >= ? AND created_at < ? ORDER BY created_at",
        (rs, row) ->
            new SalePoint(rs.getTimestamp("created_at").toInstant(), rs.getBigDecimal("total")),
        Timestamp.from(start),
        Timestamp.from(end));
  }

  private List<HourlyView> hourly(List<SalePoint> sales) {
    Map<Integer, BigDecimal> values = new LinkedHashMap<>();
    for (SalePoint sale : sales) {
      int hour = sale.at().atZone(BUSINESS_ZONE).getHour();
      values.merge(hour, sale.total(), BigDecimal::add);
    }
    return values.entrySet().stream()
        .map(entry -> new HourlyView(entry.getKey(), entry.getValue().setScale(2)))
        .toList();
  }

  private List<RecentSaleView> recent(Instant start, Instant end) {
    return jdbc.query(
        "SELECT s.code, s.created_at, s.total, p.method, u.display_name "
            + "FROM sale s JOIN payment p ON p.sale_id = s.id "
            + "JOIN app_user u ON u.id = s.operator_user_id "
            + "WHERE s.status = 'COMPLETED' AND s.created_at >= ? AND s.created_at < ? "
            + "ORDER BY s.created_at DESC, s.id DESC LIMIT 8",
        (rs, row) ->
            new RecentSaleView(
                rs.getString("code"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getString("display_name"),
                rs.getString("method"),
                rs.getBigDecimal("total")),
        Timestamp.from(start),
        Timestamp.from(end));
  }

  private CashSummaryView currentCash() {
    List<CashSummaryView> result =
        jdbc.query(
            "SELECT cs.code, cs.opened_at, cs.opening_amount + COALESCE(SUM(CASE WHEN"
                + " cm.movement_type IN ('SUPPLY','CASH_SALE') THEN cm.amount WHEN cm.movement_type"
                + " IN ('WITHDRAWAL','CASH_REFUND') THEN -cm.amount ELSE 0 END), 0) expected_amount FROM cash_shift"
                + " cs LEFT JOIN cash_movement cm ON cm.cash_shift_id = cs.id WHERE cs.status ="
                + " 'OPEN' GROUP BY cs.id, cs.code, cs.opened_at, cs.opening_amount",
            (rs, row) ->
                new CashSummaryView(
                    true,
                    rs.getString("code"),
                    rs.getTimestamp("opened_at").toInstant(),
                    rs.getBigDecimal("expected_amount")));
    return result.isEmpty()
        ? new CashSummaryView(false, null, null, BigDecimal.ZERO.setScale(2))
        : result.getFirst();
  }

  private long lowStockCount() {
    Long count =
        jdbc.queryForObject(
            "SELECT COUNT(*) FROM product p LEFT JOIN stock_balance b "
                + "ON b.product_id = p.id WHERE p.active = 1 AND p.tracks_stock = 1 "
                + "AND COALESCE(b.quantity, 0) <= p.minimum_stock",
            Long.class);
    return count == null ? 0 : count;
  }

  private List<LowStockView> lowStock() {
    return jdbc.query(
        "SELECT p.id, p.name, p.minimum_stock, COALESCE(b.quantity, 0) quantity FROM product p LEFT"
            + " JOIN stock_balance b ON b.product_id = p.id WHERE p.active = 1 AND p.tracks_stock ="
            + " 1 AND COALESCE(b.quantity, 0) <= p.minimum_stock ORDER BY (COALESCE(b.quantity, 0)"
            + " - p.minimum_stock), p.name LIMIT 5",
        (rs, row) ->
            new LowStockView(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getBigDecimal("quantity"),
                rs.getBigDecimal("minimum_stock")));
  }

  private record SalePoint(Instant at, BigDecimal total) {}

  public record DashboardView(
      LocalDate businessDate,
      BigDecimal revenue,
      long salesCount,
      BigDecimal averageTicket,
      List<HourlyView> hourlySales,
      List<RecentSaleView> recentSales,
      CashSummaryView cash,
      long lowStockCount,
      List<LowStockView> lowStock) {}

  public record HourlyView(int hour, BigDecimal total) {}

  public record RecentSaleView(
      String code, Instant completedAt, String operator, String paymentMethod, BigDecimal total) {}

  public record CashSummaryView(
      boolean open, String code, Instant openedAt, BigDecimal expectedAmount) {}

  public record LowStockView(
      Long productId, String name, BigDecimal quantity, BigDecimal minimumStock) {}
}

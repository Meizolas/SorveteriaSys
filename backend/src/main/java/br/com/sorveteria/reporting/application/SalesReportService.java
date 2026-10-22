package br.com.sorveteria.reporting.application;

import br.com.sorveteria.platform.web.ApiException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SalesReportService {
  private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Bahia");
  private final JdbcTemplate jdbc;

  public SalesReportService(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Transactional(readOnly = true)
  public SalesReport report(LocalDate from, LocalDate to) {
    validate(from, to);
    Instant start = from.atStartOfDay(BUSINESS_ZONE).toInstant();
    Instant end = to.plusDays(1).atStartOfDay(BUSINESS_ZONE).toInstant();
    List<SaleRow> completed = jdbc.query(
        "SELECT s.created_at, s.total, p.method FROM sale s JOIN payment p ON p.sale_id = s.id "
            + "WHERE s.status = 'COMPLETED' AND s.created_at >= ? AND s.created_at < ? "
            + "ORDER BY s.created_at",
        (result, row) -> new SaleRow(result.getTimestamp("created_at").toInstant(),
            result.getBigDecimal("total"), result.getString("method")),
        Timestamp.from(start), Timestamp.from(end));
    Long canceledValue = jdbc.queryForObject(
        "SELECT COUNT(*) FROM sale WHERE status = 'CANCELED' AND created_at >= ? AND created_at < ?",
        Long.class, Timestamp.from(start), Timestamp.from(end));
    long canceled = canceledValue == null ? 0 : canceledValue;
    BigDecimal revenue = completed.stream().map(SaleRow::total)
        .reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2);
    BigDecimal average = completed.isEmpty() ? BigDecimal.ZERO.setScale(2)
        : revenue.divide(BigDecimal.valueOf(completed.size()), 2, RoundingMode.HALF_UP);

    Map<String, PaymentAccumulator> paymentMap = new LinkedHashMap<>();
    Map<LocalDate, DailyAccumulator> dailyMap = new LinkedHashMap<>();
    for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
      dailyMap.put(day, new DailyAccumulator());
    }
    completed.forEach(sale -> {
      paymentMap.computeIfAbsent(sale.method(), ignored -> new PaymentAccumulator()).add(sale.total());
      dailyMap.get(sale.at().atZone(BUSINESS_ZONE).toLocalDate()).add(sale.total());
    });
    List<PaymentSummary> payments = paymentMap.entrySet().stream()
        .map(entry -> new PaymentSummary(entry.getKey(), entry.getValue().count,
            entry.getValue().total.setScale(2))).toList();
    List<DailySales> daily = dailyMap.entrySet().stream()
        .map(entry -> new DailySales(entry.getKey(), entry.getValue().count,
            entry.getValue().total.setScale(2))).toList();
    List<ProductRanking> products = jdbc.query(
        "SELECT si.product_id, si.product_sku, si.product_name, SUM(si.quantity) quantity, "
            + "SUM(si.line_total) revenue FROM sale_item si JOIN sale s ON s.id = si.sale_id "
            + "WHERE s.status = 'COMPLETED' AND s.created_at >= ? AND s.created_at < ? "
            + "GROUP BY si.product_id, si.product_sku, si.product_name "
            + "ORDER BY quantity DESC, revenue DESC, si.product_name LIMIT 10",
        (result, row) -> new ProductRanking(result.getLong("product_id"),
            result.getString("product_sku"), result.getString("product_name"),
            result.getBigDecimal("quantity"), result.getBigDecimal("revenue")),
        Timestamp.from(start), Timestamp.from(end));
    return new SalesReport(from, to, revenue, completed.size(), canceled, average,
        payments, daily, products);
  }

  private void validate(LocalDate from, LocalDate to) {
    if (from == null || to == null || from.isAfter(to)
        || ChronoUnit.DAYS.between(from, to) > 365) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_REPORT_PERIOD",
          "Informe um periodo valido de ate 366 dias.");
    }
  }

  private record SaleRow(Instant at, BigDecimal total, String method) {}
  private static final class PaymentAccumulator {
    private long count;
    private BigDecimal total = BigDecimal.ZERO;
    void add(BigDecimal value) {
      count++;
      total = total.add(value);
    }
  }
  private static final class DailyAccumulator {
    private long count;
    private BigDecimal total = BigDecimal.ZERO;
    void add(BigDecimal value) {
      count++;
      total = total.add(value);
    }
  }

  public record SalesReport(LocalDate from, LocalDate to, BigDecimal revenue,
      long completedSales, long canceledSales, BigDecimal averageTicket,
      List<PaymentSummary> payments, List<DailySales> dailySales,
      List<ProductRanking> topProducts) {}
  public record PaymentSummary(String method, long salesCount, BigDecimal total) {}
  public record DailySales(LocalDate date, long salesCount, BigDecimal total) {}
  public record ProductRanking(Long productId, String sku, String name,
      BigDecimal quantity, BigDecimal revenue) {}
}

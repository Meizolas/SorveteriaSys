package br.com.sorveteria.cash.application;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CashHistoryService {
  private final JdbcTemplate jdbc;

  public CashHistoryService(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Transactional(readOnly = true)
  public List<ClosedShiftView> closedShifts() {
    return jdbc.query(
        "SELECT cs.id, cs.code, u.display_name operator, cs.opening_amount, "
            + "COALESCE((SELECT SUM(s.total) FROM sale s WHERE s.cash_shift_id = cs.id "
            + "AND s.status = 'COMPLETED'), 0) sales_total, "
            + "COALESCE(SUM(CASE WHEN cm.movement_type = 'CASH_SALE' THEN cm.amount ELSE 0 END), 0) cash_sales, "
            + "COALESCE(SUM(CASE WHEN cm.movement_type = 'SUPPLY' THEN cm.amount ELSE 0 END), 0) supplies, "
            + "COALESCE(SUM(CASE WHEN cm.movement_type = 'WITHDRAWAL' THEN cm.amount ELSE 0 END), 0) withdrawals, "
            + "COALESCE(SUM(CASE WHEN cm.movement_type = 'CASH_REFUND' THEN cm.amount ELSE 0 END), 0) refunds, "
            + "cs.opening_amount + COALESCE(SUM(CASE WHEN cm.movement_type IN ('CASH_SALE','SUPPLY') "
            + "THEN cm.amount WHEN cm.movement_type IN ('WITHDRAWAL','CASH_REFUND') THEN -cm.amount ELSE 0 END), 0) expected_amount, "
            + "cs.counted_amount, cs.difference_amount, cs.closing_reason, cs.opened_at, cs.closed_at "
            + "FROM cash_shift cs JOIN app_user u ON u.id = cs.operator_user_id "
            + "LEFT JOIN cash_movement cm ON cm.cash_shift_id = cs.id WHERE cs.status = 'CLOSED' "
            + "GROUP BY cs.id, cs.code, u.display_name, cs.opening_amount, cs.counted_amount, "
            + "cs.difference_amount, cs.closing_reason, cs.opened_at, cs.closed_at "
            + "ORDER BY cs.closed_at DESC, cs.id DESC LIMIT 50",
        (result, row) -> new ClosedShiftView(
            result.getLong("id"), result.getString("code"), result.getString("operator"),
            result.getBigDecimal("opening_amount"), result.getBigDecimal("sales_total"),
            result.getBigDecimal("cash_sales"), result.getBigDecimal("supplies"),
            result.getBigDecimal("withdrawals"), result.getBigDecimal("refunds"),
            result.getBigDecimal("expected_amount"), result.getBigDecimal("counted_amount"),
            result.getBigDecimal("difference_amount"), result.getString("closing_reason"),
            result.getTimestamp("opened_at").toInstant(),
            result.getTimestamp("closed_at").toInstant()));
  }

  public record ClosedShiftView(
      Long id, String code, String operator, BigDecimal openingAmount, BigDecimal salesTotal,
      BigDecimal cashSales, BigDecimal supplies, BigDecimal withdrawals, BigDecimal refunds,
      BigDecimal expectedAmount, BigDecimal countedAmount, BigDecimal differenceAmount,
      String closingReason, Instant openedAt, Instant closedAt) {}
}

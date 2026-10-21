package br.com.sorveteria.dashboard.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

class DashboardServiceTest {
  @SuppressWarnings({"rawtypes", "unchecked"})
  @Test
  void reconcilesEmptyDayWithClosedCashAndNoStockAlerts() {
    JdbcTemplate jdbc = mock(JdbcTemplate.class);
    when(jdbc.query(anyString(), any(RowMapper.class), any(), any())).thenReturn(List.of());
    when(jdbc.query(anyString(), any(RowMapper.class))).thenReturn(List.of());
    when(jdbc.queryForObject(anyString(), eq(Long.class))).thenReturn(0L);

    DashboardService.DashboardView result = new DashboardService(jdbc).overview();

    assertThat(result.revenue()).isEqualByComparingTo("0.00");
    assertThat(result.salesCount()).isZero();
    assertThat(result.averageTicket()).isEqualByComparingTo("0.00");
    assertThat(result.hourlySales()).isEmpty();
    assertThat(result.recentSales()).isEmpty();
    assertThat(result.cash().open()).isFalse();
    assertThat(result.cash().expectedAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.lowStockCount()).isZero();
    assertThat(result.lowStock()).isEmpty();
  }
}

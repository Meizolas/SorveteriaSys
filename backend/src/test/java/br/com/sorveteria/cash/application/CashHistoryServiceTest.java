package br.com.sorveteria.cash.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

class CashHistoryServiceTest {
  @SuppressWarnings({"rawtypes", "unchecked"})
  @Test
  void returnsEmptyHistoryWhenNoShiftWasClosed() {
    JdbcTemplate jdbc = mock(JdbcTemplate.class);
    when(jdbc.query(anyString(), any(RowMapper.class))).thenReturn(List.of());
    assertThat(new CashHistoryService(jdbc).closedShifts()).isEmpty();
  }
}

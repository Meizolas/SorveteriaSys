package br.com.sorveteria.sales.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.sorveteria.platform.web.ApiException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

class SalesHistoryServiceTest {
  @SuppressWarnings({"rawtypes", "unchecked"})
  @Test
  void returnsEmptyHistoryAndNotFoundForUnknownSale() {
    JdbcTemplate jdbc = mock(JdbcTemplate.class);
    when(jdbc.query(anyString(), any(RowMapper.class))).thenReturn(List.of());
    when(jdbc.query(anyString(), any(RowMapper.class), any())).thenReturn(List.of());
    SalesHistoryService service = new SalesHistoryService(jdbc);

    assertThat(service.list()).isEmpty();
    assertThatThrownBy(() -> service.detail(999L))
        .isInstanceOfSatisfying(ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("SALE_NOT_FOUND"));
  }
}

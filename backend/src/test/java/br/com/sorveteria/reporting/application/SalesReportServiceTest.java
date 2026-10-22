package br.com.sorveteria.reporting.application;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

import br.com.sorveteria.platform.web.ApiException;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

class SalesReportServiceTest {
  @Test
  void rejectsInvertedAndOversizedPeriods() {
    SalesReportService service = new SalesReportService(mock(JdbcTemplate.class));
    assertThatThrownBy(() -> service.report(LocalDate.of(2026, 2, 2), LocalDate.of(2026, 2, 1)))
        .isInstanceOf(ApiException.class);
    assertThatThrownBy(() -> service.report(LocalDate.of(2025, 1, 1), LocalDate.of(2026, 2, 1)))
        .isInstanceOf(ApiException.class);
  }
}

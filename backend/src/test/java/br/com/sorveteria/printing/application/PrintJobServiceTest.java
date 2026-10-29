package br.com.sorveteria.printing.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.sorveteria.platform.web.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

class PrintJobServiceTest {
  @Test
  void rejectsDirectModeWithoutAConfiguredConnector() {
    PrintJobService service = new PrintJobService(mock(JdbcTemplate.class));
    assertThatThrownBy(() -> service.prepare(1L,
        "00000000-0000-0000-0000-000000000001", "DIRECT_CONNECTOR", null, 1L))
        .isInstanceOfSatisfying(ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("PRINT_CONNECTOR_UNAVAILABLE"));
  }

  @Test
  void returnsTheSameJobForTheSameOperationKey() {
    JdbcTemplate jdbc = mock(JdbcTemplate.class);
    when(jdbc.query(org.mockito.ArgumentMatchers.anyString(),
        org.mockito.ArgumentMatchers.<org.springframework.jdbc.core.RowMapper<PrintJobService.PrintJobView>>any(),
        org.mockito.ArgumentMatchers.<Object[]>any()))
        .thenReturn(java.util.List.of(new PrintJobService.PrintJobView(7L,
            "00000000-0000-0000-0000-000000000007", 3L, "FIRST_COPY", "SYSTEM_DIALOG",
            "PREPARED", null, java.time.Instant.parse("2026-01-01T10:00:00Z"))));
    PrintJobService.JobResult result = new PrintJobService(jdbc).prepare(3L,
        "00000000-0000-0000-0000-000000000007", "SYSTEM_DIALOG", null, 1L);
    assertThat(result.created()).isFalse();
    assertThat(result.job().id()).isEqualTo(7L);
  }

  @Test
  void classifiesFirstCopyAndReprints() {
    assertThat(PrintJobService.kindFor(0L, null)).isEqualTo("FIRST_COPY");
    assertThat(PrintJobService.kindFor(1L, null)).isEqualTo("REPRINT");
    assertThat(PrintJobService.kindFor(0L, "REPRINT")).isEqualTo("REPRINT");
  }
}

package br.com.sorveteria.printing.application;

import br.com.sorveteria.platform.web.ApiException;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PrintJobService {
  private final JdbcTemplate jdbc;

  public PrintJobService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

  @Transactional
  public JobResult prepare(Long saleId, String operationKey, String mode, String requestedKind,
      Long userId) {
    if (!"SYSTEM_DIALOG".equals(mode)) {
      throw new ApiException(HttpStatus.CONFLICT, "PRINT_CONNECTOR_UNAVAILABLE",
          "A impressão direta ainda não possui um conector configurado.");
    }
    List<PrintJobView> existing = findByOperationKey(operationKey);
    if (!existing.isEmpty()) {
      PrintJobView job = existing.getFirst();
      if (!job.saleId().equals(saleId) || !job.mode().equals(mode)
          || (requestedKind != null && !job.kind().equals(requestedKind))) {
        throw new ApiException(HttpStatus.CONFLICT, "PRINT_OPERATION_CONFLICT",
            "A chave de impressão já foi usada para outra solicitação.");
      }
      return new JobResult(job, false);
    }
    Long saleCount = jdbc.queryForObject("SELECT COUNT(*) FROM sale WHERE id=?", Long.class, saleId);
    if (saleCount == null || saleCount == 0) {
      throw new ApiException(HttpStatus.NOT_FOUND, "SALE_NOT_FOUND", "Venda não encontrada.");
    }
    Long previous = jdbc.queryForObject(
        "SELECT COUNT(*) FROM print_job WHERE sale_id=?", Long.class, saleId);
    String kind = kindFor(previous, requestedKind);
    Instant now = Instant.now();
    GeneratedKeyHolder keys = new GeneratedKeyHolder();
    jdbc.update(connection -> {
      PreparedStatement statement = connection.prepareStatement(
          "INSERT INTO print_job(operation_key,sale_id,requested_by,job_kind,print_mode,"
              + "status,created_at,updated_at) VALUES (?,?,?,?,?,'PREPARED',?,?)",
          Statement.RETURN_GENERATED_KEYS);
      statement.setString(1, operationKey);
      statement.setLong(2, saleId);
      statement.setLong(3, userId);
      statement.setString(4, kind);
      statement.setString(5, mode);
      statement.setTimestamp(6, Timestamp.from(now));
      statement.setTimestamp(7, Timestamp.from(now));
      return statement;
    }, keys);
    Number id = keys.getKey();
    return new JobResult(new PrintJobView(id.longValue(), operationKey, saleId, kind, mode,
        "PREPARED", null, now), true);
  }

  static String kindFor(Long previousJobs, String requestedKind) {
    if ("REPRINT".equals(requestedKind)) {
      return "REPRINT";
    }
    return previousJobs == null || previousJobs == 0 ? "FIRST_COPY" : "REPRINT";
  }

  @Transactional(readOnly = true)
  public List<PrintJobView> history(Long saleId) {
    Long count = jdbc.queryForObject("SELECT COUNT(*) FROM sale WHERE id=?", Long.class, saleId);
    if (count == null || count == 0) {
      throw new ApiException(HttpStatus.NOT_FOUND, "SALE_NOT_FOUND", "Venda não encontrada.");
    }
    return jdbc.query("SELECT id,operation_key,sale_id,job_kind,print_mode,status,error_code,"
            + "created_at FROM print_job WHERE sale_id=? ORDER BY created_at DESC,id DESC",
        (rs, row) -> map(rs), saleId);
  }

  private List<PrintJobView> findByOperationKey(String operationKey) {
    return jdbc.query("SELECT id,operation_key,sale_id,job_kind,print_mode,status,error_code,"
            + "created_at FROM print_job WHERE operation_key=?",
        (rs, row) -> map(rs), operationKey);
  }

  private PrintJobView map(java.sql.ResultSet rs) throws java.sql.SQLException {
    return new PrintJobView(rs.getLong("id"), rs.getString("operation_key"),
        rs.getLong("sale_id"), rs.getString("job_kind"), rs.getString("print_mode"),
        rs.getString("status"), rs.getString("error_code"),
        rs.getTimestamp("created_at").toInstant());
  }

  public record JobResult(PrintJobView job, boolean created) {}
  public record PrintJobView(Long id, String operationKey, Long saleId, String kind, String mode,
      String status, String errorCode, Instant createdAt) {}
}

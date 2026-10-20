package br.com.sorveteria.platform.database;

import br.com.sorveteria.platform.config.ApplicationProperties;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaReadinessValidator {
    private final JdbcTemplate jdbc;
    private final String expectedVersion;

    public SchemaReadinessValidator(JdbcTemplate jdbc, ApplicationProperties properties) {
        this.jdbc = jdbc;
        this.expectedVersion = properties.installation().expectedSchemaVersion();
    }

    public Result validate() {
        try {
            Integer failed = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM flyway_schema_history WHERE success = 0", Integer.class);
            if (failed != null && failed > 0) { return Result.notReady("SCHEMA_HISTORY_INVALID"); }
            Optional<String> current = jdbc.query(
                    "SELECT version FROM flyway_schema_history WHERE success = 1 AND version IS NOT NULL "
                            + "ORDER BY installed_rank DESC LIMIT 1",
                    result -> result.next() ? Optional.ofNullable(result.getString(1)) : Optional.empty());
            if (current.isEmpty() || !expectedVersion.equals(current.get())) {
                return Result.notReady("SCHEMA_MIGRATION_PENDING");
            }
            return Result.success();
        } catch (RuntimeException exception) {
            return Result.notReady("DATABASE_UNAVAILABLE");
        }
    }

    public record Result(boolean ready, String code) {
        static Result success() { return new Result(true, "READY"); }
        static Result notReady(String code) { return new Result(false, code); }
    }
}


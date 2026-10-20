package br.com.sorveteria.platform.health;

import br.com.sorveteria.platform.database.SchemaReadinessValidator;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApplicationHealthConfiguration {
    private final SchemaReadinessValidator schema;

    public ApplicationHealthConfiguration(SchemaReadinessValidator schema) { this.schema = schema; }

    @GetMapping("/health/live")
    Map<String, String> liveness() { return Map.of("status", "UP"); }

    @GetMapping("/health/ready")
    ResponseEntity<Map<String, String>> readiness() {
        SchemaReadinessValidator.Result result = schema.validate();
        if (result.ready()) { return ResponseEntity.ok(Map.of("status", "UP")); }
        return ResponseEntity.status(503).body(Map.of("status", "OUT_OF_SERVICE"));
    }
}

package br.com.sorveteria.audit.web;

import br.com.sorveteria.access.application.AccessPermissions;
import br.com.sorveteria.audit.application.AuditQueryService;
import br.com.sorveteria.audit.application.AuditQueryService.AuditPage;
import br.com.sorveteria.audit.infrastructure.AuditEventEntity.Outcome;
import java.time.Instant;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/audit-events")
public class AuditController {
  private final AuditQueryService service;

  public AuditController(AuditQueryService service) { this.service = service; }

  @GetMapping
  @PreAuthorize("hasAuthority('" + AccessPermissions.AUDIT_READ + "')")
  AuditPage search(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant occurredFrom,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant occurredTo,
      @RequestParam(required = false) Long actorUserId,
      @RequestParam(required = false) String action,
      @RequestParam(required = false) Outcome outcome,
      @RequestParam(required = false) String cursor,
      @RequestParam(defaultValue = "30") int limit) {
    return service.search(occurredFrom, occurredTo, actorUserId, action, outcome, cursor, limit);
  }
}

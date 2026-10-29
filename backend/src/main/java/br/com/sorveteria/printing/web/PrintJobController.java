package br.com.sorveteria.printing.web;

import br.com.sorveteria.access.application.UserPrincipal;
import br.com.sorveteria.platform.web.ApiException;
import br.com.sorveteria.printing.application.PrintJobService;
import br.com.sorveteria.printing.application.PrintJobService.JobResult;
import br.com.sorveteria.printing.application.PrintJobService.PrintJobView;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sales/{saleId}/print-jobs")
public class PrintJobController {
  private final PrintJobService jobs;
  public PrintJobController(PrintJobService jobs) { this.jobs = jobs; }

  @PostMapping
  ResponseEntity<PrintJobView> prepare(@PathVariable Long saleId,
      @RequestHeader("Idempotency-Key") @Pattern(regexp = "[0-9a-fA-F-]{36}") String operationKey,
      @Valid @RequestBody PrintRequest input, Authentication authentication) {
    JobResult result = jobs.prepare(saleId, operationKey, input.mode(), input.kind(),
        principal(authentication));
    return ResponseEntity.status(result.created() ? HttpStatus.CREATED : HttpStatus.OK)
        .body(result.job());
  }

  @GetMapping
  List<PrintJobView> history(@PathVariable Long saleId) { return jobs.history(saleId); }

  private Long principal(Authentication authentication) {
    if (authentication.getPrincipal() instanceof UserPrincipal principal) {
      return principal.userId();
    }
    throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Autenticação necessária.");
  }

  public record PrintRequest(@NotBlank String mode,
      @Pattern(regexp = "FIRST_COPY|REPRINT") String kind) {}
}

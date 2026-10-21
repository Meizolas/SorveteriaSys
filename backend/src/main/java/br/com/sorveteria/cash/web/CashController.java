package br.com.sorveteria.cash.web;

import br.com.sorveteria.access.application.UserPrincipal;
import br.com.sorveteria.cash.application.CashService;
import br.com.sorveteria.cash.application.CashService.CashView;
import br.com.sorveteria.platform.web.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cash")
public class CashController {
  private final CashService cash;

  public CashController(CashService cash) {
    this.cash = cash;
  }

  @GetMapping("/current")
  ResponseEntity<CashView> current() {
    CashView current = cash.current();
    return current == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(current);
  }

  @PostMapping("/shifts")
  CashView open(@Valid @RequestBody OpenRequest input, Authentication authentication) {
    return cash.open(input.openingAmount(), principal(authentication).userId());
  }

  @PostMapping("/movements")
  CashView move(@Valid @RequestBody MovementRequest input, Authentication authentication) {
    return cash.move(
        input.type(), input.amount(), input.reason(), principal(authentication).userId());
  }

  @PostMapping("/close")
  CashView close(@Valid @RequestBody CloseRequest input, Authentication authentication) {
    return cash.close(input.countedAmount(), input.reason(), principal(authentication).userId());
  }

  private UserPrincipal principal(Authentication authentication) {
    if (authentication.getPrincipal() instanceof UserPrincipal principal) {
      return principal;
    }
    throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Autenticação necessária.");
  }

  public record OpenRequest(
      @DecimalMin("0.00") @Digits(integer = 11, fraction = 2) BigDecimal openingAmount) {}

  public record MovementRequest(
      @NotBlank String type,
      @DecimalMin("0.01") @Digits(integer = 11, fraction = 2) BigDecimal amount,
      @NotBlank @Size(max = 240) String reason) {}

  public record CloseRequest(
      @DecimalMin("0.00") @Digits(integer = 11, fraction = 2) BigDecimal countedAmount,
      @Size(max = 240) String reason) {}
}

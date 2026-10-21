package br.com.sorveteria.sales.web;

import br.com.sorveteria.access.application.UserPrincipal;
import br.com.sorveteria.platform.web.ApiException;
import br.com.sorveteria.sales.application.CheckoutService;
import br.com.sorveteria.sales.application.CheckoutService.CheckoutCommand;
import br.com.sorveteria.sales.application.CheckoutService.CheckoutLine;
import br.com.sorveteria.sales.application.CheckoutService.CheckoutResult;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sales")
public class SalesController {
    private final CheckoutService checkout;
    public SalesController(CheckoutService checkout) { this.checkout = checkout; }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    CheckoutResult create(@RequestHeader("Idempotency-Key") String key,
            @Valid @RequestBody SaleRequest input, Authentication authentication) {
        if (!(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Autenticação necessária.");
        }
        return checkout.checkout(key, new CheckoutCommand(input.items().stream()
                .map(item -> new CheckoutLine(item.productId(), item.quantity())).toList(),
                input.paymentMethod(), input.receivedAmount()), principal.userId());
    }

    public record SaleRequest(@NotEmpty @Size(max = 20) List<@Valid SaleLineRequest> items,
            @NotNull String paymentMethod,
            @Digits(integer = 11, fraction = 2) @DecimalMin("0.00") BigDecimal receivedAmount) { }
    public record SaleLineRequest(@NotNull Long productId,
            @NotNull @DecimalMin("0.001") @Digits(integer = 10, fraction = 3) BigDecimal quantity) { }
}

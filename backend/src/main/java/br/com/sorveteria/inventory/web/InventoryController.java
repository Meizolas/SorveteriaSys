package br.com.sorveteria.inventory.web;

import br.com.sorveteria.access.application.UserPrincipal;
import br.com.sorveteria.inventory.application.InventoryService;
import br.com.sorveteria.inventory.application.InventoryService.MovementData;
import br.com.sorveteria.platform.web.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stock")
public class InventoryController {
    private final InventoryService inventory;
    public InventoryController(InventoryService inventory) { this.inventory = inventory; }

    @PostMapping("/movements") @ResponseStatus(HttpStatus.CREATED)
    MovementData move(@Valid @RequestBody MovementRequest input, Authentication authentication) {
        if (!(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Autenticação necessária.");
        }
        return inventory.move(input.productId(), input.type(), input.quantity(), input.reason(), principal.userId());
    }
    public record MovementRequest(@NotNull Long productId, @NotBlank String type,
            @NotNull @DecimalMin("0.001") @Digits(integer = 10, fraction = 3) BigDecimal quantity,
            @NotBlank @Size(max = 240) String reason) { }
}

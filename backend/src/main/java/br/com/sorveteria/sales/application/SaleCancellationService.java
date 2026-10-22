package br.com.sorveteria.sales.application;

import br.com.sorveteria.cash.application.CashService;
import br.com.sorveteria.inventory.application.InventoryService;
import br.com.sorveteria.platform.web.ApiException;
import br.com.sorveteria.sales.domain.Sale;
import br.com.sorveteria.sales.infrastructure.SaleRepository;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SaleCancellationService {
  private final SaleRepository sales;
  private final InventoryService inventory;
  private final CashService cash;

  public SaleCancellationService(SaleRepository sales, InventoryService inventory, CashService cash) {
    this.sales = sales;
    this.inventory = inventory;
    this.cash = cash;
  }

  @Transactional
  public CancellationResult cancel(Long id, String reason, Long actor) {
    String cleanReason = reason == null ? "" : reason.trim();
    if (cleanReason.isBlank() || cleanReason.length() > 240) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_CANCELLATION_REASON",
          "Informe um motivo de ate 240 caracteres.");
    }
    Sale sale = sales.findByIdForUpdate(id).orElseThrow(() ->
        new ApiException(HttpStatus.NOT_FOUND, "SALE_NOT_FOUND", "Venda nao encontrada."));
    if (!"COMPLETED".equals(sale.getStatus())) {
      throw new ApiException(HttpStatus.CONFLICT, "SALE_ALREADY_CANCELED",
          "Esta venda ja foi cancelada.");
    }
    Instant now = Instant.now();
    cash.recordCancellation(sale.getCashShiftId(), sale.getId(), sale.getPayment().getMethod(),
        sale.getTotal(), actor, now);
    sale.getItems().forEach(item -> inventory.returnFromCancellation(
        item.getProduct(), item.getQuantity(), sale.getCode(), actor, now));
    sale.cancel(cleanReason, actor, now);
    sales.saveAndFlush(sale);
    return new CancellationResult(sale.getId(), sale.getCode(), sale.getStatus(), now, cleanReason);
  }

  public record CancellationResult(
      Long id, String code, String status, Instant canceledAt, String cancellationReason) {}
}

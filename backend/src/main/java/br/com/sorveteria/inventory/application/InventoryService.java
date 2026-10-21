package br.com.sorveteria.inventory.application;

import br.com.sorveteria.catalog.domain.Product;
import br.com.sorveteria.catalog.infrastructure.ProductRepository;
import br.com.sorveteria.inventory.domain.StockBalance;
import br.com.sorveteria.inventory.domain.StockMovement;
import br.com.sorveteria.inventory.infrastructure.StockBalanceRepository;
import br.com.sorveteria.inventory.infrastructure.StockMovementRepository;
import br.com.sorveteria.platform.web.ApiException;
import java.math.BigDecimal;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {
    private final ProductRepository products;
    private final StockBalanceRepository balances;
    private final StockMovementRepository movements;
    public InventoryService(ProductRepository products, StockBalanceRepository balances,
            StockMovementRepository movements) {
        this.products = products; this.balances = balances; this.movements = movements;
    }
    @Transactional
    public MovementData move(Long productId, String type, BigDecimal quantity, String reason, Long actor) {
        if (!type.equals("ENTRY") && !type.equals("ADJUSTMENT_IN") && !type.equals("ADJUSTMENT_OUT")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_MOVEMENT", "Tipo de movimento inválido.");
        }
        if (quantity == null || quantity.signum() <= 0 || quantity.scale() > 3) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_QUANTITY", "Quantidade inválida.");
        }
        Product product = products.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Produto não encontrado."));
        StockBalance balance = balances.findByProductIdForUpdate(productId)
                .orElseGet(() -> balances.saveAndFlush(new StockBalance(product, Instant.now())));
        BigDecimal signed = type.equals("ADJUSTMENT_OUT") ? quantity.negate() : quantity;
        BigDecimal previous;
        try { previous = balance.apply(signed, Instant.now()); }
        catch (IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.CONFLICT, "INSUFFICIENT_STOCK", exception.getMessage());
        }
        BigDecimal resulting = balance.getQuantity();
        StockMovement movement = new StockMovement(product, type, quantity.setScale(3), previous,
                resulting, reason, actor, Instant.now());
        movements.save(movement);
        return new MovementData(productId, type, quantity.setScale(3), previous, resulting, reason);
    }

    public void consumeForSale(Product product, BigDecimal quantity, String saleCode, Long actor, Instant now) {
        if (!product.isTracksStock()) return;
        StockBalance balance = balances.findByProductIdForUpdate(product.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT, "INSUFFICIENT_STOCK",
                        "Produto sem saldo de estoque: " + product.getName()));
        BigDecimal previous;
        try { previous = balance.apply(quantity.negate(), now); }
        catch (IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.CONFLICT, "INSUFFICIENT_STOCK",
                    "Estoque insuficiente para " + product.getName() + ".");
        }
        movements.save(new StockMovement(product, "SALE_OUT", quantity.setScale(3), previous,
                balance.getQuantity(), "Venda " + saleCode, actor, now));
    }
    public record MovementData(Long productId, String type, BigDecimal quantity,
            BigDecimal previousQuantity, BigDecimal resultingQuantity, String reason) { }
}

package br.com.sorveteria.sales.application;

import br.com.sorveteria.catalog.domain.Product;
import br.com.sorveteria.catalog.infrastructure.ProductRepository;
import br.com.sorveteria.inventory.application.InventoryService;
import br.com.sorveteria.platform.web.ApiException;
import br.com.sorveteria.sales.domain.Payment;
import br.com.sorveteria.sales.domain.Sale;
import br.com.sorveteria.sales.domain.SaleItem;
import br.com.sorveteria.sales.infrastructure.SaleRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CheckoutService {
    private static final BigDecimal MAX_QUANTITY = new BigDecimal("9999999999.000");
    private final SaleRepository sales;
    private final ProductRepository products;
    private final InventoryService inventory;

    public CheckoutService(SaleRepository sales, ProductRepository products, InventoryService inventory) {
        this.sales = sales; this.products = products; this.inventory = inventory;
    }

    @Transactional
    public CheckoutResult checkout(String key, CheckoutCommand command, Long operatorId) {
        validateKey(key);
        Map<Long, BigDecimal> quantities = consolidate(command.items());
        String fingerprint = fingerprint(quantities, command.paymentMethod(), command.receivedAmount());
        Sale existing = sales.findByIdempotencyKey(key).orElse(null);
        if (existing != null) {
            if (!existing.getRequestFingerprint().equals(fingerprint)) {
                throw new ApiException(HttpStatus.CONFLICT, "IDEMPOTENCY_CONFLICT",
                        "Esta chave já foi usada com outro conteúdo.");
            }
            return result(existing);
        }

        List<Product> selected = quantities.keySet().stream().map(id -> products.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND",
                        "Produto não encontrado: " + id))).toList();
        for (Product product : selected) {
            if (!product.isActive()) throw new ApiException(HttpStatus.CONFLICT, "PRODUCT_INACTIVE",
                    "Produto inativo: " + product.getName());
        }
        BigDecimal total = selected.stream().map(product -> product.getSalePrice()
                .multiply(quantities.get(product.getId()))).reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
        String method = normalizeMethod(command.paymentMethod());
        BigDecimal received = method.equals("CASH") ? money(command.receivedAmount()) : total;
        if (received.compareTo(total) < 0) throw new ApiException(HttpStatus.BAD_REQUEST,
                "INSUFFICIENT_PAYMENT", "O valor recebido é menor que o total.");
        BigDecimal change = method.equals("CASH") ? received.subtract(total).setScale(2) : BigDecimal.ZERO.setScale(2);
        Instant now = Instant.now();
        Sale sale = sales.saveAndFlush(new Sale(key, fingerprint, operatorId, total, now));
        sale.assignCode();
        for (Product product : selected) {
            BigDecimal quantity = quantities.get(product.getId());
            sale.addItem(new SaleItem(sale, product, quantity));
            inventory.consumeForSale(product, quantity, sale.getCode(), operatorId, now);
        }
        sale.setPayment(new Payment(sale, method, received, total, change, now));
        sales.saveAndFlush(sale);
        return result(sale);
    }

    private Map<Long, BigDecimal> consolidate(List<CheckoutLine> lines) {
        if (lines == null || lines.isEmpty() || lines.size() > 20) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_CART", "O carrinho deve conter de 1 a 20 itens.");
        }
        Map<Long, BigDecimal> result = new LinkedHashMap<>();
        for (CheckoutLine line : lines) {
            if (line.productId() == null || line.quantity() == null || line.quantity().scale() > 3
                    || line.quantity().signum() <= 0 || line.quantity().compareTo(MAX_QUANTITY) > 0
                    || line.quantity().stripTrailingZeros().scale() > 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_QUANTITY", "Quantidade inválida no carrinho.");
            }
            result.merge(line.productId(), line.quantity().setScale(3), BigDecimal::add);
        }
        return result;
    }

    private String normalizeMethod(String value) {
        String method = value == null ? "" : value.trim().toUpperCase();
        if (!List.of("CASH", "PIX", "CARD").contains(method)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PAYMENT", "Forma de pagamento inválida.");
        }
        return method;
    }

    private BigDecimal money(BigDecimal value) {
        if (value == null || value.signum() < 0 || value.scale() > 2) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PAYMENT", "Valor recebido inválido.");
        }
        return value.setScale(2);
    }

    private void validateKey(String key) {
        try { UUID.fromString(key); }
        catch (RuntimeException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_IDEMPOTENCY_KEY", "Chave idempotente inválida.");
        }
    }

    private String fingerprint(Map<Long, BigDecimal> items, String payment, BigDecimal received) {
        String canonical = items.entrySet().stream().sorted(Map.Entry.comparingByKey())
                .map(item -> item.getKey() + ":" + item.getValue().stripTrailingZeros().toPlainString())
                .reduce((left, right) -> left + "|" + right).orElse("") + "|" + normalizeMethod(payment)
                + "|" + (received == null ? "" : received.stripTrailingZeros().toPlainString());
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(canonical.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) { throw new IllegalStateException(exception); }
    }

    private CheckoutResult result(Sale sale) {
        Payment payment = sale.getPayment();
        List<CheckoutItemResult> items = sale.getItems().stream()
                .sorted(Comparator.comparing(SaleItem::getProductName))
                .map(item -> new CheckoutItemResult(item.getProductId(), item.getProductSku(), item.getProductName(),
                        item.getUnitPrice(), item.getQuantity(), item.getLineTotal())).toList();
        return new CheckoutResult(sale.getId(), sale.getCode(), sale.getTotal(), sale.getCreatedAt(), items,
                payment.getMethod(), payment.getReceivedAmount(), payment.getChangeAmount());
    }

    public record CheckoutCommand(List<CheckoutLine> items, String paymentMethod, BigDecimal receivedAmount) { }
    public record CheckoutLine(Long productId, BigDecimal quantity) { }
    public record CheckoutResult(Long id, String code, BigDecimal total, Instant completedAt,
            List<CheckoutItemResult> items, String paymentMethod, BigDecimal receivedAmount, BigDecimal changeAmount) { }
    public record CheckoutItemResult(Long productId, String sku, String name, BigDecimal unitPrice,
            BigDecimal quantity, BigDecimal lineTotal) { }
}

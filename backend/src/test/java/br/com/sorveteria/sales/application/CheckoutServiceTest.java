package br.com.sorveteria.sales.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.sorveteria.cash.application.CashService;
import br.com.sorveteria.catalog.domain.Product;
import br.com.sorveteria.catalog.domain.ProductCategory;
import br.com.sorveteria.catalog.infrastructure.ProductRepository;
import br.com.sorveteria.inventory.application.InventoryService;
import br.com.sorveteria.platform.web.ApiException;
import br.com.sorveteria.sales.domain.Sale;
import br.com.sorveteria.sales.infrastructure.SaleRepository;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;

class CheckoutServiceTest {
  @Test
  void sameIdempotencyKeyReturnsSaleWithoutConsumingStockAgain() {
    SaleRepository sales = mock(SaleRepository.class);
    ProductRepository products = mock(ProductRepository.class);
    InventoryService inventory = mock(InventoryService.class);
    CashService cash = mock(CashService.class);
    Product product = product(10L);
    AtomicReference<Sale> stored = new AtomicReference<>();
    when(sales.findByIdempotencyKey(any())).thenAnswer(call -> Optional.ofNullable(stored.get()));
    when(sales.saveAndFlush(any())).thenAnswer(call -> {
      Sale sale = call.getArgument(0);
      setId(sale, 7L);
      stored.set(sale);
      return sale;
    });
    when(products.findById(10L)).thenReturn(Optional.of(product));
    when(cash.requireOpenShiftId()).thenReturn(3L);
    CheckoutService service = new CheckoutService(sales, products, inventory, cash);
    String key = "5f3c6383-4b96-46d4-8587-11cffbb40111";
    CheckoutService.CheckoutCommand command = new CheckoutService.CheckoutCommand(
        List.of(new CheckoutService.CheckoutLine(10L, BigDecimal.ONE)),
        "CASH", new BigDecimal("20.00"));

    CheckoutService.CheckoutResult first = service.checkout(key, command, 1L);
    CheckoutService.CheckoutResult repeated = service.checkout(key, command, 1L);

    assertThat(first.id()).isEqualTo(7L);
    assertThat(first.code()).isEqualTo("V000007");
    assertThat(first.total()).isEqualByComparingTo("12.50");
    assertThat(first.changeAmount()).isEqualByComparingTo("7.50");
    assertThat(repeated).isEqualTo(first);
    verify(inventory, times(1)).consumeForSale(any(), any(), any(), any(), any());
    verify(cash, times(1)).recordSale(3L, 7L, "CASH", new BigDecimal("12.50"), 1L, first.completedAt());
  }

  @Test
  void rejectsReusingKeyWithDifferentRequest() {
    SaleRepository sales = mock(SaleRepository.class);
    Sale existing = new Sale(
        "5f3c6383-4b96-46d4-8587-11cffbb40111", "different", 1L, 3L,
        new BigDecimal("12.50"), Instant.now());
    when(sales.findByIdempotencyKey(any())).thenReturn(Optional.of(existing));
    CheckoutService service = new CheckoutService(
        sales, mock(ProductRepository.class), mock(InventoryService.class), mock(CashService.class));
    CheckoutService.CheckoutCommand command = new CheckoutService.CheckoutCommand(
        List.of(new CheckoutService.CheckoutLine(10L, BigDecimal.ONE)), "PIX", null);

    assertThatThrownBy(() -> service.checkout(existing.getIdempotencyKey(), command, 1L))
        .isInstanceOfSatisfying(ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("IDEMPOTENCY_CONFLICT"));
  }

  private static Product product(Long id) {
    ProductCategory category = new ProductCategory("Cascões", Instant.now());
    setId(category, 1L);
    Product product = new Product(category, "Cascão especial", "CAS-001",
        new BigDecimal("12.50"), true, new BigDecimal("3.000"), Instant.now());
    setId(product, id);
    return product;
  }

  private static void setId(Object target, Long id) {
    try {
      Field field = target.getClass().getDeclaredField("id");
      field.setAccessible(true);
      field.set(target, id);
    } catch (ReflectiveOperationException exception) {
      throw new IllegalStateException(exception);
    }
  }
}

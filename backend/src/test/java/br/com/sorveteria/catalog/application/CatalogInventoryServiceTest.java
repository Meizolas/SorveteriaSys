package br.com.sorveteria.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.sorveteria.catalog.domain.Product;
import br.com.sorveteria.catalog.domain.ProductCategory;
import br.com.sorveteria.catalog.infrastructure.ProductCategoryRepository;
import br.com.sorveteria.catalog.infrastructure.ProductRepository;
import br.com.sorveteria.inventory.application.InventoryService;
import br.com.sorveteria.inventory.domain.StockBalance;
import br.com.sorveteria.inventory.infrastructure.StockBalanceRepository;
import br.com.sorveteria.inventory.infrastructure.StockMovementRepository;
import br.com.sorveteria.platform.web.ApiException;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class CatalogInventoryServiceTest {
  @Test
  void createsProductWithNormalizedSkuAndZeroBalance() {
    ProductCategoryRepository categories = mock(ProductCategoryRepository.class);
    ProductRepository products = mock(ProductRepository.class);
    StockBalanceRepository balances = mock(StockBalanceRepository.class);
    ProductCategory category = new ProductCategory("Potes", Instant.now());
    setId(category, 2L);
    when(categories.findById(2L)).thenReturn(Optional.of(category));
    when(products.save(any())).thenAnswer(call -> {
      Product product = call.getArgument(0);
      setId(product, 9L);
      return product;
    });
    CatalogService service = new CatalogService(categories, products, balances);

    CatalogService.ProductData created = service.createProduct(
        2L, "Pote 500 ml", " pote-500 ", new BigDecimal("25.00"), true,
        new BigDecimal("2.000"));

    assertThat(created.id()).isEqualTo(9L);
    assertThat(created.sku()).isEqualTo("POTE-500");
    assertThat(created.stock()).isEqualByComparingTo("0.000");
    verify(balances).save(any(StockBalance.class));
  }

  @Test
  void appliesEntriesAndPreventsNegativeStock() {
    ProductRepository products = mock(ProductRepository.class);
    StockBalanceRepository balances = mock(StockBalanceRepository.class);
    StockMovementRepository movements = mock(StockMovementRepository.class);
    Product product = product(9L);
    StockBalance balance = new StockBalance(product, Instant.now());
    when(products.findById(9L)).thenReturn(Optional.of(product));
    when(balances.findByProductIdForUpdate(9L)).thenReturn(Optional.of(balance));
    InventoryService service = new InventoryService(products, balances, movements);

    InventoryService.MovementData entry = service.move(
        9L, "ENTRY", new BigDecimal("5.000"), "Compra", 1L);

    assertThat(entry.previousQuantity()).isEqualByComparingTo("0.000");
    assertThat(entry.resultingQuantity()).isEqualByComparingTo("5.000");
    assertThatThrownBy(() -> service.move(
        9L, "ADJUSTMENT_OUT", new BigDecimal("6.000"), "Contagem", 1L))
        .isInstanceOfSatisfying(ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("INSUFFICIENT_STOCK"));
  }

  private static Product product(Long id) {
    ProductCategory category = new ProductCategory("Potes", Instant.now());
    setId(category, 2L);
    Product product = new Product(category, "Pote 500 ml", "POTE-500",
        new BigDecimal("25.00"), true, BigDecimal.ZERO.setScale(3), Instant.now());
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

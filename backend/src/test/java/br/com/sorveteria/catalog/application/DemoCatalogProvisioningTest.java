package br.com.sorveteria.catalog.application;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashSet;
import org.junit.jupiter.api.Test;

class DemoCatalogProvisioningTest {
  @Test
  void providesACompleteAndConsistentDemoCatalog() {
    var categories = DemoCatalogProvisioning.demoCategories();
    var products = DemoCatalogProvisioning.demoProducts();

    assertThat(categories).hasSize(6).doesNotHaveDuplicates();
    assertThat(products).hasSize(17);
    assertThat(products).extracting(DemoCatalogProvisioning.DemoProduct::sku).doesNotHaveDuplicates();
    assertThat(products)
        .allSatisfy(
            product -> {
              assertThat(categories).contains(product.category());
              assertThat(product.price()).isPositive();
              assertThat(product.initialStock()).isNotNegative();
              assertThat(product.minimumStock()).isNotNegative();
            });
    assertThat(products)
        .anySatisfy(
            product ->
                assertThat(product.initialStock()).isLessThanOrEqualTo(product.minimumStock()));
    assertThat(new HashSet<>(products.stream().map(p -> p.name()).toList()))
        .hasSameSizeAs(products);
  }
}

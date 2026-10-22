package br.com.sorveteria.catalog.web;

import br.com.sorveteria.catalog.application.CatalogService;
import br.com.sorveteria.catalog.application.CatalogService.CategoryData;
import br.com.sorveteria.catalog.application.CatalogService.ProductData;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {
    private final CatalogService catalog;
    public CatalogController(CatalogService catalog) { this.catalog = catalog; }

    @GetMapping("/categories")
    List<CategoryData> categories() { return catalog.categories(); }

    @PostMapping("/categories") @ResponseStatus(HttpStatus.CREATED)
    CategoryData createCategory(@Valid @RequestBody CategoryRequest input) {
        return catalog.createCategory(input.name());
    }

    @PatchMapping("/categories/{id}")
    CategoryData updateCategory(@PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest input) {
        return catalog.updateCategory(id, input.name(), input.active());
    }

    @GetMapping("/products")
    List<ProductData> products() { return catalog.products(); }

    @PostMapping("/products") @ResponseStatus(HttpStatus.CREATED)
    ProductData createProduct(@Valid @RequestBody ProductRequest input) {
        return catalog.createProduct(input.categoryId(), input.name(), input.sku(), input.price(),
                input.tracksStock(), input.minimumStock());
    }

    @PatchMapping("/products/{id}")
    ProductData updateProduct(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest input) {
        return catalog.updateProduct(id, input.categoryId(), input.name(), input.price(), input.active(),
                input.tracksStock(), input.minimumStock());
    }

    public record CategoryRequest(@NotBlank @Size(max = 80) String name) { }
    public record CategoryUpdateRequest(@NotBlank @Size(max = 80) String name,
            boolean active) { }
    public record ProductRequest(@NotNull Long categoryId, @NotBlank @Size(max = 120) String name,
            @NotBlank @Size(max = 40) String sku,
            @NotNull @DecimalMin("0.00") @Digits(integer = 11, fraction = 2) BigDecimal price,
            boolean tracksStock,
            @NotNull @DecimalMin("0.000") @Digits(integer = 10, fraction = 3) BigDecimal minimumStock) { }
    public record ProductUpdateRequest(@NotNull Long categoryId, @NotBlank @Size(max = 120) String name,
            @NotNull @DecimalMin("0.00") @Digits(integer = 11, fraction = 2) BigDecimal price,
            boolean active, boolean tracksStock,
            @NotNull @DecimalMin("0.000") @Digits(integer = 10, fraction = 3) BigDecimal minimumStock) { }
}

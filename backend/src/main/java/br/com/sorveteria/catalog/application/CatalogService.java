package br.com.sorveteria.catalog.application;

import br.com.sorveteria.catalog.domain.Product;
import br.com.sorveteria.catalog.domain.ProductCategory;
import br.com.sorveteria.catalog.infrastructure.ProductCategoryRepository;
import br.com.sorveteria.catalog.infrastructure.ProductRepository;
import br.com.sorveteria.inventory.domain.StockBalance;
import br.com.sorveteria.inventory.infrastructure.StockBalanceRepository;
import br.com.sorveteria.platform.web.ApiException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {
    private final ProductCategoryRepository categories;
    private final ProductRepository products;
    private final StockBalanceRepository balances;
    public CatalogService(ProductCategoryRepository categories, ProductRepository products,
            StockBalanceRepository balances) {
        this.categories = categories; this.products = products; this.balances = balances;
    }
    @Transactional(readOnly = true)
    public List<CategoryData> categories() {
        return categories.findAllByOrderByNameAsc().stream()
                .map(item -> new CategoryData(item.getId(), item.getName(), item.isActive())).toList();
    }
    @Transactional
    public CategoryData createCategory(String name) {
        String clean = name.trim();
        if (categories.existsByNameIgnoreCase(clean)) throw conflict("Categoria já cadastrada.");
        ProductCategory saved = categories.save(new ProductCategory(clean, Instant.now()));
        return new CategoryData(saved.getId(), saved.getName(), saved.isActive());
    }
    @Transactional(readOnly = true)
    public List<ProductData> products() {
        return products.findAllByOrderByNameAsc().stream().map(this::view).toList();
    }
    @Transactional
    public ProductData createProduct(Long categoryId, String name, String sku, BigDecimal price,
            boolean tracksStock, BigDecimal minimum) {
        validateMoney(price, minimum);
        String normalizedSku = sku.trim().toUpperCase();
        if (products.existsBySku(normalizedSku)) throw conflict("Código de produto já cadastrado.");
        ProductCategory category = categories.findById(categoryId)
                .orElseThrow(() -> notFound("Categoria não encontrada."));
        Product saved = products.save(new Product(category, name, normalizedSku, price.setScale(2),
                tracksStock, minimum.setScale(3), Instant.now()));
        balances.save(new StockBalance(saved, Instant.now()));
        return view(saved);
    }
    @Transactional
    public ProductData updateProduct(Long id, Long categoryId, String name, BigDecimal price,
            boolean active, boolean tracksStock, BigDecimal minimum) {
        validateMoney(price, minimum);
        Product product = products.findById(id).orElseThrow(() -> notFound("Produto não encontrado."));
        ProductCategory category = categories.findById(categoryId)
                .orElseThrow(() -> notFound("Categoria não encontrada."));
        product.update(category, name, price.setScale(2), active, tracksStock, minimum.setScale(3), Instant.now());
        return view(product);
    }
    private ProductData view(Product product) {
        BigDecimal quantity = balances.findById(product.getId()).map(StockBalance::getQuantity)
                .orElse(BigDecimal.ZERO.setScale(3));
        return new ProductData(product.getId(), product.getName(), product.getSku(),
                product.getCategory().getId(), product.getCategory().getName(), product.getSalePrice(),
                product.getUnit(), product.isActive(), product.isTracksStock(), product.getMinimumStock(),
                quantity, product.getVersion());
    }
    private void validateMoney(BigDecimal price, BigDecimal minimum) {
        if (price == null || price.signum() < 0 || price.scale() > 2) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PRICE", "Preço inválido.");
        }
        if (minimum == null || minimum.signum() < 0 || minimum.scale() > 3) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_QUANTITY", "Estoque mínimo inválido.");
        }
        price.setScale(2, RoundingMode.UNNECESSARY); minimum.setScale(3, RoundingMode.UNNECESSARY);
    }
    private ApiException conflict(String message) { return new ApiException(HttpStatus.CONFLICT, "CONFLICT", message); }
    private ApiException notFound(String message) { return new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", message); }
    public record CategoryData(Long id, String name, boolean active) { }
    public record ProductData(Long id, String name, String sku, Long categoryId, String category,
            BigDecimal price, String unit, boolean active, boolean tracksStock,
            BigDecimal minimumStock, BigDecimal stock, long version) { }
}

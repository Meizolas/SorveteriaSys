package br.com.sorveteria.catalog.infrastructure;

import br.com.sorveteria.catalog.domain.Product;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @EntityGraph(attributePaths = "category")
    List<Product> findAllByOrderByNameAsc();
    boolean existsBySku(String sku);
}

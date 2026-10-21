package br.com.sorveteria.sales.infrastructure;

import br.com.sorveteria.sales.domain.Sale;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    @EntityGraph(attributePaths = {"items", "items.product", "payment"})
    Optional<Sale> findByIdempotencyKey(String idempotencyKey);
}

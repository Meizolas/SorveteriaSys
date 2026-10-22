package br.com.sorveteria.sales.infrastructure;

import br.com.sorveteria.sales.domain.Sale;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface SaleRepository extends JpaRepository<Sale, Long> {
  @EntityGraph(attributePaths = {"items", "items.product", "payment"})
  Optional<Sale> findByIdempotencyKey(String idempotencyKey);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @EntityGraph(attributePaths = {"items", "items.product", "payment"})
  @Query("select sale from Sale sale where sale.id = :id")
  Optional<Sale> findByIdForUpdate(@Param("id") Long id);

  @Query("select coalesce(sum(sale.total), 0) from Sale sale where sale.cashShiftId = :shiftId and sale.status = 'COMPLETED'")
  BigDecimal sumTotalByCashShiftId(@Param("shiftId") Long shiftId);
}

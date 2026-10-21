package br.com.sorveteria.inventory.infrastructure;

import br.com.sorveteria.inventory.domain.StockBalance;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockBalanceRepository extends JpaRepository<StockBalance, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from StockBalance b where b.productId = :productId")
    Optional<StockBalance> findByProductIdForUpdate(@Param("productId") Long productId);
}

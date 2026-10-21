package br.com.sorveteria.cash.infrastructure;

import br.com.sorveteria.cash.domain.CashShift;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface CashShiftRepository extends JpaRepository<CashShift, Long> {
  Optional<CashShift> findFirstByStatusOrderByIdDesc(String status);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select shift from CashShift shift where shift.status = 'OPEN'")
  Optional<CashShift> lockOpen();
}

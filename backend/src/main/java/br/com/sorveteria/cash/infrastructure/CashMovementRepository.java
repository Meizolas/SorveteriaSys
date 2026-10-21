package br.com.sorveteria.cash.infrastructure;

import br.com.sorveteria.cash.domain.CashMovement;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CashMovementRepository extends JpaRepository<CashMovement, Long> {
  List<CashMovement> findByShiftIdOrderByCreatedAtDescIdDesc(Long shiftId);

  @Query(
      "select coalesce(sum(m.amount), 0) from CashMovement m where m.shift.id = :shiftId and"
          + " m.movementType = :type")
  BigDecimal sumByShiftAndType(@Param("shiftId") Long shiftId, @Param("type") String type);
}

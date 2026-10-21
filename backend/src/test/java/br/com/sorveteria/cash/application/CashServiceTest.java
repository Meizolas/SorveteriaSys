package br.com.sorveteria.cash.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.sorveteria.cash.domain.CashShift;
import br.com.sorveteria.cash.infrastructure.CashMovementRepository;
import br.com.sorveteria.cash.infrastructure.CashShiftRepository;
import br.com.sorveteria.platform.web.ApiException;
import br.com.sorveteria.sales.infrastructure.SaleRepository;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CashServiceTest {
  private CashShiftRepository shifts;
  private CashMovementRepository movements;
  private SaleRepository sales;
  private CashService service;

  @BeforeEach
  void setUp() {
    shifts = mock(CashShiftRepository.class);
    movements = mock(CashMovementRepository.class);
    sales = mock(SaleRepository.class);
    service = new CashService(shifts, movements, sales);
    when(movements.sumByShiftAndType(any(), any())).thenReturn(BigDecimal.ZERO);
    when(movements.findByShiftIdOrderByCreatedAtDescIdDesc(any())).thenReturn(List.of());
    when(sales.sumTotalByCashShiftId(any())).thenReturn(BigDecimal.ZERO);
  }

  @Test
  void opensOneShiftAndCreatesOpeningMovement() {
    when(shifts.lockOpen()).thenReturn(Optional.empty());
    when(shifts.saveAndFlush(any())).thenAnswer(call -> {
      CashShift shift = call.getArgument(0);
      setId(shift, 4L);
      return shift;
    });

    CashService.CashView result = service.open(new BigDecimal("100.00"), 1L);

    assertThat(result.id()).isEqualTo(4L);
    assertThat(result.code()).isEqualTo("CX000004");
    assertThat(result.expectedAmount()).isEqualByComparingTo("100.00");
    verify(movements).save(any());
  }

  @Test
  void requiresReasonWhenClosingWithDifference() {
    CashShift shift = new CashShift(1L, new BigDecimal("100.00"), Instant.now());
    setId(shift, 4L);
    shift.assignCode();
    when(shifts.lockOpen()).thenReturn(Optional.of(shift));
    when(shifts.findById(4L)).thenReturn(Optional.of(shift));

    assertThatThrownBy(() -> service.close(new BigDecimal("90.00"), null, 1L))
        .isInstanceOfSatisfying(ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("CLOSING_REASON_REQUIRED"));
    assertThat(shift.getStatus()).isEqualTo("OPEN");
  }

  @Test
  void rejectsWithdrawalAboveExpectedBalance() {
    CashShift shift = new CashShift(1L, new BigDecimal("100.00"), Instant.now());
    setId(shift, 4L);
    when(shifts.lockOpen()).thenReturn(Optional.of(shift));
    when(shifts.findById(4L)).thenReturn(Optional.of(shift));

    assertThatThrownBy(() -> service.move(
        "WITHDRAWAL", new BigDecimal("101.00"), "Retirada", 1L))
        .isInstanceOfSatisfying(ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("CASH_SHIFT_CONFLICT"));
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

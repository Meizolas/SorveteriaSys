package br.com.sorveteria.cash.application;

import br.com.sorveteria.cash.domain.CashMovement;
import br.com.sorveteria.cash.domain.CashShift;
import br.com.sorveteria.cash.infrastructure.CashMovementRepository;
import br.com.sorveteria.cash.infrastructure.CashShiftRepository;
import br.com.sorveteria.platform.web.ApiException;
import br.com.sorveteria.sales.infrastructure.SaleRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CashService {
  private final CashShiftRepository shifts;
  private final CashMovementRepository movements;
  private final SaleRepository sales;

  public CashService(
      CashShiftRepository shifts, CashMovementRepository movements, SaleRepository sales) {
    this.shifts = shifts;
    this.movements = movements;
    this.sales = sales;
  }

  @Transactional(readOnly = true)
  public CashView current() {
    return shifts.findFirstByStatusOrderByIdDesc("OPEN").map(this::view).orElse(null);
  }

  @Transactional
  public CashView open(BigDecimal openingAmount, Long operatorId) {
    money(openingAmount, "Saldo inicial inválido.");
    if (shifts.lockOpen().isPresent()) {
      throw conflict("Já existe um caixa aberto.");
    }
    Instant now = Instant.now();
    try {
      CashShift shift =
          shifts.saveAndFlush(new CashShift(operatorId, openingAmount.setScale(2), now));
      shift.assignCode();
      movements.save(
          new CashMovement(
              shift,
              "OPENING",
              openingAmount.setScale(2),
              "Abertura do caixa",
              null,
              operatorId,
              now));
      shifts.saveAndFlush(shift);
      return view(shift);
    } catch (DataIntegrityViolationException exception) {
      throw conflict("Já existe um caixa aberto.");
    }
  }

  @Transactional
  public CashView move(String type, BigDecimal amount, String reason, Long operatorId) {
    CashShift shift = openLocked();
    String normalized = type == null ? "" : type.trim().toUpperCase();
    if (!List.of("SUPPLY", "WITHDRAWAL").contains(normalized)) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "INVALID_CASH_MOVEMENT", "Tipo de movimento inválido.");
    }
    money(amount, "Valor do movimento inválido.");
    if (amount.signum() == 0) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "INVALID_CASH_MOVEMENT", "O valor deve ser maior que zero.");
    }
    String cleanReason = requiredReason(reason);
    if (normalized.equals("WITHDRAWAL") && amount.compareTo(expected(shift.getId())) > 0) {
      throw conflict("A sangria não pode superar o saldo esperado.");
    }
    movements.save(
        new CashMovement(
            shift, normalized, amount.setScale(2), cleanReason, null, operatorId, Instant.now()));
    return view(shift);
  }

  @Transactional
  public CashView close(BigDecimal countedAmount, String reason, Long operatorId) {
    CashShift shift = openLocked();
    money(countedAmount, "Valor contado inválido.");
    BigDecimal difference = countedAmount.setScale(2).subtract(expected(shift.getId())).setScale(2);
    String cleanReason = reason == null ? "" : reason.trim();
    if (difference.signum() != 0 && cleanReason.isBlank()) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "CLOSING_REASON_REQUIRED",
          "Informe uma justificativa para a diferença do caixa.");
    }
    if (cleanReason.length() > 240) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "INVALID_CLOSING_REASON", "Justificativa muito longa.");
    }
    shift.close(
        countedAmount.setScale(2),
        difference,
        cleanReason.isBlank() ? null : cleanReason,
        Instant.now());
    shifts.saveAndFlush(shift);
    return view(shift);
  }

  @Transactional
  public Long requireOpenShiftId() {
    return openLocked().getId();
  }

  @Transactional
  public void recordSale(
      Long shiftId,
      Long saleId,
      String paymentMethod,
      BigDecimal amount,
      Long operatorId,
      Instant at) {
    CashShift shift = openLocked();
    if (!shift.getId().equals(shiftId)) {
      throw conflict("O turno do caixa foi alterado. Refaça a venda.");
    }
    if ("CASH".equals(paymentMethod)) {
      movements.save(
          new CashMovement(
              shift,
              "CASH_SALE",
              amount.setScale(2),
              "Recebimento da venda",
              saleId,
              operatorId,
              at));
    }
  }

  public void recordCancellation(Long shiftId, Long saleId, String paymentMethod,
      BigDecimal amount, Long operatorId, Instant at) {
    if (!"CASH".equals(paymentMethod)) {
      return;
    }
    CashShift shift = openLocked();
    if (!shift.getId().equals(shiftId)) {
      throw conflict("Para cancelar uma venda em dinheiro, o turno original precisa estar aberto.");
    }
    movements.save(new CashMovement(shift, "CASH_REFUND", amount.setScale(2),
        "Cancelamento da venda", saleId, operatorId, at));
  }

  private CashShift openLocked() {
    return shifts.lockOpen().orElseThrow(() -> conflict("Abra o caixa antes de continuar."));
  }

  private CashView view(CashShift shift) {
    BigDecimal cashSales = sum(shift.getId(), "CASH_SALE");
    BigDecimal supplies = sum(shift.getId(), "SUPPLY");
    BigDecimal withdrawals = sum(shift.getId(), "WITHDRAWAL");
    BigDecimal refunds = sum(shift.getId(), "CASH_REFUND");
    BigDecimal expectedAmount =
        shift.getOpeningAmount().add(cashSales).add(supplies).subtract(withdrawals).subtract(refunds).setScale(2);
    BigDecimal salesTotal =
        sales.sumTotalByCashShiftId(shift.getId()).setScale(2, RoundingMode.HALF_UP);
    List<MovementView> entries =
        movements.findByShiftIdOrderByCreatedAtDescIdDesc(shift.getId()).stream()
            .map(
                item ->
                    new MovementView(
                        item.getId(),
                        item.getMovementType(),
                        item.getAmount(),
                        item.getReason(),
                        item.getSaleId(),
                        item.getCreatedAt()))
            .toList();
    return new CashView(
        shift.getId(),
        shift.getCode(),
        shift.getStatus(),
        shift.getOperatorUserId(),
        shift.getOpeningAmount(),
        salesTotal,
        cashSales,
        supplies,
        withdrawals,
        refunds,
        expectedAmount,
        shift.getCountedAmount(),
        shift.getDifferenceAmount(),
        shift.getClosingReason(),
        shift.getOpenedAt(),
        shift.getClosedAt(),
        entries);
  }

  private BigDecimal expected(Long shiftId) {
    CashShift shift = shifts.findById(shiftId).orElseThrow();
    return shift
        .getOpeningAmount()
        .add(sum(shiftId, "CASH_SALE"))
        .add(sum(shiftId, "SUPPLY"))
        .subtract(sum(shiftId, "WITHDRAWAL"))
        .subtract(sum(shiftId, "CASH_REFUND"))
        .setScale(2);
  }

  private BigDecimal sum(Long shiftId, String type) {
    return movements.sumByShiftAndType(shiftId, type).setScale(2, RoundingMode.HALF_UP);
  }

  private void money(BigDecimal value, String message) {
    if (value == null || value.signum() < 0 || value.scale() > 2) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_CASH_AMOUNT", message);
    }
  }

  private String requiredReason(String value) {
    String reason = value == null ? "" : value.trim();
    if (reason.isBlank() || reason.length() > 240) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_CASH_REASON",
          "Informe um motivo de até 240 caracteres.");
    }
    return reason;
  }

  private ApiException conflict(String message) {
    return new ApiException(HttpStatus.CONFLICT, "CASH_SHIFT_CONFLICT", message);
  }

  public record CashView(
      Long id,
      String code,
      String status,
      Long operatorUserId,
      BigDecimal openingAmount,
      BigDecimal salesTotal,
      BigDecimal cashSales,
      BigDecimal supplies,
      BigDecimal withdrawals,
      BigDecimal refunds,
      BigDecimal expectedAmount,
      BigDecimal countedAmount,
      BigDecimal differenceAmount,
      String closingReason,
      Instant openedAt,
      Instant closedAt,
      List<MovementView> movements) {}

  public record MovementView(
      Long id, String type, BigDecimal amount, String reason, Long saleId, Instant createdAt) {}
}

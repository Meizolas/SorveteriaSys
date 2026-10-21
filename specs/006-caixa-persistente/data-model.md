# Data Model: Caixa persistente

## CashShift

- `id`, `code`, `operatorUserId`, `status`
- `openingAmount`, `countedAmount`, `differenceAmount`, `closingReason`
- `openedAt`, `closedAt`, `version`
- Transição: `OPEN -> CLOSED`; não reabre nesta etapa.

## CashMovement

- `id`, `cashShiftId`, `type`, `amount`, `reason`, `saleId`, `actorUserId`, `createdAt`
- Tipos: `OPENING`, `SUPPLY`, `WITHDRAWAL`, `CASH_SALE`.
- Valores são positivos; o tipo determina entrada ou saída.
- `saleId` é único quando informado para impedir duplicação do recebimento.

## Sale

- Novo `cashShiftId` obrigatório para vendas criadas após a migração.
- Relação muitas vendas para um turno.

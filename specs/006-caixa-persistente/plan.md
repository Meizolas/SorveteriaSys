# Implementation Plan: Caixa persistente

## Technical Context

- Java 21, Spring Boot, Spring Data JPA, MySQL 8.4 e Flyway no backend.
- React, TypeScript, Material UI e cliente HTTP existente no frontend.
- Nova migração V5; valores `DECIMAL(13,2)`/`BigDecimal`; instantes UTC.
- Bloqueio pessimista do turno aberto e constraint de unicidade para impedir duas aberturas.

## Constitution Check

- Escopo interno e monólito modular: aprovado.
- Dinheiro e histórico: movimentos imutáveis, valores decimais e totais calculados no servidor.
- Atomicidade e concorrência: venda, vínculo com turno e movimento em dinheiro na mesma transação; turno bloqueado nas escritas.
- Permissões e auditoria: ator registrado em turno e movimento; permissões refinadas ficam para a etapa de segurança solicitada posteriormente.
- Testes: build, Checkstyle, frontend e cenário integrado com MySQL/Docker.
- Operação offline local: sem dependências externas.

## Design

- Módulo `cash` proprietário de `CashShift` e `CashMovement`.
- `CashService` coordena abertura, movimentos, consulta, fechamento e recebimento de venda.
- `CheckoutService` exige turno aberto antes de persistir e chama o contrato interno do caixa.
- A tabela `sale` guarda `cash_shift_id` para reconciliação.

## Structure

- `backend/src/main/java/br/com/sorveteria/cash/`
- `backend/src/main/resources/db/migration/V5__create_cash_shifts.sql`
- `frontend/src/features/cash/CashPage.tsx`
- `frontend/src/shared/api/operationsApi.ts`

# Tasks: Caixa persistente

## Phase 1: Foundation

- [X] T001 Criar migração V5 em backend/src/main/resources/db/migration/V5__create_cash_shifts.sql
- [X] T002 Criar entidades e repositórios em backend/src/main/java/br/com/sorveteria/cash/

## Phase 2: User Story 1

- [X] T003 [US1] Implementar abertura e consulta em backend/src/main/java/br/com/sorveteria/cash/application/CashService.java
- [X] T004 [US1] Expor API do caixa em backend/src/main/java/br/com/sorveteria/cash/web/CashController.java

## Phase 3: User Story 2

- [X] T005 [US2] Implementar suprimento e sangria em backend/src/main/java/br/com/sorveteria/cash/application/CashService.java
- [X] T006 [US2] Vincular checkout e recebimento ao turno em backend/src/main/java/br/com/sorveteria/sales/application/CheckoutService.java

## Phase 4: User Story 3

- [X] T007 [US3] Implementar fechamento conciliado em backend/src/main/java/br/com/sorveteria/cash/application/CashService.java
- [X] T008 [US3] Integrar tela real em frontend/src/features/cash/CashPage.tsx e frontend/src/shared/api/operationsApi.ts

## Phase 5: Validation

- [X] T009 Validar backend, frontend, Docker e fluxo integrado de caixa

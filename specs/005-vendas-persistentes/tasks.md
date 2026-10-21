# Tasks: Vendas persistentes

## Phase 1: Foundation

- [X] T001 Criar migração de vendas em backend/src/main/resources/db/migration/V4__create_sales.sql
- [X] T002 Criar entidades e repositórios em backend/src/main/java/br/com/sorveteria/sales/

## Phase 2: User Story 1

- [X] T003 [US1] Implementar baixa de estoque originada por venda em backend/src/main/java/br/com/sorveteria/inventory/application/InventoryService.java
- [X] T004 [US1] Implementar checkout transacional em backend/src/main/java/br/com/sorveteria/sales/application/CheckoutService.java
- [X] T005 [US1] Expor POST /api/v1/sales em backend/src/main/java/br/com/sorveteria/sales/web/SalesController.java
- [X] T006 [US1] Integrar catálogo e checkout reais em frontend/src/shared/api/operationsApi.ts e frontend/src/features/pos/PosPage.tsx
- [X] T007 [US1] Adaptar comprovante à resposta persistida em frontend/src/features/pos/SaleCompletionDialog.tsx

## Phase 3: User Story 2

- [X] T008 [US2] Implementar chave e fingerprint idempotentes em backend/src/main/java/br/com/sorveteria/sales/application/CheckoutService.java
- [X] T009 [US2] Cobrir cálculos no frontend e validar repetição idempotente no ambiente integrado

## Phase 4: Validation

- [X] T010 Executar validações backend/frontend, reconstruir Docker e testar venda persistida


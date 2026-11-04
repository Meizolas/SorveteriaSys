# Tasks: Venda por peso no PDV

## Phase 1: Setup e fundação

- [X] T001 Criar migração de unidades em backend/src/main/resources/db/migration/V9__allow_weighted_products.sql
- [X] T002 Atualizar contrato de catálogo em specs/010-venda-por-peso/contracts/openapi.yaml

## Phase 2: User Story 1 - Venda por quilograma

- [X] T003 [US1] Permitir unidade UNIT/KG no domínio em backend/src/main/java/br/com/sorveteria/catalog/
- [X] T004 [US1] Validar quantidade por unidade no checkout em backend/src/main/java/br/com/sorveteria/sales/application/CheckoutService.java
- [X] T005 [US1] Cobrir produto KG e quantidade fracionada em backend/src/test/java/br/com/sorveteria/
- [X] T006 [US1] Expor unidade no cadastro em frontend/src/features/catalog/ProductsPage.tsx
- [X] T007 [US1] Implementar diálogo de pesagem e carrinho decimal em frontend/src/features/pos/PosPage.tsx
- [X] T008 [US1] Exibir unidade e peso no comprovante em frontend/src/features/pos/SaleCompletionDialog.tsx

## Phase 3: User Story 2 - Estado do equipamento

- [X] T009 [US2] Identificar modo simulado e dados bruto/tara/líquido em frontend/src/features/pos/PosPage.tsx

## Phase 4: Polish

- [X] T010 Validar backend, frontend, OpenAPI, migração e Docker conforme specs/010-venda-por-peso/quickstart.md

## Dependencies & Execution Order

T001 → T003/T004 → T005 → T006/T007/T008/T009 → T010.

## Implementation Strategy

Entregar primeiro cálculo e validação de peso com simulação honesta; conector físico será um adaptador posterior dependente do modelo da balança.

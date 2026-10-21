# Tasks: Operação de Balcão MVP

## Phase 1: Setup

- [X] T001 Criar estrutura dos módulos do frontend em frontend/src/features/ e do backend em backend/src/main/java/br/com/sorveteria/
- [X] T002 [P] Atualizar tema visual e tokens de ERP em frontend/src/app/theme.ts
- [X] T003 [P] Criar migração de catálogo e estoque em backend/src/main/resources/db/migration/V3__create_catalog_inventory.sql

## Phase 2: Foundational

- [X] T004 Criar shell responsivo e navegação em frontend/src/app/AppShell.tsx
- [X] T005 [P] Criar componentes compartilhados de página em frontend/src/shared/ui/
- [X] T006 [P] Criar tipos e cliente das APIs do MVP em frontend/src/shared/api/operationsApi.ts
- [X] T007 Configurar rotas autenticadas dos cinco módulos em frontend/src/app/router.tsx

## Phase 3: User Story 1 - Registrar venda

**Independent Test**: abrir caixa, incluir produtos e concluir venda em dinheiro, validando troco e baixa de estoque.

- [X] T008 [P] [US1] Criar entidades de venda e pagamento em backend/src/main/java/br/com/sorveteria/sales/
- [X] T009 [P] [US1] Criar testes transacionais e idempotentes em backend/src/test/java/br/com/sorveteria/sales/
- [X] T010 [US1] Implementar finalização transacional em backend/src/main/java/br/com/sorveteria/sales/application/CheckoutService.java
- [X] T011 [US1] Expor endpoints de venda em backend/src/main/java/br/com/sorveteria/sales/web/SalesController.java
- [X] T012 [US1] Implementar tela de PDV e carrinho em frontend/src/features/pos/PosPage.tsx
- [X] T013 [US1] Integrar finalização e feedback do PDV em frontend/src/features/pos/PosPage.tsx

## Phase 4: User Story 2 - Catálogo e estoque

**Independent Test**: cadastrar produto, registrar entrada e confirmar disponibilidade no PDV.

- [X] T014 [P] [US2] Criar entidades e repositórios de catálogo em backend/src/main/java/br/com/sorveteria/catalog/
- [X] T015 [P] [US2] Criar entidades e repositórios de estoque em backend/src/main/java/br/com/sorveteria/inventory/
- [X] T016 [P] [US2] Criar testes de catálogo e saldo em backend/src/test/java/br/com/sorveteria/catalog/ e inventory/
- [X] T017 [US2] Implementar serviços e endpoints de catálogo em backend/src/main/java/br/com/sorveteria/catalog/
- [X] T018 [US2] Implementar movimentos de estoque em backend/src/main/java/br/com/sorveteria/inventory/
- [X] T019 [US2] Implementar tela de produtos em frontend/src/features/catalog/ProductsPage.tsx
- [X] T020 [US2] Implementar tela de estoque em frontend/src/features/inventory/InventoryPage.tsx

## Phase 5: User Story 3 - Turno de caixa

**Independent Test**: abrir, movimentar e fechar turno conferindo esperado, contado e diferença.

- [X] T021 [P] [US3] Criar entidades e repositórios de caixa em backend/src/main/java/br/com/sorveteria/cash/
- [X] T022 [P] [US3] Criar testes de transições do caixa em backend/src/test/java/br/com/sorveteria/cash/
- [X] T023 [US3] Implementar serviço e endpoints de caixa em backend/src/main/java/br/com/sorveteria/cash/
- [X] T024 [US3] Implementar tela de caixa em frontend/src/features/cash/CashPage.tsx

## Phase 6: User Story 4 - Dashboard

**Independent Test**: registrar operações e reconciliar indicadores e listas do dia.

- [X] T025 [P] [US4] Criar projeção e endpoint do dashboard em backend/src/main/java/br/com/sorveteria/dashboard/
- [X] T026 [P] [US4] Criar testes de reconciliação em backend/src/test/java/br/com/sorveteria/dashboard/
- [X] T027 [US4] Implementar dashboard responsivo em frontend/src/features/dashboard/DashboardPage.tsx

## Phase 7: Polish

- [X] T028 Criar dados sintéticos de catálogo em backend/src/main/java/br/com/sorveteria/catalog/application/DemoCatalogProvisioning.java
- [X] T029 [P] Cobrir navegação e estados com Vitest em frontend/tests/component/
- [X] T030 Criar fluxo Playwright do balcão em frontend/tests/e2e/counter-sale.spec.ts
- [X] T031 Atualizar documentação e executar specs/002-operacao-pdv-mvp/quickstart.md

## Dependencies & Execution Order

Setup → Foundational → Catálogo/Estoque e Caixa → Venda → Dashboard → Polish. O shell visual pode ser validado assim que T002, T004, T005 e T007 forem concluídos.

## Implementation Strategy

Primeiro entregar o shell e as cinco rotas visíveis; depois tornar catálogo e caixa reais; em seguida completar o fluxo vertical do PDV e reconciliar o dashboard.

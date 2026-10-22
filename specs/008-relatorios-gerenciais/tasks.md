# Tasks: Relatórios gerenciais

## Phase 1: Setup
- [X] T001 Criar estrutura do módulo em backend/src/main/java/br/com/sorveteria/reporting/ e frontend/src/features/reports/

## Phase 2: Foundational
- [X] T002 [P] Definir contrato do relatório em specs/008-relatorios-gerenciais/contracts/openapi.yaml
- [X] T003 [P] Criar tipos e cliente em frontend/src/shared/api/operationsApi.ts

## Phase 3: User Story 1 - Analisar vendas por período
- [X] T004 [P] [US1] Criar testes da projeção em backend/src/test/java/br/com/sorveteria/reporting/
- [X] T005 [US1] Implementar projeção e validação em backend/src/main/java/br/com/sorveteria/reporting/
- [X] T006 [US1] Expor GET /api/v1/reports/sales em backend/src/main/java/br/com/sorveteria/reporting/web/ReportingController.java
- [X] T007 [US1] Criar indicadores e filtros em frontend/src/features/reports/ReportsPage.tsx

## Phase 4: User Story 2 - Comparar pagamentos e produtos
- [X] T008 [P] [US2] Cobrir a tela com teste em frontend/tests/component/reports/ReportsPage.test.tsx
- [X] T009 [US2] Implementar pagamentos, série diária e ranking em frontend/src/features/reports/ReportsPage.tsx
- [X] T010 [US2] Integrar rota e navegação em frontend/src/app/router.tsx e frontend/src/app/AppShell.tsx

## Phase 5: Polish
- [X] T011 Validar quickstart, builds, testes e containers descritos em specs/008-relatorios-gerenciais/quickstart.md

## Dependencies & Execution Order

Setup → Foundational → US1 → US2 → Polish.

## Implementation Strategy

Entregar primeiro os indicadores reconciliados; adicionar os agrupamentos na mesma projeção e finalizar com validação no Docker.

# Tasks: Impressão térmica operacional

## Phase 1: Setup

- [X] T001 Criar estrutura do módulo em backend/src/main/java/br/com/sorveteria/printing/
- [X] T002 Definir contrato em specs/009-impressao-termica/contracts/openapi.yaml e cliente em frontend/src/shared/api/operationsApi.ts

## Phase 2: Foundational

- [X] T003 Criar migração da fila em backend/src/main/resources/db/migration/V8__create_print_jobs.sql
- [X] T004 [P] Criar testes de idempotência e vínculo com venda em backend/src/test/java/br/com/sorveteria/printing/

## Phase 3: User Story 1 - Imprimir comprovante de venda

**Independent Test**: concluir uma venda, preparar a impressão e confirmar trabalho `PREPARED` sem alterar a venda.

- [X] T005 [US1] Implementar serviço de trabalhos em backend/src/main/java/br/com/sorveteria/printing/application/PrintJobService.java
- [X] T006 [US1] Expor criação e histórico em backend/src/main/java/br/com/sorveteria/printing/web/PrintJobController.java
- [X] T007 [US1] Vincular o identificador persistente da venda ao comprovante em frontend/src/features/pos/
- [X] T008 [US1] Registrar trabalho antes de abrir o diálogo em frontend/src/features/pos/SaleCompletionDialog.tsx

## Phase 4: User Story 2 - Reimprimir com rastreabilidade

**Independent Test**: abrir uma venda anterior, reimprimir e confirmar nova tentativa marcada como reimpressão.

- [X] T009 [P] [US2] Cobrir primeira via e reimpressão em backend/src/test/java/br/com/sorveteria/printing/
- [X] T010 [US2] Identificar reimpressão na resposta e no comprovante em backend/src/main/java/br/com/sorveteria/printing/ e frontend/src/features/pos/SaleCompletionDialog.tsx
- [X] T011 [US2] Integrar histórico de vendas ao mesmo fluxo rastreável em frontend/src/features/sales/SalesHistoryPage.tsx

## Phase 5: User Story 3 - Configurar modo de impressão

**Independent Test**: visualizar modo navegador ativo e conector direto indisponível até configuração homologada.

- [X] T012 [P] [US3] Definir configuração de impressão em specs/009-impressao-termica/contracts/openapi.yaml
- [X] T013 [US3] Expor capacidade e modo disponível em backend/src/main/java/br/com/sorveteria/printing/
- [X] T014 [US3] Criar painel de impressão em frontend/src/features/store/StoreConfigurationPage.tsx

## Phase 6: Polish

- [X] T015 Cobrir o fluxo de impressão no Playwright real em frontend/tests/e2e/real-mvp-flow.spec.ts
- [X] T016 Validar builds, testes, migração e Docker conforme specs/009-impressao-termica/quickstart.md

## Dependencies & Execution Order

Setup → Foundational → US1 → US2 → US3 → Polish. O MVP demonstrável é US1; o conector direto não é habilitado sem equipamento identificado.

## Implementation Strategy

Entregar primeiro a preparação persistente pelo diálogo do sistema, depois reimpressão rastreável e, por último, a configuração que habilitará um conector físico em feature complementar.

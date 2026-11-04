# Tasks: Terminal de pagamento demonstrável

## Phase 1: Setup

- [x] T001 Documentar limite simulado em specs/011-terminal-pagamento/spec.md

## Phase 2: User Story 1

- [x] T002 [US1] Criar estados do terminal em frontend/src/features/pos/PaymentTerminalDialog.tsx
- [x] T003 [US1] Integrar seleção Cartão ao terminal em frontend/src/features/pos/PosPage.tsx
- [x] T004 [US1] Implementar aprovação, recusa e nova tentativa em frontend/src/features/pos/PaymentTerminalDialog.tsx
- [x] T005 [US1] Preservar carrinho e impedir conclusão antes da aprovação em frontend/src/features/pos/PosPage.tsx

## Phase 3: Polish

- [x] T006 Validar tipagem, lint, testes e build de produção no frontend/

## Dependencies & Execution Order

T001 → T002 → T003/T004/T005 → T006.

## Implementation Strategy

Entregar simulador visual isolado; integração real posterior substituirá o adaptador após escolha do provedor.

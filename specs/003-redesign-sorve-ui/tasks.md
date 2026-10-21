# Tasks: Redesign Operacional Sorvê

## Phase 1: Shared foundation
- [X] T001 Copiar logo aprovada para frontend/public/brand/sorve-logo.png
- [X] T002 Criar tokens retos e cores dos módulos em frontend/src/app/theme.ts
- [X] T003 Criar ícones locais reutilizáveis em frontend/src/shared/ui/OperationIcon.tsx
- [X] T004 Redesenhar cabeçalho e navegação responsiva em frontend/src/app/AppShell.tsx
- [X] T005 Criar componentes operacionais compartilhados em frontend/src/shared/ui/OperationalUi.tsx

## Phase 2: Screens
- [X] T006 [US1] Redesenhar visão geral em frontend/src/features/dashboard/DashboardPage.tsx
- [X] T007 [US2] Redesenhar PDV e pedido móvel em frontend/src/features/pos/PosPage.tsx
- [X] T008 [US2] Redesenhar produtos desktop/móvel em frontend/src/features/catalog/ProductsPage.tsx
- [X] T009 [US2] Redesenhar estoque desktop/móvel em frontend/src/features/inventory/InventoryPage.tsx
- [X] T010 [US2] Redesenhar caixa e diálogos em frontend/src/features/cash/CashPage.tsx

## Phase 3: Validation
- [X] T011 Validar tipos, lint, testes e build do frontend
- [X] T012 Validar visualmente em 1440×900, 1024×768, 768×1024 e 390×844
- [X] T013 Publicar e verificar o redesign no Docker

## Dependencies

T001–T005 bloqueiam as telas; T006–T010 podem avançar após a fundação; validação encerra a entrega.

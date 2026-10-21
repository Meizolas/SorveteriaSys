# Implementation Plan: Dashboard operacional

## Technical Context

- Endpoint de leitura no monólito Java/Spring com projeções SQL sobre vendas, pagamentos, estoque e usuários.
- Limites do dia calculados no fuso `America/Sao_Paulo` e enviados como instantes UTC ao MySQL.
- React/TypeScript consome uma única projeção para evitar indicadores montados de fontes divergentes.

## Constitution Check

- Escopo interno, somente leitura e sem dependências externas.
- Valores monetários permanecem decimais e reconciliados à tabela de vendas.
- O módulo de relatórios lê os módulos de origem sem escrever em suas tabelas.
- Estados de carregamento, vazio e erro serão explícitos.

## Structure

- `backend/src/main/java/br/com/sorveteria/dashboard/`
- `frontend/src/features/dashboard/DashboardPage.tsx`
- `frontend/src/shared/api/operationsApi.ts`

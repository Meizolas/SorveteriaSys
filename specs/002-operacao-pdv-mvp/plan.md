# Implementation Plan: Operação de Balcão MVP

**Branch**: `[002-operacao-pdv-mvp]` | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)

## Summary

Entregar um fluxo vertical de venda presencial que conecta catálogo, estoque, turno de caixa, pagamentos manuais e dashboard. A solução amplia o monólito modular existente, usa transações locais para preservar dinheiro e estoque e oferece uma interface de ERP/PDV responsiva, rápida e acessível.

## Technical Context

**Language/Version**: Java 21; TypeScript 6; Node.js 24  
**Primary Dependencies**: Spring Boot 4.1.1, Spring MVC, Spring Data JPA, React 19, React Router 8, TanStack Query 5, MUI 9  
**Storage**: MySQL 8.4/InnoDB e Flyway  
**Testing**: JUnit/Spring Boot/Testcontainers; Vitest/Testing Library; Playwright  
**Target Platform**: servidor Linux local via Docker Compose; navegadores desktop e tablet  
**Project Type**: aplicação web com backend e frontend, mesma origem em execução  
**Performance Goals**: busca percebida em até 500 ms e conclusão local de venda em até 1 s  
**Constraints**: LAN sem internet; BRL; sem estoque negativo; escrita idempotente; pagamentos manuais  
**Scale/Scope**: uma loja, até 10 terminais, cinco áreas e até 10.000 produtos

## Constitution Check

*GATE: aprovado antes e depois do desenho.*

- Escopo interno, sem venda online ou integração externa.
- Dinheiro, estoque e estados do caixa têm critérios explícitos.
- Mantém monólito modular e MySQL existentes.
- Usa DECIMAL/BigDecimal, snapshots e movimentos rastreáveis.
- Conclusão da venda é transacional e idempotente.
- Pagamentos são manuais e identificados como não confirmados automaticamente.
- Reutiliza sessão e autorização existentes; ações permanecem protegidas no backend.
- Prevê testes unitários, integração MySQL e E2E.
- Não introduz dependência de internet ou CDN.
- Flyway e Docker Compose permanecem autoridades.

## Project Structure

### Documentation (this feature)

```text
specs/002-operacao-pdv-mvp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
backend/src/main/java/br/com/sorveteria/
├── catalog/
├── inventory/
├── cash/
├── sales/
└── dashboard/
frontend/src/
├── app/
├── features/dashboard/
├── features/catalog/
├── features/inventory/
├── features/cash/
├── features/pos/
└── shared/
```

**Structure Decision**: preservar os dois projetos existentes e organizar cada lado por domínio.

## Complexity Tracking

Nenhuma violação constitucional ou exceção arquitetural foi necessária.


# Implementation Plan: Relatórios gerenciais

**Branch**: `[008-relatorios-gerenciais]` | **Date**: 2026-10-22 | **Spec**: [spec.md](spec.md)

## Summary

Adicionar uma projeção de leitura sobre vendas e itens existentes, exposta pela API e apresentada em uma nova tela responsiva de relatórios.

## Technical Context

**Language/Version**: Java 21; TypeScript 6; Node.js 24
**Primary Dependencies**: Spring Boot, JdbcTemplate, React, MUI
**Storage**: MySQL 8.4, sem nova tabela
**Testing**: JUnit/Mockito, Vitest/Testing Library
**Target Platform**: servidor local via Docker Compose
**Project Type**: aplicação web
**Performance Goals**: consulta percebida em até 2 s
**Constraints**: somente leitura; intervalo máximo de 366 dias; BRL; fuso America/Bahia
**Scale/Scope**: uma loja e dados operacionais do MVP

## Constitution Check

- Escopo interno e monólito modular preservados.
- Valores monetários agregados no servidor com tipos decimais.
- Cancelamentos tratados separadamente e origem rastreável.
- Nenhuma nova escrita, integração externa ou dependência de internet.
- Testes cobrem período e projeção; Docker valida a entrega.

## Project Structure

```text
backend/src/main/java/br/com/sorveteria/reporting/
frontend/src/features/reports/
frontend/src/shared/api/operationsApi.ts
frontend/src/app/{AppShell.tsx,router.tsx}
```

**Structure Decision**: novo módulo de leitura `reporting`, sem escrever em tabelas de vendas.

## Complexity Tracking

Nenhuma violação constitucional.

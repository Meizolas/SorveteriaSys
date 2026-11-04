# Implementation Plan: Venda por peso no PDV

**Branch**: `010-venda-por-peso` | **Date**: 2026-11-04 | **Spec**: [spec.md](spec.md)

## Summary

Ampliar o catálogo para unidades UNIT/KG, validar quantidades conforme a unidade no backend e incluir no PDV um diálogo de pesagem simulada que calcula líquido e preço antes de adicionar ao carrinho.

## Technical Context

**Language/Version**: Java 21, TypeScript 6  
**Primary Dependencies**: Spring Boot, React, MUI  
**Storage**: MySQL 8.4 com Flyway  
**Testing**: JUnit, Mockito, Vitest e build Vite  
**Target Platform**: servidor local e navegadores na LAN  
**Project Type**: aplicação web monolítica modular  
**Performance Goals**: feedback da pesagem imediato  
**Constraints**: três casas decimais; sem alegar homologação física  
**Scale/Scope**: uma loja, catálogo existente e um PDV

## Constitution Check

- Quantidade decimal possui unidade explícita, precisão de 0,001 kg e cálculo autoritativo no backend.
- Pesagem mostra bruto, tara, líquido e origem.
- Equipamento simulado é identificado como não homologado.
- Venda e estoque continuam atômicos no checkout existente.

## Project Structure

```text
backend/src/main/java/br/com/sorveteria/catalog/
backend/src/main/java/br/com/sorveteria/sales/
backend/src/main/resources/db/migration/
frontend/src/features/catalog/
frontend/src/features/pos/
frontend/src/shared/api/
```

**Structure Decision**: evolução dos módulos atuais de catálogo, vendas e PDV, sem novo serviço.

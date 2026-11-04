# Implementation Plan: Terminal de pagamento demonstrável

**Branch**: `011-terminal-pagamento` | **Date**: 2026-11-04 | **Spec**: [spec.md](spec.md)

## Summary

Adicionar ao PDV um adaptador visual de terminal simulado para cartão, mantendo o carrinho até aprovação e isolando a futura integração física.

## Technical Context

**Language/Version**: React 19, TypeScript 6  
**Primary Dependencies**: MUI  
**Storage**: sem nova persistência nesta simulação  
**Testing**: TypeScript, ESLint, Vitest e build Vite  
**Target Platform**: navegador do terminal PDV  
**Constraints**: não coletar dados do cartão nem declarar homologação

## Constitution Check

- O simulador não é apresentado como equipamento homologado.
- A venda só é enviada ao servidor após aprovação visual.
- Dados sensíveis de cartão não são coletados.
- Resultado recusado mantém o pedido intacto.

## Project Structure

```text
frontend/src/features/pos/PosPage.tsx
frontend/tests/component/pos/
```

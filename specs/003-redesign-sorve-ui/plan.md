# Implementation Plan: Redesign Operacional Sorvê

**Branch**: `[003-redesign-sorve-ui]` | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)

## Summary

Redesenhar somente o frontend das cinco telas existentes com componentes reais e responsivos, usando a logo local e preservando integrações, rotas e comportamento. A base visual será centralizada no tema e em componentes compartilhados; tabelas terão representação móvel própria e o PDV terá pedido móvel em painel dedicado.

## Technical Context

**Language/Version**: TypeScript 6, React 19  
**Primary Dependencies**: MUI 9, React Router 8, TanStack Query 5  
**Storage**: APIs existentes; nenhum novo armazenamento  
**Testing**: TypeScript, ESLint, Vitest, Playwright e inspeção visual  
**Target Platform**: navegadores desktop, tablet e celular  
**Constraints**: operação local, sem CDN, sem novos módulos ou alteração de contratos

## Constitution Check

- Escopo interno e arquitetura preservados.
- Nenhuma regra de dinheiro, estoque ou autorização alterada.
- Dados inexistentes permanecem vazios ou explicitamente demonstrativos.
- Interface mantém teclado, foco, contraste e alvos de toque.
- Assets são locais e o funcionamento essencial continua sem internet.

## Project Structure

```text
frontend/public/brand/
frontend/src/app/theme.ts
frontend/src/app/AppShell.tsx
frontend/src/shared/ui/
frontend/src/features/{dashboard,pos,catalog,inventory,cash}/
```

## Complexity Tracking

Nenhuma exceção constitucional.


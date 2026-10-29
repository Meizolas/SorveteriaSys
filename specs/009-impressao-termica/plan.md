# Implementation Plan: Impressão térmica operacional

**Branch**: `[009-impressao-termica]` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

## Summary

Criar uma fila persistente de trabalhos de impressão vinculados às vendas, registrar primeira via e reimpressões e integrar o comprovante atual ao modo de impressão do navegador. O desenho reserva um modo direto por conector local, mas não o habilita até existir equipamento e transporte homologados.

## Technical Context

**Language/Version**: Java 21; TypeScript 6; Node.js 24  
**Primary Dependencies**: Spring Boot, Spring Data JPA, React, MUI  
**Storage**: MySQL 8.4, nova tabela `print_job`  
**Testing**: JUnit/Mockito, Vitest/Testing Library e Playwright  
**Target Platform**: servidor local via Docker Compose e navegadores dos terminais  
**Project Type**: aplicação web monolítica modular  
**Performance Goals**: preparar trabalho e abrir o diálogo em até 2 segundos no ambiente local  
**Constraints**: comprovante não fiscal; sem promessa de impressão física; operação interna sem internet  
**Scale/Scope**: uma loja, até centenas de trabalhos por dia, retenção junto ao histórico operacional

## Constitution Check

- O recorte permanece interno e não introduz emissão fiscal.
- A origem do documento é a venda persistida; nenhum total é recalculado no navegador.
- O trabalho é persistido antes da tentativa e possui chave idempotente.
- Estados distinguem preparação, envio, falha e resultado incerto.
- Reimpressões são novas tentativas vinculadas à venda, sem modificar a venda.
- O modo navegador funciona offline na rede local e não depende de CDN.
- Equipamento não testado não é declarado homologado; modo direto permanece desabilitado.
- Testes cobrem idempotência, vínculo com venda, conteúdo e falha sem efeito comercial.

## Project Structure

```text
backend/src/main/java/br/com/sorveteria/printing/
backend/src/main/resources/db/migration/V8__create_print_jobs.sql
backend/src/test/java/br/com/sorveteria/printing/
frontend/src/features/pos/SaleCompletionDialog.tsx
frontend/src/shared/api/operationsApi.ts
frontend/tests/component/printing/
specs/009-impressao-termica/contracts/openapi.yaml
```

**Structure Decision**: novo módulo `printing` cria e consulta trabalhos, lendo vendas por um serviço de aplicação explícito. Nesta primeira entrega o frontend prepara o documento e abre o diálogo do sistema; o backend registra resultado `PREPARED`, não `PRINTED`.

## Delivery Slices

1. Persistência e contrato de trabalhos de impressão.
2. Primeira via e reimpressão registradas no comprovante existente.
3. Consulta de estado e fallback pelo diálogo do dispositivo.
4. Configuração e conector direto somente após identificação do equipamento.

## Post-Design Constitution Check

PASS. O desenho evita acesso direto a periféricos pelo navegador, não confunde envio com impressão física, mantém idempotência e preserva todos os efeitos comerciais da venda em caso de falha.

## Complexity Tracking

Nenhuma violação constitucional. O módulo adicional é necessário para separar o ciclo de vida da impressão do ciclo de vida da venda.

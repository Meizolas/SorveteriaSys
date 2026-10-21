# Implementation Plan: Comprovante demonstrativo

## Technical Context

- React e TypeScript existentes, com Material UI, `@mui/icons-material` e estado local.
- Nenhuma API, migration ou persistência nova.
- Impressão pelo navegador com folha de estilo dedicada a 80 mm.

## Constitution Check

- O documento é explicitamente não fiscal e demonstrativo.
- Não confirma pagamento real, não movimenta estoque e não altera caixa.
- Valores são derivados do carrinho existente.
- A integração real de impressão continuará exigindo trabalho persistido e auditoria em feature futura.

## Design

- `PosPage` coordena carrinho, confirmação e ciclo de nova venda.
- `SaleCompletionDialog` apresenta confirmação responsiva e ações.
- `ReceiptPreview` é reutilizado na prévia normal e ampliada.
- CSS de impressão oculta a aplicação e imprime somente o comprovante.
- Ícones operacionais vêm exclusivamente do pacote compatível com o Material UI, sem SVGs desenhados manualmente ou CDN.


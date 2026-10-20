# Data Model: Operação de Balcão MVP

- **Category**: `id`, `name` único, `active`, timestamps.
- **Product**: categoria, nome, SKU único, unidade, preço DECIMAL(13,2), status, controle e mínimo DECIMAL(13,3), versão.
- **StockBalance**: produto, quantidade DECIMAL(13,3), instante e versão; nunca negativo.
- **StockMovement**: produto, tipo, quantidade, saldos anterior/resultante, motivo, origem, ator e instante; imutável.
- **CashShift**: operador, estado, valores inicial/esperado/contado/diferença, instantes e versão; apenas um aberto por operador.
- **CashMovement**: turno, tipo, valor, forma, motivo, origem, ator e instante; imutável.
- **Sale**: código, chave única de operação, turno, operador, estado, subtotal, desconto, total e instante.
- **SaleItem**: venda e retrato histórico do produto, unidade, preço, quantidade e total.
- **Payment**: venda, método, valores recebido/aplicado e troco; troco zero para Pix e cartão.

## Transições

- Caixa inexistente/fechado → aberto → fechado; turno fechado rejeita movimentos.
- Finalizar venda valida turno, produtos e saldo e persiste todos os efeitos em uma transação.
- Repetir chave com mesmo conteúdo devolve o resultado; conteúdo diferente gera conflito.


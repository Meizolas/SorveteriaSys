# Data Model: Relatórios gerenciais

Não há nova persistência. A feature projeta:

- `SalesReport`: período, faturamento, vendas concluídas, cancelamentos, ticket médio.
- `PaymentSummary`: método, quantidade e total de vendas concluídas.
- `DailySales`: data local, quantidade e total concluído.
- `ProductRanking`: identificador, SKU, nome, quantidade e faturamento concluído.

Somente vendas `COMPLETED` compõem valores; `CANCELED` compõe apenas o contador de cancelamentos.

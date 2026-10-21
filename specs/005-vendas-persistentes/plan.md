# Implementation Plan: Vendas persistentes

## Technical Context

- Java 21, Spring Boot, JPA, MySQL/InnoDB e Flyway no backend existente.
- React/TypeScript e cliente HTTP same-origin no frontend existente.
- Valores monetários em `BigDecimal`/`DECIMAL(13,2)` e quantidades em `DECIMAL(13,3)`.

## Constitution Check

- O servidor recalcula todos os valores.
- Uma transação local engloba venda, itens, pagamento e estoque.
- Itens guardam snapshots históricos.
- Chave idempotente e fingerprint protegem repetição.
- Estoque é bloqueado antes da baixa e não pode ficar negativo.
- Pagamentos permanecem manuais e não fiscais.

## Design

- Migração V4 cria `sale`, `sale_item` e `payment` e permite movimento `SALE_OUT`.
- Módulo `sales` contém entidades, repositórios, serviço transacional e controller.
- O PDV passa a consumir catálogo e endpoint de conclusão reais.
- O comprovante usa exclusivamente a resposta persistida.


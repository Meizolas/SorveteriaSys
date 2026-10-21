# Data Model: Vendas persistentes

- `sale`: id, code, idempotency_key, request_fingerprint, operator_user_id, status, subtotal, discount, total, created_at.
- `sale_item`: sale_id, product_id, snapshots de SKU/nome/unidade/preço, quantidade e total.
- `payment`: sale_id, method, received_amount, applied_amount, change_amount e created_at.
- `stock_movement`: recebe o tipo `SALE_OUT` e referência textual ao número da venda.

Repetir chave e fingerprint retorna a venda existente; chave igual com fingerprint diferente gera conflito.


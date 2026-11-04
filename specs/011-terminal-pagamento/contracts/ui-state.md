# UI State Contract

`READY → PROCESSING → APPROVED | DECLINED`

- APPROVED permite chamar o checkout existente.
- DECLINED não chama checkout e oferece nova tentativa.
- Cancelamento fecha o terminal e preserva o carrinho.

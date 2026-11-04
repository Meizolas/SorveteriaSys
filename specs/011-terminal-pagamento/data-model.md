# Data Model

## Tentativa de terminal transitória

- valor, tipo (crédito/débito), estado e mensagem.
- estados: READY, PROCESSING, APPROVED, DECLINED.
- não contém PAN, validade ou CVV.
- persistência será adicionada junto ao provedor real e política de reconciliação.

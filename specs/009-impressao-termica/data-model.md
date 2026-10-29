# Data Model: Impressão térmica operacional

## PrintJob

Representa uma ação do operador para preparar ou enviar um comprovante.

| Campo | Regra |
| --- | --- |
| `id` | Identificador interno crescente |
| `operation_key` | Chave única fornecida pelo cliente para idempotência |
| `sale_id` | Venda de origem obrigatória para comprovantes |
| `requested_by` | Usuário autenticado que solicitou |
| `kind` | `FIRST_COPY` ou `REPRINT` |
| `mode` | Inicialmente `SYSTEM_DIALOG`; reservado `DIRECT_CONNECTOR` |
| `status` | `PREPARED`, `SENT`, `FAILED` ou `UNKNOWN` |
| `error_code` | Código técnico limitado e sem segredo, quando aplicável |
| `created_at` | Instante UTC da solicitação |
| `updated_at` | Instante UTC da última transição |

## Regras e transições

- A mesma `operation_key` com a mesma venda retorna o trabalho existente.
- A mesma chave para outra venda ou intenção produz conflito.
- O primeiro trabalho de uma venda pode ser `FIRST_COPY`; trabalhos seguintes são `REPRINT`.
- `SYSTEM_DIALOG` nasce em `PREPARED`, pois o resultado físico é desconhecido.
- `DIRECT_CONNECTOR` não pode ser criado enquanto o conector não estiver habilitado.
- Nenhuma transição modifica venda, pagamento, caixa ou estoque.
- Trabalhos não são excluídos para corrigir histórico.

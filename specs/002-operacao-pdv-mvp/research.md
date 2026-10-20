# Research: Operação de Balcão MVP

## Navegação e linguagem visual

- **Decision**: shell lateral persistente, barra superior contextual, superfícies claras e poucos acentos roxos e coral.
- **Rationale**: favorece o uso recorrente de ERP sem perder legibilidade no balcão.
- **Alternatives considered**: navegação apenas superior limita crescimento; visual de consumo reduz densidade operacional.

## Consistência de venda

- **Decision**: finalizar em transação única com chave idempotente e bloqueio dos saldos afetados.
- **Rationale**: protege contra duplo clique, retry e concorrência.
- **Alternatives considered**: atualizações independentes podem deixar caixa e estoque divergentes.

## Pagamentos e estoque

- **Decision**: dinheiro, Pix e cartão como registros manuais; troco apenas em dinheiro; saldo do produto vendido por unidade.
- **Rationale**: entrega fluxo verificável sem simular adquirente ou fichas técnicas.
- **Alternatives considered**: integrações reais e consumo por ingrediente exigem features próprias.


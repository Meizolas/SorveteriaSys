# Feature Specification: Caixa persistente

## User Scenarios & Testing

### User Story 1 - Abrir e consultar o caixa (Priority: P1)

Como operador, quero abrir um turno com saldo inicial e consultar seus totais para iniciar a operação com valores rastreáveis.

**Independent Test**: abrir o caixa, recarregar a aplicação e confirmar que o mesmo turno e saldo continuam visíveis.

**Acceptance Scenarios**

1. **Given** nenhum turno aberto, **When** o operador informa um saldo inicial válido, **Then** um turno numerado é aberto e persistido.
2. **Given** um turno já aberto, **When** outra abertura é solicitada, **Then** a operação é recusada sem criar duplicidade.
3. **Given** nenhum turno aberto, **When** uma venda é tentada, **Then** a venda é recusada antes de alterar estoque.

### User Story 2 - Movimentar e vender no turno (Priority: P1)

Como operador, quero registrar suprimentos e sangrias e ver as vendas do turno para acompanhar o saldo esperado.

**Independent Test**: registrar suprimento e sangria e concluir vendas em dinheiro e Pix, conferindo totais e saldo físico esperado.

**Acceptance Scenarios**

1. **Given** turno aberto, **When** um suprimento ou sangria com valor e motivo válidos é registrado, **Then** o movimento aparece no histórico e recalcula o saldo esperado.
2. **Given** turno aberto, **When** uma venda é concluída, **Then** ela fica vinculada ao turno e aparece nos totais.
3. **Given** venda em dinheiro, **Then** seu valor aumenta o saldo físico esperado; **Given** Pix ou cartão, **Then** aumenta vendas recebidas sem alterar o numerário.
4. **Given** sangria superior ao saldo físico esperado, **Then** a operação é recusada.

### User Story 3 - Fechar o caixa (Priority: P1)

Como operador, quero informar o valor contado e fechar o turno com eventual justificativa de diferença.

**Independent Test**: fechar um turno com valor contado, recarregar a tela e confirmar que não aceita novos movimentos nem vendas.

**Acceptance Scenarios**

1. **Given** turno aberto sem diferença, **When** o valor contado é confirmado, **Then** o turno é fechado com diferença zero.
2. **Given** diferença entre contado e esperado, **When** não há justificativa, **Then** o fechamento é recusado.
3. **Given** turno fechado, **When** uma escrita operacional é tentada, **Then** ela é recusada.

## Requirements

### Functional Requirements

- **FR-001** O sistema DEVE persistir turnos com número, operador, saldo inicial, estado e instantes de abertura/fechamento.
- **FR-002** O sistema DEVE garantir no máximo um turno aberto no MVP de loja única.
- **FR-003** O sistema DEVE persistir suprimentos e sangrias positivos, com ator, instante e motivo obrigatório.
- **FR-004** O sistema DEVE bloquear sangria superior ao saldo físico esperado.
- **FR-005** Toda nova venda DEVE estar vinculada atomicamente ao turno aberto.
- **FR-006** Venda em dinheiro DEVE gerar movimento de caixa uma única vez; Pix e cartão NÃO DEVEM alterar o saldo físico.
- **FR-007** A consulta do turno DEVE informar saldo inicial, total vendido, vendas em dinheiro, suprimentos, sangrias e saldo esperado.
- **FR-008** O fechamento DEVE persistir valor contado, diferença e justificativa quando a diferença não for zero.
- **FR-009** Turno fechado NÃO DEVE aceitar movimentos nem novas vendas.
- **FR-010** A interface DEVE tratar estados carregando, fechado, aberto, erro e conflito em português.

### Key Entities

- **Turno de caixa**: período operacional aberto ou fechado, com valores de abertura e conferência.
- **Movimento de caixa**: abertura, suprimento, sangria ou recebimento em dinheiro originado por venda.
- **Venda**: operação existente vinculada ao turno em que foi concluída.

## Assumptions

- O MVP opera uma única loja e permite apenas um turno aberto globalmente.
- Reabertura, cancelamento de movimento, estorno e múltiplos caixas simultâneos ficam fora desta etapa.
- Valores são em BRL, com duas casas decimais; instantes são armazenados em UTC.

## Success Criteria

- **SC-001** O operador consegue abrir, movimentar e fechar um turno sem perder dados após recarregar a página.
- **SC-002** Cem por cento das novas vendas ficam associadas a um turno aberto ou são recusadas sem efeitos parciais.
- **SC-003** O saldo esperado reconcilia exatamente abertura + dinheiro + suprimentos - sangrias.
- **SC-004** Requisições concorrentes não produzem dois turnos abertos nem movimento após fechamento.

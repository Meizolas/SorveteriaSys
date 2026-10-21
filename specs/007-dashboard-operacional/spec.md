# Feature Specification: Dashboard operacional

## User Scenarios & Testing

### User Story 1 - Acompanhar o dia (Priority: P1)

Como gestor, quero abrir o dashboard e ver faturamento, quantidade de vendas e ticket médio do dia para entender imediatamente a operação.

**Independent Test**: concluir vendas no dia, abrir o dashboard e reconciliar os três indicadores com as vendas persistidas.

**Acceptance Scenarios**

1. **Given** vendas concluídas hoje, **When** o dashboard é aberto, **Then** faturamento, quantidade e ticket médio correspondem às vendas do dia.
2. **Given** nenhuma venda hoje, **When** o dashboard é aberto, **Then** os indicadores mostram zero e um estado vazio informativo.

### User Story 2 - Identificar ações necessárias (Priority: P1)

Como gestor, quero ver situação do caixa e produtos com estoque baixo para agir sem navegar por várias telas.

**Independent Test**: abrir um caixa, deixar produto no mínimo e confirmar os dois estados no dashboard com atalhos corretos.

### User Story 3 - Consultar vendas recentes (Priority: P2)

Como gestor, quero ver as vendas recentes com código, horário, operador, pagamento e total para acompanhar o movimento.

**Independent Test**: concluir vendas com formas diferentes e confirmar a ordem da mais recente para a mais antiga.

## Requirements

- **FR-001** O dashboard DEVE calcular indicadores apenas com vendas concluídas no dia comercial local.
- **FR-002** Faturamento, quantidade e ticket médio DEVEM reconciliar com as mesmas vendas de origem.
- **FR-003** O dashboard DEVE apresentar o turno aberto ou informar claramente que o caixa está fechado.
- **FR-004** Produtos ativos controlados com saldo igual ou inferior ao mínimo DEVEM ser destacados.
- **FR-005** As vendas recentes DEVEM mostrar código, horário, operador, forma de pagamento e total.
- **FR-006** A interface DEVE distinguir carregamento, vazio, erro e sucesso.
- **FR-007** Consultas do dashboard NÃO DEVEM alterar dados operacionais.

## Assumptions

- O dia comercial usa o fuso configurado inicialmente para a operação brasileira.
- O dashboard é um resumo do dia; filtros históricos ficam para relatórios futuros.
- São exibidas até oito vendas recentes e cinco alertas de estoque, com atalhos para os módulos completos.

## Success Criteria

- **SC-001** Todos os indicadores reconciliam exatamente com as vendas do dia nos cenários de aceite.
- **SC-002** O estado operacional principal pode ser compreendido em até dez segundos.
- **SC-003** O dashboard apresenta resposta útil também sem vendas ou sem caixa aberto.

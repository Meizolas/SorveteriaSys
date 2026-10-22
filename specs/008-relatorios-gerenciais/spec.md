# Feature Specification: Relatórios gerenciais

**Feature Branch**: `[008-relatorios-gerenciais]`
**Created**: 2026-10-22
**Status**: Draft
**Input**: Continuar o MVP com uma visão gerencial histórica para apresentação.

## User Scenarios & Testing

### User Story 1 - Analisar vendas por período (Priority: P1)

O gestor escolhe um intervalo e consulta faturamento líquido, vendas válidas, ticket médio e cancelamentos.

**Why this priority**: Transforma registros operacionais em uma visão gerencial demonstrável.
**Independent Test**: Selecionar um período com vendas concluídas e canceladas e reconciliar os indicadores.

**Acceptance Scenarios**:
1. **Given** vendas no período, **When** o relatório é aberto, **Then** os totais consideram somente vendas concluídas e informam cancelamentos separadamente.
2. **Given** um período sem vendas, **When** consultado, **Then** os indicadores mostram zero e as listas apresentam estado vazio.

### User Story 2 - Comparar pagamentos e produtos (Priority: P2)

O gestor visualiza a participação de dinheiro, Pix e cartão e os produtos mais vendidos.

**Why this priority**: Ajuda a explicar de onde vem o faturamento e quais itens geram mais resultado.
**Independent Test**: Registrar vendas com produtos e pagamentos diferentes e conferir os agrupamentos.

**Acceptance Scenarios**:
1. **Given** vendas concluídas, **When** o período muda, **Then** formas de pagamento e ranking são recalculados.

### Edge Cases

- A data inicial posterior à final é rejeitada de forma clara.
- O período inclui o dia inicial e o dia final completos no fuso da loja.
- Cancelamentos não compõem faturamento, ticket nem ranking.

## Requirements

### Functional Requirements

- **FR-001**: O gestor DEVE filtrar o relatório por data inicial e final.
- **FR-002**: O sistema DEVE apresentar faturamento líquido, quantidade de vendas concluídas, ticket médio e cancelamentos.
- **FR-003**: O sistema DEVE agrupar vendas concluídas por forma de pagamento.
- **FR-004**: O sistema DEVE listar até dez produtos por quantidade vendida e faturamento.
- **FR-005**: O sistema DEVE apresentar uma série diária do faturamento no período.
- **FR-006**: Totais e agrupamentos DEVEM excluir vendas canceladas, exibindo sua quantidade separadamente.
- **FR-007**: A interface DEVE tratar carregamento, erro e ausência de dados e funcionar em computador e tablet.
- **FR-008**: A consulta DEVE limitar o intervalo a 366 dias para preservar resposta previsível.

### Key Entities

- **ReportPeriod**: Intervalo inclusivo escolhido pelo gestor.
- **SalesReport**: Indicadores e agrupamentos derivados de vendas persistidas.
- **ProductRanking**: Produto, quantidade vendida e faturamento concluído no intervalo.

## Success Criteria

### Measurable Outcomes

- **SC-001**: O gestor obtém a visão do período em até 2 segundos no ambiente de demonstração.
- **SC-002**: Os totais reconciliam integralmente com as vendas concluídas do mesmo intervalo.
- **SC-003**: Um apresentador identifica os três principais produtos e pagamentos em menos de 30 segundos.
- **SC-004**: A tela apresenta estado correto para períodos com e sem movimento.

## Assumptions

- O intervalo padrão é o mês corrente.
- O relatório é somente leitura e usa os registros existentes.
- Exportação, custos, lucro e dados fiscais ficam fora desta entrega.

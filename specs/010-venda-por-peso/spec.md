# Feature Specification: Venda por peso no PDV

**Feature Branch**: `010-venda-por-peso`  
**Created**: 2026-11-04  
**Status**: Approved  
**Input**: Continuação das integrações de equipamentos do PDV, começando pela balança.

## User Scenarios & Testing

### User Story 1 - Vender produto por quilograma (Priority: P1)

Como operador, quero selecionar um produto vendido por quilograma, informar a pesagem e adicioná-lo ao pedido com o preço proporcional.

**Why this priority**: É o fluxo central de uma sorveteria self-service.

**Independent Test**: Cadastrar produto a R$ 40/kg, pesar 0,350 kg e confirmar item de R$ 14,00 no carrinho.

**Acceptance Scenarios**:

1. **Given** produto ativo vendido por kg, **When** operador informa peso bruto e tara válidos, **Then** o sistema adiciona o peso líquido e calcula o total proporcional.
2. **Given** produto vendido por unidade, **When** operador o seleciona, **Then** o fluxo atual por unidades permanece inalterado.

### User Story 2 - Demonstrar estado da balança (Priority: P2)

Como apresentador, quero visualizar origem, estabilidade e peso da leitura para demonstrar como o equipamento será integrado.

**Independent Test**: Abrir a pesagem e verificar indicação de modo simulado, peso bruto, tara e líquido antes de confirmar.

**Acceptance Scenarios**:

1. **Given** ausência de balança homologada, **When** a pesagem é aberta, **Then** a interface identifica claramente a leitura como simulada/manual.

### Edge Cases

- Tara igual ou maior que o peso bruto impede confirmação.
- Peso líquido zero, negativo, acima do estoque ou com mais de três casas decimais é rejeitado.
- Quantidade fracionada para produto por unidade é rejeitada no servidor.

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE permitir produto com unidade `UNIT` ou `KG`.
- **FR-002**: O preço de produto `KG` DEVE representar preço por quilograma.
- **FR-003**: A pesagem DEVE apresentar peso bruto, tara, peso líquido, unidade e origem.
- **FR-004**: O carrinho DEVE aceitar até três casas decimais somente para produtos `KG`.
- **FR-005**: O servidor DEVE recalcular o valor da linha usando preço cadastrado e peso líquido.
- **FR-006**: Produtos por unidade DEVEM continuar aceitando apenas quantidades inteiras.
- **FR-007**: O modo simulado NÃO DEVE ser apresentado como equipamento homologado.

### Key Entities

- **Produto**: item vendável, com unidade de venda e preço por unidade ou quilograma.
- **Pesagem**: leitura transitória com peso bruto, tara, líquido, unidade e origem.
- **Item de venda**: retrato histórico do produto, unidade, preço, quantidade e total.

## Success Criteria

- **SC-001**: Operador adiciona um produto pesado ao carrinho em menos de 15 segundos.
- **SC-002**: Totais de 100% dos cenários de peso testados coincidem com preço por kg multiplicado pelo peso líquido, arredondado em centavos.
- **SC-003**: Quantidades inválidas são bloqueadas antes de alterar venda ou estoque.
- **SC-004**: O fluxo existente de venda por unidade permanece funcional.

## Assumptions

- O MVP usa leitura simulada/manual até modelo, protocolo e conexão da balança serem informados.
- Quilograma é a única unidade fracionada desta entrega; gramas são exibidas como conversão de kg.
- Estoque de produtos `KG` também é controlado em quilogramas.

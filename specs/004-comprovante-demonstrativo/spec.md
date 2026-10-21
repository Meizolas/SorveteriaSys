# Feature Specification: Venda concluída e comprovante demonstrativo

**Created**: 2026-10-20
**Status**: Approved
**Input**: Completar visualmente o fluxo do PDV com confirmação de pagamento, venda concluída, comprovante térmico e impressão demonstrativa, sem persistência nem valor fiscal.

## User Scenarios & Testing

### User Story 1 - Concluir uma venda demonstrativa (Priority: P1)

O operador monta um pedido, escolhe a forma de pagamento e conclui a venda para apresentar o ciclo completo do atendimento.

**Independent Test**: Adicionar produtos, escolher cada forma de pagamento e abrir a confirmação de venda concluída em desktop e celular.

**Acceptance Scenarios**:
1. **Given** um carrinho com itens, **When** o operador finaliza, **Then** vê uma confirmação com número temporário, data, operador e total.
2. **Given** pagamento em dinheiro, **When** o valor recebido é suficiente, **Then** o troco é calculado e exibido.
3. **Given** pagamento em Pix ou cartão, **When** a venda é concluída, **Then** não é apresentado troco em dinheiro.

### User Story 2 - Apresentar o comprovante (Priority: P1)

O operador visualiza um comprovante de 80 mm, pode abrir uma prévia ampliada, acionar a impressão do navegador e iniciar outra venda.

**Independent Test**: Conferir conteúdo do comprovante, ampliar, acionar impressão e limpar o carrinho em “Nova venda”.

**Acceptance Scenarios**:
1. **Given** uma venda demonstrativa concluída, **When** o comprovante aparece, **Then** itens, quantidades, valores e pagamento coincidem com o carrinho.
2. **Given** o comprovante, **When** o operador imprime, **Then** somente o documento de 80 mm é preparado para impressão e continua marcado “SEM VALOR FISCAL”.
3. **Given** a confirmação aberta, **When** “Nova venda” é acionado, **Then** carrinho e pagamento são reiniciados.

### Edge Cases

- Finalização permanece bloqueada para carrinho vazio.
- Dinheiro recebido menor que o total impede a conclusão e explica o problema.
- Cancelar a janela de impressão não altera o pedido.
- Atualizar a página descarta a venda demonstrativa.
- Conteúdo longo do comprovante permanece legível e rolável no celular.

## Requirements

### Functional Requirements

- **FR-001**: O PDV DEVE abrir uma etapa de confirmação antes de exibir venda concluída.
- **FR-002**: Pagamento em dinheiro DEVE aceitar valor recebido e calcular troco visualmente.
- **FR-003**: Pix e cartão NÃO DEVEM solicitar valor recebido nem apresentar troco.
- **FR-004**: A venda concluída DEVE exibir identificador temporário, data, horário, operador, total e pagamento.
- **FR-005**: O comprovante DEVE listar os itens e ser identificado como “COMPROVANTE DO PEDIDO — SEM VALOR FISCAL”.
- **FR-006**: A impressão DEVE usar uma apresentação própria de papel térmico de 80 mm.
- **FR-007**: A prévia DEVE poder ser ampliada sem perder o estado da venda.
- **FR-008**: “Nova venda” DEVE limpar o carrinho e retornar ao catálogo.
- **FR-009**: Toda a experiência DEVE ser identificada como demonstração e NÃO DEVE persistir venda, pagamento, caixa ou estoque.
- **FR-010**: O fluxo DEVE funcionar por teclado, mouse e toque em desktop e celular.

## Success Criteria

- **SC-001**: Um apresentador conclui o fluxo do carrinho ao comprovante em menos de 60 segundos.
- **SC-002**: 100% dos valores do comprovante coincidem com o pedido montado.
- **SC-003**: O fluxo não apresenta sobreposição nas resoluções-alvo do redesign.
- **SC-004**: O comprovante impresso contém a marcação “SEM VALOR FISCAL”.
- **SC-005**: Nenhuma ação demonstrativa modifica dados persistidos.

## Assumptions

- O identificador do pedido é temporário e existe somente na memória da página.
- A impressão usa os recursos do navegador, sem comunicação com impressora térmica.
- A sessão autenticada fornece o nome do operador; na ausência, usa “Operador”.


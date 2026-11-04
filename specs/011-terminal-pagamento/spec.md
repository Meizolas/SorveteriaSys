# Feature Specification: Terminal de pagamento demonstrável

**Feature Branch**: `011-terminal-pagamento`  
**Created**: 2026-11-04  
**Status**: Approved

## User Scenarios & Testing

### User Story 1 - Demonstrar pagamento com cartão (Priority: P1)

Como operador, quero enviar o total à maquininha e acompanhar o estado da transação antes de concluir a venda.

**Independent Test**: selecionar Cartão, finalizar, simular aprovação e confirmar que a venda é concluída somente depois da aprovação.

**Acceptance Scenarios**:

1. **Given** pedido com cartão, **When** o operador inicia o pagamento, **Then** vê valor, origem simulada e estados aguardando/processando.
2. **Given** pagamento aprovado, **When** o resultado é confirmado, **Then** a venda pode ser concluída uma única vez.
3. **Given** pagamento recusado, **When** o terminal retorna recusa, **Then** a venda permanece aberta e pode ser tentada novamente.

### Edge Cases

- Clique repetido não cria duas vendas.
- Fechar o diálogo antes da aprovação não conclui a venda.
- Nenhum número, validade ou código de segurança de cartão é armazenado.

## Requirements

- **FR-001**: O PDV DEVE exibir valor e estados do terminal para pagamentos com cartão.
- **FR-002**: O modo simulado DEVE ser claramente identificado como não homologado.
- **FR-003**: Aprovação DEVE anteceder a criação da venda com cartão.
- **FR-004**: Recusa DEVE preservar o pedido e permitir nova tentativa ou troca de pagamento.
- **FR-005**: O sistema NÃO DEVE solicitar nem armazenar dados completos do cartão.
- **FR-006**: Dinheiro e Pix DEVEM manter seus fluxos atuais.

## Success Criteria

- **SC-001**: O fluxo aprovado pode ser demonstrado em menos de 20 segundos.
- **SC-002**: Em 100% das recusas testadas nenhuma venda é criada.
- **SC-003**: O operador identifica visualmente o estado atual sem depender somente de cor.

## Assumptions

- O MVP usa simulador local até definição do adquirente, TEF ou modelo POS.
- Crédito e débito são escolhas visuais; parcelamento não integra cobrança real nesta entrega.

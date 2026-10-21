# Feature Specification: Vendas persistentes

**Created**: 2026-10-21
**Status**: Approved
**Input**: Persistir vendas do PDV com itens históricos, pagamento manual, número definitivo, idempotência e baixa atômica do estoque.

## User Scenarios & Testing

### User Story 1 - Concluir uma venda real (Priority: P1)

O operador monta um carrinho com produtos ativos, informa uma forma de pagamento manual e conclui a venda, recebendo um número definitivo e um comprovante baseado no registro salvo.

**Independent Test**: Vender duas unidades de um produto e uma de outro, pagar em dinheiro e confirmar venda, itens históricos, pagamento, troco e novos saldos.

**Acceptance Scenarios**:
1. **Given** produtos ativos com saldo suficiente, **When** a venda é concluída, **Then** venda, itens, pagamento e baixas de estoque são confirmados em conjunto.
2. **Given** dinheiro recebido acima do total, **When** o servidor conclui a venda, **Then** calcula e devolve o troco correto.
3. **Given** Pix ou cartão manual, **When** a venda é concluída, **Then** o total é registrado sem troco.
4. **Given** saldo insuficiente ou produto inativo, **When** a conclusão é tentada, **Then** nenhuma parte da operação é persistida.

### User Story 2 - Repetir uma solicitação com segurança (Priority: P1)

O sistema tolera repetição da confirmação causada por clique duplo ou falha de comunicação sem duplicar a venda ou a baixa de estoque.

**Independent Test**: Enviar duas vezes a mesma chave e conteúdo e confirmar uma única venda; repetir a chave com conteúdo diferente e confirmar conflito.

**Acceptance Scenarios**:
1. **Given** uma venda concluída, **When** a mesma chave e conteúdo são reenviados, **Then** o resultado original é devolvido sem novos efeitos.
2. **Given** uma chave já usada, **When** conteúdo diferente é enviado, **Then** o sistema rejeita a solicitação como conflito.

### Edge Cases

- Carrinho vazio, quantidade não inteira/positiva ou mais de 20 linhas é rejeitado.
- Produtos repetidos são consolidados antes do envio.
- O servidor ignora preços e totais calculados pela interface e usa o cadastro vigente.
- O estoque nunca fica negativo.
- Falha durante qualquer persistência desfaz todos os efeitos.

## Requirements

### Functional Requirements

- **FR-001**: O PDV DEVE carregar produtos ativos e saldos reais do catálogo.
- **FR-002**: O servidor DEVE recalcular preços, subtotais, total e troco.
- **FR-003**: A venda DEVE preservar nome, SKU, unidade e preço do produto no momento da conclusão.
- **FR-004**: O sistema DEVE registrar uma parcela de pagamento manual em dinheiro, Pix ou cartão.
- **FR-005**: Troco DEVE existir apenas para dinheiro e o valor recebido não pode ser inferior ao total.
- **FR-006**: Cada venda concluída DEVE receber um número definitivo único.
- **FR-007**: Venda, itens, pagamento e baixas de estoque DEVEM ser atômicos.
- **FR-008**: Produto controlado sem saldo suficiente DEVE impedir toda a venda.
- **FR-009**: A conclusão DEVE exigir chave idempotente; mesma chave e conteúdo retornam o mesmo resultado, enquanto conteúdo diferente gera conflito.
- **FR-010**: O comprovante DEVE usar somente os valores confirmados pelo servidor.
- **FR-011**: Esta etapa NÃO DEVE movimentar caixa, emitir documento fiscal nem confirmar pagamentos em provedores externos.

## Key Entities

- **Sale**: cabeçalho da venda concluída, operador, número, chave/fingerprint, valores e instante.
- **SaleItem**: retrato histórico de cada produto vendido.
- **Payment**: recebimento manual e eventual troco.
- **StockMovement**: saída rastreável originada pela venda.

## Success Criteria

- **SC-001**: Uma venda de até 20 linhas conclui em até 1 segundo na rede local em condições normais.
- **SC-002**: Repetir a mesma solicitação 10 vezes produz exatamente uma venda e uma baixa por item.
- **SC-003**: Em todos os cenários de erro, venda, pagamento e estoque permanecem sem efeitos parciais.
- **SC-004**: 100% dos valores exibidos após a conclusão coincidem com o resultado salvo pelo servidor.

## Assumptions

- Quantidades são inteiras neste recorte.
- Há um único pagamento por venda.
- Pix e cartão são registros manuais, sem integração externa.
- A vinculação obrigatória ao turno de caixa será adicionada na próxima etapa, quando o caixa persistente existir.


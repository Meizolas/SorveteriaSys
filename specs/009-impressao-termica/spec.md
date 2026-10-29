# Feature Specification: Impressão térmica operacional

**Feature Branch**: `[009-impressao-termica]`

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "Iniciar a integração do PDV com impressora térmica, começando pela primeira etapa das integrações de equipamentos."

## User Scenarios & Testing

### User Story 1 - Imprimir comprovante de venda (Priority: P1)

Após concluir uma venda, o operador solicita a impressão do comprovante não fiscal de 80 mm e recebe uma indicação clara de que a solicitação foi preparada, concluída ou falhou.

**Why this priority**: A impressão no balcão é a primeira integração operacional solicitada e já possui um comprovante persistente como origem.

**Independent Test**: Concluir uma venda, solicitar a impressão pelo modo disponível e confirmar que somente o comprovante correto é preparado sem alterar venda, pagamento, estoque ou caixa.

**Acceptance Scenarios**:

1. **Given** uma venda concluída, **When** o operador solicita a impressão, **Then** o comprovante de 80 mm da venda é preparado e a interface informa o resultado conhecido.
2. **Given** que a impressão direta não está configurada, **When** o operador imprime, **Then** o sistema oferece o diálogo de impressão do dispositivo sem declarar que a impressão física ocorreu.
3. **Given** uma falha ou cancelamento na impressão, **When** o operador retorna ao sistema, **Then** a venda continua concluída e pode ser consultada normalmente.

---

### User Story 2 - Reimprimir com rastreabilidade (Priority: P1)

O operador abre uma venda anterior e solicita uma nova via do comprovante, identificada como reimpressão e vinculada à venda original.

**Why this priority**: Falhas de papel, tampa aberta e resultado físico incerto fazem parte da operação real e não podem exigir uma nova venda.

**Independent Test**: Abrir uma venda no histórico, solicitar uma segunda via e confirmar que a venda permanece única e que a nova tentativa é registrada separadamente.

**Acceptance Scenarios**:

1. **Given** uma venda existente, **When** o operador solicita uma segunda via, **Then** o comprovante mantém os valores originais e é marcado como reimpressão.
2. **Given** duas solicitações de impressão da mesma venda, **When** o histórico é consultado, **Then** cada tentativa possui instante, operador, modo e resultado próprios.

---

### User Story 3 - Configurar o modo de impressão (Priority: P2)

O responsável pela loja escolhe entre impressão pelo diálogo do dispositivo e impressão direta, visualiza o estado da configuração e pode executar um teste sem gerar venda.

**Why this priority**: Equipamentos variam entre USB, rede e sistemas operacionais; a ativação precisa ser explícita e verificável.

**Independent Test**: Alterar o modo, salvar, executar uma impressão de teste e confirmar que o resultado é apresentado sem criar movimentação comercial.

**Acceptance Scenarios**:

1. **Given** uma instalação sem conector homologado, **When** o responsável acessa a configuração, **Then** somente o modo por diálogo está disponível para uso.
2. **Given** um conector local configurado e acessível, **When** o responsável executa o teste, **Then** o sistema apresenta o resultado e não cria venda, pagamento ou movimento de estoque.
3. **Given** um conector indisponível, **When** uma impressão direta é solicitada, **Then** a tentativa falha de forma explícita e permite usar o modo por diálogo.

### Edge Cases

- A janela de impressão pode ser cancelada sem que o navegador informe o resultado físico.
- Falta de papel, tampa aberta, impressora desligada e cabo desconectado não alteram a venda.
- Uma resposta perdida após o envio produz resultado incerto; o sistema orienta conferência antes de repetir.
- Duplo clique ou repetição de rede não pode criar solicitações duplicadas para a mesma ação do operador.
- Comprovantes longos permanecem legíveis e não cortam totais ou a marcação “SEM VALOR FISCAL”.
- Alterações posteriores no produto ou na loja não modificam os valores históricos da venda reimpressa.

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE manter o modo de impressão por diálogo do dispositivo como opção funcional e fallback.
- **FR-002**: Cada solicitação de impressão DEVE estar vinculada a uma venda persistida ou ser explicitamente um teste de configuração.
- **FR-003**: O conteúdo do comprovante DEVE usar somente o retrato histórico confirmado da venda.
- **FR-004**: O comprovante DEVE manter formato de 80 mm e a marcação “SEM VALOR FISCAL”.
- **FR-005**: Reimpressões DEVEM ser identificadas no documento e registradas separadamente da primeira via.
- **FR-006**: Cada tentativa DEVE registrar identificador, operador, instante, modo solicitado e resultado conhecido.
- **FR-007**: Os resultados DEVEM distinguir pelo menos preparada, enviada, falha e resultado incerto.
- **FR-008**: Repetir a mesma solicitação DEVE reutilizar seu resultado sem duplicar o envio.
- **FR-009**: Falha de impressão NÃO DEVE cancelar, repetir ou modificar a venda e seus efeitos.
- **FR-010**: O responsável DEVE visualizar o modo ativo e executar impressão de teste sem criar registros comerciais.
- **FR-011**: A impressão direta DEVE permanecer indisponível enquanto nenhum conector compatível estiver configurado e acessível.
- **FR-012**: Quando a impressão direta falhar, o operador DEVE poder recorrer ao modo por diálogo.
- **FR-013**: O sistema NÃO DEVE declarar sucesso físico quando só souber que o documento foi preparado ou enviado.
- **FR-014**: A interface DEVE indicar claramente que o documento é um comprovante não fiscal.

### Key Entities

- **Trabalho de impressão**: Uma solicitação rastreável vinculada a uma venda ou teste, com modo, estado, tentativas, operador e instantes.
- **Configuração de impressão**: Preferências da loja para modo, largura do papel, destino configurado e disponibilidade conhecida.
- **Comprovante**: Retrato imutável e não fiscal dos dados confirmados da venda, incluindo indicação de primeira via ou reimpressão.

## Success Criteria

### Measurable Outcomes

- **SC-001**: O operador prepara uma impressão ou segunda via em até 10 segundos após localizar a venda.
- **SC-002**: 100% dos comprovantes testados reproduzem itens, quantidades, totais e pagamento da venda original.
- **SC-003**: 100% das reimpressões ficam identificadas e rastreáveis sem criar nova venda.
- **SC-004**: Falhas simuladas de impressora não alteram venda, estoque, pagamento ou caixa em nenhum cenário de aceite.
- **SC-005**: Uma solicitação repetida com o mesmo identificador produz no máximo um envio efetivo.
- **SC-006**: Em uma instalação sem equipamento configurado, o operador ainda consegue preparar o comprovante pelo diálogo do dispositivo.

## Assumptions

- O comprovante continua não fiscal; emissão de NFC-e pertence a uma feature separada.
- A primeira entrega funciona pelo diálogo de impressão do sistema e prepara a rastreabilidade necessária para impressão direta.
- Comunicação direta exige um conector local compatível com o sistema operacional e com o tipo de conexão do equipamento.
- Nenhum modelo de impressora é considerado homologado sem teste físico registrado.
- A largura inicial é 80 mm; suporte a 58 mm poderá ser acrescentado após necessidade confirmada.
- A venda persistente e o histórico existentes são a origem autoritativa do documento.

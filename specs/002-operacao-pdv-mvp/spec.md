# Feature Specification: Operação de Balcão MVP

**Feature Branch**: `[002-operacao-pdv-mvp]`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "Iniciar as telas principais para apresentação de um ERP PDV de sorveteria, com design moderno e minimalista: dashboard, produtos, estoque, caixa e venda."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar venda de balcão (Priority: P1)

O operador abre o PDV, localiza produtos, monta o carrinho, informa o pagamento manual e conclui a venda com baixa de estoque e registro no caixa.

**Why this priority**: É o fluxo central que demonstra valor operacional do sistema e conecta catálogo, estoque, caixa e indicadores.

**Independent Test**: Com caixa aberto e produtos disponíveis, adicionar dois itens, receber em dinheiro, concluir e confirmar total, troco, venda registrada e estoque atualizado.

**Acceptance Scenarios**:

1. **Given** um caixa aberto e produto ativo com estoque suficiente, **When** o operador conclui o pagamento, **Then** a venda é registrada uma única vez, o estoque é baixado e o recebimento aparece no caixa.
2. **Given** um produto sem saldo suficiente, **When** o operador tenta concluir a venda, **Then** o sistema não confirma a operação e identifica o item que precisa ser corrigido.
3. **Given** pagamento em dinheiro superior ao total, **When** a venda é concluída, **Then** o troco correto é apresentado e registrado.
4. **Given** uma tentativa repetida de conclusão da mesma venda, **When** a solicitação é recebida novamente, **Then** nenhum efeito financeiro ou de estoque é duplicado.

---

### User Story 2 - Administrar catálogo e estoque (Priority: P2)

O gestor consulta, cria e edita categorias e produtos, registra entradas ou ajustes e acompanha itens abaixo do estoque mínimo.

**Why this priority**: O PDV depende de produtos comercializáveis e saldos confiáveis para operar.

**Independent Test**: Criar uma categoria e um produto, registrar uma entrada e confirmar que ele fica disponível no PDV com saldo e preço corretos.

**Acceptance Scenarios**:

1. **Given** dados válidos, **When** o gestor cadastra um produto, **Then** ele aparece no catálogo com nome, categoria, preço, unidade, status e controle de estoque informados.
2. **Given** um produto controlado em estoque, **When** uma entrada ou ajuste é registrado, **Then** o novo saldo e o movimento rastreável ficam visíveis.
3. **Given** saldo igual ou inferior ao mínimo, **When** o gestor consulta estoque ou dashboard, **Then** o produto é destacado como estoque baixo.

---

### User Story 3 - Operar turno de caixa (Priority: P3)

O operador abre o caixa com saldo inicial, consulta os movimentos, registra sangria ou suprimento e fecha o turno com resumo por forma de pagamento.

**Why this priority**: Uma venda precisa estar associada a um turno e seus recebimentos devem ser conciliáveis.

**Independent Test**: Abrir um caixa, registrar uma venda e uma sangria, fechar o turno e conferir o resumo esperado.

**Acceptance Scenarios**:

1. **Given** nenhum turno aberto para o operador, **When** ele informa o saldo inicial, **Then** um novo turno é aberto e habilita vendas.
2. **Given** um turno aberto, **When** o operador registra sangria ou suprimento com motivo, **Then** o movimento altera o saldo esperado e aparece no histórico.
3. **Given** um turno aberto, **When** o operador informa a contagem e fecha o caixa, **Then** o resumo mostra valores esperados, informados e eventual diferença.

---

### User Story 4 - Acompanhar operação no dashboard (Priority: P4)

O gestor visualiza rapidamente faturamento, quantidade de vendas, ticket médio, situação do caixa, produtos com estoque baixo e vendas recentes.

**Why this priority**: Reúne a situação da loja e torna a demonstração e a tomada de decisão imediatas.

**Independent Test**: Registrar vendas e alterar estoque, abrir o dashboard e conferir que os indicadores refletem os registros do dia.

**Acceptance Scenarios**:

1. **Given** movimentações no dia, **When** o dashboard é aberto, **Then** os indicadores e listas apresentam dados coerentes com as operações registradas.
2. **Given** ausência de vendas, **When** o dashboard é aberto, **Then** o estado vazio é informativo e os atalhos operacionais continuam disponíveis.

### Edge Cases

- Um produto inativo ou sem preço válido não pode ser adicionado a uma nova venda.
- O operador não pode abrir um segundo turno próprio nem vender sem turno aberto.
- Quantidades, descontos e valores negativos ou fora da precisão permitida são rejeitados.
- A alteração cadastral posterior não modifica a descrição e o preço preservados em vendas concluídas.
- Turno fechado não aceita novos movimentos; correções futuras devem ocorrer por movimentos explícitos.
- Falha de comunicação mantém o carrinho e não informa sucesso sem confirmação do servidor.
- Listas sem dados, carregando ou com falha apresentam estados distintos e acessíveis.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE apresentar, após o login, uma estrutura visual consistente de ERP com navegação para Dashboard, PDV, Produtos, Estoque e Caixa.
- **FR-002**: A interface DEVE ser responsiva para computador e tablet, utilizar português do Brasil, valores em BRL, contraste legível, foco visível e navegação por teclado.
- **FR-003**: O dashboard DEVE apresentar indicadores do dia, estado do caixa, alertas de estoque e vendas recentes com estados de carregamento, vazio e erro.
- **FR-004**: O gestor DEVE poder listar, buscar, criar, editar, ativar e inativar categorias e produtos.
- **FR-005**: Cada produto DEVE possuir nome, categoria, preço de venda, unidade, status, indicação de controle de estoque, saldo e estoque mínimo quando aplicável.
- **FR-006**: Valores monetários e quantidades DEVEM respeitar precisão definida e ser validados pelo sistema antes de persistir.
- **FR-007**: O gestor DEVE poder registrar entrada e ajuste de estoque com quantidade, tipo e motivo, preservando histórico rastreável.
- **FR-008**: O sistema DEVE bloquear por padrão a conclusão de venda que gere estoque negativo.
- **FR-009**: O operador DEVE poder abrir um turno de caixa com saldo inicial e consultar o turno atualmente aberto.
- **FR-010**: O operador DEVE poder registrar suprimento e sangria somente em turno aberto, sempre com valor positivo e motivo.
- **FR-011**: O operador DEVE poder fechar o turno informando o valor contado e visualizar esperado, informado e diferença.
- **FR-012**: O PDV DEVE permitir pesquisar produtos, adicionar itens, alterar quantidades e remover itens sem confirmação desnecessária.
- **FR-013**: O servidor DEVE recalcular subtotal, desconto, total, pagamento e troco, sem confiar em totais calculados apenas na interface.
- **FR-014**: O MVP DEVE aceitar registros manuais de pagamento em dinheiro, Pix e cartão, deixando explícito que Pix e cartão não possuem confirmação automática de provedor.
- **FR-015**: Troco DEVE ser permitido somente para a parcela recebida em dinheiro.
- **FR-016**: A conclusão da venda DEVE registrar de forma atômica a venda, seus itens históricos, pagamentos, movimento do caixa e baixas de estoque.
- **FR-017**: A conclusão da venda DEVE aceitar um identificador único de operação e impedir duplicação de efeitos por repetição.
- **FR-018**: O sistema DEVE listar vendas recentes com código, horário, operador, total, forma de pagamento e estado.
- **FR-019**: A interface DEVE comunicar validações e conflitos em linguagem operacional, preservando os dados digitados em falhas recuperáveis.
- **FR-020**: O ambiente de demonstração DEVE fornecer dados sintéticos de categorias, produtos e estoque sem criar vendas ou caixa fictícios como se fossem reais.
- **FR-021**: Recursos fora deste recorte — fiscal, integração automática de pagamentos, clientes, fornecedores, compras, fichas técnicas, múltiplas lojas e produção — NÃO DEVEM ser apresentados como concluídos.

### Key Entities

- **Category**: Agrupamento usado para organizar e filtrar produtos comercializáveis.
- **Product**: Item de venda com preço, unidade, status e configuração de controle de estoque.
- **StockBalance**: Saldo atual e limite mínimo de um produto controlado.
- **StockMovement**: Entrada, saída ou ajuste rastreável que explica uma alteração de saldo.
- **CashShift**: Turno de caixa aberto por um operador, com saldos inicial, esperado e contado.
- **CashMovement**: Suprimento, sangria, recebimento ou troco associado a um turno e origem.
- **Sale**: Venda de balcão com estado, totais, operador, turno e identificador idempotente.
- **SaleItem**: Retrato histórico do produto, preço, quantidade e total no momento da venda.
- **Payment**: Parcela manual de recebimento, sua forma, valor e troco quando em dinheiro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um operador treinado consegue abrir o caixa, registrar e concluir uma venda simples em até 90 segundos.
- **SC-002**: Uma nova venda com até 20 itens é concluída sem duplicar valores ou estoque mesmo após repetição da confirmação.
- **SC-003**: O gestor consegue cadastrar um produto e disponibilizá-lo no PDV em até 2 minutos.
- **SC-004**: Saldos de estoque, recebimentos e indicadores do dashboard reconciliam integralmente com os movimentos que lhes deram origem nos cenários de aceite.
- **SC-005**: Todos os cinco módulos principais exibem corretamente estados de carregamento, vazio, erro e sucesso em computador e tablet.
- **SC-006**: Pelo menos 90% dos participantes de uma demonstração guiada identificam sem orientação onde iniciar uma venda, cadastrar produto e abrir o caixa.

## Assumptions

- O MVP atende uma empresa e uma única loja em servidor local.
- A autenticação e os perfis existentes serão reutilizados; o primeiro recorte prioriza o perfil administrador e o operador autenticado.
- Produtos são vendidos por unidade neste primeiro fluxo; peso, montagem por sabores, tamanhos e complementos ficam para feature posterior.
- Descontos excepcionais, cancelamentos e estornos completos ficam fora da primeira implementação, embora a estrutura preserve rastreabilidade para evolução.
- Pagamentos são registrados manualmente e não representam confirmação por banco, adquirente ou provedor Pix.
- Estoque é controlado diretamente por produto de venda no MVP; ingredientes, receitas e lotes ficam fora deste recorte.


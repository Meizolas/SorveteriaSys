# Feature Specification: Redesign Operacional Sorvê

**Feature Branch**: `[003-redesign-sorve-ui]`
**Created**: 2026-10-20
**Status**: Approved
**Input**: Redesenhar as cinco telas do MVP conforme as referências aprovadas em `images/`, preservando dados, regras e integrações existentes.

## User Scenarios & Testing

### User Story 1 - Navegar pela operação (Priority: P1)

O operador identifica a marca Sorvê e alterna entre Visão geral, Frente de caixa, Produtos, Estoque e Caixa com alvos adequados para mouse, teclado e toque.

**Independent Test**: Percorrer as cinco telas em desktop, tablet e celular, confirmando módulo selecionado, ausência de cortes e continuidade do estado.

**Acceptance Scenarios**:
1. **Given** sessão autenticada, **When** uma área é escolhida, **Then** a navegação colorida identifica o módulo também por texto, ícone e indicador de seleção.
2. **Given** largura de celular, **When** o operador navega, **Then** a barra inferior permanece acessível sem cobrir o conteúdo.

### User Story 2 - Operar as cinco telas responsivas (Priority: P1)

O operador usa dashboard, catálogo do PDV, produtos, estoque e caixa em layouts próprios para cada largura, sem perder as funcionalidades atuais.

**Independent Test**: Validar cada tela em 1440×900, 1024×768, 768×1024 e 390×844.

**Acceptance Scenarios**:
1. **Given** dados reais disponíveis, **When** uma tela é aberta, **Then** ela apresenta somente valores confirmados pela aplicação.
2. **Given** ausência de dados ou endpoint, **When** o bloco correspondente é exibido, **Then** apresenta estado vazio ou limitação explícita, sem inventar valores.
3. **Given** celular no PDV, **When** itens são adicionados, **Then** o resumo fixo abre o pedido e o carrinho é preservado.

### Edge Cases

- Conteúdo longo não causa rolagem horizontal da página.
- Tabelas viram listas próprias no celular.
- Modais continuam utilizáveis com teclado virtual.
- Status não depende exclusivamente de cor.
- Falha da API não é apresentada como conexão ativa.

## Requirements

### Functional Requirements

- **FR-001**: A identidade DEVE usar o nome Sorvê e a logo fornecida, preservando proporção e transparência.
- **FR-002**: Componentes da interface DEVEM usar cantos retos, fundos sólidos, separadores finos e nenhuma sombra decorativa.
- **FR-003**: A navegação DEVE usar verde-petróleo no cabeçalho e cores estáveis por módulo: escuro, azul, teal, ocre e vermelho.
- **FR-004**: Controles principais DEVEM ter no mínimo 56 px e demais alvos interativos no mínimo 48×48 px.
- **FR-005**: Desktop DEVE usar navegação superior em cinco blocos; celular DEVE usar navegação inferior respeitando safe areas.
- **FR-006**: Visão geral DEVE mostrar indicadores, atalhos, estado vazio de vendas, situação real do caixa e estoque baixo real.
- **FR-007**: PDV DEVE ter busca, categorias retangulares, grade e pedido lateral; no celular, pedido acessível por resumo fixo sem comprimir duas colunas.
- **FR-008**: Produtos DEVE usar tabela em desktop e lista em celular, com busca, filtros, cadastro e ativação reais.
- **FR-009**: Estoque DEVE usar tabela/lista, destacar a linha inteira abaixo do mínimo e não mostrar porcentagem sem capacidade real.
- **FR-010**: Caixa DEVE preservar estados e diálogos atuais com indicadores e ações em blocos sólidos.
- **FR-011**: A interface NÃO DEVE usar emojis ou desenhos SVG manuais como ícones operacionais; DEVE usar uma biblioteca de ícones compatível instalada no projeto e não depender de recursos remotos.
- **FR-012**: Datas, horários, operador, conexão, caixa e dados operacionais DEVEM vir do estado real ou serem omitidos/identificados como indisponíveis.
- **FR-013**: Estados carregando, vazio, erro e indisponível DEVEM ser distinguíveis e acessíveis.
- **FR-014**: O redesign NÃO DEVE alterar contratos, cálculos, permissões ou regras financeiras.

## Success Criteria

- **SC-001**: As cinco telas funcionam sem sobreposição ou rolagem horizontal nas quatro resoluções-alvo.
- **SC-002**: 100% das ações principais possuem alvo mínimo de 56 px e foco visível.
- **SC-003**: O pedido do PDV permanece intacto ao abrir e fechar sua visualização móvel.
- **SC-004**: Produtos e estoque continuam executando todas as operações persistentes existentes após o redesign.
- **SC-005**: Nenhum indicador operacional exibe dado fictício como se fosse real.

## Assumptions

- A logo branca será usada sobre o cabeçalho verde-petróleo.
- Na ausência de fotos individuais, produtos usarão placeholders vetoriais locais.
- Caixa e vendas permanecem demonstrativos enquanto seus endpoints não existirem.


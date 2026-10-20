<!--
Sync Impact Report — material temporário de revisão; remover antes do commit de adoção.
Version change: inexistente → 1.0.0 (constituição inicial proposta).
Princípios adicionados: I–X abaixo; nenhum princípio anterior removido.
Seções adicionadas: Core Principles; Escopo e restrições técnicas;
Fluxo de desenvolvimento e qualidade; Governance.
Templates dependentes: não alterados; devem consumir esta constituição em runtime.
Repositório de aplicação e instalação do Spec Kit não foram fornecidos ou modificados.
Decisão inicial recomendada: MySQL 8.4 LTS/InnoDB; revisável pelo responsável
antes da primeira migração. Não representa aprovação expressa prévia do banco.
Pendências de implantação: equipamentos, dimensionamento, enquadramento fiscal
e metas de recuperação serão definidos nas respectivas specs antes de ativação.
-->

# Sistema de Gestão de Sorveteria Constitution

## Core Principles

### I. Especificação como contrato de desenvolvimento

- Toda funcionalidade DEVE nascer de uma especificação versionada antes do código.
- A spec DEVE explicar problema, usuários, escopo, exclusões, regras de negócio,
  critérios de aceite observáveis e cenários de erro relevantes.
- Requisitos DEVEM receber identificadores estáveis para rastrear decisões,
  tarefas e evidências de validação.
- O plano técnico DEVE explicar como atender à spec e demonstrar conformidade
  com esta constituição antes da implementação.
- Mudanças de comportamento DEVEM atualizar spec, plano, tarefas e testes afetados.
- Correções pequenas PODEM usar um registro curto vinculado à spec existente,
  contendo reprodução, comportamento esperado e validação. Não é obrigatório
  abrir uma nova feature para cada defeito.
- Ambiguidades que alterem dinheiro, estoque, permissões ou obrigações fiscais
  DEVEM ser resolvidas antes de implementar a parte dependente.
- Agentes e desenvolvedores NÃO DEVEM inventar regras comerciais para preencher
  lacunas. Decisões técnicas reversíveis PODEM ser documentadas como premissas.

Motivo: acelerar entregas sem transformar suposições em regras do negócio.

### II. Entregas pequenas e arquitetura proporcional

- O sistema DEVE começar como monólito modular, com backend único e banco relacional.
- Cada entrega DEVE formar um fluxo utilizável ou habilitar uma dependência
  concreta da próxima entrega, com critério de conclusão explícito.
- Microsserviços, Kubernetes, event sourcing, brokers, múltiplos bancos e
  sincronização distribuída NÃO DEVEM ser introduzidos sem necessidade medida,
  alternativa simples analisada e decisão arquitetural registrada.
- Os módulos DEVEM ser organizados por domínio; camadas técnicas ficam dentro
  do módulo quando necessárias. Não criar uma camada global para cada tipo de classe.
- Regras DEVEM ficar no backend. A interface PODE antecipar validações para UX,
  mas NÃO DEVE ser a única responsável por validar valores ou permissões.
- Um módulo NÃO DEVE escrever diretamente nas tabelas de outro. A coordenação
  DEVE passar por serviços de aplicação ou contratos internos explícitos.
- Não criar abstrações genéricas sem uso concreto. Preferir implementação direta
  e refatoração quando surgir repetição significativa.

Motivo: priorizar rapidez sem perder limites de responsabilidade.

### III. Integridade monetária, transações e concorrência

- Valores monetários DEVEM usar BigDecimal no Java e DECIMAL no banco.
  float e double são proibidos para preço, custo, desconto, imposto e recebimento.
- Quantidades fracionadas DEVEM usar representação decimal com unidade explícita.
- Cada operação DEVE definir precisão, escala, arredondamento e rateio de resíduos.
  O plano DEVE registrar os tipos escolhidos e seus limites de valor.
- Totais DEVEM ser recalculados pelo servidor a partir de regras autorizadas.
- Vendas DEVEM preservar o retrato histórico de descrição, tamanho, escolhas,
  unidade, preço e desconto; alterações de cadastro não podem reescrever o passado.
- Movimentos de caixa, estoque e benefícios DEVEM ter origem rastreável e
  reversões explícitas; não apagar lançamentos para corrigir saldos.
- Alterações locais que componham uma única operação de negócio DEVEM ser
  atômicas dentro do MySQL, incluindo os efeitos locais obrigatórios entre módulos.
- Chamadas a equipamentos ou provedores externos NÃO DEVEM ser tratadas como
  parte de uma transação ACID do banco; exigem estado persistido e recuperação.
- Operações concorrentes DEVEM proteger saldo, reserva, pagamento e fechamento
  com estratégia explícita: bloqueio, versão, atualização condicional e constraints.
- Retries de escrita DEVEM ser limitados e seguros contra repetição de efeitos.
- Relatórios DEVEM distinguir faturamento, recebimento, saldo, custo e resultado.

Motivo: uma falha parcial ou dois caixas simultâneos não podem corromper a operação.

### IV. Estados explícitos e idempotência

- Pedido, produção, pagamento, entrega interna/retirada e documento fiscal DEVEM
  ter ciclos de estado próprios; um único status não pode representar todos.
- Cada transição DEVE validar estado de origem, permissão e pré-condições.
- Finalização de venda, confirmação de pagamento, baixa de estoque e estorno
  DEVEM resistir à repetição da mesma solicitação sem duplicar efeitos.
- Operações críticas DEVEM possuir identificador de operação e unicidade persistida.
  Reutilizar uma chave com conteúdo diferente DEVE produzir conflito explícito.
- Timeout de pagamento integrado DEVE resultar em situação desconhecida ou
  pendente de consulta, nunca em nova cobrança automática sem reconciliação.
- Impressão DEVE ocorrer a partir de trabalho persistido após confirmação local.
  Reimpressões DEVEM ser identificadas e auditadas.
- O sistema NÃO DEVE prometer impressão exatamente uma vez: falha após envio
  pode exigir conferência humana antes de repetir um trabalho de resultado incerto.
- Cancelamento após preparo DEVE avaliar estorno financeiro e perda de insumos
  separadamente; não repor automaticamente ingredientes já consumidos.

Motivo: repetição de cliques, falhas de rede e reinicializações são parte da operação.

### V. Estoque e montagem fiéis à sorveteria

- Produto de venda, ingrediente, embalagem, receita e lote DEVEM ter conceitos distintos.
- O catálogo DEVE representar venda por unidade, peso e porção, além de tamanhos,
  sabores e grupos de complementos, conforme a feature implementada.
- Grupos DEVEM declarar obrigatoriedade, mínimo, máximo, quantidade incluída,
  cobrança excedente e dependências de tamanho quando aplicáveis.
- A composição escolhida DEVE influenciar preço e consumo conforme receita versionada.
- Reserva e consumo DEVEM ter momentos definidos na spec. O mesmo insumo não
  pode ser consumido novamente por alteração de status ou repetição de requisição.
- Conversões DEVEM ser explícitas e dimensionalmente válidas. Converter litro
  em quilograma exige fator específico e medido para o produto.
- Pesagens DEVEM registrar peso bruto, tara, peso líquido, unidade e origem.
  Alteração manual DEVE exigir permissão e motivo.
- Self-service misto NÃO DEVE apresentar consumo exato por sabor a partir apenas
  do peso total; estimativas DEVEM ser identificadas como estimativas.
- Entrada, transferência, inventário, perda e devolução DEVEM gerar movimentos
  rastreáveis. Estoque negativo DEVE ser bloqueado por padrão, com exceções
  somente por política explícita e autorização auditada.
- Validade após abertura e perdas por derretimento DEVEM ser representadas
  quando o controle de lotes estiver habilitado.

Motivo: os modelos de sorveteria diferem de um catálogo genérico de varejo.

### VI. Segurança e rastreabilidade por padrão

- Toda operação protegida DEVE autenticar usuário e autorizar ação no backend.
- Permissões DEVEM seguir menor privilégio e considerar unidade quando aplicável.
- Desconto excepcional, cancelamento, estorno, ajuste de estoque, alteração de
  preço e reabertura de caixa DEVEM ter autorização e auditoria.
- Auditoria DEVE registrar ator, instante, ação, entidade, motivo quando exigido,
  identificador de correlação e mudanças relevantes, sem armazenar segredos.
- Logs de auditoria NÃO DEVEM ser editáveis pelos perfis operacionais comuns.
- Senhas DEVEM usar hash adaptativo via Spring Security. Credenciais de produção
  NÃO DEVEM estar no Git, frontend, migrations ou imagens de distribuição.
- A aplicação DEVE usar usuário de banco com permissões mínimas; migração e
  administração PODEM usar credenciais separadas.
- A primeira conta administradora DEVE ser provisionada por procedimento seguro,
  sem senha universal incorporada e sem credenciais de demonstração em produção.
- Dados pessoais DEVEM ser mínimos para a finalidade; cliente não identificado
  DEVE ser permitido quando o fluxo não exigir identificação.
- Retenção, anonimização e exportação DEVEM preservar obrigações de guarda e
  consistência dos registros, conforme política validada antes da operação real.
- Dados completos de cartão e códigos de segurança NÃO DEVEM ser armazenados.

Motivo: rede interna não elimina risco de acesso indevido ou erro operacional.

### VII. Operação local e recuperação previsível

- A implantação inicial DEVE atender uma empresa e uma loja, com servidor local
  e acesso dos terminais por navegador na rede interna.
- Ausência de internet NÃO DEVE impedir funções internas que dependam apenas
  do servidor local, banco e rede disponíveis.
- Queda do servidor ou da LAN NÃO DEVE ser confundida com ausência de internet.
  Não há compromisso inicial de venda autônoma em cada terminal desconectado.
- A interface NÃO DEVE mostrar sucesso em uma escrita sem confirmação do servidor.
  Resultado incerto DEVE orientar consulta antes de repetir a operação.
- Não depender de CDN, fontes remotas ou validação online de licença para as
  funções essenciais do atendimento local.
- Backup automático, retenção, destino independente do disco principal e
  procedimento de restauração DEVEM existir antes do uso real.
- Metas de perda de dados tolerável e tempo de recuperação DEVEM ser definidas
  e verificadas no plano de implantação; backup sem restauração testada não atende.
- Atualizações DEVEM preservar dados e fornecer estratégia de recuperação
  compatível com as migrações aplicadas.

Motivo: manter continuidade de atendimento com limites técnicos honestos.

### VIII. Experiência rápida e acessível

- PDV DEVE priorizar venda rápida, teclado, leitor de código e tela touch.
- Telas administrativas DEVEM manter navegação, termos e padrões consistentes.
- Conteúdo operacional DEVE usar português do Brasil, BRL e convenções locais.
- Estados de carregamento, vazio, erro, indisponibilidade e conflito DEVEM existir
  para os fluxos afetados; não usar apenas cor para transmitir situação.
- Ações críticas DEVEM proteger contra repetição sem depender apenas do botão desabilitado.
- Confirmações DEVEM se concentrar em ações de impacto relevante, sem interromper
  cada lançamento de produto ou ação reversível de baixo risco.
- Acessibilidade DEVE contemplar rótulos, foco visível, teclado e contraste legível.
- Operações comuns DEVEM ter feedback imediato de processamento e preservar
  os dados digitados quando uma falha recuperável ocorrer.

Motivo: a qualidade do sistema será percebida no horário de maior movimento.

### IX. Qualidade demonstrável e proporcional ao risco

- Regras de preço, arredondamento, pagamento, estoque, permissões e transições
  DEVEM ter testes automatizados de comportamento.
- Persistência e migrações DEVEM ser testadas com MySQL real, preferencialmente
  Testcontainers. H2 não substitui a validação do banco de produção.
- Funcionalidades críticas DEVEM incluir testes de repetição, concorrência ou
  falha parcial quando esses riscos estiverem presentes.
- Fluxos centrais DEVEM possuir testes de ponta a ponta em ambiente controlado.
- Mocks DEVEM isolar serviços externos e equipamentos, sem substituir testes
  de integração da lógica transacional e das constraints.
- Não exigir percentual de cobertura arbitrário nem testes que apenas repitam
  getters, mapeamentos triviais ou detalhes internos sem risco relevante.
- Equipamento simulado NÃO DEVE ser declarado homologado. Integração real exige
  modelo, protocolo e cenários de teste registrados.
- Falhas críticas conhecidas de integridade, autorização ou perda de dados
  bloqueiam a liberação do fluxo afetado.

Motivo: validar o que protege o negócio sem transformar testes em burocracia.

### X. Escopo interno e dependências controladas

- O produto DEVE concentrar gestão interna e atendimento presencial.
- WhatsApp, chatbot, envio externo de links, campanhas externas, loja online,
  marketplaces e rastreamento externo de entregadores estão fora do escopo.
- Integrações de pagamento, equipamentos e emissão fiscal PODEM existir quando
  necessárias ao atendimento interno; devem ser opcionais e explicitamente especificadas.
- Totem ou QR Code transacional NÃO entram automaticamente no primeiro release.
  Exigem feature própria, validação de sessão e política de acesso.
- Fabricação própria, múltiplas lojas e plataforma SaaS são expansões opcionais.
  Não construir isolamento multitenant ou cobrança de assinaturas antecipadamente.
- Indicadores e alertas internos PODEM ser automatizados. IA não é dependência
  do núcleo e não pode confirmar pagamentos, alterar estoque ou aprovar estornos.

Motivo: reduzir o caminho até uma primeira operação confiável.

## Escopo e restrições técnicas

### Stack inicial

| Componente | Decisão inicial |
| --- | --- |
| Backend | Java 21 LTS e Spring Boot em linha estável compatível |
| HTTP | Spring Web MVC; API REST documentada em OpenAPI |
| Segurança | Spring Security; sessão de servidor para a aplicação local |
| Persistência | Spring Data JPA/Hibernate; SQL explícito quando justificado |
| Banco | MySQL 8.4 LTS, InnoDB, utf8mb4 e modo SQL estrito |
| Migrações | Flyway como autoridade do esquema |
| Build backend | Gradle Wrapper e Java toolchain |
| Frontend | React, TypeScript em modo strict e Vite |
| UI | Biblioteca de componentes acessível e consistente, escolhida no plano |
| Testes backend | JUnit, ferramentas Spring e Testcontainers/MySQL |
| Testes frontend | Vitest, Testing Library e Playwright para fluxos centrais |
| Ambiente reproduzível | Docker Compose para desenvolvimento e testes locais |
| Implantação inicial | Servidor local; frontend e API na mesma origem por padrão |

- Versões exatas de Java, Spring Boot, Gradle, Node, pacotes e imagens DEVEM ser
  verificadas quanto à compatibilidade e fixadas no plano de fundação e nos arquivos
  de build/lock. Proibido depender de tags `latest` em ambientes reproduzíveis.
- MySQL é recomendação inicial para aproveitar familiaridade e reduzir preparação.
  A troca para PostgreSQL antes da primeira migração é uma decisão de fundação
  simples; após dados reais, exige plano de migração e validação.
- Não há obrigação de suportar dois bancos simultaneamente.
- Hibernate NÃO DEVE alterar esquema automaticamente em produção; usar validação
  de esquema e migrações versionadas. Migração aplicada não pode ser reescrita.
- Collation, sensibilidade a caixa, índices únicos e semântica de buscas DEVEM
  ser explicitados onde afetarem códigos, logins ou identificação de produtos.
- Instantes DEVEM ser persistidos em UTC com convenção explícita. Data de negócio
  e apresentação DEVEM usar fuso configurável, inicialmente America/Sao_Paulo.
- Decimais críticos na API DEVEM ter contrato que evite perda de precisão no
  JavaScript; preferir strings decimais documentadas e cálculo autoritativo no backend.
- Preferir cookies HttpOnly e sessão de servidor; CSRF DEVE ser tratado em
  operações autenticadas por cookie. Tokens em localStorage não são padrão.
- Origem única, HTTPS na implantação operacional e política de sessão DEVEM ser
  tratados no plano; certificados e endpoints de dispositivos exigem validação local.
- Redis, mensageria e serviço de autenticação externo não são requisitos iniciais.

### Limites de módulos

| Módulo | Responsabilidade |
| --- | --- |
| Acesso e configuração | Usuários, perfis, permissões, loja e parâmetros |
| Catálogo | Produtos, categorias, tamanhos, sabores, adicionais e preços |
| Fichas técnicas | Composição, rendimento, conversões e custo |
| Vendas | Carrinho presencial, pedido, mesas, comandas e cancelamento |
| Produção | Filas, setores, preparo, conferência e retirada |
| Estoque | Saldos, reservas, movimentos, inventários, lotes e perdas |
| Compras | Fornecedores, pedidos de compra e recebimento |
| Caixa | Turnos, abertura, sangria, suprimento e fechamento |
| Pagamentos | Recebimentos, estornos e conciliação |
| Financeiro | Obrigações, recebíveis, despesas e resultado gerencial |
| Clientes | Cadastro opcional, histórico e fidelidade interna |
| Equipamentos | Adaptadores de balança, impressora e leitor quando necessário |
| Fiscal | Integração fiscal e documentos, quando aplicável |
| Relatórios | Consultas e indicadores rastreáveis aos registros de origem |

Esses limites orientam o monólito; não obrigam criar todos os pacotes, tabelas
ou serviços antes da feature correspondente. Compartilhar apenas conceitos
estáveis, como dinheiro e identificadores, evitando um módulo comum sem limites.

### Regras mínimas por área

- Caixa: abertura, movimentos e fechamento pertencem a um turno identificado;
  diferença exige justificativa. Turno fechado não aceita escrita operacional comum.
- Pagamentos: soma aplicada não pode exceder o saldo sem tratamento explícito
  de troco/crédito; troco é associado à parcela em dinheiro, não a cartão ou Pix.
- Comandas: transferências e divisão devem preservar soma, origem e histórico.
- Compras: receber mercadoria, reconhecer obrigação e pagar são eventos distintos.
- Financeiro: compra paga não pode ser contada novamente como consumo/custo da venda.
- Fidelidade: concessão, uso, expiração e reversão devem formar extrato auditável;
  repetição de pedido ou cancelamento não pode duplicar benefícios.
- Relatórios: filtros por período e loja devem declarar base temporal, tratamento
  de cancelados, estornos e descontos; totais precisam reconciliar com a origem.
- Fiscal: documento não fiscal não substitui documento obrigatório. Enquadramento,
  UF, regime e provedor devem ser validados antes de operar o fluxo real aplicável.
- Equipamentos: biblioteca ou agente local só entra após comprovar necessidade;
  navegador não pode ser considerado capaz de acessar qualquer periférico diretamente.

### Implantação e evolução

1. Fundação: ambiente, esquema inicial, acesso, configuração e auditoria essencial.
2. Venda de balcão: catálogo mínimo, montagem, caixa, pagamento manual identificado,
   estoque necessário e comprovante. Fechar um fluxo vertical antes de ampliar módulos.
3. Operação presencial ampliada: balança, comandas, produção e impressão por setor.
4. Gestão: receitas completas, compras, lotes, perdas, contas e relatórios.
5. Complementos: fidelidade interna, pagamentos integrados, fiscal e expansões
   justificadas; fiscal obrigatório antecipa-se ao uso real correspondente.

O MVP é um recorte utilizável, não o sistema completo. Funcionalidades adiadas
DEVEM permanecer identificadas no backlog, sem simular recursos inexistentes.
Captura manual de pagamento DEVE informar que não houve confirmação automática.

## Fluxo de desenvolvimento e qualidade

### Processo SDD com Spec Kit

O destino canônico deste arquivo é `.specify/memory/constitution.md`.
A constituição define princípios; detalhes de cada feature ficam nas specs.

1. `/speckit.constitution`: adotar ou revisar os princípios deste documento.
2. `/speckit.specify`: descrever uma feature pequena em termos de comportamento
   e valor; não especificar todo o ERP como uma única entrega.
3. `/speckit.clarify`: resolver ambiguidades relevantes antes do plano dependente.
4. `/speckit.plan`: definir dados, contratos, transações, segurança e implantação
   da feature, com um Constitution Check antes e depois do desenho.
5. `/speckit.tasks`: dividir o trabalho em tarefas rastreáveis e ordenadas por
   dependência; paralelizar apenas tarefas sem conflito de responsabilidade.
6. `/speckit.analyze`: revisar inconsistências entre spec, plano e tarefas antes
   de implementar; violações constitucionais bloqueiam a implementação afetada.
7. `/speckit.implement`: implementar o recorte autorizado e executar validações.

Os nomes acima usam a convenção de slash commands; o agente ou a versão instalada
pode expor comandos equivalentes. A fundação DEVE registrar a versão do Spec Kit
e conferir os comandos disponíveis. Este arquivo não instala nem executa o toolkit.

### Artefatos e decisões

- Usar o diretório de feature criado pelo Spec Kit, normalmente
  `specs/NNN-nome-da-feature/`, preservando sua estrutura instalada.
- `spec.md` DEVE conter requisitos e critérios de aceite; `plan.md`, decisões de
  implementação; `tasks.md`, execução rastreável.
- `research.md`, `data-model.md`, `contracts/` e `quickstart.md` DEVEM ser usados
  quando produzidos pelo fluxo ou necessários à complexidade da feature.
- Decisões de arquitetura duradouras DEVEM ter ADR curto com contexto, alternativas,
  decisão, consequências e condição de revisão.
- A spec não substitui a constituição; o plano não pode enfraquecer uma regra para
  acomodar a implementação. Conflitos exigem correção ou emenda explícita.
- Documentação e interface DEVEM usar português; código e identificadores técnicos
  DEVEM seguir convenção única em inglês, definida no plano de fundação.

### Constitution Check obrigatório

Cada plano DEVE responder, com evidência ou justificativa de não aplicabilidade:

- O recorte atende somente ao escopo interno autorizado?
- Regras e critérios de aceite estão definidos sem ambiguidades críticas?
- A solução preserva monólito modular e evita dependências desnecessárias?
- Dinheiro, quantidades, arredondamento e histórico foram tratados?
- Há atomicidade local, proteção concorrente e idempotência onde necessárias?
- Falhas de rede, equipamento e provedor possuem estados e recuperação?
- Permissões, auditoria e dados pessoais estão contemplados?
- Os testes cobrem os riscos relevantes com o banco escolhido?
- O fluxo funciona sem internet quando depende apenas da instalação local?
- Migrações, configuração e recuperação estão documentadas para a entrega?

### Critérios de pronto

Uma feature só está concluída quando:

1. Critérios de aceite estão demonstrados e ligados aos requisitos.
2. Build, checagem de tipos, lint e testes pertinentes passam.
3. Mudanças de persistência têm migração e teste de integridade quando aplicável.
4. API e interface tratam sucesso, falha, permissão e conflito relevantes.
5. Fluxos de dinheiro e estoque resistem aos cenários de repetição aplicáveis.
6. Logs permitem investigar falhas sem expor credenciais ou dados desnecessários.
7. Specs, contratos e instruções operacionais refletem o comportamento entregue.
8. Limitações e recursos ainda simulados estão explícitos.

Não exigir implementação dos módulos adiados para concluir uma feature independente.
Não declarar prontidão fiscal, homologação de hardware ou segurança de produção
com base apenas em testes simulados.

### CI, desempenho e operação

- CI DEVE executar build, tipos, lint, testes unitários e testes de integração
  relevantes. Fluxos centrais DEVEM ter execução E2E automatizada em etapa definida.
- A fundação DEVE fornecer comandos reproduzíveis e dados sintéticos de demonstração.
- APIs DEVEM validar entrada, paginar listagens potencialmente grandes e devolver
  erros estruturados; não expor stack traces ao operador.
- Consultas DEVEM ter índices coerentes e evitar N+1 nos caminhos críticos.
- Logs DEVEM conter correlação e contexto operacional mínimo; saúde do serviço,
  banco, filas de impressão e backup DEVEM poder ser diagnosticados.
- Antes do piloto, o plano DEVE fixar hardware de referência, volume e concorrência,
  com metas mensuráveis. Meta inicial proposta: p95 de até 500 ms para buscas
  comuns e até 1 s para finalizar venda local sem serviços externos, sob a carga
  documentada; ajustes exigem medição e justificativa, não promessa sem teste.
- Procedimento de instalação DEVE cobrir início automático, firewall, HTTPS,
  configuração, backup, restauração e atualização compatíveis com o SO escolhido.

## Governance

### Autoridade e adoção

Esta constituição prevalece sobre planos, tarefas e preferências de implementação.
O responsável pelo produto decide escopo e prioridades. A equipe ou agente propõe
soluções e registra impactos. Instruções explícitas posteriores do responsável
podem alterar decisões, mas a documentação DEVE ser atualizada antes do código afetado.

Esta versão 1.0.0 é uma proposta pronta para adoção no repositório. A data abaixo
registra sua elaboração inicial; a adoção efetiva ocorre quando o responsável
incorpora o arquivo como constituição do projeto. Não representa aprovação de
tecnologias ainda em discussão nem validação fiscal.

### Emendas e versionamento

- Emendas DEVEM declarar motivo, regras afetadas, impacto e migração necessária.
- MAJOR: remoção ou redefinição incompatível de princípios ou governança.
- MINOR: novo princípio ou ampliação material de obrigação.
- PATCH: esclarecimento editorial sem alteração de obrigação.
- A revisão DEVE atualizar versão, data e relatório temporário de impacto no topo.
- O relatório DEVE apontar specs, planos e tarefas afetados; artefatos dependentes
  devem ser reconciliados ou listados explicitamente para acompanhamento.
- O relatório temporário DEVE ser removido antes do commit de adoção/emenda,
  conforme o fluxo do comando de constituição consultado.
- Exceções técnicas DEVEM ter motivo, escopo, risco, responsável, prazo ou condição
  de revisão e mitigação. Não autorizam violar integridade de valores ou segurança
  essencial silenciosamente; se houver conflito, é necessária emenda.

### Revisão de conformidade

Toda revisão de feature DEVE verificar o Constitution Check, a rastreabilidade e
os critérios de pronto. Divergência crítica exige corrigir a proposta ou emendar
a constituição. Nenhum agente pode declarar conformidade sem evidência dos checks.

### Referências de estrutura e decisão

- Spec Kit: https://github.com/github/spec-kit
- Modelo: https://github.com/github/spec-kit/blob/main/templates/constitution-template.md
- Comando: https://github.com/github/spec-kit/blob/main/templates/commands/constitution.md
- MySQL/InnoDB: https://dev.mysql.com/doc/refman/8.4/en/innodb-introduction.html

As referências orientam estrutura e fundamentos; as regras específicas de negócio
neste arquivo são decisões propostas para este projeto, não requisitos do Spec Kit.

**Version**: 1.0.0 | **Ratified**: 2026-10-20 | **Last Amended**: 2026-10-20

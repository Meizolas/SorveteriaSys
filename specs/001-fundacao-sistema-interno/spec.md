# Especificação de Feature: Fundação do Sistema Interno

**Git Branch**: `master` (estado observado em 2026-10-20; nenhuma branch de feature foi criada)

**Criado em**: 2026-10-20

**Status**: Rascunho

**Entrada**: Descrição do usuário: "Especificar a fundação do sistema interno de gestão de sorveteria: estrutura de backend e frontend, conexão com MySQL, migrações, autenticação, permissões iniciais, configuração da loja e auditoria essencial."

## Clarifications

### Session 2026-10-20

- Q: Como a primeira conta administradora deve ser criada com segurança em uma instalação nova? → A: Por comando local interativo no servidor, disponível somente enquanto não existir administrador.
- Q: Os perfis iniciais Administrador e Operador devem ter definições fixas nesta fundação ou o administrador poderá criar e editar perfis e permissões? → A: Os perfis são fixos; o administrador somente os atribui ou remove dos usuários.
- Q: Após quanto tempo uma sessão autenticada deve expirar por inatividade e qual deve ser sua duração máxima, mesmo com uso contínuo? → A: Após 30 minutos de inatividade e, em qualquer caso, após 12 horas desde a autenticação.
- Q: As migrações do MySQL devem ser executadas separadamente antes de iniciar a aplicação ou automaticamente durante a inicialização? → A: Por comando separado com credencial de migração; a aplicação apenas valida o esquema com sua credencial operacional.
- Q: Por quanto tempo os eventos de auditoria da fundação devem permanecer consultáveis antes de uma eliminação controlada? → A: Por 24 meses.

### Revisão pós-análise 2026-10-20

- O cadastro administrativo de usuário manterá senha temporária porque não existe autorregistro nem canal externo de recuperação nesta fundação. A senha é definida pelo administrador, vale por no máximo 24 horas e somente permite troca de senha, consulta da própria sessão e saída até ser substituída.
- A limitação de autenticação usa a combinação opaca de login canônico e origem normalizada, evitando que terminais diferentes atrás do mesmo IP bloqueiem uns aos outros quando usam logins distintos.
- O cadastro operacional mínimo da loja exige somente nome de uso, moeda e fuso. Nome empresarial, CNPJ e endereço são opcionais nesta fundação e não representam habilitação fiscal.
- A constituição exige hardware de referência antes do piloto. Como o equipamento real ainda não foi informado nem medido, a aceitação de desempenho e recuperação permanece bloqueada no gate do piloto, sem presumir configuração de hardware.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inicializar uma instalação confiável (Priority: P1)

Como responsável pela implantação, quero iniciar a aplicação e validar sua conexão com o banco e a versão do esquema para disponibilizar uma base reproduzível às próximas funcionalidades.

**Why this priority**: Nenhum fluxo interno pode ser construído com segurança sem uma aplicação inicializável, persistência válida e evolução controlada do esquema.

**Independent Test**: Em uma instalação vazia, executar o procedimento documentado de preparação e inicialização; a aplicação deve criar o esquema por migrações versionadas, indicar que está pronta e permitir repetir a inicialização sem perder nem duplicar dados.

**Acceptance Scenarios**:

1. **Given** uma instalação nova com banco acessível e credenciais válidas, **When** o responsável executa o comando separado de atualização e depois inicia o sistema, **Then** todas as migrações pendentes são aplicadas na ordem com a credencial de migração, a versão resultante é identificável e o sistema fica disponível usando somente a credencial operacional.
2. **Given** uma instalação já atualizada, **When** o sistema é reiniciado, **Then** nenhuma migração é reaplicada e os dados existentes permanecem inalterados.
3. **Given** banco indisponível, credenciais inválidas, migrações pendentes ou esquema incompatível, **When** o sistema tenta iniciar, **Then** ele não executa migrações, não se declara pronto e apresenta diagnóstico acionável sem revelar segredos.
4. **Given** uma migração que não pode ser concluída, **When** a atualização é executada, **Then** o sistema impede operação sobre um esquema parcialmente válido e orienta a recuperação documentada.

---

### User Story 2 - Entrar com identidade individual (Priority: P1)

Como usuário interno, quero entrar e sair do sistema com minha própria conta para acessar apenas funções autorizadas e manter minhas ações atribuídas à minha identidade.

**Why this priority**: Autenticação e autorização são pré-condições para todas as funções operacionais e administrativas posteriores.

**Independent Test**: Provisionar a primeira conta administrativa por procedimento seguro, autenticar com credenciais válidas, tentar acesso com credenciais inválidas, encerrar a sessão e verificar a proteção de uma função restrita.

**Acceptance Scenarios**:

1. **Given** uma instalação sem administrador, **When** o responsável executa no servidor o comando local interativo de provisionamento e informa os dados exigidos, **Then** exatamente uma conta administradora é criada sem senha universal, argumento de senha visível ou credencial de demonstração incorporada.
2. **Given** uma conta ativa e credenciais válidas, **When** o usuário entra, **Then** recebe uma sessão individual e acessa somente as funções permitidas.
3. **Given** credenciais inválidas ou conta inativa, **When** alguém tenta entrar, **Then** o acesso é negado com mensagem que não confirma dados sensíveis da conta.
4. **Given** uma sessão encerrada ou expirada, **When** o usuário tenta acessar uma função protegida, **Then** o acesso é negado e uma nova autenticação é solicitada.
5. **Given** uma sessão sem atividade por 30 minutos ou uma sessão criada há 12 horas, **When** qualquer função protegida é solicitada, **Then** a sessão é invalidada e uma nova autenticação é exigida.
6. **Given** um usuário criado por administrador com senha temporária ainda válida, **When** ele autentica pela primeira vez, **Then** a sessão somente permite consultar seu estado, trocar a própria senha e sair; após a troca bem-sucedida, o identificador da sessão é rotacionado e as demais sessões do usuário são revogadas.
7. **Given** uma senha temporária expirada, já substituída ou revogada, **When** ela é apresentada, **Then** a autenticação é negada sem revelar a causa; um administrador pode emitir nova senha temporária por ação autenticada e auditada.
8. **Given** cinco falhas para a mesma combinação de login canônico e origem normalizada dentro de 15 minutos, **When** nova tentativa ocorre antes do fim do bloqueio de 15 minutos, **Then** ela recebe resposta genérica `429` com `Retry-After`, é auditada e não revela se o usuário existe; o bloqueio termina automaticamente e nunca inativa permanentemente a conta.

---

### User Story 3 - Administrar acessos pelo menor privilégio (Priority: P1)

Como administrador, quero cadastrar usuários e atribuir ou remover os perfis iniciais fixos para separar responsabilidades desde o início da operação.

**Why this priority**: Contas compartilhadas ou permissões implícitas eliminariam a responsabilidade individual e comprometeriam todas as features seguintes.

**Independent Test**: Criar um usuário operacional, atribuir o perfil inicial correspondente, verificar que ele não acessa administração, alterar sua autorização e confirmar que a mudança passa a valer e fica auditada.

**Acceptance Scenarios**:

1. **Given** uma sessão de administrador, **When** ele cria ou inativa um usuário, **Then** a alteração é persistida e registrada na auditoria.
2. **Given** um usuário com perfil Operador, **When** ele tenta consultar ou alterar usuários, permissões, configuração da loja ou auditoria, **Then** o acesso é negado.
3. **Given** um usuário sem permissão explicitamente concedida, **When** ele solicita uma função protegida, **Then** o acesso é negado por padrão tanto na interface quanto no serviço responsável.
4. **Given** uma atribuição ou remoção de perfil, **When** ela é salva, **Then** o administrador identifica quem foi afetado, o estado anterior, o novo estado e o responsável pela mudança.
5. **Given** uma sessão de administrador, **When** ele tenta criar um perfil ou alterar as permissões que definem Administrador e Operador, **Then** a operação não é oferecida nem aceita nesta fundação.
6. **Given** uma sessão de administrador, **When** ele cria um usuário ou redefine seu acesso, **Then** define uma senha temporária que não volta a ser exibida pelo sistema, expira em 24 horas, substitui qualquer senha temporária anterior e revoga todas as sessões existentes do usuário.

---

### User Story 4 - Configurar a loja (Priority: P2)

Como administrador, quero registrar a identidade e os parâmetros básicos da única loja para que telas e registros futuros usem contexto operacional coerente.

**Why this priority**: A configuração dá contexto à operação, mas depende da identidade administrativa já estabelecida.

**Independent Test**: Informar os dados obrigatórios da loja e o fuso operacional, salvar, recarregar a aplicação e confirmar a apresentação dos mesmos valores; depois tentar dados inválidos e verificar que nada é alterado.

**Acceptance Scenarios**:

1. **Given** uma instalação ainda não configurada, **When** o administrador informa nome de uso da loja, moeda BRL e fuso, **Then** o sistema valida e persiste uma única configuração operacional mesmo sem CNPJ, nome empresarial ou endereço completo.
2. **Given** configuração existente, **When** o administrador altera um campo válido, **Then** o novo valor passa a ser usado e a mudança anterior continua rastreável na auditoria.
3. **Given** dados obrigatórios ausentes ou inválidos, **When** o administrador tenta salvar, **Then** o sistema informa os campos a corrigir e preserva a última configuração válida.
4. **Given** um usuário sem a permissão de configuração, **When** tenta alterar a loja, **Then** a operação é negada e nenhuma alteração é persistida.

---

### User Story 5 - Investigar ações administrativas essenciais (Priority: P2)

Como administrador autorizado, quero consultar eventos essenciais de segurança e configuração para identificar quem fez uma alteração, quando e sobre qual registro.

**Why this priority**: A rastreabilidade permite investigar incidentes e sustenta a confiança nas permissões e configurações da fundação.

**Independent Test**: Executar autenticações e alterações de usuário, autorização e loja; pesquisar os eventos por período, ator e ação; conferir detalhes e tentar modificar um registro de auditoria.

**Acceptance Scenarios**:

1. **Given** uma ação auditável concluída ou negada, **When** um administrador consulta a auditoria, **Then** encontra evento com instante, ação, resultado, ator quando conhecido, entidade afetada, correlação e mudanças relevantes, sem segredos.
2. **Given** vários eventos, **When** o administrador filtra por período, ator, ação ou resultado, **Then** recebe apenas registros compatíveis, ordenados do mais recente para o mais antigo e em páginas limitadas.
3. **Given** qualquer perfil operacional, **When** tenta alterar ou excluir um evento de auditoria, **Then** a operação não é oferecida nem aceita.
4. **Given** indisponibilidade durante uma escrita administrativa que exige auditoria, **When** a operação não pode registrar seu evento obrigatório, **Then** a alteração não é confirmada como concluída.

### Edge Cases

- Duas tentativas simultâneas de criar o mesmo identificador de acesso devem resultar em uma única conta e um conflito claro para a outra tentativa.
- Diferenças entre maiúsculas, minúsculas e espaços em identificadores de acesso não podem permitir contas ambíguas.
- A primeira conta administrativa não pode ser provisionada novamente após a instalação já possuir administrador.
- A inativação do próprio usuário ou do último administrador ativo deve ser bloqueada para evitar perda total de acesso administrativo.
- Uma alteração de permissão durante sessão ativa deve passar a valer, no máximo, na próxima requisição protegida; uma permissão removida não pode continuar autorizando novas ações.
- Expiração ou perda de sessão durante edição deve preservar os dados digitados quando seguro e exigir nova autenticação antes de gravar.
- Atividade contínua pode renovar o prazo de inatividade, mas nunca estende a sessão além de 12 horas desde a autenticação.
- Senha temporária expirada ou substituída não pode autenticar; a emissão de outra senha temporária revoga sessões existentes sem afetar o provisionamento irreversível do primeiro administrador.
- Terminais que compartilham o mesmo IP não podem bloquear logins distintos entre si; alterar somente caixa ou espaços do mesmo login não pode contornar o contador da combinação canônica.
- Instantes próximos à mudança de dia ou horário devem ser armazenados de forma inequívoca e apresentados conforme o fuso configurado da loja.
- Falha de rede ou do servidor após o envio de uma alteração deve apresentar resultado incerto e orientar consulta do estado atual antes de repetir.
- Campos livres e diagnósticos não podem permitir que senha, segredo de sessão ou credencial do banco seja armazenado na auditoria.
- Eventos de auditoria com menos de 24 meses não podem ser eliminados pelo processo de retenção; falha durante a eliminação controlada não pode deixar o histórico em estado inconsistente.
- A indisponibilidade da internet não pode impedir autenticação, configuração ou consulta de auditoria quando servidor, banco e rede local estiverem disponíveis.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer uma fundação executável com uma aplicação de interface e um serviço de regras e persistência, mantendo no serviço a validação autoritativa de entradas, permissões e alterações.
- **FR-002**: A fundação DEVE adotar os limites do monólito modular definidos na constituição e incluir inicialmente somente o módulo de Acesso e Configuração e as capacidades compartilhadas estritamente necessárias à inicialização e auditoria.
- **FR-003**: O sistema DEVE conectar-se ao MySQL configurado para a instalação usando credenciais externas aos artefatos distribuídos e identidades separadas: uma credencial operacional com apenas as permissões da operação comum e uma credencial de migração com as permissões de alteração do esquema.
- **FR-004**: O sistema DEVE verificar a disponibilidade do banco e a compatibilidade do esquema antes de se declarar pronto, fornecendo diagnóstico sem expor credenciais ou detalhes internos sensíveis.
- **FR-005**: Toda criação ou alteração de esquema DEVE ocorrer por migração versionada, ordenada e rastreável, executada por comando separado antes da aplicação. A aplicação DEVE apenas validar a versão do esquema com sua credencial operacional, recusar prontidão quando houver migrações pendentes e NÃO DEVE reescrever silenciosamente uma migração já aplicada.
- **FR-006**: O procedimento de atualização DEVE preservar dados existentes, detectar falha de migração e documentar como interromper a entrada em operação e recuperar a versão anterior com segurança.
- **FR-007**: A fundação DEVE oferecer comandos reproduzíveis e distintos para preparar o banco, aplicar migrações, iniciar, verificar e testar o ambiente, além de dados sintéticos opcionais que nunca sejam habilitados como credenciais de produção.
- **FR-008**: O sistema DEVE autenticar usuários internos por identificador e senha individual, usando sessão mantida pelo servidor e protegida contra uso por origem indevida.
- **FR-009**: Senhas DEVEM ser armazenadas somente em forma de verificação resistente a ataques; senha, segredo de sessão e credenciais de infraestrutura NÃO DEVEM aparecer em respostas, logs ou auditoria.
- **FR-010**: O sistema DEVE encerrar sessões explicitamente, expirá-las após 30 minutos consecutivos de inatividade e impor duração absoluta máxima de 12 horas desde a autenticação, mesmo com uso contínuo. Toda função protegida DEVE ser negada quando a sessão estiver ausente, inválida ou expirada.
- **FR-011**: O sistema DEVE fornecer um comando local interativo, executável no servidor somente enquanto não existir administrador, para provisionar a primeira conta administradora. O comando DEVE coletar a senha sem exibi-la nem recebê-la como argumento, recusar nova execução após a criação bem-sucedida e não incorporar senha universal ou credencial de demonstração.
- **FR-012**: Um administrador DEVE poder criar, consultar, editar, ativar e inativar usuários e emitir nova senha temporária quando necessário, sem apagar o histórico associado às suas ações.
- **FR-013**: Cada usuário DEVE possuir identificador de acesso único e não ambíguo, nome de exibição, estado ativo/inativo e um ou mais perfis autorizados.
- **FR-014**: A fundação DEVE disponibilizar os perfis fixos `Administrador` e `Operador`: Administrador gerencia usuários, atribuições de perfil, loja e consulta auditoria; Operador somente entra no sistema e acessa capacidades operacionais explicitamente concedidas por features futuras. A aplicação NÃO DEVE permitir criar, excluir ou alterar as definições desses perfis nesta etapa.
- **FR-015**: Toda função protegida DEVE negar acesso por padrão e verificar a permissão no serviço, mesmo que a interface oculte a ação.
- **FR-016**: Somente Administrador PODE gerenciar usuários e atribuir ou remover os perfis fixos; o sistema DEVE bloquear a remoção do perfil Administrador do próprio usuário autenticado, a inativação do próprio usuário e qualquer alteração que deixe a instalação sem administrador ativo.
- **FR-017**: Alterações de autorização DEVEM ser efetivas para novas solicitações protegidas sem exigir que o usuário afetado encerre voluntariamente a sessão.
- **FR-018**: A instalação inicial DEVE representar exatamente uma empresa e uma loja, sem isolamento multiloja ou multitenant.
- **FR-019**: Um administrador DEVE poder configurar nome de uso da loja, moeda e fuso de apresentação como cadastro operacional mínimo; moeda inicial DEVE ser BRL e fuso inicial `America/Sao_Paulo`. Nome empresarial, CNPJ e campos de endereço são opcionais nesta fundação, DEVEM ser validados quando informados e NÃO DEVEM ser interpretados como ativação ou prontidão fiscal.
- **FR-020**: Instantes de eventos DEVEM permanecer inequívocos independentemente do fuso de apresentação, e mudanças de fuso NÃO DEVEM alterar o instante histórico registrado.
- **FR-021**: A configuração da loja DEVE exigir somente os campos do cadastro operacional mínimo e validar o formato e a consistência de todo campo opcional efetivamente informado antes de substituir a última configuração válida.
- **FR-022**: O sistema DEVE registrar auditoria essencial para provisionamento inicial, entradas bem-sucedidas, tentativas de entrada negadas inclusive por limitação, saídas, troca de senha, emissão ou redefinição de senha temporária, criação/alteração/inativação de usuário, mudanças de perfil ou permissão, alterações da loja e acessos administrativos negados.
- **FR-023**: Cada evento de auditoria DEVE registrar identificador, instante, ação, resultado, ator quando identificável, origem normalizada ou `LOCAL_TTY`, entidade e identificador afetados quando aplicáveis, motivo quando exigido, correlação da solicitação e mudanças relevantes antes/depois, omitindo senhas, hashes, cookies, tokens, credenciais e dados pessoais desnecessários.
- **FR-024**: Eventos de auditoria DEVEM permanecer consultáveis por 24 meses a partir de seu instante de ocorrência e NÃO DEVEM ser editáveis nem removíveis por usuários da aplicação, inclusive administradores. Após esse prazo, somente um processo controlado de retenção PODE eliminá-los; cada execução DEVE registrar período abrangido, quantidade eliminada, resultado e correlação, preservando obrigações de guarda que venham a ser aplicáveis.
- **FR-025**: Administradores autorizados DEVEM poder consultar a auditoria por período, ator, ação e resultado, com ordenação inequívoca e paginação.
- **FR-026**: Uma alteração administrativa cuja auditoria seja obrigatória DEVE ser confirmada juntamente com o respectivo evento; se isso não for possível, o sistema NÃO DEVE apresentar a alteração como concluída.
- **FR-027**: A interface DEVE usar português do Brasil, convenções locais e componentes acessíveis por teclado, com foco visível, rótulos e contraste legível.
- **FR-028**: Os fluxos desta fundação DEVEM apresentar estados distintos de carregamento, ausência de dados, validação, acesso negado, conflito, indisponibilidade e resultado incerto, preservando dados digitados após falhas recuperáveis quando seguro.
- **FR-029**: As funções internas desta fundação DEVEM continuar disponíveis sem internet quando servidor local, banco e rede interna estiverem operantes e NÃO DEVEM depender de recursos remotos essenciais.
- **FR-030**: O sistema DEVE expor um estado operacional que diferencie, ao menos, aplicação pronta, banco indisponível e esquema incompatível, sem declarar como saudáveis dependências inexistentes de módulos futuros.
- **FR-031**: O plano desta feature DEVE fixar versões compatíveis da stack prescrita na constituição, registrar decisões arquiteturais duradouras e definir validações automatizadas proporcionais aos riscos de migração, autenticação, autorização e auditoria.
- **FR-032**: Antes do uso real, a implantação DEVE possuir procedimento validado de backup e restauração, destino independente do disco principal e metas explícitas de perda tolerável e tempo de recuperação; a definição dos valores dessas metas pertence ao plano de implantação.
- **FR-033**: Usuários criados ou com acesso redefinido por administrador DEVEM receber senha temporária de 12 a 128 caracteres, armazenada somente como hash, válida por no máximo 24 horas e nunca reapresentada. Até substituí-la, a sessão DEVE permitir somente consulta do próprio estado, troca de senha e saída. A troca bem-sucedida DEVE invalidar a senha temporária, rotacionar a sessão atual e revogar as demais sessões do usuário. A senha do primeiro administrador definida em TTY é permanente e não segue esse fluxo.
- **FR-034**: Para cada combinação de login canônico e origem normalizada, o sistema DEVE contar falhas em janela móvel operacional de 15 minutos e, ao atingir cinco falhas, limitar novas tentativas dessa combinação por 15 minutos. O identificador persistido da combinação DEVE ser opaco; uma autenticação válida limpa seu contador. Durante a limitação, a resposta DEVE ser genérica, usar `429` e `Retry-After`, ter custo observavelmente equivalente para conta existente ou inexistente e ser auditada. A recuperação DEVE ser automática ao fim do prazo, sem inativação ou bloqueio permanente e sem limite global por IP nesta fundação.

### Key Entities

- **Usuário**: Identidade individual de uma pessoa autorizada; inclui identificador de acesso, nome de exibição, estado e vínculos de autorização, preservando referências históricas após inativação.
- **Perfil**: Agrupamento nomeado de permissões. A fundação começa com Administrador e Operador.
- **Permissão**: Capacidade protegida e explicitamente concedível, verificada para cada solicitação relevante.
- **Sessão**: Período autenticado vinculado a um usuário, com criação, última atividade, expiração por inatividade, limite absoluto e encerramento identificáveis, sem expor o segredo correspondente.
- **Loja**: Configuração única do estabelecimento e de seu contexto operacional, incluindo identidade, endereço, moeda e fuso.
- **Evento de Auditoria**: Registro imutável de uma ação relevante, seu resultado, contexto, ator e mudanças permitidas, correlacionado à solicitação de origem.
- **Versão do Esquema**: Histórico ordenado das mudanças estruturais aplicadas à instalação e de seu resultado.

### Scope Boundaries

**Incluído**:

- Fundação separada de interface e serviço, conexão persistente, evolução do esquema, autenticação, usuários, perfis, permissões, loja única, auditoria essencial, diagnóstico operacional e procedimentos de ambiente/recuperação.
- Estrutura mínima necessária para que as próximas features respeitem os módulos definidos pela constituição.

**Fora do escopo**:

- Catálogo, vendas, comandas, produção, estoque, compras, caixa, pagamentos, financeiro, clientes, fidelidade, relatórios de negócio, equipamentos e emissão fiscal.
- Recuperação de senha por e-mail, autenticação externa, múltiplos fatores, acesso público, aplicativo móvel, loja online, integrações de mensagens e serviços em nuvem obrigatórios.
- Múltiplas empresas ou lojas, plataforma SaaS, isolamento multitenant, funcionamento autônomo de terminais sem servidor/LAN e alta disponibilidade distribuída.
- Criação ou edição de perfis, alteração das permissões que os definem e definição antecipada de autorizações para regras comerciais futuras.

### Dependencies and Constraints

- A constituição versão 1.0.0, ratificada em 2026-10-20, governa esta feature e é a fonte das restrições de stack, arquitetura, segurança, operação local e qualidade.
- O planejamento DEVE usar a stack constitucional: Java 21/Spring no serviço, React/TypeScript/Vite na interface, MySQL 8.4/InnoDB, Flyway, Gradle, testes com MySQL real e ambiente local reproduzível; versões exatas são decisão do plano.
- A implantação inicial pressupõe servidor, banco e terminais na rede local da loja. Sistema operacional, hardware de referência, certificados, firewall e metas de recuperação serão definidos no plano antes do piloto.
- O sistema não depende de cadastro de clientes nem armazena dados completos de cartão nesta fundação.

### Requirement Traceability

| User Story | Requisitos principais | Evidência de aceite |
| --- | --- | --- |
| US1 — Inicializar instalação | FR-001–FR-007, FR-030–FR-032 | Instalação nova, reinício, falha de conexão e falha de migração |
| US2 — Identidade individual | FR-008–FR-011, FR-027–FR-029, FR-033–FR-034 | Provisionamento, entrada válida/inválida/limitada, senha temporária, saída e sessão expirada |
| US3 — Menor privilégio | FR-012–FR-017, FR-022–FR-026, FR-033 | Gestão de usuário e senha temporária, negação por padrão e mudança auditada |
| US4 — Configurar loja | FR-018–FR-021, FR-026–FR-029 | Criação, edição, validação e acesso negado |
| US5 — Investigar ações | FR-022–FR-026 | Registro, filtros, imutabilidade e falha atômica |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos ensaios de instalação limpa, um responsável treinado consegue preparar e disponibilizar a fundação seguindo apenas a documentação, sem correção manual do esquema.
- **SC-002**: Em 100% dos ensaios de reinicialização e atualização bem-sucedida, os dados previamente registrados permanecem íntegros e nenhuma mudança de esquema é aplicada duas vezes.
- **SC-003**: Em 100% das tentativas testadas, usuários não autenticados ou sem a permissão exigida são impedidos de acessar ou executar funções protegidas.
- **SC-004**: Pelo menos 90% dos usuários internos participantes conseguem entrar, identificar seu estado de sessão e sair na primeira tentativa, sem auxílio, em até 2 minutos.
- **SC-005**: Pelo menos 90% dos administradores participantes conseguem criar um usuário Operador, atribuir o perfil correto e confirmar o bloqueio administrativo em até 5 minutos, sem auxílio.
- **SC-006**: Pelo menos 90% dos administradores participantes conseguem concluir a configuração válida da loja na primeira tentativa em até 5 minutos; entradas inválidas nunca substituem a última configuração válida.
- **SC-007**: Para 100% dos eventos obrigatórios exercitados nos testes de aceite, a auditoria permite identificar ação, resultado, instante, entidade, correlação e ator quando conhecido, sem conter senhas, segredos de sessão ou credenciais de infraestrutura.
- **SC-008**: Um administrador encontra um evento conhecido dos últimos 30 dias em até 2 minutos usando os filtros disponíveis, em pelo menos 90% dos ensaios de usabilidade.
- **SC-009**: Sob o volume, hardware e rede de referência registrados antes do piloto, o p95 da API para autenticação, consulta de configuração e pesquisa usual de auditoria DEVE ser de até 500 ms, medido do envio da requisição pelo cliente até o recebimento completo do corpo; separadamente, o p95 percebido no navegador DEVE ser de até 2 segundos, medido da ação do usuário até a região de resultado estar atualizada e sem indicador de carregamento.
- **SC-010**: Em 100% dos ensaios sem acesso à internet, as funções desta fundação continuam operantes enquanto servidor, banco e rede local permanecem disponíveis.
- **SC-011**: Antes do piloto, uma restauração completa é demonstrada a partir de backup em destino independente, respeitando as metas de perda e recuperação aprovadas no plano de implantação.
- **SC-012**: Em 100% dos ensaios de retenção, eventos com menos de 24 meses permanecem consultáveis, usuários da aplicação não conseguem removê-los e cada eliminação elegível produz um registro verificável de sua execução.

### Protocolo proporcional de usabilidade do piloto

- SC-004, SC-005, SC-006 e SC-008 serão avaliados em ambiente controlado do piloto, sem substituir participantes por E2E.
- Cada público terá no mínimo cinco participantes representativos; cada pessoa executa cada cenário uma vez, sem ajuda, com instrução inicial padronizada. Se houver menos de cinco, o resultado é apenas exploratório e não libera o gate.
- O cronômetro começa ao entregar a tarefa e termina quando o resultado observável do critério é alcançado. Abandono, ajuda ou tempo excedido contam como falha. O limiar de 90% é arredondado para cima.
- A evidência registra roteiro, perfil representado, resultado, tempo, observações sem dados pessoais desnecessários e versão do sistema. E2E permanece como regressão técnica separada.

## Assumptions

- Esta feature representa a primeira entrega de fundação e não migra dados nem usuários de sistema anterior.
- A loja opera inicialmente como uma única empresa e unidade; expansões exigem feature e decisão próprias.
- Administrador e Operador são perfis iniciais suficientes. Permissões dos módulos de negócio serão adicionadas somente com suas respectivas features.
- O documento empresarial é opcional nesta fundação porque prontidão fiscal está fora do escopo; sua obrigatoriedade será reavaliada antes de qualquer fluxo fiscal real.
- A recuperação de acesso administrativo, além do provisionamento inicial, será um procedimento operacional controlado até que uma feature específica seja aprovada.
- A retenção operacional da auditoria é de 24 meses; obrigação legal ou administrativa que exija prazo maior prevalece e deve impedir a eliminação dos registros abrangidos.
- Internet não é requisito para os fluxos locais, mas servidor, banco e LAN disponíveis são dependências operacionais explícitas.
- O plano técnico, e não esta especificação, determinará versões exatas, organização de código, contratos, tipos de dados, parâmetros criptográficos, estratégia de recuperação de migrações e detalhes de implantação, sem alterar os comportamentos de sessão e autenticação aqui definidos.

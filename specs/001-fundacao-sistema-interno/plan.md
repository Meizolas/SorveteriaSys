# Implementation Plan: Fundação do Sistema Interno

**Git Branch**: `master` (nenhuma branch de feature criada) | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-fundacao-sistema-interno/spec.md`

## Summary

Construir a fundação de uma aplicação web interna para uma empresa e uma loja, com frontend e API na mesma origem, backend em monólito modular e MySQL como único banco. A entrega inclui esquema controlado por Flyway, autenticação por sessão no servidor, perfis fixos, configuração singleton da loja, auditoria append-only, comandos operacionais seguros e implantação local reproduzível. Migrações, provisionamento inicial, retenção e backup são operações explícitas; a inicialização normal apenas valida o esquema e nunca recebe privilégios de DDL.

## Technical Context

**Language/Version**: Eclipse Temurin Java 21.0.12.1+1 LTS, Spring Boot 4.1.1; TypeScript 6.0.2 em modo `strict`; Node.js 24.22.0 LTS

**Primary Dependencies**: Spring Web MVC, Spring Security, Spring Data JPA/Hibernate, Bean Validation e Actuator gerenciados pelo BOM 4.1.1 do Spring Boot; Bouncy Castle `bcprov-jdk18on` 1.86; Gradle Wrapper 9.7.1; React/React DOM 19.3.0, TypeScript 6.0.2, Vite 8.3.4, Material UI 9.5.0, React Router 8.4.0 e TanStack Query 5.104.3

**Storage**: MySQL 8.4.11 LTS/InnoDB, `utf8mb4`, modo SQL estrito e conexão UTC; Flyway CLI 13.6.0 com Connector/J fixado para migrações; nenhuma persistência paralela

**Testing**: JUnit e ferramentas Spring gerenciadas pelo Boot, Testcontainers 2.0.5 com MySQL real; Vitest 5.0.5, Testing Library React 16.3.3 e Playwright 1.64.1; testes de contrato OpenAPI, migração limpa/upgrade, concorrência, autorização e E2E

**Target Platform**: servidor local Linux x86_64, referência Ubuntu Server 24.04 LTS; Docker Engine 29.9.1, Compose 5.6.0 e Caddy 2.11.7; terminais em navegador moderno na LAN. Windows 11/WSL2 é ambiente de desenvolvimento, não servidor operacional aprovado nesta entrega

**Project Type**: aplicação web interna com frontend SPA, API REST e comandos operacionais no mesmo repositório

**Performance Goals**: p95 da API de até 500 ms e p95 percebido no navegador de até 2 s para autenticação, configuração e consultas usuais de auditoria, medidos separadamente no hardware/carga/rede de referência; paginação padrão 50 e máxima 200 registros

**Constraints**: mesma origem; operação essencial sem internet; sessão ociosa de 30 min e absoluta de 12 h; migração separada; RPO de 15 min e RTO de 2 h; sem `latest`, CDN, Redis, broker, serviço de identidade externo ou armazenamento de token no navegador

**Scale/Scope**: uma empresa, uma loja, uma instância local, até 50 usuários cadastrados, 20 sessões simultâneas, 2 milhões de eventos de auditoria em 24 meses e banco de até 50 GB antes de reavaliar índices, backup e particionamento

### Versões e imagens verificadas

- A exigência constitucional é fixar versões exatas de Java, Spring Boot, Gradle, Node, pacotes e imagens. Ela não exige nominalmente fornecedor do JDK nem digest, mas esta fundação fixa Temurin e usa digest imutável para tornar as imagens reproduzíveis.
- Existência e metadados das versões diretas foram conferidos em 2026-10-20 nas publicações oficiais e registries. Compatibilidade executável ainda precisa ser demonstrada pelo build, resolução de lockfiles, integração e E2E previstos em T002, T003 e T007; este documento não declara esses testes como executados.
- Imagens-base Linux/amd64 verificadas no registry: `eclipse-temurin:21.0.12.1_1-jre-noble@sha256:da0f0d242bec39e3fe5c1ac4c415840f03be9cef848c243d723166708e02148c`, `mysql:8.4.11-oraclelinux9@sha256:6f3a50835c54d61ffdcf78d71381ba268c27804cd96755231d2fd6f180f822f0`, `redgate/flyway:13.6.0@sha256:8a18f15fb16fd54bd560949650d1d2a68f36e3b3fdf3f92c3088c45aae220bca` e `caddy:2.11.7@sha256:173b26306d711395accaeba8b67afcaad2a085ccb1e6bf26010bfe8c095a5229`.
- A tag oficial `mysql:8.4.12` não estava publicada no registry consultado; por isso o plano usa a imagem LTS 8.4.11 efetivamente disponível, sem inventar tag ou digest. Imagens `api` e `proxy` produzidas pelo projeto receberão versão e digest reais no manifesto de cada release, antes de uso fora do desenvolvimento.

### Hardware e ambiente de referência

- **Ambiente mínimo proposto**: ainda não aprovado; nenhum valor de CPU, RAM, armazenamento ou rede é presumido neste plano.
- **Hardware efetivamente disponível e medido**: pendente de inventário do equipamento do piloto. A evidência deverá registrar modelo de CPU, núcleos disponíveis, RAM, tipo de armazenamento, sistema operacional, topologia/velocidade da LAN e navegador/terminal.
- A constituição exige essa fixação **antes do piloto**, não antes da especificação. T088 deve abortar a medição oficial se o inventário não estiver anexado; T094 e T095 não podem liberar o piloto sem resultados no equipamento real.
- Até essa evidência existir, p95, RPO e RTO são metas de aceitação, não resultados validados nem promessa sobre equipamento desconhecido.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Gate constitucional | Evidência antes da pesquisa | Evidência após o desenho | Status |
| --- | --- | --- | --- |
| Escopo interno autorizado | Somente fundação, acesso, loja e auditoria; nenhum módulo comercial | Contratos limitados a sessão, usuários, perfis, loja, auditoria e saúde | PASS |
| Requisitos sem ambiguidade crítica | Cinco decisões de clarificação registradas na spec | Dados, estados, concorrência, contratos e comandos definidos nos artefatos | PASS |
| Monólito modular e dependências proporcionais | Backend único, frontend único e MySQL único | Pacotes por capacidade; sem microsserviço, broker, Redis ou abstração genérica | PASS |
| Dinheiro, quantidade e histórico | Nenhum fluxo monetário/estoque nesta feature; moeda é configuração | BRL é código ISO; auditoria e snapshots preservam histórico administrativo | PASS |
| Atomicidade, concorrência e repetição | Escritas administrativas exigem auditoria atômica | Transações locais, `version`/ETag, constraints, lock de bootstrap e chaves idempotentes | PASS |
| Falhas e recuperação | Spec distingue indisponível, conflito e resultado incerto | Problem Details, readiness, runbooks, backup/PITR e sem retry automático de escrita | PASS |
| Permissões, auditoria e dados pessoais | Menor privilégio e retenção de 24 meses definidos | Dupla autorização, credenciais segregadas, allowlist de auditoria e expurgo controlado | PASS |
| Testes com banco escolhido | MySQL real exigido | Testcontainers/MySQL exato cobre migração, constraints, concorrência e autenticação | PASS |
| Funcionamento sem internet | Requisito explícito | Assets locais, pacote offline, CA interna e teste com gateway bloqueado | PASS |
| Migração, configuração e recuperação | Exigidas pela spec | Comando one-shot, configuração externa, RPO 15 min, RTO 2 h e restauração trimestral | PASS |
| Hardware de referência antes do piloto | Exigência temporal identificada; equipamento ainda não informado | Inventário e medição bloqueiam T088/T094/T095 e a liberação do piloto | PASS — gate pré-piloto pendente |

Não há exceções constitucionais. A troca futura de sistema operacional, banco, modelo de implantação ou mecanismo de sessão exige revisão deste plano e, quando duradoura, novo ADR.

## Project Structure

### Documentation (this feature)

```text
specs/001-fundacao-sistema-interno/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── adr/
│   └── 001-arquitetura-da-fundacao.md
├── contracts/
│   ├── openapi.yaml
│   └── commands.md
└── tasks.md                 # criado somente por $speckit-tasks
```

### Source Code (repository root)

```text
backend/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle/wrapper/
└── src/
    ├── main/
    │   ├── java/br/com/sorveteria/
    │   │   ├── access/             # usuários, autenticação, perfis e autorização
    │   │   ├── store/              # configuração única da loja
    │   │   ├── audit/              # eventos e retenção
    │   │   └── platform/           # HTTP, segurança, saúde, tempo e correlação
    │   └── resources/
    │       ├── application.yml
    │       └── db/migration/
    └── test/java/br/com/sorveteria/
        ├── unit/
        ├── integration/
        └── contract/

frontend/
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── app/
│   ├── features/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── store/
│   │   └── audit/
│   ├── shared/ui/
│   └── shared/api/
├── tests/
│   ├── component/
│   └── e2e/
└── public/

deploy/
├── compose.yaml
├── compose.production.yaml
├── Caddyfile
├── config/
├── secrets.example/
├── backup/
└── runbooks/

scripts/
├── dev/
├── release/
└── validation/
```

**Structure Decision**: separar `backend`, `frontend` e `deploy` preserva toolchains e responsabilidades sem criar serviços distribuídos. Dentro do backend, dependências apontam para contratos de aplicação dos pacotes de capacidade; nenhum pacote escreve diretamente em tabelas de outro. `platform` contém apenas infraestrutura transversal comprovadamente necessária, não regras de negócio. O build de produção do frontend é servido pelo Caddy, que encaminha `/api` e endpoints mínimos de saúde ao backend na mesma origem.

## Design Decisions

### Segurança e sessão

- Spring Security mantém sessão em memória da única instância; reinício encerra sessões, comportamento aceitável e seguro para esta fundação. Persistência JDBC de sessão fica adiada até existir requisito de continuidade de sessão após reinício ou múltiplas instâncias.
- Cookie de sessão: `HttpOnly`, `Secure` em operação, `SameSite=Lax`, `Path=/`, sem domínio amplo; o ID é rotacionado no login e `remember-me` permanece desabilitado.
- CSRF fica ativo inclusive em login e logout. A SPA recebe token CSRF separado do cookie de sessão e o devolve em cabeçalho nos métodos mutáveis.
- Cada requisição autenticada compara usuário ativo e `authorization_version` atual; mudança de perfil ou inativação invalida a autorização na próxima requisição.
- Autorização usa allowlist HTTP finalizada por `denyAll` e nova verificação no caso de uso. A interface apenas oculta ações por experiência, nunca concede acesso.
- Hash de senha usa exclusivamente Argon2id por `Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8()`: salt de 16 bytes, hash de 32 bytes, paralelismo 1, memória `1 << 14` KiB e 2 iterações, com identificador de algoritmo no valor armazenado e Bouncy Castle como dependência direta fixada. Não existe fallback automático para bcrypt. Se o encoder não funcionar ou a medição no hardware real for incompatível com a operação, o piloto fica bloqueado até emenda explícita de spec/plano, migração de hashes e novos testes.
- Usuário criado ou com acesso redefinido recebe senha temporária de 12–128 caracteres, válida por 24 horas. Antes da troca, a allowlist da sessão contém somente consulta da sessão, troca de senha e logout. Emissão de nova senha revoga todas as sessões e substitui a anterior; troca bem-sucedida rotaciona a sessão atual e revoga as demais. O primeiro administrador define senha permanente no TTY e não entra nesse fluxo.
- Cinco falhas para a mesma combinação de login canônico e origem normalizada em 15 minutos bloqueiam somente essa combinação por 15 minutos. O banco persiste HMAC opaco da combinação; não há bloqueio global por IP, evitando impacto cruzado em terminais que compartilham NAT. Sucesso limpa o contador; expiração recupera automaticamente; resposta limitada usa `429`, `Retry-After` e mensagem genérica com caminho/custo equivalentes para login existente ou inexistente.

### Persistência, migração e transações

- Flyway é a única autoridade de DDL. O serviço `migrate` é acionado explicitamente e termina; a API executa apenas `validate/info`, usa `ddl-auto=validate` e não fica pronta com migração pendente ou checksum divergente.
- Credenciais MySQL: `root` apenas no bootstrap; `app_migrator` para DDL/DML de migração; `app_runtime` para DML mínimo; `app_backup` somente leitura necessária ao backup; `app_retention` com leitura e exclusão limitada à auditoria. Nenhuma possui `GRANT OPTION` ou privilégio global durante operação.
- Escrita administrativa e seu evento de auditoria pertencem à mesma transação. Tentativa negada é auditada em transação independente e nunca altera o alvo.
- `version` otimista e `If-Match` impedem edição perdida; unicidade do login canônico e do singleton da loja fica no banco. Bootstrap bloqueia a linha singleton da instalação para impedir dois administradores iniciais.
- IDs internos usam `BIGINT` e são serializados como strings no JSON. Instantes usam precisão de microssegundo em UTC. JSON fica restrito aos diffs allowlisted de auditoria.

### Configuração operacional da loja

- O singleton exige apenas `trade_name`, `currency_code=BRL` e `time_zone`; `legal_name`, `tax_id` e todos os campos de endereço são opcionais para iniciar o uso interno.
- CNPJ, CEP, UF e demais campos opcionais são validados somente quando informados. Ausência é aceita; valor presente e malformado é rejeitado sem substituir a configuração válida.
- Nenhuma combinação desses campos ativa integração fiscal. Uma feature fiscal futura deverá definir completude, regime, UF, provedor e homologação antes de uso real.

### Matriz obrigatória de auditoria

Os testes devem exercitar, no mínimo: bootstrap; login bem-sucedido, inválido e limitado; logout; troca e emissão de senha temporária; criação, edição, ativação e inativação de usuário; atribuição/remoção de perfil; criação/alteração de loja; e acesso administrativo negado. Cada caso verifica resultado, ator quando identificável, origem normalizada ou `LOCAL_TTY`, correlação, alvo/mudanças aplicáveis e ausência de senha, hash, cookie, CSRF, token e credencial.

### Frontend e contrato HTTP

- SPA em `pt-BR`, React Router Data Mode, TanStack Query apenas para estado remoto e `fetch` com `credentials: same-origin`. Sem Redux nesta entrega.
- Mutações nunca recebem retry automático; leitura idempotente pode repetir apenas falhas transitórias. Resultado incerto orienta consulta do estado antes de nova escrita.
- Material UI fornece base consistente; tema exige foco visível, contraste WCAG AA, rótulos, teclado e estados que não dependem somente de cor. Fontes e ícones são empacotados.
- OpenAPI 3.1.1 em `contracts/openapi.yaml` é contrato-first. Erros usam RFC 9457, timestamps RFC 3339 UTC, paginação por cursor e `ETag`/`If-Match` para recursos mutáveis.

### Implantação e operação local

- Compose executa `db`, `api`, `proxy` e serviços one-shot separados `migrate`, `admin`, `backup`, `restore` e `retention`; somente Caddy publica 80/443. Banco e API não são expostos à LAN, e cada operação recebe somente seus secrets.
- Caddy usa hostname estável e CA interna ou CA corporativa. A raiz é instalada nos terminais por runbook e o material privado da CA fica em volume protegido e incluído no plano de recuperação.
- Configuração não secreta fica em arquivo externo; segredos ficam fora do Git, montados como arquivos e lidos por `configtree`. Ausência de segredo obrigatório faz o processo falhar sem default de produção.
- O pacote de release contém imagens fixadas por tag e digest, checksums, configuração, assets e documentação para instalação/atualização sem internet.
- Liveness verifica somente o processo; readiness agrega banco, migrações, inicialização e configuração essencial. Detalhes de saúde são restritos.
- Logs JSON em UTC incluem correlação, rota, resultado e duração, com rotação local. Cookies, senhas, tokens, credenciais e payloads pessoais são excluídos.

### Backup e recuperação

- Dump lógico diário consistente do schema da aplicação e arquivamento de binlogs para destino em outro dispositivo a cada no máximo 15 minutos.
- Metas aprovadas de aceitação: RPO de 15 minutos e RTO de 2 horas, sem promessa de alta disponibilidade. O atendimento permanece não validado até restauração medida no hardware real do piloto.
- Retenção de backup: 35 dias. Cópias são criptografadas e a chave fica fora do servidor e do mesmo disco.
- Restauração completa é testada antes do piloto, trimestralmente e após mudança do procedimento: importar dump, aplicar binlogs, validar Flyway, integridade e smoke E2E. Após restaurar cópia que contenha auditoria já expirada, executar novamente a retenção.

## Verification Strategy

- **Unitários**: normalização de login, senha temporária/expiração, throttle por combinação, parâmetros Argon2id, permissões fixas, sanitização de auditoria, campos opcionais da loja e paginação.
- **Integração MySQL**: migração limpa e upgrade, `validate/info`, collations/constraints, bootstrap concorrente, lock do último administrador, ETag, atomicidade com auditoria, retenção em lote e queries paginadas.
- **Segurança**: fixation, CSRF, cookies, 401/403/429, `Retry-After`, equivalência para conta existente/inexistente, deny-by-default, allowlist durante troca obrigatória, sessão ociosa/absoluta, revogação, inativação e mudança de perfil na próxima requisição, matriz de auditoria e ausência de segredos.
- **Contrato**: validação do OpenAPI e respostas reais, Problem Details, cursor, ETags e cabeçalhos de correlação.
- **Frontend**: componentes por papel/rótulo, teclado, foco, estados de erro/vazio/conflito e preservação de formulário.
- **E2E**: provisionar administrador, login/logout, usuário Operador, bloqueio administrativo, loja, auditoria e indisponibilidade. Executar fluxo principal em Chromium e smoke em Firefox/WebKit.
- **Operacional**: instalação offline, reinício automático, firewall visto de outro host, CA/TLS, falha de migração, backup atrasado, restauração e teste sem gateway de internet.
- **Desempenho API**: medir do envio HTTP até o recebimento integral da resposta, com aquecimento, 50 usuários cadastrados, 20 sessões simultâneas e 2 milhões de auditorias; registrar amostra, p50/p95/p99, erros, dataset, hardware, SO e LAN.
- **Desempenho percebido**: Playwright mede da ação de login/consulta/filtro até a região de resultado estar atualizada, sem `aria-busy`/indicador de carregamento; registrar navegador, terminal, LAN e p50/p95/p99 separadamente da API.
- **Usabilidade do piloto**: executar SC-004/005/006/008 com no mínimo cinco participantes representativos por público, uma tentativa por cenário, instrução padronizada, sem ajuda e evidência anonimizada. E2E não conta como participante.

## Complexity Tracking

Nenhuma exceção constitucional foi concedida. O inventário e as medições do hardware real continuam pendentes e bloqueiam somente o gate pré-piloto; não são declarados como concluídos neste plano.

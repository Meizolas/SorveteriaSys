---
description: "Tarefas de implementação da fundação do sistema interno"
---

# Tasks: Fundação do Sistema Interno

**Input**: artefatos em `/specs/001-fundacao-sistema-interno/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`  
**Tests**: obrigatórios por constituição para migrações, autenticação, permissões, auditoria, concorrência e fluxos centrais.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: executável em paralelo após as dependências declaradas, sem editar os mesmos arquivos.
- **[Story]**: história atendida (`US1`–`US5`); fases compartilhadas não recebem esse marcador.
- Cada tarefa inclui o caminho exato do artefato principal que será criado ou alterado.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: criar toolchains, estrutura e comandos reproduzíveis antes de escrever regras da feature.

- [ ] T001 Criar a estrutura raiz definida no plano com `backend/settings.gradle.kts`, `frontend/package.json`, `deploy/compose.yaml`, `scripts/dev/README.md` e os diretórios de código/teste correspondentes
- [ ] T002 [P] Configurar Eclipse Temurin Java 21.0.12.1+1, Spring Boot 4.1.1, Gradle Wrapper 9.7.1, Bouncy Castle `bcprov-jdk18on` 1.86 e verificação de dependências em `backend/build.gradle.kts` e `backend/gradle/wrapper/gradle-wrapper.properties`
- [ ] T003 [P] Fixar Node 24.22.0, React 19.3.0, TypeScript 6.0.2, Vite 8.3.4, MUI 9.5.0, Router 8.4.0, Query 5.104.3 e ferramentas de teste em `frontend/package.json` e `frontend/package-lock.json`
- [ ] T004 [P] Configurar formatação e lint do backend em `backend/build.gradle.kts` e `backend/config/checkstyle/checkstyle.xml`
- [ ] T005 [P] Configurar TypeScript strict, ESLint, formatação, Vitest e aliases em `frontend/tsconfig.json`, `frontend/eslint.config.js`, `frontend/vite.config.ts` e `frontend/vitest.config.ts`
- [ ] T006 [P] Registrar as versões/digests base verificados no plano e exigir digests reais das imagens produzidas em cada release, sem placeholder ou `latest`, em `deploy/release-versions.env` e exemplos sem segredo em `deploy/secrets.example/README.md`
- [ ] T007 Configurar pipeline de build, tipos, lint, testes backend/frontend, contrato e E2E em `.github/workflows/ci.yml`
- [ ] T008 Documentar comandos locais reproduzíveis e convenção de código inglês/documentação portuguesa em `README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: infraestrutura compartilhada que bloqueia todas as histórias.

**⚠️ CRITICAL**: nenhuma história começa antes deste checkpoint.

- [ ] T009 Criar a aplicação Spring e declarar limites dos pacotes `access`, `store`, `audit` e `platform` em `backend/src/main/java/br/com/sorveteria/SorveteriaApplication.java` e respectivos `package-info.java`
- [ ] T010 [P] Implementar configuração externa fail-fast, leitura `configtree`, UTC, modo não web e perfis de execução em `backend/src/main/resources/application.yml` e `backend/src/main/java/br/com/sorveteria/platform/config/ApplicationProperties.java`
- [ ] T011 [P] Definir bootstrap idempotente das contas MySQL `app_migrator`, `app_runtime`, `app_backup` e `app_retention` com grants mínimos em `deploy/db/init/001-create-accounts.sql`
- [ ] T012 Configurar Flyway CLI 13.6.0, Connector/J fixado e entrypoint one-shot sem migração automática em `deploy/migrate/Dockerfile` e `deploy/migrate/entrypoint.sh`
- [ ] T013 Criar a migração inicial com todas as tabelas, constraints, collations, índices e seeds de perfis/permissões de `data-model.md` em `backend/src/main/resources/db/migration/V1__foundation_schema.sql`
- [ ] T014 [P] Criar suporte reutilizável de Testcontainers 2.0.5 com `mysql:8.4.11-oraclelinux9` pelo digest Linux/amd64 registrado no plano em `backend/src/test/java/br/com/sorveteria/support/MySqlContainerSupport.java`
- [ ] T015 [P] Implementar RFC 9457, validação de entrada e mapeamento sanitizado de 400/401/403/404/409/412/429/503 em `backend/src/main/java/br/com/sorveteria/platform/web/ApiExceptionHandler.java`
- [ ] T016 [P] Implementar correlação, timestamps UTC, logs JSON e redação de cabeçalhos/segredos em `backend/src/main/java/br/com/sorveteria/platform/observability/CorrelationFilter.java` e `backend/src/main/resources/logback-spring.xml`
- [ ] T017 Implementar persistência append-only e API interna allowlisted de auditoria em `backend/src/main/java/br/com/sorveteria/audit/infrastructure/AuditEventEntity.java` e `backend/src/main/java/br/com/sorveteria/audit/application/AuditRecorder.java`
- [ ] T018 Implementar configuração-base do Spring Security com sessão server-side, fixation protection, cookies, CSRF para SPA, logout por método inseguro e `anyRequest().denyAll()` em `backend/src/main/java/br/com/sorveteria/platform/security/SecurityConfiguration.java`
- [ ] T019 [P] Criar shell React, tema acessível, `lang="pt-BR"`, rotas públicas/protegidas e estados globais em `frontend/src/app/App.tsx`, `frontend/src/app/router.tsx` e `frontend/src/app/theme.ts`
- [ ] T020 [P] Implementar cliente `fetch` same-origin sem retry de mutações, CSRF, correlação e Problem Details em `frontend/src/shared/api/apiClient.ts` e `frontend/src/shared/api/problem.ts`
- [ ] T021 Validar `contracts/openapi.yaml` no build e gerar/verificar tipos compartilhados do frontend em `frontend/src/shared/api/generated.ts` e `scripts/validation/validate-openapi.ps1`

**Checkpoint**: toolchains, banco, segurança-base, auditoria de escrita, erros, logs, shell e contrato estão prontos.

---

## Phase 3: User Story 1 — Inicializar uma instalação confiável (Priority: P1) 🎯 MVP técnico

**Goal**: preparar banco, aplicar migrações explicitamente, iniciar uma instância saudável e possuir recuperação verificável.

**Independent Test**: em instalação vazia, executar `info/validate/apply`, iniciar, reiniciar sem reaplicar, provocar banco indisponível/migração pendente/checksum inválido e restaurar backup dentro de RPO/RTO.

### Tests for User Story 1

- [ ] T022 [P] [US1] Escrever testes inicialmente falhos de migração limpa, repetição, upgrade e checksum divergente em `backend/src/test/java/br/com/sorveteria/integration/MigrationIntegrationTest.java`
- [ ] T023 [P] [US1] Escrever testes inicialmente falhos de liveness/readiness para banco indisponível, esquema pendente e configuração inválida em `backend/src/test/java/br/com/sorveteria/integration/HealthReadinessIntegrationTest.java`
- [ ] T024 [P] [US1] Criar validação operacional inicialmente falha para portas, startup, restart e instalação sem internet em `scripts/validation/us1-installation.ps1`

### Implementation for User Story 1

- [ ] T025 [US1] Implementar validação de histórico Flyway, migrações pendentes e compatibilidade do schema sem DDL em `backend/src/main/java/br/com/sorveteria/platform/database/SchemaReadinessValidator.java`
- [ ] T026 [US1] Implementar liveness e readiness sanitizadas em `backend/src/main/java/br/com/sorveteria/platform/health/ApplicationHealthConfiguration.java`
- [ ] T027 [US1] Implementar os contratos `migrate info`, `migrate validate` e `migrate apply` em `deploy/migrate/entrypoint.sh`
- [ ] T028 [US1] Configurar serviços `db`, `migrate`, `api` e redes/volumes internos com tags e digests em `deploy/compose.yaml` e `deploy/compose.production.yaml`
- [ ] T029 [US1] Configurar Caddy 2.11.7 para SPA, proxy `/api`, saúde mínima, HTTPS e mesma origem em `deploy/Caddyfile`
- [ ] T030 [US1] Implementar o comando sanitizado `system status` em `backend/src/main/java/br/com/sorveteria/platform/cli/SystemStatusCommand.java`
- [ ] T031 [US1] Implementar serviços one-shot e scripts de dump, binlog, verificação e restauração isolada em `deploy/backup/backup.sh`, `deploy/backup/restore.sh` e `deploy/compose.production.yaml`
- [ ] T032 [US1] Configurar retenção de backup de 35 dias, rotação de logs e alerta local de falha/espaço em `deploy/config/operations.env.example` e `deploy/runbooks/monitoring.md`
- [ ] T033 [US1] Documentar instalação, atualização expand/contract, falha de migração, rollback seguro, backup, RPO 15 min e RTO 2 h em `deploy/runbooks/install-update-recovery.md`
- [ ] T034 [US1] Executar os testes US1 e registrar evidências de instalação limpa, repetição, falhas e restauração em `specs/001-fundacao-sistema-interno/evidence/us1-installation.md`

**Checkpoint**: a instalação é reproduzível e recuperável, mas ainda não está liberada para usuários até US2.

---

## Phase 4: User Story 2 — Entrar com identidade individual (Priority: P1)

**Goal**: provisionar o primeiro administrador localmente e oferecer login/logout, troca de senha e sessões seguras com limites definidos.

**Independent Test**: provisionar uma única conta permanente por TTY; criar outra conta com senha temporária de 24 horas; validar primeiro acesso restrito, troca/rotação/revogação, expiração, CSRF/fixation, throttle por login+origem compartilhada e sessão de 30 minutos ociosos/12 horas absolutas.

### Tests for User Story 2

- [ ] T035 [P] [US2] Escrever testes unitários inicialmente falhos de normalização, senha temporária/24 h, Argon2id fixo, HMAC de login+origem, janela/recuperação do throttle e expiração de sessão em `backend/src/test/java/br/com/sorveteria/access/unit/AuthenticationPolicyTest.java`
- [ ] T036 [P] [US2] Escrever teste de integração inicialmente falho para bootstrap único, concorrente e atômico com auditoria em `backend/src/test/java/br/com/sorveteria/access/integration/AdminProvisioningIntegrationTest.java`
- [ ] T037 [P] [US2] Escrever testes de contrato inicialmente falhos para CSRF, login, sessão restrita, logout, troca de senha e `429`/`Retry-After`, verificando auditoria de bootstrap, login bem-sucedido/inválido/limitado, logout e troca com resultado, ator, origem e correlação em `backend/src/test/java/br/com/sorveteria/access/contract/SessionContractTest.java`
- [ ] T038 [P] [US2] Escrever testes de componente inicialmente falhos para login, senha obrigatória, expiração e indisponibilidade em `frontend/tests/component/auth/AuthenticationFlow.test.tsx`
- [ ] T039 [P] [US2] Escrever E2E inicialmente falho de provisionamento, login válido/inválido/limitado, primeiro acesso restrito, senha temporária expirada, troca, logout e expiração em `frontend/tests/e2e/authentication.spec.ts`

### Implementation for User Story 2

- [ ] T040 [P] [US2] Implementar usuário, repositório e normalização ASCII de `login_key` em `backend/src/main/java/br/com/sorveteria/access/domain/User.java` e `backend/src/main/java/br/com/sorveteria/access/infrastructure/UserRepository.java`
- [ ] T041 [P] [US2] Implementar HMAC persistido por login canônico+origem, cinco falhas em 15 minutos, bloqueio/recuperação automática de 15 minutos, limpeza no sucesso e `429` genérico com `Retry-After`, sem bloqueio global por IP nem enumeração em `backend/src/main/java/br/com/sorveteria/access/application/AuthenticationThrottleService.java`
- [ ] T042 [P] [US2] Implementar exclusivamente Argon2id com os parâmetros `defaultsForSpringSecurity_v5_8()`, prefixo de algoritmo e Bouncy Castle fixado, sem fallback automático, em `backend/src/main/java/br/com/sorveteria/access/application/PasswordService.java`
- [ ] T043 [US2] Implementar bootstrap transacional com lock de `installation_state`, criação do Administrador e auditoria em `backend/src/main/java/br/com/sorveteria/access/application/AdminProvisioningService.java`
- [ ] T044 [US2] Implementar comando não web `provision-admin` que exige TTY, lê senha sem eco e limpa buffers em `backend/src/main/java/br/com/sorveteria/access/cli/ProvisionAdminCommand.java`
- [ ] T045 [US2] Implementar autenticação, limite absoluto, verificação por requisição de `active/authorization_version/must_change_password`, allowlist do primeiro acesso e invalidação em `backend/src/main/java/br/com/sorveteria/access/application/SessionService.java`
- [ ] T046 [US2] Implementar `/api/v1/session`, `/session/csrf` e logout conforme OpenAPI em `backend/src/main/java/br/com/sorveteria/access/web/SessionController.java`
- [ ] T047 [US2] Implementar validade de 24 horas e troca de senha própria, invalidando a temporária, incrementando autorização, rotacionando a sessão atual e revogando as demais em `backend/src/main/java/br/com/sorveteria/access/application/ChangePasswordService.java`
- [ ] T048 [P] [US2] Implementar chamadas, queries e contexto efêmero da sessão em `frontend/src/features/auth/authApi.ts` e `frontend/src/features/auth/AuthProvider.tsx`
- [ ] T049 [US2] Implementar telas acessíveis de login e troca obrigatória de senha em `frontend/src/features/auth/LoginPage.tsx` e `frontend/src/features/auth/ChangePasswordPage.tsx`
- [ ] T050 [US2] Implementar guards, aviso de expiração, limpeza de cache e preservação segura de formulário em `frontend/src/features/auth/RequireSession.tsx`

**Checkpoint**: identidade individual e sessão funcionam sem qualquer tela administrativa adicional.

---

## Phase 5: User Story 3 — Administrar acessos pelo menor privilégio (Priority: P1)

**Goal**: permitir ao Administrador gerir usuários e atribuir apenas os perfis fixos, preservando invariantes e auditoria.

**Independent Test**: criar Operador, editar/inativar, atribuir/remover perfil, negar administração ao Operador, impedir auto-inativação/último Administrador e aplicar revogação na próxima requisição.

### Tests for User Story 3

- [ ] T051 [P] [US3] Escrever testes de contrato inicialmente falhos para `/roles`, `/users`, senha temporária e sub-recursos de perfil/status em `backend/src/test/java/br/com/sorveteria/access/contract/UserAdministrationContractTest.java`
- [ ] T052 [P] [US3] Escrever integração inicialmente falha para unicidade, idempotência, ETag, senha temporária/expiração/reemissão/revogação, último Administrador, autorização e matriz auditável de criação/edição/status/perfil/acesso negado em `backend/src/test/java/br/com/sorveteria/access/integration/UserAdministrationIntegrationTest.java`
- [ ] T053 [P] [US3] Escrever testes de componente inicialmente falhos de lista, formulário, perfis fixos, conflito e acesso negado em `frontend/tests/component/users/UserAdministration.test.tsx`
- [ ] T054 [P] [US3] Escrever E2E inicialmente falho de criação do Operador e bloqueio das funções administrativas em `frontend/tests/e2e/user-administration.spec.ts`

### Implementation for User Story 3

- [ ] T055 [P] [US3] Implementar entidades/repositórios de perfis, permissões e vínculos somente leitura em `backend/src/main/java/br/com/sorveteria/access/domain/Role.java` e `backend/src/main/java/br/com/sorveteria/access/infrastructure/RoleRepository.java`
- [ ] T056 [US3] Implementar criação/edição/ativação/inativação e reemissão administrativa de senha temporária de 24 horas, sem reexibir segredo e com revogação/auditoria atômica, em `backend/src/main/java/br/com/sorveteria/access/application/UserAdministrationService.java`
- [ ] T057 [US3] Implementar atribuição/substituição de perfis e invariantes do próprio/último Administrador em `backend/src/main/java/br/com/sorveteria/access/application/RoleAssignmentService.java`
- [ ] T058 [P] [US3] Implementar deduplicação por `Idempotency-Key` e conflito de fingerprint em `backend/src/main/java/br/com/sorveteria/platform/idempotency/IdempotencyService.java`
- [ ] T059 [US3] Implementar endpoints e ETags de perfis/usuários conforme OpenAPI em `backend/src/main/java/br/com/sorveteria/access/web/UserAdministrationController.java`
- [ ] T060 [US3] Aplicar permissões `USER_READ`, `USER_WRITE` e `ROLE_ASSIGN` nos casos de uso e rotas em `backend/src/main/java/br/com/sorveteria/access/application/AccessPermissions.java`
- [ ] T061 [P] [US3] Implementar cliente e hooks de usuários/perfis com invalidação de cache em `frontend/src/features/users/usersApi.ts`
- [ ] T062 [US3] Implementar lista, detalhe, formulário, estado e atribuição de perfis acessíveis em `frontend/src/features/users/UserListPage.tsx` e `frontend/src/features/users/UserFormPage.tsx`
- [ ] T063 [US3] Implementar página autenticada do Operador sem capacidades administrativas e tratamento 403 em `frontend/src/app/OperatorHomePage.tsx`

**Checkpoint**: usuários e perfis fixos são administráveis sem permitir alteração das definições de perfil.

---

## Phase 6: User Story 4 — Configurar a loja (Priority: P2)

**Goal**: criar e atualizar exatamente uma loja com cadastro operacional mínimo, validação condicional dos dados brasileiros opcionais, fuso e concorrência segura.

**Independent Test**: salvar somente nome de uso/BRL/fuso, recarregar, aceitar ausência de CNPJ/nome empresarial/endereço, rejeitar esses campos quando presentes e inválidos, negar Operador e produzir `412` em edição concorrente sem perder a versão válida.

### Tests for User Story 4

- [ ] T064 [P] [US4] Escrever testes unitários inicialmente falhos para cadastro mínimo e ausência aceita de nome empresarial/CNPJ/endereço, validando CNPJ, CEP, UF, BRL e IANA somente quando aplicáveis em `backend/src/test/java/br/com/sorveteria/store/unit/StoreValidationTest.java`
- [ ] T065 [P] [US4] Escrever integração inicialmente falha de singleton, campos fiscais opcionais, ETag, autorização e auditoria atômica com resultado/ator/origem/correlação em `backend/src/test/java/br/com/sorveteria/store/integration/StoreConfigurationIntegrationTest.java`
- [ ] T066 [P] [US4] Escrever teste de contrato inicialmente falho para `GET/PUT /store` em `backend/src/test/java/br/com/sorveteria/store/contract/StoreContractTest.java`
- [ ] T067 [P] [US4] Escrever testes de componente/E2E inicialmente falhos do formulário e conflito em `frontend/tests/component/store/StoreForm.test.tsx` e `frontend/tests/e2e/store-configuration.spec.ts`

### Implementation for User Story 4

- [ ] T068 [P] [US4] Implementar entidade singleton e repositório da loja em `backend/src/main/java/br/com/sorveteria/store/domain/StoreConfiguration.java` e `backend/src/main/java/br/com/sorveteria/store/infrastructure/StoreRepository.java`
- [ ] T069 [US4] Implementar criação/atualização, validações, ETag e auditoria atômica em `backend/src/main/java/br/com/sorveteria/store/application/StoreConfigurationService.java`
- [ ] T070 [US4] Implementar `GET/PUT /api/v1/store` e permissões `STORE_READ/STORE_WRITE` em `backend/src/main/java/br/com/sorveteria/store/web/StoreController.java`
- [ ] T071 [P] [US4] Implementar cliente e hooks de configuração em `frontend/src/features/store/storeApi.ts`
- [ ] T072 [US4] Implementar formulário acessível com estados vazio, validação, conflito, falha e sucesso confirmado em `frontend/src/features/store/StoreConfigurationPage.tsx`
- [ ] T073 [US4] Formatar datas no fuso e moeda BRL vindos da loja sem alterar instantes em `frontend/src/shared/ui/localization.ts`

**Checkpoint**: a loja única está configurada e alterações concorrentes não se sobrescrevem.

---

## Phase 7: User Story 5 — Investigar ações administrativas essenciais (Priority: P2)

**Goal**: consultar auditoria imutável e executar retenção controlada após 24 meses.

**Independent Test**: gerar eventos de autenticação/usuário/loja, filtrar por período/ator/ação/resultado, verificar snapshots/correlação/segredos ausentes e eliminar apenas eventos elegíveis por comando restrito.

### Tests for User Story 5

- [ ] T074 [P] [US5] Escrever integração inicialmente falha para filtros, índices, cursor determinístico e volume de referência em `backend/src/test/java/br/com/sorveteria/audit/integration/AuditQueryIntegrationTest.java`
- [ ] T075 [P] [US5] Escrever integração inicialmente falha de retenção em lote, cutoff de 24 meses, falha parcial e privilégios em `backend/src/test/java/br/com/sorveteria/audit/integration/AuditRetentionIntegrationTest.java`
- [ ] T076 [P] [US5] Escrever teste de contrato inicialmente falho para `GET /audit-events` e ausência de mutação em `backend/src/test/java/br/com/sorveteria/audit/contract/AuditContractTest.java`
- [ ] T077 [P] [US5] Escrever testes de componente/E2E inicialmente falhos de filtros, paginação, detalhe e 403 em `frontend/tests/component/audit/AuditPage.test.tsx` e `frontend/tests/e2e/audit.spec.ts`

### Implementation for User Story 5

- [ ] T078 [P] [US5] Implementar repositório paginado por `(occurred_at,id)` e filtros indexados em `backend/src/main/java/br/com/sorveteria/audit/infrastructure/AuditEventRepository.java`
- [ ] T079 [US5] Implementar consulta allowlisted e permissão `AUDIT_READ` em `backend/src/main/java/br/com/sorveteria/audit/application/AuditQueryService.java`
- [ ] T080 [US5] Implementar `GET /api/v1/audit-events` conforme OpenAPI em `backend/src/main/java/br/com/sorveteria/audit/web/AuditController.java`
- [ ] T081 [P] [US5] Implementar cliente e cursor de auditoria em `frontend/src/features/audit/auditApi.ts`
- [ ] T082 [US5] Implementar tela acessível de filtros, tabela paginada e detalhe sanitizado em `frontend/src/features/audit/AuditPage.tsx`
- [ ] T083 [US5] Implementar retenção transacional em lotes e `retention_run` em `backend/src/main/java/br/com/sorveteria/audit/application/AuditRetentionService.java`
- [ ] T084 [US5] Implementar comando `audit-retention` com `--dry-run`, cutoff e batch size validados em `backend/src/main/java/br/com/sorveteria/audit/cli/AuditRetentionCommand.java`
- [ ] T085 [US5] Configurar serviço one-shot com secret exclusivo `app_retention` em `deploy/compose.production.yaml`

**Checkpoint**: eventos essenciais são investigáveis por 24 meses e nenhum usuário da aplicação pode alterá-los ou removê-los.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: fechar qualidade, operação, segurança e evidências que atravessam as histórias.

- [ ] T086 [P] Executar validação bidirecional OpenAPI/respostas e impedir drift no CI em `backend/src/test/java/br/com/sorveteria/contract/OpenApiConformanceTest.java`
- [ ] T087 [P] Criar dados sintéticos sem credencial de produção e comando explícito de carga demo em `backend/src/test/resources/demo/demo-data.json` e `scripts/dev/load-demo-data.ps1`
- [ ] T088 [P] Registrar primeiro o hardware/SO/LAN/navegador reais ou abortar o gate; medir separadamente p95 da API do envio ao corpo completo (≤500 ms) e p95 percebido da ação à região pronta (≤2 s), com 50 usuários, 20 sessões e 2 milhões de auditorias, em `scripts/validation/performance.js`, `frontend/tests/e2e/perceived-performance.spec.ts` e `specs/001-fundacao-sistema-interno/evidence/performance.md`
- [ ] T089 [P] Executar revisão de acessibilidade por teclado, foco, contraste AA, rótulos e anúncios em `frontend/tests/e2e/accessibility.spec.ts`
- [ ] T090 [P] Executar testes de segurança para CSRF, fixation, cookies, Argon2id sem fallback, enumeração, throttle/NAT, deny-by-default e matriz FR-022, comprovando resultado, ator quando conhecido, origem, correlação e ausência de senhas/hashes/cookies/tokens/credenciais em `backend/src/test/java/br/com/sorveteria/security/SecurityRegressionTest.java`
- [ ] T091 Montar pacote offline com imagens por digest, assets, browsers de teste, checksums e manifest em `scripts/release/build-offline-package.ps1`
- [ ] T092 Documentar e validar CA, hostname, firewall/DOCKER-USER, início automático e rotação em `deploy/runbooks/network-tls-startup.md`
- [ ] T093 Agendar backup/binlog, retenção e verificações locais sem conceder secrets à API em `deploy/runbooks/schedules.md` e `deploy/compose.production.yaml`
- [ ] T094 Executar integralmente `quickstart.md`, internet bloqueada, restauração real e protocolo de usabilidade SC-004/005/006/008 com participantes, registrando separadamente resultados técnicos e humanos em `specs/001-fundacao-sistema-interno/evidence/quickstart-validation.md` e `specs/001-fundacao-sistema-interno/evidence/usability-pilot.md`
- [ ] T095 Reexecutar o Constitution Check e reconciliar spec, plano, OpenAPI, comandos, inventário/medições reais do hardware e limitações finais em `specs/001-fundacao-sistema-interno/evidence/constitution-check.md`, bloqueando a liberação do piloto enquanto faltar evidência

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 Setup
    ↓
Phase 2 Foundational
    ↓
US1 Instalação e migrações
    ↓
US2 Identidade e sessão
    ├──────────────┬──────────────┐
    ↓              ↓              ↓
US3 Acessos     US4 Loja       US5 Auditoria
    └──────────────┴──────────────┘
                   ↓
Phase 8 Polish e gate final
```

- **Setup** não possui dependências.
- **Foundational** depende da conclusão do Setup e bloqueia todas as histórias.
- **US1** depende do Foundational e disponibiliza ambiente/banco para as demais.
- **US2** depende de US1 e fornece identidade autenticada.
- **US3**, **US4** e **US5** dependem de US2, mas podem avançar em paralelo em arquivos de domínio distintos. A validação final de US5 deve incluir eventos produzidos por US3 e US4.
- **Polish** depende das histórias escolhidas para a entrega; o gate de piloto exige todas as cinco.

### Within Each User Story

1. Escrever os testes marcados e confirmar que falham pela ausência do comportamento.
2. Implementar modelo/repositório.
3. Implementar serviço/caso de uso com transação e autorização.
4. Implementar contrato HTTP/CLI.
5. Implementar interface.
6. Executar teste independente e registrar evidência no checkpoint.

## Parallel Opportunities

- Após T001, backend (T002/T004), frontend (T003/T005), versões/secrets (T006) podem avançar em paralelo.
- Na fundação, configuração/logs (T010/T016), testes MySQL (T014), erros (T015) e shell/frontend (T019/T020) ocupam arquivos distintos.
- Os testes marcados `[P]` dentro de cada história podem ser preparados simultaneamente antes da implementação.
- Após US2, equipes distintas podem implementar US3, US4 e a parte de consulta de US5; a retenção de US5 não depende das telas de US3/US4.

## Parallel Examples

### User Story 1

```text
T022 MigrationIntegrationTest.java
T023 HealthReadinessIntegrationTest.java
T024 us1-installation.ps1
```

### User Story 2

```text
T035 AuthenticationPolicyTest.java
T036 AdminProvisioningIntegrationTest.java
T037 SessionContractTest.java
T038 AuthenticationFlow.test.tsx
T039 authentication.spec.ts
```

### User Story 3

```text
T051 UserAdministrationContractTest.java
T052 UserAdministrationIntegrationTest.java
T053 UserAdministration.test.tsx
T054 user-administration.spec.ts
```

### User Story 4

```text
T064 StoreValidationTest.java
T065 StoreConfigurationIntegrationTest.java
T066 StoreContractTest.java
T067 StoreForm.test.tsx + store-configuration.spec.ts
```

### User Story 5

```text
T074 AuditQueryIntegrationTest.java
T075 AuditRetentionIntegrationTest.java
T076 AuditContractTest.java
T077 AuditPage.test.tsx + audit.spec.ts
```

## Implementation Strategy

### MVP First

1. Concluir Setup e Foundational.
2. Entregar US1 e validar instalação/migrações/recuperação independentemente.
3. Parar para demonstração técnica. Este MVP não está liberado a operadores até US2.

### Incremental Delivery

1. **US1**: fundação inicializável e recuperável.
2. **US2**: fundação acessível com identidade individual.
3. **US3**: gestão segura de usuários e perfis — primeiro recorte administrativo completo.
4. **US4**: contexto da loja.
5. **US5**: investigação e ciclo completo da auditoria.
6. **Polish**: pacote offline, desempenho, acessibilidade, segurança e gate de piloto.

### Parallel Team Strategy

- A equipe fecha Setup/Foundational/US1/US2 em sequência por serem bloqueantes.
- Depois de US2, uma frente trabalha em US3, outra em US4 e outra em US5.
- Alterações em `AuditRecorder`, `SecurityConfiguration`, `compose.production.yaml` e contrato OpenAPI exigem coordenação explícita para evitar conflitos.

## Notes

- `[P]` significa arquivos e dependências independentes, não autorização para ignorar checkpoints.
- Migrações aplicadas nunca são editadas; correção cria nova versão.
- Testes MySQL usam a imagem exata da implantação, não H2.
- Nenhuma tarefa autoriza módulos comerciais, múltiplas lojas, SaaS, integração externa ou funcionamento de terminal sem servidor/LAN.
- Commits devem agrupar uma tarefa ou conjunto lógico pequeno e manter evidência de validação rastreável.

# Pesquisa Técnica: Fundação do Sistema Interno

**Data**: 2026-10-20  
**Escopo**: resolver versões, segurança, persistência, frontend e operação local antes do desenho.

## R1 — Linha base do backend

**Decision**: Eclipse Temurin Java 21.0.12.1+1 LTS, Spring Boot 4.1.1 e Gradle Wrapper 9.7.1. Dependências Spring, Hibernate, Connector/J e testes gerenciadas pelo BOM do Boot; versões transitivas não são pinadas isoladamente. Existência das versões e compatibilidade declarada Java/Gradle/Boot foram conferidas nas fontes oficiais em 2026-10-20; o build real continua sendo gate de T002/T007.

**Rationale**: Java 21 atende a constituição e a janela LTS. Boot 4.1.1 suporta Java 21 e Gradle 9.x. Wrapper e toolchain tornam build reproduzível.

**Alternatives considered**: Boot 3.5.x e Gradle 8.14.x são fallback conservador caso um plugin obrigatório não seja compatível. Não usar release candidate.

**Sources**: [Temurin releases](https://adoptium.net/temurin/releases/?version=21), [Spring Boot](https://spring.io/projects/spring-boot), [Boot 4.1.1](https://spring.io/blog/2026/08/20/spring-boot-4-1-1-available-now/), [system requirements](https://docs.spring.io/spring-boot/system-requirements.html), [Gradle releases](https://github.com/gradle/gradle/releases).

## R2 — Banco, Flyway e validação do esquema

**Decision**: MySQL 8.4.11 LTS na imagem oficial `mysql:8.4.11-oraclelinux9`, fixada pelo digest Linux/amd64 registrado no plano; Flyway CLI 13.6.0 executado separadamente com Connector/J explícito. `app_migrator` aplica mudanças; `app_runtime` executa DML mínimo e somente valida histórico/esquema. A versão 8.4.12 existe nas notas do servidor, mas sua tag oficial não estava publicada no registry consultado em 2026-10-20; nenhuma tag inexistente será presumida. Qualquer patch posterior exige imagem publicada, digest capturado e testes completos.

**Rationale**: separa DDL da operação diária e faz a API falhar fechada diante de migração pendente ou divergente. A linha LTS reduz mudanças funcionais.

**Alternatives considered**: migração automática no startup foi rejeitada por ampliar privilégios e dificultar recuperação. PostgreSQL foi rejeitado porque a constituição fixou MySQL antes da primeira migração.

**Risk**: a matriz publicada do Flyway não lista explicitamente MySQL 8.4 e o CLI não traz o driver. O gate exige `info`, `validate`, instalação limpa e upgrade contra a imagem exata em Testcontainers.

**Sources**: [MySQL release model](https://dev.mysql.com/doc/refman/8.4/en/mysql-releases.html), [MySQL Official Image](https://hub.docker.com/_/mysql), [Flyway CLI](https://documentation.red-gate.com/flyway/reference/usage/command-line), [Flyway MySQL](https://documentation.red-gate.com/flyway/reference/database-driver-reference/mysql), [Spring database initialization](https://docs.spring.io/spring-boot/how-to/data-initialization.html).

## R3 — Autenticação, sessão e autorização

**Decision**: sessão `HttpSession` da instância única, sem persistência após reinício; cookie `HttpOnly`, `Secure`, `SameSite=Lax`; CSRF ativo; 30 minutos ociosos e 12 horas absolutas; estado ativo e `authorization_version` conferidos em toda requisição. Regras HTTP em allowlist com negação final e verificação adicional no caso de uso.

**Rationale**: atende revogação na próxima requisição e evita token no navegador, Redis e schema de sessão sem requisito concreto. Encerrar sessões no reinício é seguro e operacionalmente aceitável.

**Alternatives considered**: Spring Session JDBC foi adiado até existir requisito de sobreviver reinício; Redis e identidade externa foram rejeitados. JWT em `localStorage` conflita com a constituição.

**Sources**: [Spring Security CSRF](https://docs.spring.io/spring-security/reference/7.0/servlet/exploits/csrf.html), [security context](https://docs.spring.io/spring-security/reference/7.0/servlet/authentication/persistence.html), [authorize HTTP requests](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html).

## R4 — Senhas e primeiro administrador

**Decision**: Argon2id é o único algoritmo de criação de hash nesta fundação, usando `Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8()` (salt 16 bytes, hash 32 bytes, paralelismo 1, memória `1 << 14` KiB e 2 iterações) e Bouncy Castle `bcprov-jdk18on` 1.86 fixado como dependência direta. O valor armazenado mantém identificador do algoritmo para evolução explícita. O comando não web exige console/TTY, lê e confirma senha sem eco e bloqueia o singleton de instalação em transação. Senha nunca é argumento, variável ou log.

**Rationale**: protege o segredo do histórico/process list e mantém evolução do hash. Lock mais constraint torna duas execuções concorrentes seguras.

**Alternatives considered**: tela temporária, variável de ambiente e usuário em migration foram rejeitados por maior superfície ou segredo recuperável. Fallback automático para bcrypt foi rejeitado por tornar o algoritmo dependente do ambiente. Falha de compatibilidade ou custo inviável de Argon2id bloqueia o piloto e exige emenda explícita, migração de hashes e revalidação.

**Sources**: [Spring password storage](https://docs.spring.io/spring-security/reference/7.0/features/authentication/password-storage.html), [Argon2PasswordEncoder API](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/crypto/argon2/Argon2PasswordEncoder.html), [Bouncy Castle no Maven Central](https://central.sonatype.com/artifact/org.bouncycastle/bcprov-jdk18on), [Java Console](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/Console.html).

## R5 — Linha base do frontend

**Decision**: Node 24.22.0 LTS, React 19.3.0, TypeScript 6.0.2 strict, Vite 8.3.4, MUI 9.5.0, React Router 8.4.0 Data Mode e TanStack Query 5.104.3. `fetch` nativo; estado local/contexto; sem Redux.

**Rationale**: conjunto compatível e suficiente para telas administrativas, acessibilidade, cache/invalidação e tratamento consistente de erros, sem servidor Node em produção.

**Alternatives considered**: Radix exigiria construir mais design system; Router Framework Mode/SSR e Redux não entregam valor nesta aplicação local. TypeScript 7 fica adiado até maturidade da cadeia.

**Sources**: [Node releases](https://nodejs.org/en/about/previous-releases), [React 19.3](https://react.dev/blog/2026/09/09/react-19-3), [TypeScript 6](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [Vite 8](https://vite.dev/blog/announcing-vite8), [MUI support](https://mui.com/material-ui/getting-started/support/), [React Router modes](https://reactrouter.com/start/modes), [TanStack Query](https://tanstack.com/query/latest/docs/framework/react).

## R6 — Testes frontend e acessibilidade

**Decision**: Vitest 5.0.5, Testing Library React 16.3.3 e Playwright 1.64.1. Testes usam nomes, papéis e rótulos; E2E cobre teclado/foco e browsers reais. Contraste mínimo WCAG AA e status nunca depende somente de cor.

**Rationale**: testa comportamento observável e reduz acoplamento a detalhes internos. MUI auxilia, mas não garante acessibilidade automaticamente.

**Alternatives considered**: snapshots extensos e seletores CSS foram rejeitados por baixo valor. Auditor automático complementa, mas não substitui revisão manual.

**Sources**: [Vitest migration](https://vitest.dev/guide/migration/), [Testing Library](https://github.com/testing-library/react-testing-library/releases), [Playwright](https://playwright.dev/docs/release-notes), [MUI accessibility](https://mui.com/material-ui/getting-started/accessibility/).

## R7 — Implantação local e HTTPS

**Decision**: Ubuntu Server 24.04 LTS x86_64, Docker Engine 29.9.1, Compose 5.6.0 e Caddy 2.11.7. Serviços `db`, `api`, `proxy` e `migrate`; somente Caddy exposto. Hostname LAN estável e CA interna/corporativa. Pacote offline contém imagens e checksums.

**Rationale**: reduz matriz operacional, mantém mesma origem e não depende da internet. Linux é adequado ao Engine; Docker Desktop não é servidor Windows suportado.

**Alternatives considered**: Windows Server requer ensaio próprio e não integra esta entrega; instalação nativa aumenta variação; HTTP puro não atende a constituição.

**Sources**: [Docker Engine](https://docs.docker.com/engine/release-notes/29/), [Compose releases](https://github.com/docker/compose/releases), [Compose production](https://docs.docker.com/compose/how-tos/production/), [Caddy 2.11.7](https://github.com/caddyserver/caddy/releases), [Caddy HTTPS](https://caddyserver.com/docs/automatic-https).

## R8 — Configuração, segredos, saúde e logs

**Decision**: configuração externa e secrets montados como arquivo; liveness interna ao processo e readiness dependente do banco, schema e configuração; logs JSON locais rotacionados, em UTC e correlacionados, sem payloads/segredos.

**Rationale**: permite diagnóstico offline, falha rápida e rotação sem serviço externo. Separar liveness evita reiniciar a API por falha que pertence ao banco.

**Alternatives considered**: `.env` com valores reais e logs remotos obrigatórios foram rejeitados; `.env.example` contém apenas nomes.

**Sources**: [Compose secrets](https://docs.docker.com/reference/compose-file/secrets/), [Spring external config](https://docs.spring.io/spring-boot/reference/features/external-config.html), [application availability](https://docs.spring.io/spring-boot/reference/features/spring-application.html#features.spring-application.application-availability), [tracing](https://docs.spring.io/spring-boot/reference/actuator/tracing.html).

## R9 — Backup e recuperação

**Decision**: dump lógico diário `--single-transaction --quick`, binlog arquivado em mídia independente em até 15 minutos, retenção de 35 dias, criptografia e restauração trimestral. RPO 15 min e RTO 2 h.

**Rationale**: backup diário isolado permitiria perder um dia de operação. Dump mais binlog oferece recuperação pontual proporcional a uma loja única e volume inicial moderado.

**Alternatives considered**: copiar volume vivo é inconsistente; backup físico/Enterprise e MySQL Shell paralelo ficam para quando volume ou tempo de restauração justificar.

**Sources**: [MySQL backup and recovery](https://dev.mysql.com/doc/refman/8.4/en/backup-and-recovery.html), [backup policy](https://dev.mysql.com/doc/refman/8.4/en/backup-policy.html), [mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html), [binary log purge](https://dev.mysql.com/doc/refman/8.4/en/purge-binary-logs.html).

## R10 — Auditoria e contrato HTTP

**Decision**: auditoria append-only no caminho normal, diff por allowlist e retenção em lote com credencial própria após 24 meses. OpenAPI 3.1.1 contrato-first; Problem Details RFC 9457; cursor, ETag/If-Match e IDs como strings.

**Rationale**: protege evidência, limita exposição de dados e torna concorrência/erros verificáveis pelo frontend e por testes. Particionamento não é necessário para o volume inicial.

**Alternatives considered**: serialização genérica de entidades e auditoria WORM/hash-chain foram rejeitadas por risco e falta de requisito. Code-first OpenAPI foi rejeitado por permitir contrato acidental.

**Sources**: [OpenAPI](https://spec.openapis.org/oas/), [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html), [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).

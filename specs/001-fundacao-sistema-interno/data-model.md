# Modelo de Dados: Fundação do Sistema Interno

**Data**: 2026-10-20  
**Banco**: MySQL 8.4 LTS, InnoDB, `utf8mb4`, modo estrito, conexões em UTC

## Convenções

- Tabelas e colunas usam `snake_case` em inglês; documentação e interface permanecem em português.
- Chaves primárias internas são `BIGINT UNSIGNED`; a API as serializa como strings.
- Instantes são UTC com microssegundos (`DATETIME(6)` ou equivalente validado); nunca armazenar hora local ambígua.
- Entidades mutáveis usam `version BIGINT` para concorrência otimista e `updated_at`.
- Login é apresentado como digitado, mas sua chave única é ASCII, sem espaços, normalizada para minúsculas.
- Diffs de auditoria são JSON allowlisted; entidades centrais não são armazenadas como JSON.
- Exclusão física de usuário, perfil, permissão, loja ou auditoria não existe no fluxo da aplicação.

## Entidades persistidas

### `installation_state`

Linha singleton que serializa o bootstrap e registra o estado mínimo da instalação.

| Campo | Regra |
| --- | --- |
| `id` | Constante `1`, PK e `CHECK (id = 1)` |
| `initial_admin_provisioned` | `false` até a transação de provisionamento concluir |
| `initial_admin_user_id` | FK nullable para `app_user`; preenchida uma única vez |
| `provisioned_at` | UTC, nullable antes do bootstrap |
| `version` | Concorrência otimista |

O comando de bootstrap executa `SELECT ... FOR UPDATE` nesta linha. Somente após validar que não existe Administrador, ele cria usuário, vínculo, auditoria e atualiza o singleton na mesma transação.

### `app_user`

| Campo | Regra |
| --- | --- |
| `id` | PK |
| `login_display` | 3–64 caracteres; forma apresentada |
| `login_key` | 3–64 caracteres `[a-z0-9._-]`, trim + minúsculas, `UNIQUE` com collation binária/ASCII |
| `display_name` | 2–120 caracteres, Unicode, trim |
| `password_hash` | Hash com prefixo do algoritmo; nunca retornado nem auditado |
| `must_change_password` | `true` para senha inicial criada por administrador; `false` após troca bem-sucedida |
| `temporary_password_expires_at` | UTC; preenchido com emissão + 24 horas enquanto `must_change_password=true`; `NULL` para senha permanente |
| `active` | Estado de acesso; inativo não autentica nem mantém autorização |
| `authorization_version` | Incrementado quando estado, senha ou perfil muda |
| `version` | Concorrência otimista de edição |
| `created_at`, `updated_at` | UTC |
| `created_by`, `updated_by` | FK nullable; bootstrap não possui ator anterior |

**Índices/constraints**: unicidade de `login_key`; índices por `(active, display_name, id)`. Não há delete de usuário. O login não aceita Unicode para evitar homógrafos; o nome de exibição aceita.

### `role`

| Campo | Regra |
| --- | --- |
| `id` | PK |
| `code` | `ADMINISTRATOR` ou `OPERATOR`, único e imutável |
| `display_name` | `Administrador` ou `Operador` |
| `system_defined` | Sempre `true` nesta entrega |

Semear por migração. Não expor CRUD.

### `permission`

| Campo | Regra |
| --- | --- |
| `id` | PK |
| `code` | Código estável único |
| `description` | Descrição em português |

Permissões iniciais: `USER_READ`, `USER_WRITE`, `ROLE_ASSIGN`, `STORE_READ`, `STORE_WRITE`, `AUDIT_READ`. `ADMINISTRATOR` recebe todas; `OPERATOR` não recebe capacidade administrativa nesta fundação. Autenticar e consultar a própria sessão não dependem dessas permissões.

### `role_permission`

PK composta `(role_id, permission_id)`. Conteúdo semeado por migração e imutável pela aplicação.

### `user_role`

| Campo | Regra |
| --- | --- |
| `user_id`, `role_id` | PK composta e FKs |
| `assigned_at` | UTC |
| `assigned_by` | FK para administrador responsável; nullable somente no bootstrap |

Usuário ativo deve possuir ao menos um perfil. A operação deve impedir que uma alteração deixe a instalação sem Administrador ativo. Atribuição/remoção incrementa `app_user.authorization_version` e gera auditoria na mesma transação.

### `store_config`

Configuração singleton da única loja.

| Campo | Regra |
| --- | --- |
| `id` | Constante `1`, PK e `CHECK (id = 1)` |
| `trade_name` | Obrigatório, 2–120 caracteres |
| `legal_name` | Opcional, 2–160 caracteres quando informado |
| `tax_id` | CNPJ opcional, somente dígitos e dígitos verificadores válidos |
| `postal_code` | CEP opcional, 8 dígitos quando informado |
| `street`, `number`, `district`, `city` | Opcionais, com tamanho/formato validados quando informados |
| `complement` | Opcional |
| `state_code` | UF brasileira opcional com 2 letras quando informada |
| `country_code` | Opcional; quando informado, `BR` nesta entrega |
| `currency_code` | `BRL` nesta entrega |
| `time_zone` | Identificador IANA válido; default `America/Sao_Paulo` |
| `version` | Concorrência otimista |
| `created_at`, `updated_at` | UTC |
| `created_by`, `updated_by` | FK para `app_user` |

Somente `trade_name`, `currency_code` e `time_zone` compõem o cadastro operacional mínimo. Documento empresarial, nome empresarial e endereço continuam opcionais e não implicam prontidão fiscal. Mudança de fuso altera somente apresentação futura, nunca instantes históricos.

### `authentication_throttle`

Limita força bruta sem inativar a conta e sem confirmar sua existência.

| Campo | Regra |
| --- | --- |
| `subject_hash` | HMAC com segredo externo do login canônico combinado à origem normalizada; parte da PK e opaco para operadores |
| `window_started_at` | Início UTC da janela de 15 minutos |
| `failure_count` | Incremento atômico, máximo operacional controlado |
| `blocked_until` | Preenchido ao atingir 5 falhas; 15 minutos após o bloqueio |
| `updated_at` | UTC, usado para limpeza segura de registros antigos |

O HMAC usa segredo externo e não permite recuperar o login. Sucesso limpa o contador correspondente; registros vencidos podem ser removidos por manutenção. Durante o bloqueio, a API retorna `429` com `Retry-After` e mensagem genérica, seguindo caminho/custo equivalentes para login existente ou inexistente. Não existe bloqueio global por IP: usuários distintos atrás da mesma origem não compartilham contador. O desbloqueio é automático e nunca altera `app_user.active`.

### `audit_event`

| Campo | Regra |
| --- | --- |
| `id` | PK |
| `occurred_at` | UTC, imutável |
| `action` | Código estável: autenticação, usuário, perfil, loja, acesso negado, bootstrap ou retenção |
| `outcome` | `SUCCEEDED`, `DENIED` ou `FAILED` |
| `actor_user_id` | FK nullable; desconhecido em login negado |
| `actor_login_snapshot` | Login canônico conhecido no momento, minimizado |
| `actor_name_snapshot` | Nome conhecido no momento |
| `target_type`, `target_id` | Referência lógica nullable |
| `reason` | Motivo exigido pelo caso de uso, limitado a 500 caracteres |
| `correlation_id` | UUID gerado/validado no backend |
| `before_json`, `after_json` | Campos allowlisted; nunca senha, hash, cookie, CSRF ou credencial |
| `origin_type` | `LOCAL_TTY` ou `NETWORK`; obrigatório |
| `source_address` | Origem de rede normalizada para eventos HTTP; nullable somente para `LOCAL_TTY`, com acesso restrito |

**Índices**: `(occurred_at, id)`, `(actor_user_id, occurred_at, id)`, `(action, occurred_at, id)`, `(outcome, occurred_at, id)`, `correlation_id`. Paginação usa cursor `(occurred_at, id)` em ordem descendente.

`app_runtime` recebe `SELECT` e `INSERT`, nunca `UPDATE` ou `DELETE`. Evento de mudança administrativa entra na mesma transação do alvo. Eventos de tentativa negada usam transação independente.

### `retention_run`

| Campo | Regra |
| --- | --- |
| `id` | PK |
| `started_at`, `finished_at` | UTC |
| `cutoff_at` | Exclusão somente de `audit_event.occurred_at < cutoff_at`, calculado como 24 meses |
| `deleted_count` | Quantidade concluída |
| `status` | `RUNNING`, `SUCCEEDED`, `FAILED` |
| `correlation_id` | UUID único |
| `error_code` | Código sanitizado, nullable |

Executado com `app_retention` em lotes ordenados. O registro de execução e evento-resumo permanecem; falha não pode marcar lote incompleto como sucesso.

### `idempotency_record`

Protege criações administrativas contra repetição após resultado incerto.

| Campo | Regra |
| --- | --- |
| `idempotency_key` | UUID fornecido pelo cliente, PK |
| `operation` | Caso de uso protegido |
| `request_fingerprint` | Hash do conteúdo canônico, sem segredo |
| `resource_type`, `resource_id` | Resultado criado |
| `created_at`, `expires_at` | UTC; retenção operacional curta definida em configuração |

Mesma chave e mesmo fingerprint devolvem o resultado anterior; mesma chave com conteúdo diferente retorna conflito. A senha inicial nunca integra fingerprint persistido em texto.

### `flyway_schema_history`

Tabela gerenciada exclusivamente por Flyway. Migração aplicada é imutável; correção cria nova versão.

## Modelo não persistido: Sessão

A sessão reside na memória da única instância e contém apenas ID do usuário, instante de autenticação e versão de autorização observada. Última atividade é controlada pelo container. Não conter permissões como autoridade permanente: cada requisição verifica `active`, `authorization_version`, `must_change_password` e validade da senha temporária no banco. Enquanto `must_change_password=true`, somente consulta da própria sessão, troca de senha e logout são autorizados.

Estados:

```text
ACTIVE ──30 min ociosa──────────> EXPIRED
ACTIVE ──12 h desde autenticação> EXPIRED
ACTIVE ──logout/inativação──────> REVOKED
ACTIVE ──reinício do processo───> REVOKED
```

## Transições principais

### Usuário

```text
CREATED_WITH_TEMP_PASSWORD -> ACTIVE_PASSWORD_CHANGE_REQUIRED
ACTIVE_PASSWORD_CHANGE_REQUIRED -> ACTIVE
ACTIVE_PASSWORD_CHANGE_REQUIRED -> TEMP_PASSWORD_EXPIRED
TEMP_PASSWORD_EXPIRED -> ACTIVE_PASSWORD_CHANGE_REQUIRED  (nova emissão por Administrador)
ACTIVE -> INACTIVE
INACTIVE -> ACTIVE_PASSWORD_CHANGE_REQUIRED  (quando nova senha temporária for definida)
```

- Não há estado deletado.
- A conta do primeiro Administrador nasce `ACTIVE` com senha permanente definida no TTY; não usa senha temporária.
- Emitir ou redefinir senha temporária substitui a anterior, define expiração em 24 horas, incrementa `authorization_version`, revoga sessões e gera auditoria sem o segredo.
- O próprio administrador autenticado não pode se inativar nem remover seu perfil Administrador.
- Nenhuma transição pode deixar zero administradores ativos.

### Instalação

```text
UNPROVISIONED -> ADMIN_PROVISIONED
```

Transição única, transacional e irreversível pela aplicação.

### Configuração da loja

```text
ABSENT -> CONFIGURED -> UPDATED
```

Somente Administrador; criação/atualização e auditoria são atômicas. Versão divergente retorna precondição falha.

## Limites e reavaliação

- Baseline: 50 usuários, 20 sessões simultâneas, 2 milhões de eventos em 24 meses, 50 GB totais.
- Reavaliar plano de índices, dump e possível particionamento ao atingir 70% de qualquer limite ou quando o p95 ultrapassar 500 ms sob carga de referência.
- `audit_event` não usa particionamento inicialmente; a complexidade só entra após medição.

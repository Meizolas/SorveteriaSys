# Quickstart de Validação: Fundação do Sistema Interno

Este guia descreve como demonstrar os requisitos depois da implementação. Ele não substitui os runbooks operacionais nem contém código da aplicação.

## 1. Pré-requisitos

- Ubuntu Server 24.04 LTS x86_64 ou ambiente de desenvolvimento compatível.
- Docker Engine 29.9.1 e Compose 5.6.0.
- Release local com imagens, digests, checksums e browsers Playwright previamente preparados.
- Diretório de secrets fora do Git, com ACL restrita e credenciais distintas para root/bootstrap, migração, runtime, backup e retenção.
- Dispositivo de backup que não pertença ao disco principal.
- Hostname LAN e CA local/corporativa preparados.

Confira [contrato HTTP](./contracts/openapi.yaml), [comandos](./contracts/commands.md) e [modelo de dados](./data-model.md) antes da validação.

## 2. Validar pacote e configuração

```sh
sha256sum --check release-checksums.txt
docker compose -f deploy/compose.yaml -f deploy/compose.production.yaml config --quiet
docker image ls --digests
```

**Esperado**: checksums válidos, configuração Compose resolvida sem segredo impresso e todas as imagens presentes por versão/digest, sem `latest`.

## 3. Preparar banco e aplicar migrações

Inicie somente o banco e verifique saúde:

```sh
docker compose -f deploy/compose.yaml -f deploy/compose.production.yaml up -d db
docker compose -f deploy/compose.yaml -f deploy/compose.production.yaml ps
```

Consulte, valide e aplique as migrações explicitamente:

```sh
docker compose -f deploy/compose.yaml -f deploy/compose.production.yaml run --rm migrate info
docker compose -f deploy/compose.yaml -f deploy/compose.production.yaml run --rm migrate validate
docker compose -f deploy/compose.yaml -f deploy/compose.production.yaml run --rm migrate apply
```

**Esperado**: ordem e checksums válidos; segunda execução de `apply` não altera nada. Com uma migração pendente propositalmente, a API deve recusar prontidão e nunca aplicá-la sozinha.

## 4. Iniciar e verificar a instalação

```sh
docker compose -f deploy/compose.yaml -f deploy/compose.production.yaml up -d api proxy
curl --fail --cacert deploy/config/local-ca.crt https://sorveteria.local/health/live
curl --fail --cacert deploy/config/local-ca.crt https://sorveteria.local/health/ready
```

**Esperado**: liveness e readiness `UP`; somente 80/443 acessíveis a partir de outro terminal da LAN; 3306 e a porta interna da API inacessíveis. A resposta pública não revela versão, credencial ou stack trace.

## 5. Provisionar o primeiro administrador

Execute em TTY local:

```sh
docker compose -f deploy/compose.yaml -f deploy/compose.production.yaml run --rm admin provision-admin
```

Informe login, nome e senha nos prompts.

**Esperado**: senha permanente sem eco; uma conta Administrador e um evento de bootstrap com origem `LOCAL_TTY` e correlação. Nova execução e duas execuções concorrentes são recusadas sem segunda conta.

## 6. Validar fluxos da interface

No navegador confiando na CA:

1. Entrar com o primeiro Administrador e confirmar que sua senha definida no TTY não exige troca obrigatória.
2. Criar usuário Operador com senha temporária e confirmar que o segredo não é retornado após a criação.
3. Confirmar que Operador entra dentro de 24 horas, acessa somente sessão/troca/logout, troca a senha, mantém a sessão atual rotacionada e não acessa usuários, loja ou auditoria; simular expiração e reemissão administrativa com revogação das sessões anteriores.
4. Alterar e remover perfil de um usuário; confirmar efeito na próxima requisição.
5. Tentar inativar o próprio administrador e deixar zero administradores ativos; ambas devem falhar.
6. Configurar a loja apenas com nome de uso, BRL e fuso; confirmar que nome empresarial, CNPJ e endereço podem ficar ausentes. Depois informar CNPJ/CEP/UF inválidos e verificar preservação da versão anterior.
7. Abrir duas edições da loja; salvar a primeira e confirmar `412` na segunda.
8. Consultar auditoria por período, ator, ação e resultado; para toda a matriz FR-022 conferir resultado, ator quando conhecido, origem, correlação e ausência de senhas, hashes, cookies, tokens e credenciais.
9. Deixar sessão ociosa por 30 minutos e simular 12 horas absolutas em teste controlado; ambos exigem novo login.
10. Efetuar cinco tentativas inválidas com o mesmo login canônico e origem em 15 minutos; a tentativa seguinte deve receber `429` genérico e `Retry-After`. Confirmar desbloqueio automático após 15 minutos, limpeza no sucesso, equivalência entre conta existente/inexistente e que outro login no mesmo IP compartilhado não é bloqueado.

**Esperado**: estados de carregamento, vazio, erro, conflito e indisponibilidade em português; navegação completa por teclado, foco visível e nenhuma confirmação falsa após falha.

## 7. Executar validações automatizadas

```sh
./gradlew -p backend clean test
npm --prefix frontend ci
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run test
npm --prefix frontend run build
npm --prefix frontend run test:e2e
```

**Esperado**: build, tipos, lint, unitários, integração MySQL, contrato e E2E aprovados. O conjunto de integração precisa cobrir instalação limpa, upgrade, checksum divergente, constraints e concorrência.

## 8. Validar operação sem internet

Bloqueie o gateway externo preservando LAN, DNS interno, servidor e banco. Repita login, gestão de usuário, configuração e consulta de auditoria.

**Esperado**: todos funcionam; nenhum asset, fonte, script, licença ou autenticação tenta depender da internet.

## 9. Validar backup e restauração

```sh
docker compose -f deploy/compose.yaml -f deploy/compose.production.yaml run --rm backup create
docker compose -f deploy/compose.yaml -f deploy/compose.production.yaml run --rm backup verify MANIFEST
docker compose -f deploy/compose.yaml -f deploy/compose.production.yaml run --rm restore verify MANIFEST --target isolated-restore
```

**Esperado**: cópia cifrada no dispositivo independente, checksum válido e restauração completa em até 2 horas, com ponto recuperável a no máximo 15 minutos. Depois da restauração, Flyway, contagens, vínculos, login e smoke devem passar.

## 10. Validar retenção da auditoria

Em base controlada com eventos antes e depois do cutoff:

```sh
docker compose -f deploy/compose.yaml -f deploy/compose.production.yaml run --rm retention audit-retention --before CUTOFF --dry-run
docker compose -f deploy/compose.yaml -f deploy/compose.production.yaml run --rm retention audit-retention --before CUTOFF
```

**Esperado**: eventos com menos de 24 meses permanecem; somente os elegíveis são removidos em lotes; execução, quantidade, resultado e correlação ficam registradas. Usuários da aplicação continuam incapazes de editar ou excluir auditoria.

## 11. Medir desempenho no ambiente real

Antes de medir, registrar CPU, núcleos disponíveis, RAM, armazenamento, SO, topologia/velocidade da LAN, navegador e terminal. Sem esse inventário, o ensaio oficial deve ser marcado como não executável, nunca como aprovado.

- API: com 50 usuários, 20 sessões simultâneas e 2 milhões de auditorias, medir do envio HTTP ao recebimento completo do corpo e registrar p50/p95/p99 e erros; p95 alvo ≤ 500 ms.
- Navegador: medir da ação de login/consulta/filtro até a região de resultado estar atualizada e sem indicador de carregamento; registrar separadamente p50/p95/p99; p95 alvo ≤ 2 s.

## 12. Avaliar usabilidade com participantes

Executar SC-004, SC-005, SC-006 e SC-008 com no mínimo cinco participantes representativos por público, uma tentativa por cenário, instrução inicial padronizada e sem ajuda. Registrar resultado, tempo e observações sem dados pessoais desnecessários. Resultado com menos de cinco participantes é exploratório; E2E não conta como participante.

## Gate de aceite

A fundação somente pode avançar ao piloto quando:

- todos os cenários da spec e deste guia passam;
- nenhuma falha crítica de autorização, integridade, migração ou perda de dados permanece;
- firewall e HTTPS foram verificados de outro terminal;
- instalação offline e restauração real foram demonstradas;
- hardware, volume, concorrência, p95, RPO e RTO medidos foram anexados à evidência da entrega.

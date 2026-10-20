# Contrato de Comandos Operacionais

Os comandos abaixo são interfaces operacionais, não endpoints HTTP. Em produção são executados no servidor local por pessoa autorizada, com TTY quando houver senha humana. Nenhum segredo é aceito como argumento de linha de comando.

## Convenções

- Saída normal: mensagem curta em português e, quando automatizável, resumo JSON em `stdout` sem segredos.
- Diagnóstico: `stderr`, sanitizado e com `correlationId`.
- Códigos: `0` sucesso; `2` entrada inválida; `3` estado impede operação; `4` banco/configuração indisponível; `5` falha de integridade/validação; `10` falha interna sanitizada.
- Credenciais vêm de arquivos montados e protegidos por ACL.

## `migrate info`

Mostra banco alvo sanitizado, versão atual, migrações pendentes e divergências. Não altera esquema.

**Pós-condição**: nenhuma. Retorna `5` quando checksum/ordem diverge.

## `migrate validate`

Valida histórico Flyway e compatibilidade antes de atualização ou startup. Não aplica mudança.

## `migrate apply`

Aplica migrações pendentes com `app_migrator` e lock do Flyway. Deve ser executado explicitamente após backup verificado.

**Pós-condições**: histórico consistente e nenhuma pendência; em falha, API não fica pronta e o runbook de recuperação é obrigatório.

## `provision-admin`

Disponível somente em modo não web e com console/TTY local.

**Prompts**: login, nome de exibição, senha sem eco, confirmação sem eco. Senha não pode ser argumento, variável de ambiente ou pipe.

**Validações**: instalação ainda sem Administrador; login válido e único; senha permanente entre 12 e 128 caracteres; duas entradas iguais; banco e migrações válidos. Essa senha não é temporária e não aciona troca obrigatória.

**Efeito atômico**: bloqueia `installation_state`, cria usuário ativo, atribui Administrador, registra auditoria e marca bootstrap concluído. Execução concorrente ou posterior retorna `3` sem criar conta.

## `audit-retention --before <RFC3339>`

Executado com `app_retention`. O cutoff operacional normal deve equivaler a 24 meses; data mais recente é recusada. Exclui lotes ordenados e registra `retention_run` e evento-resumo.

Opções permitidas: `--dry-run` para contagem e `--batch-size` entre 100 e 5.000. Não aceita filtro arbitrário por usuário ou ação.

## `backup create`

Executa dump lógico consistente do schema da aplicação, copia binlogs fechados, cifra o resultado, gera checksum e grava em dispositivo independente. Usa `app_backup`.

**Sucesso**: arquivo, checksum, intervalo de binlog e instante ficam registrados; destino no mesmo disco não é aceito como backup operacional.

## `backup verify <manifest>`

Valida checksum, legibilidade e metadados sem substituir restauração completa.

## `restore verify <manifest> --target <isolated-instance>`

Somente contra instância vazia e isolada. Importa dump, aplica binlogs até o alvo, valida Flyway/integridade e executa smoke. Nunca aponta por padrão para produção.

## `system status`

Mostra versões, banco alcançável, schema válido, configuração essencial, último backup e espaço disponível, sem imprimir endereço com credencial ou conteúdo de secrets.

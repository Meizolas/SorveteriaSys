# Segredos locais

Crie `deploy/secrets/` fora do Git e adicione um arquivo por segredo, sem quebra de linha extra:

- `mysql_root_password`
- `mysql_migrator_password`
- `mysql_runtime_password`
- `mysql_backup_password`
- `mysql_retention_password`
- `auth_throttle_hmac_key` (ao menos 32 bytes aleatórios)
- `demo_admin_password` (somente no perfil local `development`)
- `backup_encryption_key`

Nunca copie valores reais para este diretório de exemplo, imagens, migrations ou variáveis versionadas.


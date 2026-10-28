# Desenvolvimento local

Os comandos de desenvolvimento devem ser executados na raiz indicada em cada seção do README principal. Scripts deste diretório não podem incorporar credenciais e devem consumir somente a configuração externa documentada.

# Ambiente de desenvolvimento

Com Docker Desktop em execução, inicie banco, migrações, API e interface com:

```powershell
.\scripts\dev\start.ps1
```

A interface fica disponível em `http://localhost:8088`. Os segredos locais são
gerados na primeira execução dentro de `deploy/secrets/`, que não é versionado.

Para encerrar sem apagar os dados:

```powershell
docker compose -f deploy/compose.yaml down
```

# Teste integrado do MVP

Com o ambiente Docker em execução, rode o fluxo real de ponta a ponta a partir da pasta `frontend`:

```powershell
$env:E2E_REAL='true'
$env:E2E_BASE_URL='http://127.0.0.1:8088'
$env:E2E_ADMIN_PASSWORD=(Get-Content ..\deploy\secrets\demo_admin_password -Raw).Trim()
npm run test:e2e:real
```

O teste realiza uma venda, confere a baixa e a restauração do estoque após o cancelamento, valida as telas operacionais e deixa um caixa aberto ao terminar para facilitar a apresentação.

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

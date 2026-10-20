# Sistema interno da sorveteria

Monólito modular local com API Spring Boot, SPA React e MySQL. Código e identificadores técnicos são escritos em inglês; documentação e interface são em português do Brasil.

## Pré-requisitos fixados

- Eclipse Temurin Java 21.0.12.1+1
- Node.js 24.22.0
- Docker Engine 29.9.1 e Compose 5.6.0 no servidor Linux suportado

## Comandos de desenvolvimento

```powershell
cd backend
.\gradlew.bat check

cd ..\frontend
npm ci
npm run typecheck
npm run lint
npm test
npm run build

cd ..
docker compose --env-file deploy/release-versions.env -f deploy/compose.yaml config
```

Os segredos são arquivos locais em `deploy/secrets/`; veja `deploy/secrets.example/README.md`. A API não aplica migrations no startup. Use o serviço one-shot `migrate` antes de iniciar a aplicação.


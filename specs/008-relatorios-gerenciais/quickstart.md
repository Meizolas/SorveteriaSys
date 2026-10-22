# Quickstart: Relatórios gerenciais

1. Suba o ambiente com `docker compose -f deploy/compose.yaml up -d --build`.
2. Registre vendas com mais de uma forma de pagamento e cancele uma delas.
3. Abra Relatórios e selecione o intervalo correspondente.
4. Confirme indicadores, pagamentos, série diária e ranking.
5. Selecione um período vazio e confirme o estado sem dados.
6. Execute `backend/gradlew.bat --no-daemon check` e, em `frontend`, `npm run typecheck`, `npm run lint`, `npm test -- --run` e `npm run build`.

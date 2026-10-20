# Quickstart de validação

1. Execute `./scripts/dev/start.ps1` e acesse `http://localhost:8088`.
2. Confirme Dashboard, PDV, Produtos, Estoque e Caixa na navegação.
3. Cadastre produto; registre entrada; abra caixa; faça uma venda em dinheiro.
4. Confirme troco, movimento de caixa, baixa de estoque e dashboard.
5. Reenvie a conclusão e confirme que os saldos não mudaram novamente.

## Qualidade

- Backend: `cd backend; ./gradlew test`
- Frontend: `cd frontend; npm run typecheck; npm run lint; npm test; npm run build`
- E2E: `cd frontend; npm run test:e2e`

# Quickstart: validação do caixa

1. Subir o ambiente com `docker compose -f deploy/compose.yaml up -d --build`.
2. Entrar no sistema e acessar `/caixa`.
3. Abrir o caixa com R$ 150,00 e recarregar a página.
4. Registrar suprimento e sangria com motivo.
5. Concluir uma venda em dinheiro e outra em Pix; conferir total vendido e saldo esperado.
6. Fechar com valor contado; se houver diferença, informar justificativa.
7. Confirmar que uma venda sem turno aberto é recusada.

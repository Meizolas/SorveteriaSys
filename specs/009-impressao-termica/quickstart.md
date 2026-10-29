# Quickstart: Impressão térmica operacional

1. Suba o ambiente com `docker compose -f deploy/compose.yaml up -d --build`.
2. Entre como administrador, abra o caixa e conclua uma venda.
3. Na confirmação, acione “Imprimir comprovante”.
4. Confirme que o diálogo do sistema recebe somente o documento de 80 mm e que a interface informa “Documento preparado”.
5. Cancele o diálogo e confirme que a venda continua concluída.
6. Abra a venda no histórico, solicite nova via e confirme a identificação de reimpressão.
7. Repita uma solicitação com a mesma chave e confirme que nenhum segundo trabalho é criado.
8. Execute os checks do backend, frontend e o fluxo Playwright real.

**Limite desta entrega**: o sistema prepara e rastreia o documento, mas não confirma saída física nem envia ESC/POS diretamente. A habilitação direta depende do modelo e da conexão da impressora.

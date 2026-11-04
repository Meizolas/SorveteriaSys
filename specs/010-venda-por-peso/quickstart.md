# Quickstart

1. Suba o ambiente com `docker compose -f deploy/compose.yaml up -d --build`.
2. Cadastre um produto com unidade “Quilograma” e preço R$ 40,00/kg.
3. No PDV, selecione o produto, informe bruto 0,400 kg e tara 0,050 kg.
4. Confirme líquido 0,350 kg e subtotal R$ 14,00.
5. Finalize a venda e verifique comprovante e baixa de 0,350 kg no estoque.
6. Confirme que produto por unidade continua usando botões +/− inteiros.

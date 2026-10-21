# Quickstart de validação

## Subir o sistema com Docker

Na raiz do projeto, execute:

```powershell
.\scripts\dev\start.ps1
```

O script cria os segredos locais que estiverem ausentes, constrói os containers e
informa no terminal a senha do usuário `admin`. A aplicação fica disponível em
`http://localhost:8088`.

Para consultar o estado ou os logs:

```powershell
docker compose -f deploy/compose.yaml ps
docker compose -f deploy/compose.yaml logs -f
```

## Roteiro de apresentação

1. Entre com o usuário `admin` e a senha exibida pelo script.
2. No Dashboard, mostre o resumo diário, os atalhos e o estado do caixa.
3. Em Produtos, apresente o catálogo; em Estoque, registre uma entrada.
4. Em Caixa, abra o turno informando o saldo inicial.
5. No PDV, adicione um produto, finalize em dinheiro e confira o troco.
6. Na conclusão, mostre a prévia de 80 mm e o botão **Imprimir comprovante**.
7. Volte ao Dashboard e confirme a venda recente e os indicadores atualizados.
8. Em Caixa, confira o movimento da venda e encerre o turno.

O comprovante do MVP é não fiscal. A impressão abre o diálogo padrão do navegador;
integração fiscal e comunicação direta com impressora ficam fora deste MVP.

## Qualidade

```powershell
cd backend
.\gradlew.bat check

cd ..\frontend
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

O E2E padrão simula a API de forma determinística e cobre login, abertura do caixa,
venda, comprovante, Dashboard e fechamento. Para apontar o Playwright para uma
instância já iniciada, defina `E2E_BASE_URL`, por exemplo:

```powershell
$env:E2E_BASE_URL = 'http://localhost:8088'
npm run test:e2e
```

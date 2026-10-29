# Research: Impressão térmica operacional

- **Decision**: manter o diálogo de impressão do sistema como modo inicial e fallback.
  **Rationale**: funciona com drivers já instalados, não exige acesso USB do navegador e pode ser demonstrado sem inventar confirmação física.
  **Alternatives considered**: acesso WebUSB, rejeitado por compatibilidade e segurança; envio direto pelo container, rejeitado por não alcançar USB do terminal de forma portátil.

- **Decision**: persistir um trabalho antes de abrir a impressão.
  **Rationale**: permite rastrear primeira via, reimpressão e falhas sem duplicar venda ou alterar estoque.
  **Alternatives considered**: registrar somente após `window.print`, rejeitado porque o navegador não informa resultado físico confiável.

- **Decision**: usar `PREPARED` como resultado do modo navegador.
  **Rationale**: abrir o diálogo confirma apenas que o documento foi preparado, não que saiu papel.
  **Alternatives considered**: `PRINTED`, rejeitado por produzir uma afirmação falsa.

- **Decision**: adiar o conector ESC/POS direto até identificar transporte e modelo.
  **Rationale**: USB, serial e TCP 9100 têm implantação, permissões e confirmação diferentes.
  **Alternatives considered**: escolher um agente genérico agora, rejeitado por criar dependência e configuração possivelmente incompatíveis com o equipamento real.

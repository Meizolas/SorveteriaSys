# Research: Relatórios gerenciais

- **Decision**: agregar no servidor por período e devolver uma projeção única.
  **Rationale**: evita divergência de totais no navegador e reduz viagens HTTP.
  **Alternatives considered**: agregar o histórico limitado no frontend, rejeitado por incompletude.
- **Decision**: usar dias completos no fuso America/Bahia e limites UTC exclusivos.
  **Rationale**: mantém datas de negócio coerentes com a interface.
  **Alternatives considered**: filtrar UTC diretamente, rejeitado por cortar dias locais.
- **Decision**: gráfico sem nova biblioteca, usando barras nativas da interface.
  **Rationale**: mantém execução offline e evita dependência desnecessária.

# Research

## Unidade e precisão

- **Decision**: persistir `KG` e transportar quantidades em quilogramas com três casas decimais.
- **Rationale**: coincide com estoque e checkout decimais já existentes e evita conversões ambíguas.
- **Alternatives considered**: gramas inteiras, rejeitado por exigir conversão em toda a API atual.

## Equipamento

- **Decision**: criar experiência simulada/manual com contrato visual equivalente à futura leitura física.
- **Rationale**: nenhum modelo, porta ou protocolo foi informado; simulação permite apresentação honesta.
- **Alternatives considered**: Web Serial e agente local, adiados até identificação do equipamento.

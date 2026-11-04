# Data Model

## Produto

- `unit`: `UNIT` ou `KG`.
- `salePrice`: preço por unidade de venda.
- `minimumStock` e saldo: na mesma unidade do produto.

## Pesagem transitória

- `grossWeightKg`, `tareKg`, `netWeightKg`: decimais positivos com três casas.
- `source`: `SIMULATED_MANUAL` nesta entrega.
- Não é persistida separadamente no MVP; o peso líquido fica preservado no item da venda.

## Item de venda

- Já preserva `unit`, `unitPrice`, `quantity` e `lineTotal`.

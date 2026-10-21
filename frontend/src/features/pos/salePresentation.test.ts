import { describe, expect, it } from 'vitest';
import { calculateChange, canCompleteSale, temporaryOrderNumber } from './salePresentation';

describe('apresentação da venda', () => {
  it('calcula troco somente para dinheiro', () => {
    expect(calculateChange(21.5, 25, 'Dinheiro')).toBe(3.5);
    expect(calculateChange(21.5, 25, 'Pix')).toBe(0);
  });

  it('impede dinheiro insuficiente e aceita pagamento eletrônico', () => {
    expect(canCompleteSale(21.5, 20, 'Dinheiro')).toBe(false);
    expect(canCompleteSale(21.5, 0, 'Cartão')).toBe(true);
  });

  it('gera identificador temporário com seis dígitos', () => {
    expect(temporaryOrderNumber(new Date(2026, 9, 20, 9, 2, 7))).toMatch(/^\d{6}$/);
  });
});

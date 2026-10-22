import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CashPage } from '@/features/cash/CashPage';
import * as api from '@/shared/api/operationsApi';

vi.mock('@/shared/api/operationsApi', () => ({
  getCurrentCash: vi.fn(), listClosedCashShifts: vi.fn(), openCash: vi.fn(),
  createCashMovement: vi.fn(), closeCash: vi.fn()
}));

describe('CashPage', () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getCurrentCash).mockResolvedValue(undefined);
    vi.mocked(api.listClosedCashShifts).mockResolvedValue([{
      id: 3, code: 'CX000003', operator: 'Administrador', openingAmount: 100,
      salesTotal: 250, cashSales: 150, supplies: 20, withdrawals: 10, refunds: 0,
      expectedAmount: 260, countedAmount: 258, differenceAmount: -2,
      closingReason: 'Diferença de troco', openedAt: '2026-10-22T12:00:00Z',
      closedAt: '2026-10-22T20:00:00Z'
    }]);
  });

  it('exibe a conferência dos caixas fechados', async () => {
    render(<CashPage />);

    expect(await screen.findByText('Histórico de caixas')).toBeVisible();
    expect(screen.getByText('CX000003')).toBeVisible();
    expect(screen.getByText('Diferença de troco')).toBeVisible();
    expect(screen.getByText('Administrador', { exact: false })).toBeVisible();
  });
});

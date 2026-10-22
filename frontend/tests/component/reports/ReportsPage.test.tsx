import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportsPage } from '@/features/reports/ReportsPage';
import * as api from '@/shared/api/operationsApi';

vi.mock('@/shared/api/operationsApi', () => ({ getSalesReport: vi.fn() }));

describe('ReportsPage', () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getSalesReport).mockResolvedValue({
      from: '2026-10-01', to: '2026-10-22', revenue: 480, completedSales: 12,
      canceledSales: 1, averageTicket: 40,
      payments: [{ method: 'PIX', salesCount: 7, total: 280 }],
      dailySales: [{ date: '2026-10-22', salesCount: 12, total: 480 }],
      topProducts: [{ productId: 1, sku: 'CAS-001', name: 'Cascão', quantity: 15, revenue: 300 }]
    });
  });

  it('apresenta indicadores, pagamentos e ranking', async () => {
    render(<ReportsPage />);
    expect(await screen.findByText('Produtos mais vendidos')).toBeVisible();
    expect(screen.getAllByText(/480,00/)).not.toHaveLength(0);
    expect(screen.getByText('Pix')).toBeVisible();
    expect(screen.getByText('Cascão')).toBeVisible();
  });
});

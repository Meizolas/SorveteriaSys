import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { getDashboard } from '@/shared/api/operationsApi';

vi.mock('@/shared/api/operationsApi', () => ({ getDashboard: vi.fn() }));

const mockedGetDashboard = vi.mocked(getDashboard);
const dashboard = {
  businessDate: '2026-10-21', revenue: 37.5, salesCount: 3, averageTicket: 12.5,
  hourlySales: [{ hour: 14, total: 37.5 }],
  recentSales: [{ code: 'VEN-0003', completedAt: '2026-10-21T14:30:00-03:00', operator: 'Administrador', paymentMethod: 'CASH' as const, total: 12.5 }],
  cash: { open: true, code: 'CX-0001', openedAt: '2026-10-21T09:00:00-03:00', expectedAmount: 137.5 },
  lowStockCount: 1,
  lowStock: [{ productId: 1, name: 'Cascão especial', quantity: 2, minimumStock: 3 }]
};

describe('DashboardPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exibe carregamento e reconcilia os dados operacionais', async () => {
    mockedGetDashboard.mockResolvedValue(dashboard);
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);

    expect(screen.getByText('Carregando operação…')).toBeVisible();
    expect(await screen.findByText('VEN-0003')).toBeVisible();
    expect(screen.getAllByText('R$ 37,50')).not.toHaveLength(0);
    expect(screen.getByText('CX-0001')).toBeVisible();
    expect(screen.getByText('Cascão especial')).toBeVisible();
  });

  it('mostra os estados vazios quando ainda não houve operação', async () => {
    mockedGetDashboard.mockResolvedValue({
      ...dashboard, revenue: 0, salesCount: 0, averageTicket: 0,
      hourlySales: [], recentSales: [], cash: { open: false, expectedAmount: 0 },
      lowStockCount: 0, lowStock: []
    });
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);

    expect(await screen.findByText('Nenhuma venda registrada hoje')).toBeVisible();
    expect(screen.getByText('Sem movimento por horário')).toBeVisible();
    expect(screen.getByText('Estoque em dia')).toBeVisible();
    expect(screen.getByRole('link', { name: /Abrir caixa/ })).toHaveAttribute('href', '/caixa');
  });

  it('oferece recuperação quando a API falha', async () => {
    mockedGetDashboard.mockRejectedValue(new Error('Falha de teste'));
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de teste');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
  });
});

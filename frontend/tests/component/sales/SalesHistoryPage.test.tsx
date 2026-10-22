import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SalesHistoryPage } from '@/features/sales/SalesHistoryPage';
import * as api from '@/shared/api/operationsApi';

vi.mock('@/shared/api/operationsApi', () => ({ listSales: vi.fn(), getSale: vi.fn() }));
vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => ({ session: { user: { displayName: 'Administrador' } } })
}));

const summary = {
  id: 7, code: 'V000007', completedAt: '2026-10-22T14:30:00-03:00', status: 'COMPLETED',
  total: 25, paymentMethod: 'CASH' as const, operator: 'Operador Teste', itemCount: 2
};

describe('SalesHistoryPage', () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.listSales).mockResolvedValue([summary]);
    vi.mocked(api.getSale).mockResolvedValue({
      ...summary, receivedAmount: 30, changeAmount: 5,
      items: [{ productId: 1, sku: 'CAS-001', name: 'Cascão', unitPrice: 12.5, quantity: 2, lineTotal: 25 }]
    });
  });

  it('lista uma venda e abre o comprovante para reimpressão', async () => {
    render(<SalesHistoryPage />);

    expect(await screen.findAllByText('V000007')).not.toHaveLength(0);
    expect(screen.getAllByText('Operador Teste')).not.toHaveLength(0);
    const [detailButton] = screen.getAllByRole('button', { name: 'Ver detalhes' });
    if (!detailButton) throw new Error('Botão de detalhes ausente');
    fireEvent.click(detailButton);

    await waitFor(() => expect(api.getSale).toHaveBeenCalledWith(7));
    expect(await screen.findByRole('heading', { name: 'Detalhes da venda' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Imprimir comprovante' })).toBeVisible();
    expect(screen.getByText(/Reimpressão de venda registrada/)).toBeVisible();
  });

  it('filtra o histórico sem perder o estado vazio informativo', async () => {
    render(<SalesHistoryPage />);
    expect(await screen.findAllByText('V000007')).not.toHaveLength(0);
    fireEvent.change(screen.getByPlaceholderText('Buscar por número ou operador'), {
      target: { value: 'inexistente' }
    });
    expect(screen.getByText('Nenhuma venda encontrada')).toBeVisible();
  });
});

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryPage } from '@/features/inventory/InventoryPage';
import * as api from '@/shared/api/operationsApi';

vi.mock('@/shared/api/operationsApi', () => ({
  listProducts: vi.fn(), listStockMovements: vi.fn(), createStockMovement: vi.fn()
}));

describe('InventoryPage', () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.listProducts).mockResolvedValue([{
      id: 1, name: 'Pote 500 ml', sku: 'POT-500', categoryId: 1, category: 'Potes',
      price: 22, unit: 'UNIT', active: true, tracksStock: true,
      minimumStock: 5, stock: 12, version: 0
    }]);
    vi.mocked(api.listStockMovements).mockResolvedValue([{
      id: 9, productId: 1, productName: 'Pote 500 ml', sku: 'POT-500', type: 'ENTRY',
      quantity: 10, previousQuantity: 2, resultingQuantity: 12,
      reason: 'Reposição semanal', actor: 'Administrador', createdAt: new Date().toISOString()
    }]);
  });

  it('mostra contador e rastreabilidade dos movimentos', async () => {
    render(<InventoryPage />);

    expect(await screen.findByText('Histórico de movimentações')).toBeVisible();
    expect(screen.getAllByText('Pote 500 ml')).not.toHaveLength(0);
    expect(screen.getAllByText('Reposição semanal')).not.toHaveLength(0);
    expect(screen.getAllByText(/Administrador/)).not.toHaveLength(0);
    expect(screen.getByText('Movimentos hoje')).toBeVisible();
    expect(screen.getAllByText('1')).not.toHaveLength(0);
  });
});

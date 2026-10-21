import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductsPage } from '@/features/catalog/ProductsPage';
import * as api from '@/shared/api/operationsApi';

vi.mock('@/shared/api/operationsApi', () => ({
  listProducts: vi.fn(), listCategories: vi.fn(), createProduct: vi.fn(), updateProduct: vi.fn()
}));

const product = {
  id: 7, name: 'Cascão', sku: 'CAS-001', categoryId: 2, category: 'Cascões',
  price: 12.5, unit: 'UNIT', active: true, tracksStock: true,
  minimumStock: 3, stock: 20, version: 0
};

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.listProducts).mockResolvedValue([product]);
    vi.mocked(api.listCategories).mockResolvedValue([{ id: 2, name: 'Cascões', active: true }]);
    vi.mocked(api.updateProduct).mockResolvedValue({ ...product, name: 'Cascão premium', price: 15 });
  });

  it('preenche, valida e envia a edição de um produto existente', async () => {
    render(<ProductsPage />);
    const row = await screen.findByRole('row', { name: /Cascão CAS-001/ });
    fireEvent.click(within(row).getByRole('button', { name: 'Editar' }));

    expect(screen.getByRole('heading', { name: 'Editar produto' })).toBeVisible();
    expect(screen.getByLabelText('Código / SKU')).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/^Nome/), { target: { value: 'Cascão premium' } });
    fireEvent.change(screen.getByLabelText(/^Preço/), { target: { value: '15,00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(api.updateProduct).toHaveBeenCalledWith(7, {
      categoryId: 2,
      name: 'Cascão premium',
      price: 15,
      active: true,
      tracksStock: true,
      minimumStock: 3
    }));
    expect(await screen.findByText('Produto atualizado com sucesso.')).toBeVisible();
  });
});

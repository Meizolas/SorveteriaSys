import { apiRequest } from './apiClient';

export type CategoryView = { id: number; name: string; active: boolean };
export type ProductView = {
  id: number; name: string; sku: string; categoryId: number; category: string;
  price: number; unit: string; active: boolean; tracksStock: boolean;
  minimumStock: number; stock: number; version: number;
};

export const listCategories = () => apiRequest<CategoryView[]>('/api/v1/categories');
export const listProducts = () => apiRequest<ProductView[]>('/api/v1/products');
export const createProduct = (input: {
  categoryId: number; name: string; sku: string; price: number;
  tracksStock: boolean; minimumStock: number;
}) => apiRequest<ProductView>('/api/v1/products', { method: 'POST', body: JSON.stringify(input) });
export const updateProduct = (id: number, input: {
  categoryId: number; name: string; price: number; active: boolean;
  tracksStock: boolean; minimumStock: number;
}) => apiRequest<ProductView>(`/api/v1/products/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const createStockMovement = (input: {
  productId: number; type: 'ENTRY' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';
  quantity: number; reason: string;
}) => apiRequest('/api/v1/stock/movements', { method: 'POST', body: JSON.stringify(input) });

export type SaleResult = {
  id: number; code: string; total: number; completedAt: string;
  items: { productId: number; sku: string; name: string; unitPrice: number; quantity: number; lineTotal: number }[];
  paymentMethod: 'CASH' | 'PIX' | 'CARD'; receivedAmount: number; changeAmount: number;
};

export const createSale = (idempotencyKey: string, input: {
  items: { productId: number; quantity: number }[];
  paymentMethod: 'CASH' | 'PIX' | 'CARD'; receivedAmount?: number;
}) => apiRequest<SaleResult>('/api/v1/sales', {
  method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify(input)
});

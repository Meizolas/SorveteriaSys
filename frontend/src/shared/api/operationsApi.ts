import { apiRequest } from './apiClient';

export type CategoryView = { id: number; name: string; active: boolean };
export type ProductView = {
  id: number; name: string; sku: string; categoryId: number; category: string;
  price: number; unit: string; active: boolean; tracksStock: boolean;
  minimumStock: number; stock: number; version: number;
};

export const listCategories = () => apiRequest<CategoryView[]>('/api/v1/categories');
export const createCategory = (name: string) => apiRequest<CategoryView>('/api/v1/categories', {
  method: 'POST', body: JSON.stringify({ name })
});
export const updateCategory = (id: number, input: { name: string; active: boolean }) =>
  apiRequest<CategoryView>(`/api/v1/categories/${id}`, {
    method: 'PATCH', body: JSON.stringify(input)
  });
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

export type StockMovementView = {
  id: number; productId: number; productName: string; sku: string;
  type: 'ENTRY' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'SALE_OUT' | 'SALE_RETURN';
  quantity: number; previousQuantity: number; resultingQuantity: number;
  reason: string; actor: string; createdAt: string;
};
export const listStockMovements = () =>
  apiRequest<StockMovementView[]>('/api/v1/stock/movements');

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

export type SaleSummaryView = {
  id: number; code: string; completedAt: string; status: string; total: number;
  paymentMethod: 'CASH' | 'PIX' | 'CARD'; operator: string; itemCount: number;
  canceledAt?: string; cancellationReason?: string;
};
export type SaleDetailView = {
  id: number; code: string; completedAt: string; status: string; total: number;
  paymentMethod: 'CASH' | 'PIX' | 'CARD'; receivedAmount: number; changeAmount: number;
  operator: string; canceledAt?: string; cancellationReason?: string;
  items: { productId: number; sku: string; name: string; unitPrice: number; quantity: number; lineTotal: number }[];
};
export const listSales = () => apiRequest<SaleSummaryView[]>('/api/v1/sales');
export const getSale = (id: number) => apiRequest<SaleDetailView>(`/api/v1/sales/${id}`);
export const cancelSale = (id: number, reason: string) => apiRequest<{
  id: number; code: string; status: string; canceledAt: string; cancellationReason: string;
}>(`/api/v1/sales/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) });

export type CashMovementView = {
  id: number; type: 'OPENING' | 'SUPPLY' | 'WITHDRAWAL' | 'CASH_SALE' | 'CASH_REFUND';
  amount: number; reason: string; saleId?: number; createdAt: string;
};
export type CashView = {
  id: number; code: string; status: 'OPEN' | 'CLOSED'; operatorUserId: number;
  openingAmount: number; salesTotal: number; cashSales: number; supplies: number;
  withdrawals: number; refunds: number; expectedAmount: number; countedAmount?: number;
  differenceAmount?: number; closingReason?: string; openedAt: string; closedAt?: string;
  movements: CashMovementView[];
};
export type ClosedCashShiftView = {
  id: number; code: string; operator: string; openingAmount: number; salesTotal: number;
  cashSales: number; supplies: number; withdrawals: number; refunds: number;
  expectedAmount: number; countedAmount: number; differenceAmount: number;
  closingReason?: string; openedAt: string; closedAt: string;
};
export const getCurrentCash = () => apiRequest<CashView | undefined>('/api/v1/cash/current');
export const listClosedCashShifts = () =>
  apiRequest<ClosedCashShiftView[]>('/api/v1/cash/shifts/history');
export const openCash = (openingAmount: number) => apiRequest<CashView>('/api/v1/cash/shifts', {
  method: 'POST', body: JSON.stringify({ openingAmount })
});
export const createCashMovement = (type: 'SUPPLY' | 'WITHDRAWAL', amount: number, reason: string) =>
  apiRequest<CashView>('/api/v1/cash/movements', {
    method: 'POST', body: JSON.stringify({ type, amount, reason })
  });
export const closeCash = (countedAmount: number, reason?: string) => apiRequest<CashView>('/api/v1/cash/close', {
  method: 'POST', body: JSON.stringify({ countedAmount, reason })
});

export type DashboardView = {
  businessDate: string; revenue: number; salesCount: number; averageTicket: number;
  hourlySales: { hour: number; total: number }[];
  recentSales: { code: string; completedAt: string; operator: string; paymentMethod: 'CASH' | 'PIX' | 'CARD'; total: number }[];
  cash: { open: boolean; code?: string; openedAt?: string; expectedAmount: number };
  lowStockCount: number;
  lowStock: { productId: number; name: string; quantity: number; minimumStock: number }[];
};
export const getDashboard = () => apiRequest<DashboardView>('/api/v1/dashboard');

export type SalesReportView = {
  from: string; to: string; revenue: number; completedSales: number; canceledSales: number;
  averageTicket: number;
  payments: { method: 'CASH' | 'PIX' | 'CARD'; salesCount: number; total: number }[];
  dailySales: { date: string; salesCount: number; total: number }[];
  topProducts: { productId: number; sku: string; name: string; quantity: number; revenue: number }[];
};
export const getSalesReport = (from: string, to: string) =>
  apiRequest<SalesReportView>(`/api/v1/reports/sales?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);

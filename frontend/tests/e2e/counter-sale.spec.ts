import { expect, test, type Route } from '@playwright/test';

const session = {
  user: { id: '1', login: 'admin', displayName: 'Administrador', active: true, mustChangePassword: false, temporaryPasswordExpiresAt: null, roles: ['ADMINISTRATOR'], version: 0, createdAt: '2026-10-21T09:00:00-03:00', updatedAt: '2026-10-21T09:00:00-03:00' },
  permissions: ['STORE_READ', 'STORE_WRITE'], authenticatedAt: '2026-10-21T09:00:00-03:00', idleExpiresAt: '2026-10-21T18:00:00-03:00', absoluteExpiresAt: '2026-10-22T09:00:00-03:00'
};
const product = { id: 1, name: 'Cascão especial', sku: 'CAS-001', categoryId: 1, category: 'Cascões', price: 12.5, unit: 'UN', active: true, tracksStock: true, minimumStock: 3, stock: 20, version: 0 };
let authenticated = false;
let cashOpen = false;
let saleCreated = false;

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

test.beforeEach(async ({ page }) => {
  authenticated = false; cashOpen = false; saleCreated = false;
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    if (path === '/api/v1/session/csrf') return json(route, { token: 'e2e-csrf' });
    if (path === '/api/v1/session' && method === 'POST') { authenticated = true; return json(route, session); }
    if (path === '/api/v1/session' && method === 'GET') return authenticated ? json(route, session) : json(route, { title: 'Não autenticado', status: 401, code: 'UNAUTHENTICATED' }, 401);
    if (path === '/api/v1/products') return json(route, [{ ...product, stock: saleCreated ? 19 : 20 }]);
    if (path === '/api/v1/cash/current') return json(route, cashOpen ? cashView() : undefined);
    if (path === '/api/v1/cash/shifts' && method === 'POST') { cashOpen = true; return json(route, cashView()); }
    if (path === '/api/v1/cash/close' && method === 'POST') { cashOpen = false; return json(route, { ...cashView(), status: 'CLOSED' }); }
    if (path === '/api/v1/sales' && method === 'POST') {
      saleCreated = true;
      return json(route, { id: 1, code: 'VEN-0001', total: 12.5, completedAt: '2026-10-21T14:30:00-03:00', items: [{ productId: 1, sku: product.sku, name: product.name, unitPrice: 12.5, quantity: 1, lineTotal: 12.5 }], paymentMethod: 'CASH', receivedAmount: 12.5, changeAmount: 0 });
    }
    if (path === '/api/v1/dashboard') return json(route, dashboardView());
    return json(route, { title: `Rota não simulada: ${method} ${path}`, status: 404 }, 404);
  });
});

test('login, abertura, venda, comprovante, dashboard e fechamento do caixa', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Usuário').fill('admin');
  await page.getByLabel('Senha').fill('senha-de-demonstracao');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();

  await page.getByRole('link', { name: 'Caixa', exact: true }).click();
  await page.getByRole('button', { name: 'Abrir caixa' }).click();
  await page.getByLabel('Saldo inicial').fill('100,00');
  await page.getByRole('button', { name: 'Abrir turno' }).click();
  await expect(page.getByText('CAIXA ABERTO')).toBeVisible();

  await page.getByRole('link', { name: 'Frente de caixa' }).click();
  await page.getByRole('button', { name: /Cascão especial/ }).click();
  await page.getByRole('button', { name: 'Finalizar venda' }).click();
  await page.getByRole('button', { name: 'Concluir venda' }).click();
  await expect(page.getByRole('heading', { name: 'Venda concluída' })).toBeVisible();
  await expect(page.getByText('VEN-0001').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Imprimir comprovante' })).toBeVisible();
  await page.getByRole('button', { name: 'Nova venda' }).click();

  await page.getByRole('link', { name: 'Visão geral' }).click();
  await expect(page.getByText('VEN-0001')).toBeVisible();
  await expect(page.getByText('R$ 12,50').first()).toBeVisible();

  await page.getByRole('link', { name: 'Caixa', exact: true }).click();
  await page.getByRole('button', { name: 'Fechar caixa' }).click();
  await page.getByLabel('Valor contado').fill('112,50');
  await page.getByRole('button', { name: 'Conferir e fechar' }).click();
  await expect(page.getByText('CAIXA FECHADO', { exact: true })).toBeVisible();
});

function cashView() {
  return { id: 1, code: 'CX-0001', status: 'OPEN', operatorUserId: 1, openingAmount: 100, salesTotal: saleCreated ? 12.5 : 0, cashSales: saleCreated ? 12.5 : 0, supplies: 0, withdrawals: 0, expectedAmount: saleCreated ? 112.5 : 100, openedAt: '2026-10-21T09:00:00-03:00', movements: saleCreated ? [{ id: 2, type: 'CASH_SALE', amount: 12.5, reason: 'Venda VEN-0001', saleId: 1, createdAt: '2026-10-21T14:30:00-03:00' }] : [{ id: 1, type: 'OPENING', amount: 100, reason: 'Abertura', createdAt: '2026-10-21T09:00:00-03:00' }] };
}

function dashboardView() {
  return { businessDate: '2026-10-21', revenue: saleCreated ? 12.5 : 0, salesCount: saleCreated ? 1 : 0, averageTicket: saleCreated ? 12.5 : 0, hourlySales: saleCreated ? [{ hour: 14, total: 12.5 }] : [], recentSales: saleCreated ? [{ code: 'VEN-0001', completedAt: '2026-10-21T14:30:00-03:00', operator: 'Administrador', paymentMethod: 'CASH', total: 12.5 }] : [], cash: { open: cashOpen, ...(cashOpen ? { code: 'CX-0001', openedAt: '2026-10-21T09:00:00-03:00' } : {}), expectedAmount: cashOpen ? (saleCreated ? 112.5 : 100) : 0 }, lowStockCount: 0, lowStock: [] };
}

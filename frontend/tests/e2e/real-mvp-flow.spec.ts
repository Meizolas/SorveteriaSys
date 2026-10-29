import { expect, test } from '@playwright/test';

const environment = (globalThis as { process?: { env: Record<string, string | undefined> } })
  .process?.env ?? {};
const realEnvironment = environment.E2E_REAL === 'true';
const password = environment.E2E_ADMIN_PASSWORD;

test.describe('fluxo integrado no ambiente Docker real', () => {
  test.skip(!realEnvironment, 'Executado somente com E2E_REAL=true contra o Docker local.');

  test('login, caixa, venda, estoque, reimpressão, cancelamento, relatórios e auditoria', async ({ page }) => {
    test.setTimeout(90_000);
    test.skip(!password, 'Informe E2E_ADMIN_PASSWORD sem registrar a credencial no código.');

    await page.goto('/login');
    await page.getByLabel('Usuário').fill('admin');
    await page.getByLabel('Senha').fill(password ?? '');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible({ timeout: 20_000 });

    const productsResponse = await page.request.get('/api/v1/products');
    expect(productsResponse.ok()).toBeTruthy();
    const products = await productsResponse.json() as Array<{
      id: number; name: string; sku: string; price: number; active: boolean;
      tracksStock: boolean; stock: number;
    }>;
    expect(products.length, 'A carga demonstrativa deve oferecer ao menos 17 produtos')
      .toBeGreaterThanOrEqual(17);
    const product = products.find((item) => item.active && (!item.tracksStock || item.stock > 0));
    expect(product, 'A base deve possuir ao menos um produto ativo com estoque').toBeTruthy();
    if (!product) return;
    const stockBefore = Number(product.stock);

    await page.getByRole('link', { name: 'Caixa', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Caixa', exact: true })).toBeVisible();
    const openButton = page.getByRole('button', { name: 'Abrir caixa' });
    if (await openButton.isVisible()) {
      await openButton.click();
      await page.getByLabel('Saldo inicial').fill('100,00');
      await page.getByRole('button', { name: 'Abrir turno' }).click();
    }
    await expect(page.getByText('CAIXA ABERTO')).toBeVisible();

    await page.getByRole('link', { name: 'Frente de caixa' }).click();
    await page.getByPlaceholder('Buscar produto por nome ou código').fill(product.sku);
    await page.getByRole('button', { name: new RegExp(escapeRegex(product.name), 'i') }).click();
    await page.getByRole('button', { name: 'Finalizar venda' }).click();
    await page.getByRole('button', { name: 'Concluir venda' }).click();
    await expect(page.getByRole('heading', { name: 'Venda concluída' })).toBeVisible();
    const saleCode = (await page.getByText(/Pedido #V[0-9]+/).textContent())?.match(/V[0-9]+/)?.[0];
    expect(saleCode).toBeTruthy();
    await expect(page.getByRole('button', { name: 'Imprimir comprovante' })).toBeVisible();
    await page.evaluate(() => { window.print = () => undefined; });
    await page.getByRole('button', { name: 'Imprimir comprovante' }).click();
    await expect(page.getByText('Impressão solicitada')).toBeVisible();
    await page.getByRole('button', { name: 'Nova venda' }).click();

    const updatedProducts = await (await page.request.get('/api/v1/products')).json() as typeof products;
    const updatedProduct = updatedProducts.find((item) => item.id === product.id);
    expect(updatedProduct).toBeTruthy();
    if (product.tracksStock) expect(Number(updatedProduct?.stock)).toBe(stockBefore - 1);

    await page.getByRole('link', { name: 'Visão geral' }).click();
    await expect(page.getByText(saleCode ?? '').first()).toBeVisible();

    await page.getByRole('link', { name: 'Vendas', exact: true }).click();
    const saleRow = page.getByRole('row').filter({ hasText: saleCode ?? '' });
    await expect(saleRow).toBeVisible();
    await saleRow.getByRole('button', { name: 'Detalhes' }).click();
    await expect(page.getByRole('heading', { name: 'Detalhes da venda' })).toBeVisible();
    await expect(page.getByText('Reimpressão de venda registrada.')).toBeVisible();
    await page.getByRole('button', { name: 'Fechar' }).click();

    await saleRow.getByRole('button', { name: 'Cancelar' }).click();
    await page.getByLabel('Motivo do cancelamento').fill('Validação integrada automatizada do MVP');
    await page.getByRole('button', { name: 'Confirmar cancelamento' }).click();
    await expect(page.getByRole('row').filter({ hasText: saleCode ?? '' }).getByText('Cancelada')).toBeVisible();

    const restoredProducts = await (await page.request.get('/api/v1/products')).json() as typeof products;
    const restoredProduct = restoredProducts.find((item) => item.id === product.id);
    if (product.tracksStock) expect(Number(restoredProduct?.stock)).toBe(stockBefore);

    await page.getByRole('link', { name: 'Estoque', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Estoque' })).toBeVisible();
    await expect(page.getByText(product.name).first()).toBeVisible();

    await page.getByRole('link', { name: 'Relatórios', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Relatórios' })).toBeVisible();

    await page.getByRole('link', { name: 'Auditoria', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Auditoria' })).toBeVisible();
    await expect(page.getByText(/eventos carregados/)).toBeVisible();

    await page.getByRole('link', { name: 'Caixa', exact: true }).click();
    const currentCashResponse = await page.request.get('/api/v1/cash/current');
    const currentCash = await currentCashResponse.json() as { expectedAmount: number };
    await page.getByRole('button', { name: 'Fechar caixa' }).click();
    await page.getByLabel('Valor contado').fill(Number(currentCash.expectedAmount).toFixed(2).replace('.', ','));
    await page.getByRole('button', { name: 'Conferir e fechar' }).click();
    await expect(page.getByText('CAIXA FECHADO', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Abrir caixa' }).click();
    await page.getByLabel('Saldo inicial').fill('100,00');
    await page.getByRole('button', { name: 'Abrir turno' }).click();
    await expect(page.getByText('CAIXA ABERTO')).toBeVisible();
  });
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

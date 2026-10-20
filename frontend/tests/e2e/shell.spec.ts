import { expect, test } from '@playwright/test';

test('abre a tela de autenticação em português', async ({ page }) => {
  await page.route('**/api/v1/session', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/problem+json',
      body: JSON.stringify({
        type: 'about:blank',
        title: 'Não autenticado',
        status: 401,
        code: 'UNAUTHENTICATED',
        correlationId: '00000000-0000-4000-8000-000000000000'
      })
    });
  });

  await page.goto('/login');

  await expect(page).toHaveTitle('Sistema da Sorveteria');
  await expect(page.getByRole('heading', { level: 1, name: 'Entrar' })).toBeVisible();
  await expect(page.getByLabel('Usuário')).toBeVisible();
  await expect(page.getByLabel('Senha')).toBeVisible();
});

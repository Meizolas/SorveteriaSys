/* global process */
import { chromium } from '@playwright/test';
const password = process.env.DEMO_PASSWORD;
if (!password) throw new Error('DEMO_PASSWORD obrigatório');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:8088/login');
await page.locator('input').nth(0).fill('admin');
await page.locator('input').nth(1).fill(password);
await page.locator('button[type="submit"]').click();
await page.waitForURL('http://127.0.0.1:8088/');
await page.waitForLoadState('networkidle');
const sizes = [[1440,900],[1024,768],[768,1024],[390,844]];
for (const [width,height] of sizes) {
  await page.setViewportSize({ width, height });
  await page.goto('http://127.0.0.1:8088/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `visual-${width}x${height}.png`, fullPage: true });
}
for (const route of ['pdv','produtos','estoque','caixa']) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`http://127.0.0.1:8088/${route}`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `visual-mobile-${route}.png`, fullPage: true });
}
await browser.close();

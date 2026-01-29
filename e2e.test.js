import { test, expect } from '@playwright/test';

test('PokerGT game loads and starts', async ({ page }) => {
  await page.goto('http://localhost:8080');

  await expect(page.locator('h1')).toContainText('PokerGT');
  await expect(page.locator('#new-game-btn')).toBeVisible();

  await page.click('#new-game-btn');

  await expect(page.locator('#hand-number')).toContainText('1');
  await expect(page.locator('#player-cards .card')).toHaveCount(2);

  await expect(page.locator('#fold-btn')).toBeVisible();
  await expect(page.locator('#gt-btn')).toBeVisible();
});

test('GT Advice modal works', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.click('#new-game-btn');

  await page.waitForTimeout(100);

  await page.click('#gt-btn');

  await expect(page.locator('#gto-modal')).toBeVisible();
  await expect(page.locator('.gto-recommendation')).toBeVisible();

  await page.click('.close');
  await expect(page.locator('#gto-modal')).toBeHidden();
});

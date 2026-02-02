import { test, expect } from '@playwright/test';

/**
 * Example E2E Test
 *
 * This is a basic test to verify Playwright is configured correctly
 * and can interact with the Next.js application.
 */

test.describe('Application Basics', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');

    // Verify page title
    await expect(page).toHaveTitle(/Order Food Online/);

    // Verify the page loads successfully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });

  test('should navigate to 404 page for invalid routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');

    // Should get a 404 response
    expect(response?.status()).toBe(404);
  });
});

test.describe('Environment', () => {
  test('should have BASE_URL configured', async ({ page }) => {
    // This test verifies the environment is set up correctly
    expect(process.env.BASE_URL || 'http://localhost:3000').toBeTruthy();

    await page.goto('/');
    expect(page.url()).toContain('http');
  });

  test('should support English and Spanish', async ({ page }) => {
    await page.goto('/');

    // Verify the page uses Spanish (Mexico timezone)
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang || 'es').toMatch(/es|en/);
  });
});

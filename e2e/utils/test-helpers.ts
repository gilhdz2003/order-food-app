/**
 * Test Helper Utilities for Playwright E2E Tests
 *
 * Common functions and utilities used across all E2E tests
 */

import { Page, Locator } from '@playwright/test';

/**
 * Demo user credentials for testing
 */
export const DEMO_USERS = {
  admin: {
    email: 'admin@demo.com',
    password: 'Demo123!', // Note: Set this in Supabase Auth
    role: 'admin',
  },
  editor: {
    email: 'editor@demo.com',
    password: 'Demo123!',
    role: 'editor_menu',
  },
  comanda: {
    email: 'comanda@demo.com',
    password: 'Demo123!',
    role: 'comanda_user',
  },
  employee: {
    email: 'juan.perez@demo.com',
    password: 'Demo123!',
    role: 'empleado',
  },
};

/**
 * Login with OAuth (Google)
 * This is a placeholder - actual OAuth implementation will vary
 */
export async function loginWithGoogle(page: Page, email: string): Promise<void> {
  await page.goto('/login');
  await page.click('button:has-text("Continuar con Google")');

  // TODO: Implement OAuth flow simulation
  // For now, this is a placeholder that needs to be updated
  // based on actual OAuth implementation
}

/**
 * Wait for page to be stable (no network requests for 500ms)
 */
export async function waitForStablePage(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

/**
 * Fill form with data
 */
export async function fillForm(
  page: Page,
  selectors: Record<string, string>,
  data: Record<string, string>
): Promise<void> {
  for (const [field, selector] of Object.entries(selectors)) {
    if (data[field]) {
      await page.fill(selector, data[field]);
    }
  }
}

/**
 * Take screenshot on failure
 */
export async function takeScreenshot(page: Page, testName: string): Promise<void> {
  await page.screenshot({
    path: `e2e/results/screenshots/${testName}-failure.png`,
    fullPage: true,
  });
}

/**
 * Get today's menu items
 */
export async function getTodayMenuItems(page: Page): Promise<Locator[]> {
  return await page.locator('[data-testid="dish-card"]').all();
}

/**
 * Add item to cart
 */
export async function addToCart(page: Page, dishName: string): Promise<void> {
  await page.click(`[data-dish-name="${dishName}"] button:has-text("Agregar")`);
}

/**
 * Get cart item count
 */
export async function getCartItemCount(page: Page): Promise<number> {
  const badge = page.locator('[data-testid="cart-badge"]');
  const text = await badge.textContent();
  return text ? parseInt(text, 10) : 0;
}

/**
 * Navigate to dashboard by role
 */
export async function navigateToDashboard(page: Page, role: string): Promise<void> {
  const routes: Record<string, string> = {
    admin: '/admin',
    editor: '/editor',
    empleado: '/employee',
    comanda_user: '/comanda',
  };

  const route = routes[role];
  if (!route) {
    throw new Error(`Unknown role: ${role}`);
  }

  await page.goto(route);
  await waitForStablePage(page);
}

/**
 * Create test menu (for admin testing)
 */
export async function createTestMenu(page: Page, menuDate: string): Promise<void> {
  await page.goto('/admin/menus/new');
  await page.fill('[name="menuDate"]', menuDate);
  await page.click('button:has-text("Crear Menú")');
  await waitForStablePage(page);
}

/**
 * Generate random order code for testing
 */
export function generateOrderCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

/**
 * Get current date in Mexico City timezone
 */
export function getCurrentDate(): string {
  return new Date().toLocaleDateString('es-MX', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Check if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).count() > 0;
}

/**
 * Wait for toast message
 */
export async function waitForToast(page: Page, message: string): Promise<void> {
  await page.waitForSelector(`[data-testid="toast"]:has-text("${message}")`, {
    timeout: 5000,
  });
}

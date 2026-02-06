import { test, expect } from '@playwright/test';
import { DEMO_USERS, waitForStablePage, loginWithEmail } from '../utils/test-helpers';

/**
 * Admin Dashboard E2E Tests
 *
 * Tests for the Admin Dashboard functionality including:
 * - Overview page with metrics
 * - Users list page
 * - Navigation between sections
 */

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin user
    await loginWithEmail(page, DEMO_USERS.admin.email, DEMO_USERS.admin.password);

    // Wait for navigation to admin dashboard
    await page.waitForURL('**/admin', { timeout: 10000 });
    await waitForStablePage(page);
  });

  test.describe('Overview Page', () => {
    test('should display admin dashboard with metrics', async ({ page }) => {
      // Check page title and heading
      await expect(page).toHaveTitle(/Order Food Online/);
      await expect(page.locator('h1:has-text("Dashboard Admin")')).toBeVisible();

      // Check that all metric cards are displayed
      await expect(page.locator('text=Usuarios Totales')).toBeVisible();
      await expect(page.locator('text=Empresas')).toBeVisible();
      await expect(page.locator('text=Menús Activos')).toBeVisible();
      await expect(page.locator('text=Pedidos de Hoy')).toBeVisible();
    });

    test('should display correct metrics counts', async ({ page }) => {
      // Wait for metrics to load
      await waitForStablePage(page);

      // Get all metric cards
      const metricCards = page.locator('.grid').locator('.border').filter({ hasText: 'Usuarios' });

      // Metrics should be numbers (not empty or loading)
      const metrics = await page.locator('.text-3xl').allTextContents();
      for (const metric of metrics) {
        expect(metric.trim()).not.toBe('');
        expect(parseInt(metric.trim(), 10)).toBeGreaterThanOrEqual(0);
      }
    });

    test('should have working quick action links', async ({ page }) => {
      // Test "Crear Usuario" link
      const createUserLink = page.locator('a:has-text("Crear Usuario")');
      await expect(createUserLink).toBeVisible();
      await createUserLink.click();
      await expect(page).toHaveURL('**/admin/users/new');

      // Go back
      await page.goBack();
      await waitForStablePage(page);

      // Test "Crear Menú" link
      const createMenuLink = page.locator('a:has-text("Crear Menú")');
      await expect(createMenuLink).toBeVisible();
      await createMenuLink.click();
      await expect(page).toHaveURL('**/admin/menus/new');
    });

    test('metric cards should be clickable and navigate to correct pages', async ({ page }) => {
      // Click on "Usuarios Totales" card
      const usersCard = page.locator('.border', { hasText: 'Usuarios Totales' }).first();
      await usersCard.click();
      await expect(page).toHaveURL('**/admin/users');
      await expect(page.locator('h1:has-text("Gestión de Usuarios")')).toBeVisible();
    });
  });

  test.describe('Users List Page', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to users page
      await page.goto('/admin/users');
      await waitForStablePage(page);
    });

    test('should display users table', async ({ page }) => {
      // Check page heading
      await expect(page.locator('h1:has-text("Gestión de Usuarios")')).toBeVisible();

      // Check table headers
      await expect(page.locator('th:has-text("Usuario")')).toBeVisible();
      await expect(page.locator('th:has-text("Email")')).toBeVisible();
      await expect(page.locator('th:has-text("Rol")')).toBeVisible();
      await expect(page.locator('th:has-text("Empresa")')).toBeVisible();
      await expect(page.locator('th:has-text("Estado")')).toBeVisible();
      await expect(page.locator('th:has-text("Acciones")')).toBeVisible();
    });

    test('should display all users in database', async ({ page }) => {
      // Wait for table to load
      await page.waitForSelector('table tbody tr', { timeout: 10000 });

      // Count rows in table
      const userRows = await page.locator('table tbody tr').count();
      expect(userRows).toBeGreaterThan(0);

      // Verify at least the demo admin user exists
      await expect(page.locator('td:has-text("admin@demo.com")')).toBeVisible();
    });

    test('should display user count in card description', async ({ page }) => {
      const description = page.locator('text=usuarios registrados en el sistema');
      await expect(description).toBeVisible();

      // Extract the number from the description
      const text = await description.textContent();
      const match = text?.match(/(\d+)\s+usuarios/);
      expect(match).toBeTruthy();
      expect(parseInt(match?.[1] || '0', 10)).toBeGreaterThan(0);
    });

    test('should have working "Nuevo Usuario" button', async ({ page }) => {
      const newUserButton = page.locator('button:has-text("Nuevo Usuario")');
      await expect(newUserButton).toBeVisible();
      await newUserButton.click();
      await expect(page).toHaveURL('**/admin/users/new');
    });

    test('should display role badges with correct colors', async ({ page }) => {
      // Wait for table to load
      await page.waitForSelector('table tbody tr', { timeout: 10000 });

      // Check for admin role badge (should be red)
      const adminBadge = page.locator('.badge').filter({ hasText: 'Administrador' }).first();
      await expect(adminBadge).toHaveClass(/bg-red-100/);

      // Check for employee role badge (should be green)
      const employeeBadge = page.locator('.badge').filter({ hasText: 'Empleado' }).first();
      await expect(employeeBadge).toHaveClass(/bg-green-100/);
    });

    test('should have action dropdown for each user', async ({ page }) => {
      // Wait for table to load
      await page.waitForSelector('table tbody tr', { timeout: 10000 });

      // Get first row's action button
      const firstRow = page.locator('table tbody tr').first();
      const actionButton = firstRow.locator('button[aria-haspopup="menu"]');
      await expect(actionButton).toBeVisible();

      // Click to open dropdown
      await actionButton.click();
      await expect(page.locator('[role="menu"]')).toBeVisible();

      // Check menu items
      await expect(page.locator('a:has-text("Ver detalles")')).toBeVisible();
      await expect(page.locator('a:has-text("Editar")')).toBeVisible();
      await expect(page.locator('text=Desactivar').or(page.locator('text=Activar'))).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between admin pages', async ({ page }) => {
      // Start at admin overview
      await expect(page).toHaveURL('**/admin');

      // Navigate to users
      await page.goto('/admin/users');
      await expect(page.locator('h1:has-text("Gestión de Usuarios")')).toBeVisible();

      // Navigate back to overview
      await page.goto('/admin');
      await expect(page.locator('h1:has-text("Dashboard Admin")')).toBeVisible();
    });
  });
});

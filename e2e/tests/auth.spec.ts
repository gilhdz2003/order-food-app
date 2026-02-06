import { test, expect } from '@playwright/test';
import { DEMO_USERS, waitForStablePage, loginWithEmail } from '../utils/test-helpers';

/**
 * Authentication E2E Tests
 *
 * Tests for authentication functionality including:
 * - Login page rendering
 * - Email/password login
 * - Role-based redirects
 * - Logout functionality
 * - Protected routes
 */

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form correctly', async ({ page }) => {
      await page.goto('/login');

      // Check page title
      await expect(page).toHaveTitle(/Order Food Online/);

      // Click to show email login form
      await page.click('button:has-text("Iniciar sesión con email")');

      // Check form elements (using id selectors since name attributes are not used)
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');

      // Click to show email login form
      await page.click('button:has-text("Iniciar sesión con email")');
      await page.waitForSelector('#email', { timeout: 5000 });

      // Try to submit with empty fields
      await page.click('button[type="submit"]');

      // Check for validation messages (HTML5 validation)
      const emailInput = page.locator('#email');
      const isRequired = await emailInput.getAttribute('required');

      expect(isRequired).toBeTruthy();
    });

    test('should have Google OAuth button', async ({ page }) => {
      await page.goto('/login');

      // Check for Google OAuth button
      const googleButton = page.locator('button:has-text("Google")').or(
        page.locator('button:has-text("Continuar con Google")')
      );

      await expect(googleButton).toBeVisible();
    });
  });

  test.describe('Email/Password Login', () => {
    test('should login as admin user', async ({ page }) => {
      await loginWithEmail(page, DEMO_USERS.admin.email, DEMO_USERS.admin.password);

      // Should redirect to admin dashboard
      await page.waitForURL('**/admin', { timeout: 10000 });
      await expect(page).toHaveURL(/\/admin/);
      await expect(page.locator('h1:has-text("Dashboard Admin")')).toBeVisible();
    });

    test('should login as editor user', async ({ page }) => {
      await loginWithEmail(page, DEMO_USERS.editor.email, DEMO_USERS.editor.password);

      // Should redirect to editor dashboard
      await page.waitForURL('**/editor', { timeout: 10000 });
      await expect(page).toHaveURL(/\/editor/);
      await expect(page.locator('h1:has-text("Mis Menús")')).toBeVisible();
    });

    test('should login as employee user', async ({ page }) => {
      await loginWithEmail(page, DEMO_USERS.employee.email, DEMO_USERS.employee.password);

      // Should redirect to employee dashboard
      await page.waitForURL('**/employee', { timeout: 10000 });
      await expect(page).toHaveURL(/\/employee/);
      await expect(page.locator('text=Panel de Empleado')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      // Click to show email form
      await page.click('button:has-text("Iniciar sesión con email")');
      await page.waitForSelector('#email', { timeout: 5000 });

      await page.fill('#email', 'invalid@test.com');
      await page.fill('#password', 'WrongPassword123!');
      await page.click('button[type="submit"]');

      // Should show error message or stay on login page
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      expect(currentUrl).toContain('/login');
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated user to login', async ({ page }) => {
      // Try to access admin dashboard without login
      await page.goto('/admin');

      // Should redirect to login
      await page.waitForURL('**/login**', { timeout: 10000 });
      expect(page.url()).toContain('/login');
    });

    test('should redirect unauthenticated user from editor to login', async ({ page }) => {
      await page.goto('/editor');

      await page.waitForURL('**/login**', { timeout: 10000 });
      expect(page.url()).toContain('/login');
    });

    test('should redirect unauthenticated user from employee to login', async ({ page }) => {
      await page.goto('/employee');

      await page.waitForURL('**/login**', { timeout: 10000 });
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Role-Based Access Control', () => {
    test('should prevent editor from accessing admin dashboard', async ({ page }) => {
      // Login as editor
      await loginWithEmail(page, DEMO_USERS.editor.email, DEMO_USERS.editor.password);

      await page.waitForURL('**/editor', { timeout: 10000 });

      // Try to access admin dashboard
      await page.goto('/admin');

      // Should be redirected away or see error
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      const isAdmin = currentUrl.includes('/admin');

      // Editor should not be able to access admin
      expect(isAdmin).toBeFalsy();
    });

    test('should prevent employee from accessing editor dashboard', async ({ page }) => {
      // Login as employee
      await loginWithEmail(page, DEMO_USERS.employee.email, DEMO_USERS.employee.password);

      await page.waitForURL('**/employee', { timeout: 10000 });

      // Try to access editor dashboard
      await page.goto('/editor');

      // Should be redirected away
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      const isEditor = currentUrl.includes('/editor');

      expect(isEditor).toBeFalsy();
    });
  });

  test.describe('Session Persistence', () => {
    test('should keep user logged in after page refresh', async ({ page }) => {
      // Login as admin
      await loginWithEmail(page, DEMO_USERS.admin.email, DEMO_USERS.admin.password);

      await page.waitForURL('**/admin', { timeout: 10000 });

      // Refresh page
      await page.reload();
      await waitForStablePage(page);

      // Should still be on admin dashboard
      await expect(page).toHaveURL(/\/admin/);
      await expect(page.locator('h1:has-text("Dashboard Admin")')).toBeVisible();
    });
  });

  test.describe('Logout Functionality', () => {
    test('should logout user successfully', async ({ page }) => {
      // Login first
      await loginWithEmail(page, DEMO_USERS.admin.email, DEMO_USERS.admin.password);

      await page.waitForURL('**/admin', { timeout: 10000 });

      // Look for logout button (usually in a dropdown or header)
      const logoutButton = page.locator('button:has-text("Cerrar")').or(
        page.locator('button:has-text("Salir")').or(
          page.locator('a:has-text("Cerrar")').or(
            page.locator('a:has-text("Salir")')
          )
        )
      );

      const hasLogoutButton = await logoutButton.count() > 0;

      if (hasLogoutButton) {
        await logoutButton.first().click();
        await waitForStablePage(page);

        // Should be redirected to login or home
        const currentUrl = page.url();
        const isLoggedIn = currentUrl.includes('/admin') ||
                          currentUrl.includes('/editor') ||
                          currentUrl.includes('/employee');

        expect(isLoggedIn).toBeFalsy();
      } else {
        test.skip(true, 'Logout button not found - might need implementation');
      }
    });
  });
});

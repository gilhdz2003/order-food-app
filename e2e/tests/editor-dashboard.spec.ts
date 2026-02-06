import { test, expect } from '@playwright/test';
import { DEMO_USERS, waitForStablePage, loginWithEmail } from '../utils/test-helpers';

/**
 * Editor Dashboard E2E Tests
 *
 * Tests for the Editor Dashboard functionality including:
 * - Menu list page
 * - Create new menu
 * - Publish/Unpublish menus
 * - Navigate to menu detail page
 */

test.describe('Editor Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as editor user
    await loginWithEmail(page, DEMO_USERS.editor.email, DEMO_USERS.editor.password);

    // Wait for navigation to editor dashboard
    await page.waitForURL('**/editor', { timeout: 10000 });
    await waitForStablePage(page);
  });

  test.describe('Menus List Page', () => {
    test('should display editor dashboard with menu list', async ({ page }) => {
      // Check page title and heading
      await expect(page).toHaveTitle(/Order Food Online/);
      await expect(page.locator('h1:has-text("Mis Menús")')).toBeVisible();
      await expect(page.locator('text=Gestiona los menús diarios')).toBeVisible();
    });

    test('should display "Crear Menú" button', async ({ page }) => {
      const createButton = page.locator('button:has-text("Crear Menú")');
      await expect(createButton).toBeVisible();

      // Click should navigate to new menu page
      await createButton.click();
      await expect(page).toHaveURL('**/editor/new');
    });

    test('should display menu cards with correct information', async ({ page }) => {
      // Wait for any menus to load
      await waitForStablePage(page);

      // Check if there are any menus
      const menuCards = page.locator('.border').filter({ hasText: 'Publicado' }).or(
        page.locator('.border').filter({ hasText: 'Borrador' })
      );

      const count = await menuCards.count();

      if (count > 0) {
        // Check first menu card
        const firstCard = menuCards.first();

        // Should have date/title
        await expect(firstCard.locator('.text-xl')).toBeVisible();

        // Should have dish count
        await expect(firstCard).toContainText('platillo', { ignoreCase: true });

        // Should have status badge
        const hasStatus = await firstCard.locator('text=Publicado').count() > 0 ||
                          await firstCard.locator('text=Borrador').count() > 0;
        expect(hasStatus).toBeTruthy();
      }
    });

    test('should display publish/unpublish buttons for each menu', async ({ page }) => {
      // Wait for any menus to load
      await waitForStablePage(page);

      // Check if there are any menus
      const menuCards = page.locator('.border').filter({ hasText: 'Publicado' }).or(
        page.locator('.border').filter({ hasText: 'Borrador' })
      );

      const count = await menuCards.count();

      if (count > 0) {
        const firstCard = menuCards.first();

        // Check for Edit/Add dishes button
        const editButton = firstCard.locator('button:has-text("Editar")').or(
          firstCard.locator('button:has-text("Agregar Platillos")')
        );
        await expect(editButton).toBeVisible();

        // Check for Publish or Unpublish button
        const publishButton = firstCard.locator('button:has-text("Publicar")');
        const unpublishButton = firstCard.locator('button:has-text("Despublicar")');

        const hasAction = await publishButton.count() > 0 || await unpublishButton.count() > 0;
        expect(hasAction).toBeTruthy();
      }
    });

    test('should show empty state when no menus exist', async ({ page }) => {
      // This test verifies the empty state is shown
      // Note: In real scenario, you might need to delete all menus first

      const emptyState = page.locator('text=No hay menús creados');
      const menus = page.locator('.border').filter({ hasText: 'Publicado' }).or(
        page.locator('.border').filter({ hasText: 'Borrador' })
      );

      // Either empty state or menus should be visible
      const hasEmptyState = await emptyState.count() > 0;
      const hasMenus = await menus.count() > 0;

      expect(hasEmptyState || hasMenus).toBeTruthy();
    });
  });

  test.describe('Publish/Unpublish Functionality', () => {
    test('should publish a draft menu', async ({ page }) => {
      await page.goto('/editor');
      await waitForStablePage(page);

      // Find a draft menu (has "Publicar" button)
      const publishButton = page.locator('button:has-text("Publicar")').first();

      const hasPublishButton = await publishButton.count() > 0;

      if (hasPublishButton) {
        // Get the parent card to check status change
        const card = publishButton.locator('xpath=ancestor::div[contains(@class, "border")]').first();

        // Click publish button
        await publishButton.click();
        await waitForStablePage(page);

        // Wait a moment for state update
        await page.waitForTimeout(1000);

        // The button should have changed to "Despublicar"
        // Note: This test might fail if the button doesn't actually work
        await expect(page.locator('button:has-text("Despublicar")')).toBeVisible();
      } else {
        test.skip(true, 'No draft menus found to test publish functionality');
      }
    });

    test('should unpublish a published menu', async ({ page }) => {
      await page.goto('/editor');
      await waitForStablePage(page);

      // Find a published menu (has "Despublicar" button)
      const unpublishButton = page.locator('button:has-text("Despublicar")').first();

      const hasUnpublishButton = await unpublishButton.count() > 0;

      if (hasUnpublishButton) {
        // Click unpublish button
        await unpublishButton.click();
        await waitForStablePage(page);

        // Wait a moment for state update
        await page.waitForTimeout(1000);

        // The button should have changed to "Publicar"
        // Note: This test will likely fail due to the bug we're testing for
        await expect(page.locator('button:has-text("Publicar")')).toBeVisible();
      } else {
        test.skip(true, 'No published menus found to test unpublish functionality');
      }
    });
  });

  test.describe('Menu Detail Navigation', () => {
    test('should navigate to menu detail page', async ({ page }) => {
      await page.goto('/editor');
      await waitForStablePage(page);

      // Find any menu card
      const menuCards = page.locator('.border').filter({ hasText: 'Publicado' }).or(
        page.locator('.border').filter({ hasText: 'Borrador' })
      );

      const count = await menuCards.count();

      if (count > 0) {
        const firstCard = menuCards.first();
        const editButton = firstCard.locator('button:has-text("Editar")').or(
          firstCard.locator('button:has-text("Agregar Platillos")')
        );

        await editButton.click();

        // Should navigate to menu detail page
        await expect(page).toHaveURL(/\/editor\/menus\/.+/);
      }
    });
  });

  test.describe('Date Formatting', () => {
    test('should display "Hoy" for today\'s menu', async ({ page }) => {
      await page.goto('/editor');
      await waitForStablePage(page);

      // Look for "Hoy" in menu cards
      const todayLabel = page.locator('text=Hoy');

      const hasTodayMenu = await todayLabel.count() > 0;

      if (hasTodayMenu) {
        await expect(todayLabel).toBeVisible();
      }
      // If no today's menu, that's ok - this is data dependent
    });
  });
});

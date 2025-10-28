import { test, expect } from '@playwright/test';

test.describe('AR Experience End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
  });

  test('should load the home page with AR section', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/AR Experience/);

    // Check for AR section content
    await expect(page.locator('text=Try AR Now')).toBeVisible();
    await expect(page.locator('text=Experience augmented reality with our interactive 3D astronaut model')).toBeVisible();
  });

  test('should display AR instructions', async ({ page }) => {
    // Check AR instructions are visible
    await expect(page.locator('text=AR Instructions:')).toBeVisible();
    await expect(page.locator('text=Point your camera at a flat surface and tap "View in AR" to place the model in your environment')).toBeVisible();
  });

  test('should render the ARViewer component', async ({ page }) => {
    // Check that the model-viewer element is present
    const modelViewer = page.locator('model-viewer');
    await expect(modelViewer).toBeVisible();

    // Check model-viewer attributes
    await expect(modelViewer).toHaveAttribute('src', '/astronaut.glb');
    await expect(modelViewer).toHaveAttribute('alt', 'Astronaut 3D Model');
    await expect(modelViewer).toHaveAttribute('ar');
    await expect(modelViewer).toHaveAttribute('ar-modes', 'webxr scene-viewer quick-look');
  });

  test('should display AR button', async ({ page }) => {
    // Check that the AR button is present
    const arButton = page.locator('button:has-text("View in AR")');
    await expect(arButton).toBeVisible();
    await expect(arButton).toHaveClass(/bg-purple-600/);
  });

  test('should load model-viewer script', async ({ page }) => {
    // Check that the model-viewer script is loaded
    const script = page.locator('script[src*="model-viewer"]');
    await expect(script).toBeAttached();
  });

  test.describe('Mobile AR Experience', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('should adapt to mobile viewport', async ({ page }) => {
      await page.goto('/');

      // Check that content is still visible on mobile
      await expect(page.locator('text=Try AR Now')).toBeVisible();

      // Check that ARViewer maintains proper sizing on mobile
      const modelViewer = page.locator('model-viewer');
      await expect(modelViewer).toBeVisible();
    });

    test('should handle touch interactions on mobile', async ({ page }) => {
      await page.goto('/');

      // The AR button should be touchable on mobile
      const arButton = page.locator('button:has-text("View in AR")');
      await expect(arButton).toBeVisible();

      // Check button is properly sized for touch
      const buttonBox = await arButton.boundingBox();
      expect(buttonBox?.width).toBeGreaterThan(44); // Minimum touch target size
      expect(buttonBox?.height).toBeGreaterThan(44);
    });
  });

  test.describe('Desktop AR Experience', () => {
    test('should work on desktop browsers', async ({ page }) => {
      // Desktop browsers should still show the AR interface
      const modelViewer = page.locator('model-viewer');
      await expect(modelViewer).toHaveAttribute('ar-modes', 'webxr scene-viewer quick-look');

      // AR button should be visible
      const arButton = page.locator('button:has-text("View in AR")');
      await expect(arButton).toBeVisible();
    });
  });

  test.describe('Error Scenarios', () => {
    test('should handle missing model file gracefully', async ({ page }) => {
      // Intercept the model request and return 404
      await page.route('/astronaut.glb', route => route.fulfill({
        status: 404,
        contentType: 'text/plain',
        body: 'Model not found'
      }));

      await page.goto('/');

      // The component should still render, but model loading might fail
      const modelViewer = page.locator('model-viewer');
      await expect(modelViewer).toBeVisible();

      // Check that the component doesn't crash
      await expect(page.locator('text=Try AR Now')).toBeVisible();
    });

    test('should handle script loading failure', async ({ page }) => {
      // Block the model-viewer script
      await page.route('**/model-viewer.min.js', route => route.fulfill({
        status: 404,
        contentType: 'text/plain',
        body: 'Script not found'
      }));

      await page.goto('/');

      // The page should still load, but AR functionality might be limited
      await expect(page.locator('text=Try AR Now')).toBeVisible();

      // The model-viewer element should still be present
      const modelViewer = page.locator('model-viewer');
      await expect(modelViewer).toBeVisible();
    });

    test('should handle unsupported browsers', async ({ page, browserName }) => {
      // For browsers that don't support WebXR, the component should still work
      const modelViewer = page.locator('model-viewer');
      await expect(modelViewer).toHaveAttribute('ar-modes', 'webxr scene-viewer quick-look');

      // AR button should still be present
      const arButton = page.locator('button:has-text("View in AR")');
      await expect(arButton).toBeVisible();
    });
  });

  test.describe('Performance Tests', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should not have console errors during load', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Filter out expected errors (like model-viewer warnings)
      const unexpectedErrors = errors.filter(error =>
        !error.includes('model-viewer') ||
        !error.includes('WebXR')
      );

      expect(unexpectedErrors).toHaveLength(0);
    });
  });
});
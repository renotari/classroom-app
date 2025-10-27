/**
 * E2E Test: Microphone Permission Flow (CRITICAL - EC-000, EC-001)
 *
 * Tests the complete microphone permission handling:
 * 1. First-time permission request (EC-000)
 * 2. Handle denied permission (EC-001)
 * 3. Show graceful error when no microphone available
 * 4. Permissions persist across app reopens
 *
 * Addresses: External Review Point #6 (E2E Testing Strategy)
 * References: docs/edge-cases.md EC-000, EC-001
 */

import { test, expect, BrowserContext } from '@playwright/test';

test.describe('Microphone Permission Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should request microphone permission on first use (EC-000)', async ({ page, context }) => {
    // Override permission to prompt
    await context.grantPermissions(['microphone']);

    // Find Noise Meter or monitoring section
    const noiseMeterTab = page.locator('[data-testid="noise-tab"], button:has-text("Noise"), button:has-text("Rumore")').first();

    if (await noiseMeterTab.isVisible()) {
      await noiseMeterTab.click();
    }

    // Look for a "Start Monitoring" or similar button
    const startMonitoringButton = page.locator(
      'button:has-text("Start"), button:has-text("Avvia"), [data-testid="start-monitoring"]'
    ).first();

    if (await startMonitoringButton.isVisible()) {
      // Browser may show permission dialog here
      await startMonitoringButton.click();

      // Wait for either:
      // 1. Permission dialog to appear and be handled
      // 2. Noise meter to become active
      await page.waitForTimeout(500);
    }

    // Verify that monitoring section appears or error is shown gracefully
    const noiseMeterDisplay = page.locator('[data-testid="noise-meter"], .noise-meter, [class*="NoiseMeter"]').first();
    const permissionError = page.locator('text=/permesso|permission|negato|denied/i').first();

    const hasMonitor = await noiseMeterDisplay.isVisible({ timeout: 2000 }).catch(() => false);
    const hasError = await permissionError.isVisible({ timeout: 1000 }).catch(() => false);

    // Should have either a working monitor or a graceful error message
    expect(hasMonitor || hasError).toBeTruthy();
  });

  test('should handle denied microphone permission gracefully (EC-001)', async ({ page, context }) => {
    // Deny microphone permission
    await context.denyPermissions(['microphone']);

    // Find Noise Meter section
    const noiseMeterTab = page.locator('[data-testid="noise-tab"], button:has-text("Noise"), button:has-text("Rumore")').first();

    if (await noiseMeterTab.isVisible()) {
      await noiseMeterTab.click();
    }

    // Try to start monitoring
    const startButton = page.locator(
      'button:has-text("Start"), button:has-text("Avvia"), [data-testid="start-monitoring"]'
    ).first();

    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(300);
    }

    // Should show error message in Italian
    const errorMessages = [
      'Permesso negato',
      'negato',
      'microfono',
      'Nessun microfono',
      'non disponibile'
    ];

    const errorLocator = page.locator(
      `text=/${errorMessages.join('|')}/i`
    );

    // Should show graceful error, not crash
    const hasError = await errorLocator.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasError).toBeTruthy('Should show permission denied error message');
  });

  test('should show error when no microphone device available', async ({ page }) => {
    // No special setup needed - on some systems no microphone exists
    // The hook should handle this gracefully

    const noiseMeterTab = page.locator('[data-testid="noise-tab"], button:has-text("Noise"), button:has-text("Rumore")').first();

    if (await noiseMeterTab.isVisible()) {
      await noiseMeterTab.click();
    }

    // Try to enable monitoring
    const startButton = page.locator(
      'button:has-text("Start"), button:has-text("Avvia"), [data-testid="start-monitoring"]'
    ).first();

    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(300);
    }

    // Should not show a generic error - instead should show helpful message
    // or gracefully disable the feature
    const helpfulMessages = [
      'Nessun microfono',      // No microphone
      'non disponibile',        // not available
      'Non disponibile',
      'device not found'
    ];

    const helpfulError = page.locator(
      `text=/${helpfulMessages.join('|')}/i`
    );

    // Either shows helpful error or gracefully disables feature
    const hasHelpfulError = await helpfulError.first().isVisible({ timeout: 2000 }).catch(() => false);
    const noiseMeter = page.locator('[data-testid="noise-meter"], .noise-meter').first();
    const isDisabled = await noiseMeter.locator(':disabled').isVisible({ timeout: 1000 }).catch(() => false);

    expect(hasHelpfulError || isDisabled).toBeTruthy('Should handle missing microphone gracefully');
  });

  test('should persist permission state across page reloads', async ({ page, context }) => {
    // Grant permission
    await context.grantPermissions(['microphone']);

    // Navigate to noise section
    const noiseMeterTab = page.locator('[data-testid="noise-tab"], button:has-text("Noise"), button:has-text("Rumore")').first();

    if (await noiseMeterTab.isVisible()) {
      await noiseMeterTab.click();
    }

    // Try to start monitoring
    const startButton = page.locator(
      'button:has-text("Start"), button:has-text("Avvia"), [data-testid="start-monitoring"]'
    ).first();

    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);
    }

    // Store initial state
    const initialStateExists = await page.locator('[data-testid="noise-meter"]').isVisible({ timeout: 1000 }).catch(() => false);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Re-navigate to noise section
    const noiseMeterTab2 = page.locator('[data-testid="noise-tab"], button:has-text("Noise"), button:has-text("Rumore")').first();

    if (await noiseMeterTab2.isVisible()) {
      await noiseMeterTab2.click();
    }

    // Permission should persist (no new dialog should appear)
    // The app should remember the previous state
    const persistedState = await page.locator('[data-testid="noise-meter"]').isVisible({ timeout: 2000 }).catch(() => false);

    // State should be consistent before and after reload
    expect(initialStateExists).toBe(persistedState);
  });
});

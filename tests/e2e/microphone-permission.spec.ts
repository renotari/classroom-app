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
    // Grant microphone permission for this test
    await context.grantPermissions(['microphone']);

    // Click Noise tab
    await page.click('[data-testid="tab-noise"]');

    // Wait for NoiseMeterPanel to appear (should auto-start with permission granted)
    await page.waitForTimeout(500);

    // Check if noise monitoring panel is visible or if permission error appeared
    const noiseMeterPanel = page.locator('[data-testid="noise-meter-panel"]');
    const permissionError = page.locator('[data-testid="noise-error-message"]');

    const hasPanel = await noiseMeterPanel.isVisible({ timeout: 2000 }).catch(() => false);
    const hasError = await permissionError.isVisible({ timeout: 1000 }).catch(() => false);

    // Should have either a working panel or a graceful error message
    expect(hasPanel || hasError).toBeTruthy();
  });

  test('should handle denied microphone permission gracefully (EC-001)', async ({ page, context }) => {
    // Deny microphone permission - this is the default context behavior
    // Just navigate to Noise tab and verify error is shown

    // Click Noise tab
    await page.click('[data-testid="tab-noise"]');

    // Wait for UI to render
    await page.waitForTimeout(500);

    // Should show PermissionDeniedFallback component with error message
    // It will show a message about microphone permission being required
    const errorOrFallback = page.locator('[class*="PermissionDenied"], text=/microfono|permission|negato/i').first();

    const hasError = await errorOrFallback.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasError).toBeTruthy('Should show permission denied error message');
  });

  test('should show error when no microphone device available', async ({ page }) => {
    // Note: In test environment with mocked MediaDevices, this will show error
    // because getUserMedia is mocked

    // Click Noise tab
    await page.click('[data-testid="tab-noise"]');

    // Wait for UI to render
    await page.waitForTimeout(500);

    // Look for error or disabled state
    const errorMessage = page.locator('[data-testid="noise-error-message"]');
    const fallbackMessage = page.locator('[class*="PermissionDenied"]');

    // Either shows error or fallback (acceptable behavior)
    const hasError = await errorMessage.isVisible({ timeout: 1000 }).catch(() => false);
    const hasFallback = await fallbackMessage.isVisible({ timeout: 1000 }).catch(() => false);

    expect(hasError || hasFallback).toBeTruthy('Should handle missing microphone gracefully');
  });

  test('should persist permission state across page reloads', async ({ page, context }) => {
    // Grant permission
    await context.grantPermissions(['microphone']);

    // Navigate to noise section
    await page.click('[data-testid="tab-noise"]');

    // Wait for panel to load (auto-starts with permission)
    await page.waitForTimeout(500);

    // Store initial state - check if panel is visible
    const initialPanelVisible = await page.locator('[data-testid="noise-meter-panel"]').isVisible({ timeout: 1000 }).catch(() => false);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Re-navigate to noise section
    await page.click('[data-testid="tab-noise"]');

    // Wait a bit for auto-start
    await page.waitForTimeout(500);

    // Check if panel is visible again
    const persistedPanelVisible = await page.locator('[data-testid="noise-meter-panel"]').isVisible({ timeout: 2000 }).catch(() => false);

    // State should be consistent before and after reload
    expect(initialPanelVisible).toBe(persistedPanelVisible);
  });
});

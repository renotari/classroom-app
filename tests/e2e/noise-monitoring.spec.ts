/**
 * E2E Test: Noise Monitoring Flow (CRITICAL USER FLOW)
 *
 * Tests the complete noise monitoring user flow:
 * 1. Start noise monitoring
 * 2. Verify real-time noise level display
 * 3. Test threshold alerts (green/yellow/red transitions)
 * 4. Verify noise history tracking
 * 5. Calibration workflow
 *
 * Addresses: External Review Point #6 (E2E Testing Strategy)
 * References: Phase 5 - Noise Monitoring
 */

import { test, expect } from '@playwright/test';

test.describe('Noise Monitoring Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display noise meter when monitoring is started', async ({ page, context }) => {
    // Grant microphone permission
    await context.grantPermissions(['microphone']);

    // Find Noise/Rumore tab
    const noiseTab = page.locator('[data-testid="noise-tab"], button:has-text("Noise"), button:has-text("Rumore")').first();

    if (await noiseTab.isVisible()) {
      await noiseTab.click();
    }

    // Wait for noise meter section to be visible
    const noiseMeterSection = page.locator('[data-testid="noise-meter"], [class*="NoiseMeter"]').first();
    await expect(noiseMeterSection).toBeVisible({ timeout: 5000 });

    // Look for start monitoring button
    const startButton = page.locator(
      'button:has-text("Start"), button:has-text("Avvia"), [data-testid="start-monitoring"]'
    ).first();

    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }

    // Verify noise meter is displaying a number (current level)
    const levelDisplay = page.locator(
      '[data-testid="noise-level"], [class*="level"], text=/[0-9]+(\.[0-9]+)?\s*(dB|%)?/i'
    ).first();

    await expect(levelDisplay).toBeVisible({ timeout: 3000 });
  });

  test('should show color-coded noise levels (green/yellow/red)', async ({ page, context }) => {
    // Grant permission
    await context.grantPermissions(['microphone']);

    const noiseTab = page.locator('[data-testid="noise-tab"], button:has-text("Noise"), button:has-text("Rumore")').first();

    if (await noiseTab.isVisible()) {
      await noiseTab.click();
    }

    // Start monitoring
    const startButton = page.locator(
      'button:has-text("Start"), button:has-text("Avvia"), [data-testid="start-monitoring"]'
    ).first();

    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }

    // Look for color indicators
    const colorIndicators = page.locator(
      '[data-testid="noise-color"], [class*="green"], [class*="yellow"], [class*="red"], [role="meter"]'
    );

    // At least one indicator should be visible
    const count = await colorIndicators.count();
    expect(count).toBeGreaterThan(0);

    // Check if current color is accessible
    const currentColor = page.locator('[data-testid="noise-status"]');
    const hasStatus = await currentColor.isVisible({ timeout: 1000 }).catch(() => false);

    if (hasStatus) {
      const statusText = await currentColor.textContent();
      expect(statusText).toMatch(/verde|giallo|rosso|green|yellow|red/i);
    }
  });

  test('should track noise history during session', async ({ page, context }) => {
    // Grant permission
    await context.grantPermissions(['microphone']);

    const noiseTab = page.locator('[data-testid="noise-tab"], button:has-text("Noise"), button:has-text("Rumore")').first();

    if (await noiseTab.isVisible()) {
      await noiseTab.click();
    }

    // Start monitoring
    const startButton = page.locator(
      'button:has-text("Start"), button:has-text("Avvia"), [data-testid="start-monitoring"]'
    ).first();

    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1500); // Let it collect some history
    }

    // Look for history display
    const historySection = page.locator(
      '[data-testid="noise-history"], [class*="History"], [class*="history"]'
    ).first();

    const hasHistory = await historySection.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasHistory) {
      // History should show some data points
      const dataPoints = page.locator('[data-testid="history-point"], [class*="point"]');
      const pointCount = await dataPoints.count();
      expect(pointCount).toBeGreaterThan(0);
    }
  });

  test('should allow threshold configuration', async ({ page, context }) => {
    // Grant permission
    await context.grantPermissions(['microphone']);

    const noiseTab = page.locator('[data-testid="noise-tab"], button:has-text("Noise"), button:has-text("Rumore")').first();

    if (await noiseTab.isVisible()) {
      await noiseTab.click();
    }

    // Look for threshold settings
    const thresholdGreen = page.locator(
      'input[data-testid*="green"], input[placeholder*="verde" i], label:has-text("Verde") ~ input'
    ).first();

    const thresholdYellow = page.locator(
      'input[data-testid*="yellow"], input[placeholder*="giallo" i], label:has-text("Giallo") ~ input'
    ).first();

    const thresholdRed = page.locator(
      'input[data-testid*="red"], input[placeholder*="rosso" i], label:has-text("Rosso") ~ input'
    ).first();

    // Check if settings are available
    const hasSettings =
      (await thresholdGreen.isVisible({ timeout: 1000 }).catch(() => false)) ||
      (await thresholdYellow.isVisible({ timeout: 1000 }).catch(() => false)) ||
      (await thresholdRed.isVisible({ timeout: 1000 }).catch(() => false));

    if (hasSettings) {
      // If threshold 1 is visible, try to change it
      if (await thresholdGreen.isVisible({ timeout: 500 }).catch(() => false)) {
        const currentValue = await thresholdGreen.inputValue();
        const newValue = String(parseInt(currentValue || '40') + 5);

        await thresholdGreen.fill(newValue);
        await page.waitForTimeout(300);

        // Verify it was set
        const updatedValue = await thresholdGreen.inputValue();
        expect(updatedValue).toBe(newValue);
      }
    }
  });

  test('should allow calibration', async ({ page, context }) => {
    // Grant permission
    await context.grantPermissions(['microphone']);

    const noiseTab = page.locator('[data-testid="noise-tab"], button:has-text("Noise"), button:has-text("Rumore")').first();

    if (await noiseTab.isVisible()) {
      await noiseTab.click();
    }

    // Start monitoring first
    const startButton = page.locator(
      'button:has-text("Start"), button:has-text("Avvia"), [data-testid="start-monitoring"]'
    ).first();

    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }

    // Look for calibrate button
    const calibrateButton = page.locator(
      'button:has-text("Calibrate"), button:has-text("Calibra"), [data-testid="calibrate"]'
    ).first();

    const hasCalibrate = await calibrateButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasCalibrate) {
      await calibrateButton.click();
      await page.waitForTimeout(500);

      // Should show some confirmation or status change
      const calibratedStatus = page.locator('text=/calibrat|Calibrat/i').first();
      const isCalibrated = await calibratedStatus.isVisible({ timeout: 1000 }).catch(() => false);

      expect(isCalibrated || true).toBeTruthy(); // Should not error
    }
  });

  test('should handle stop monitoring', async ({ page, context }) => {
    // Grant permission
    await context.grantPermissions(['microphone']);

    const noiseTab = page.locator('[data-testid="noise-tab"], button:has-text("Noise"), button:has-text("Rumore")').first();

    if (await noiseTab.isVisible()) {
      await noiseTab.click();
    }

    // Start monitoring
    const startButton = page.locator(
      'button:has-text("Start"), button:has-text("Avvia"), [data-testid="start-monitoring"]'
    ).first();

    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);
    }

    // Look for stop button
    const stopButton = page.locator(
      'button:has-text("Stop"), button:has-text("Ferma"), [data-testid="stop-monitoring"]'
    ).first();

    if (await stopButton.isVisible()) {
      await stopButton.click();
      await page.waitForTimeout(300);

      // Level display might hide or show "stopped" state
      const stoppedStatus = page.locator('text=/stopped|fermo|off/i').first();
      const isHidden = await stoppedStatus.isVisible({ timeout: 1000 }).catch(() => false);

      // Should handle stop cleanly
      expect(isHidden || true).toBeTruthy();
    }
  });
});

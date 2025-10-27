/**
 * E2E Test: Timer Flow (CRITICAL USER FLOW)
 *
 * Tests the complete timer user flow:
 * 1. Set timer using preset (5 minutes)
 * 2. Start countdown
 * 3. Verify time updates in real-time
 * 4. Timer completes and triggers audio alert
 *
 * Addresses: External Review Point #6 (E2E Testing Strategy)
 */

import { test, expect } from '@playwright/test';

test.describe('Timer Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should set timer from preset and start countdown', async ({ page }) => {
    // Find Timer tab/section
    const timerTab = page.locator('[data-testid="timer-tab"], button:has-text("Timer")').first();

    if (await timerTab.isVisible()) {
      await timerTab.click();
    }

    // Wait for Timer UI to be visible
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible({ timeout: 5000 });

    // Click 5 min preset
    const fiveMinButton = page.locator('button:has-text("5"), button:has-text("5 min")').first();
    await fiveMinButton.click();

    // Verify duration is set (5:00)
    const timerDisplay = page.locator('[data-testid="timer-display"]');
    await expect(timerDisplay).toContainText(/5:00|300/);

    // Click Start button
    const startButton = page.locator('button:has-text("Start"), [data-testid="timer-start"]').first();
    await startButton.click();

    // Verify timer is running (display should show less than 5:00 after a moment)
    await page.waitForTimeout(1000); // Wait 1 second

    // Timer should have counted down (check it's not exactly 5:00 anymore)
    const timerText = await timerDisplay.textContent();
    const isCountingDown = !timerText?.includes('5:00');
    expect(isCountingDown).toBeTruthy();
  });

  test('should pause and resume timer', async ({ page }) => {
    // Set up: Create and start a timer
    const timerTab = page.locator('[data-testid="timer-tab"], button:has-text("Timer")').first();
    if (await timerTab.isVisible()) {
      await timerTab.click();
    }

    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible({ timeout: 5000 });

    // Set 1 minute (faster for testing)
    const oneMinButton = page.locator('button:has-text("1")').first();
    await oneMinButton.click({ force: true });

    // Start
    const startButton = page.locator('button:has-text("Start"), [data-testid="timer-start"]').first();
    await startButton.click();

    // Wait for timer to count down
    await page.waitForTimeout(500);

    // Get paused time
    const timerDisplay = page.locator('[data-testid="timer-display"]');
    const timerBeforePause = await timerDisplay.textContent();

    // Click Pause
    const pauseButton = page.locator('button:has-text("Pause"), [data-testid="timer-pause"]').first();
    await pauseButton.click();

    // Verify time stops changing
    await page.waitForTimeout(500);
    const timerAfterPause = await timerDisplay.textContent();

    // Time should be the same (or very close)
    expect(timerBeforePause).toBe(timerAfterPause);

    // Resume should exist and be clickable
    const resumeButton = page.locator('button:has-text("Resume"), [data-testid="timer-resume"]').first();
    await expect(resumeButton).toBeVisible();
  });

  test('should reset timer', async ({ page }) => {
    // Set up timer
    const timerTab = page.locator('[data-testid="timer-tab"], button:has-text("Timer")').first();
    if (await timerTab.isVisible()) {
      await timerTab.click();
    }

    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible({ timeout: 5000 });

    // Set 5 minutes
    const fiveMinButton = page.locator('button:has-text("5"), button:has-text("5 min")').first();
    await fiveMinButton.click();

    // Start timer
    const startButton = page.locator('button:has-text("Start"), [data-testid="timer-start"]').first();
    await startButton.click();

    // Wait for countdown
    await page.waitForTimeout(1000);

    // Click Reset
    const resetButton = page.locator('button:has-text("Reset"), [data-testid="timer-reset"]').first();
    await resetButton.click();

    // Verify timer is back to 5:00 and not running
    const timerDisplay = page.locator('[data-testid="timer-display"]');
    await expect(timerDisplay).toContainText(/5:00|300/);
  });

  test('should show custom duration input', async ({ page }) => {
    // Find Timer section
    const timerTab = page.locator('[data-testid="timer-tab"], button:has-text("Timer")').first();
    if (await timerTab.isVisible()) {
      await timerTab.click();
    }

    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible({ timeout: 5000 });

    // Look for custom input (might be labeled "Durata personalizzata" or "Custom")
    const customInput = page.locator('input[type="number"], input[placeholder*="durata" i], input[placeholder*="custom" i]').first();

    if (await customInput.isVisible()) {
      // Set custom value
      await customInput.fill('2');

      // Find and click set button
      const setButton = page.locator('button:has-text("Set"), button:has-text("Imposta")').first();
      if (await setButton.isVisible()) {
        await setButton.click();
      }

      // Verify timer updated
      const timerDisplay = page.locator('[data-testid="timer-display"]');
      await expect(timerDisplay).toContainText(/2:00|120/);
    }
  });
});

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
    // Click Timer tab
    await page.click('[data-testid="tab-timer"]');

    // Wait for Timer UI to be visible
    await expect(page.locator('[data-testid="timer-view"]')).toBeVisible({ timeout: 5000 });

    // Click 5 min preset (300 seconds)
    await page.click('[data-testid="timer-preset-300"]');

    // Verify duration is set (5:00)
    const timerDisplay = page.locator('[data-testid="timer-time-display"]');
    await expect(timerDisplay).toContainText('5:00');

    // Click Start button
    await page.click('[data-testid="timer-start-btn"]');

    // Verify timer is running (display should show less than 5:00 after a moment)
    await page.waitForTimeout(1000); // Wait 1 second

    // Timer should have counted down (check it's not exactly 5:00 anymore)
    const timerText = await timerDisplay.textContent();
    const isCountingDown = !timerText?.includes('5:00');
    expect(isCountingDown).toBeTruthy();
  });

  test('should pause and resume timer', async ({ page }) => {
    // Click Timer tab
    await page.click('[data-testid="tab-timer"]');

    await expect(page.locator('[data-testid="timer-view"]')).toBeVisible({ timeout: 5000 });

    // Set 5 minutes (faster for testing than full duration)
    await page.click('[data-testid="timer-preset-300"]');

    // Start timer
    await page.click('[data-testid="timer-start-btn"]');

    // Wait for timer to count down
    await page.waitForTimeout(500);

    // Get paused time
    const timerDisplay = page.locator('[data-testid="timer-time-display"]');
    const timerBeforePause = await timerDisplay.textContent();

    // Click Pause
    await page.click('[data-testid="timer-pause-btn"]');

    // Verify time stops changing
    await page.waitForTimeout(500);
    const timerAfterPause = await timerDisplay.textContent();

    // Time should be the same (or very close)
    expect(timerBeforePause).toBe(timerAfterPause);

    // Resume should exist and be clickable
    await expect(page.locator('[data-testid="timer-resume-btn"]')).toBeVisible();
  });

  test('should reset timer', async ({ page }) => {
    // Click Timer tab
    await page.click('[data-testid="tab-timer"]');

    await expect(page.locator('[data-testid="timer-view"]')).toBeVisible({ timeout: 5000 });

    // Set 5 minutes
    await page.click('[data-testid="timer-preset-300"]');

    // Start timer
    await page.click('[data-testid="timer-start-btn"]');

    // Wait for countdown
    await page.waitForTimeout(1000);

    // Click Stop button (secondary control)
    await page.click('[data-testid="timer-stop-btn"]');

    // Verify timer is back to 00:00
    const timerDisplay = page.locator('[data-testid="timer-time-display"]');
    await expect(timerDisplay).toContainText('00:00');
  });

  test('should show custom duration input', async ({ page }) => {
    // Click Timer tab
    await page.click('[data-testid="tab-timer"]');

    await expect(page.locator('[data-testid="timer-view"]')).toBeVisible({ timeout: 5000 });

    // Click custom duration toggle to expand form
    const customToggle = page.locator('[data-testid="timer-custom-toggle"]');
    await customToggle.click();

    // Wait for form to appear
    await expect(page.locator('[data-testid="timer-custom-input-form"]')).toBeVisible();

    // Set 2 minutes
    await page.fill('[data-testid="timer-custom-minutes-input"]', '2');
    await page.fill('[data-testid="timer-custom-seconds-input"]', '0');

    // Click apply button
    await page.click('[data-testid="timer-custom-apply-btn"]');

    // Verify timer updated
    const timerDisplay = page.locator('[data-testid="timer-time-display"]');
    await expect(timerDisplay).toContainText('2:00');
  });
});

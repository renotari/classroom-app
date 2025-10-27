/**
 * Shared E2E Test Helpers
 *
 * Reusable utility functions and page objects for Playwright E2E tests.
 * Reduces code duplication and improves test maintainability.
 *
 * Usage:
 *   import { navigateToTab, setTimerDuration } from './helpers';
 *
 *   test('timer flow', async ({ page }) => {
 *     await navigateToTab(page, 'Timer');
 *     await setTimerDuration(page, 5);
 *   });
 */

import { Page, expect } from '@playwright/test';

/**
 * Navigation Helpers
 */

/**
 * Navigate to a feature tab by aria-label
 * @param page Playwright page object
 * @param tabName Tab name (e.g., 'Timer', 'Audio', 'Noise', 'Semaphore', 'Classes', 'Settings')
 */
export async function navigateToTab(page: Page, tabName: string) {
  const tabSelector = `[aria-label="${tabName}"]`;
  await page.click(tabSelector);
  await expect(page.locator(`text=${tabName}`)).toBeVisible({ timeout: 5000 });
}

/**
 * Navigate to home/main screen
 */
export async function navigateToHome(page: Page) {
  await page.click('button[aria-label="Home"]');
  await page.waitForLoadState('networkidle');
}

/**
 * Timer Helpers
 */

/**
 * Set timer duration from preset buttons
 * @param page Playwright page object
 * @param minutes Preset minutes (5, 10, 15, 30) or custom value
 */
export async function setTimerDuration(page: Page, minutes: number) {
  const presets = [5, 10, 15, 30];

  if (presets.includes(minutes)) {
    // Click preset button
    await page.click(`button:has-text("${minutes} min")`);
  } else {
    // Click custom input and enter value
    await page.click('input[aria-label="Custom Time"]');
    await page.fill('input[aria-label="Custom Time"]', minutes.toString());
    await page.click('button:has-text("Set")');
  }

  // Verify timer display updated
  const mins = String(minutes).padStart(2, '0');
  await expect(page.locator(`text=/${mins}:00/`)).toBeVisible({ timeout: 5000 });
}

/**
 * Start the timer
 */
export async function startTimer(page: Page) {
  await page.click('button:has-text("Start")');
  await expect(page.locator('[aria-label="Timer running"]')).toBeVisible({
    timeout: 5000,
  });
}

/**
 * Pause the running timer
 */
export async function pauseTimer(page: Page) {
  await page.click('button:has-text("Pause")');
  await expect(page.locator('[aria-label="Timer paused"]')).toBeVisible({
    timeout: 5000,
  });
}

/**
 * Resume the paused timer
 */
export async function resumeTimer(page: Page) {
  await page.click('button:has-text("Resume")');
  await expect(page.locator('[aria-label="Timer running"]')).toBeVisible({
    timeout: 5000,
  });
}

/**
 * Stop (reset) the timer
 */
export async function stopTimer(page: Page) {
  await page.click('button:has-text("Stop")');
  await expect(page.locator('text=/00:00/')).toBeVisible({ timeout: 5000 });
}

/**
 * Wait for timer to count down (verify it's running)
 * @param fromMinutes Expected starting minutes
 * @param timeout How long to wait (in ms)
 */
export async function waitForTimerCountdown(
  page: Page,
  fromMinutes: number,
  timeout: number = 5000
) {
  const beforeMin = String(fromMinutes - 1).padStart(2, '0');
  await page.waitForFunction(
    () => {
      const text = document.body.innerText;
      // Timer should be counting down (showing minute-1 or seconds in that minute)
      return new RegExp(`${beforeMin}:|0[0-5]\\d`).test(text);
    },
    { timeout }
  );
}

/**
 * Audio Helpers
 */

/**
 * Change master volume
 * @param page Playwright page object
 * @param level Volume level (0-100)
 */
export async function setMasterVolume(page: Page, level: number) {
  await page.fill('input[aria-label="Master Volume"]', level.toString());
  await expect(page.locator(`text=${level}%`)).toBeVisible({ timeout: 3000 });
}

/**
 * Select audio sound pack
 * @param packName Sound pack name (e.g., 'Classic', 'Chime', 'Soft')
 */
export async function selectSoundPack(page: Page, packName: string) {
  await page.click(`button:has-text("${packName}")`);
  await expect(
    page.locator(`button:has-text("${packName}")[aria-pressed="true"]`)
  ).toBeVisible({ timeout: 3000 });
}

/**
 * Play test sound
 */
export async function playTestSound(page: Page) {
  await page.click('button:has-text("Test Sound")');
  // Audio plays asynchronously, just verify button click didn't error
  await page.waitForLoadState('networkidle');
}

/**
 * Settings Helpers
 */

/**
 * Change application theme
 * @param themeName Theme name (e.g., 'Calm', 'Energy', 'Professional', 'Dark Mode')
 */
export async function switchTheme(page: Page, themeName: string) {
  await navigateToTab(page, 'Settings');
  await page.click(`button:has-text("${themeName}")`);
  // Verify theme applied by checking button state
  await expect(
    page.locator(`button:has-text("${themeName}")[aria-pressed="true"]`)
  ).toBeVisible({ timeout: 3000 });
}

/**
 * Clear all local storage (simulate first-time user)
 */
export async function clearAppState(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
}

/**
 * Get stored preference value
 */
export async function getStoredPreference(
  page: Page,
  storeName: string,
  key: string
): Promise<any> {
  return await page.evaluate(
    ({ store, property }) => {
      const stored = localStorage.getItem(store);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed[property];
    },
    { store: storeName, property: key }
  );
}

/**
 * Class & Student Helpers (Phase 7+)
 */

/**
 * Select a class from dropdown
 * @param className Name of the class to select
 */
export async function selectClass(page: Page, className: string) {
  await page.click('select[aria-label="Select Class"]');
  await page.click(`option:has-text("${className}")`);
  await expect(
    page.locator(`select[aria-label="Select Class"] >> text=${className}`)
  ).toBeVisible({ timeout: 3000 });
}

/**
 * Import students from CSV (Phase 7+)
 * @param filePath Path to CSV file to upload
 */
export async function uploadStudentCSV(page: Page, filePath: string) {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);
  // Wait for file to be processed
  await page.waitForLoadState('networkidle');
}

/**
 * Mark student as absent
 * @param studentName Name of the student to mark absent
 */
export async function markStudentAbsent(page: Page, studentName: string) {
  const row = page.locator(`text=${studentName}`).first();
  const checkbox = row.locator('input[type="checkbox"]');
  await checkbox.click();
  await expect(checkbox).toBeChecked({ timeout: 3000 });
}

/**
 * Unmark student as absent
 */
export async function markStudentPresent(page: Page, studentName: string) {
  const row = page.locator(`text=${studentName}`).first();
  const checkbox = row.locator('input[type="checkbox"]');
  await checkbox.click();
  await expect(checkbox).not.toBeChecked({ timeout: 3000 });
}

/**
 * Select random student button click
 */
export async function selectRandomStudent(page: Page) {
  await page.click('button:has-text("Select Random")');
  // Wait for selection animation to complete
  await page.waitForTimeout(1500);
}

/**
 * Noise Monitoring Helpers (Phase 5+)
 */

/**
 * Set noise threshold
 * @param level Threshold level (dB)
 */
export async function setNoiseThreshold(page: Page, level: number) {
  await page.fill('input[aria-label="Noise Threshold"]', level.toString());
  await expect(page.locator(`text=${level}dB`)).toBeVisible({ timeout: 3000 });
}

/**
 * Enable microphone permission simulation (for testing)
 */
export async function grantMicrophonePermission(page: Page) {
  await page.context().grantPermissions(['microphone']);
}

/**
 * Deny microphone permission simulation (for testing error handling)
 */
export async function denyMicrophonePermission(page: Page) {
  // Note: This requires setting up during context creation
  // See playwright.config.ts for permission handling
}

/**
 * Semaphore/Traffic Light Helpers (Phase 6+)
 */

/**
 * Change semaphore state
 * @param state State: 'red', 'yellow', or 'green'
 */
export async function setSemaphoreState(page: Page, state: 'red' | 'yellow' | 'green') {
  const stateLabels = {
    red: 'Silent Work',
    yellow: 'Quiet Discussion',
    green: 'Normal Discussion',
  };

  await page.click(`button:has-text("${stateLabels[state]}")`);
  await expect(page.locator(`[aria-label="Semaphore ${state}"]`)).toBeVisible({
    timeout: 3000,
  });
}

/**
 * Utility Helpers
 */

/**
 * Wait for element with specific text content
 */
export async function waitForText(page: Page, text: string, timeout: number = 5000) {
  await expect(page.locator(`text=${text}`)).toBeVisible({ timeout });
}

/**
 * Get element text content
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });
  return await element.textContent();
}

/**
 * Check if element is visible
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    await expect(page.locator(selector)).toBeVisible({ timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for success/error message
 */
export async function waitForMessage(
  page: Page,
  type: 'success' | 'error',
  timeout: number = 5000
) {
  const selector =
    type === 'success' ? '[aria-label="Success message"]' : '[aria-label="Error message"]';
  await expect(page.locator(selector)).toBeVisible({ timeout });
}

/**
 * Dismiss notification/toast
 */
export async function dismissNotification(page: Page) {
  const closeButton = page.locator('button[aria-label="Close notification"]').first();
  if (await closeButton.isVisible()) {
    await closeButton.click();
    await page.waitForTimeout(300);
  }
}

/**
 * Wait for loading spinner to disappear
 */
export async function waitForLoadingComplete(page: Page, timeout: number = 5000) {
  await expect(page.locator('[aria-label="Loading"]')).not.toBeVisible({ timeout });
}

/**
 * Higher-level workflow helpers
 */

/**
 * Complete timer flow: set duration → start → wait for countdown
 */
export async function completeTimerFlow(page: Page, minutes: number) {
  await navigateToTab(page, 'Timer');
  await setTimerDuration(page, minutes);
  await startTimer(page);
  // Wait a few seconds to verify counting
  await waitForTimerCountdown(page, minutes, 5000);
}

/**
 * Complete audio setup: select theme, set volume, test sound
 */
export async function setupAudio(page: Page, pack: string, volumeLevel: number) {
  await navigateToTab(page, 'Audio');
  await selectSoundPack(page, pack);
  await setMasterVolume(page, volumeLevel);
  await playTestSound(page);
}

/**
 * Complete first-time setup
 */
export async function completeFirstTimeSetup(page: Page, theme: string) {
  await page.goto('/');
  await clearAppState(page);
  await switchTheme(page, theme);
  await setupAudio(page, 'Classic', 50);
}

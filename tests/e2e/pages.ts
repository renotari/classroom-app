/**
 * Page Object Models for E2E Tests
 *
 * Encapsulates UI interactions for each feature page.
 * Provides a clean API for test authors while hiding selector details.
 *
 * Usage:
 *   import { TimerPage } from './pages';
 *
 *   test('timer flow', async ({ page }) => {
 *     const timer = new TimerPage(page);
 *     await timer.navigateTo();
 *     await timer.setDuration(5);
 *     await timer.start();
 *     await timer.verifyRunning();
 *   });
 */

import { Page, expect } from '@playwright/test';

/**
 * Base page class with common navigation
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to app home
   */
  async goHome() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to tab by data-testid
   */
  protected async navigateToTab(tabName: string) {
    // Use data-testid for more reliable tab selection
    const tabSelector = `[data-testid="tab-${tabName.toLowerCase()}"]`;
    await this.page.click(tabSelector);
    await expect(this.page.locator(`text=${tabName}`)).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get stored value from localStorage
   */
  protected async getStoredValue(storeName: string, key: string): Promise<any> {
    return await this.page.evaluate(
      ({ store, property }) => {
        const stored = localStorage.getItem(store);
        if (!stored) return null;
        return JSON.parse(stored)[property];
      },
      { store: storeName, property: key }
    );
  }

  /**
   * Clear localStorage
   */
  async clearState() {
    await this.page.evaluate(() => localStorage.clear());
    await this.page.context().clearCookies();
  }

  /**
   * Wait for element with text
   */
  protected async waitForText(text: string, timeout: number = 5000) {
    await expect(this.page.locator(`text=${text}`)).toBeVisible({ timeout });
  }

  /**
   * Get element text
   */
  protected async getText(selector: string): Promise<string | null> {
    return await this.page.locator(selector).textContent();
  }

  /**
   * Check if element visible
   */
  protected async isVisible(selector: string, timeout: number = 1000): Promise<boolean> {
    try {
      await expect(this.page.locator(selector)).toBeVisible({ timeout });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Timer Page Object
 */
export class TimerPage extends BasePage {
  async navigateTo() {
    await this.navigateToTab('Timer');
  }

  /**
   * Set timer duration from preset
   */
  async setDurationFromPreset(minutes: number) {
    await this.page.click(`button:has-text("${minutes} min")`);
    const minutesStr = String(minutes).padStart(2, '0');
    await expect(this.page.locator(`text=/${minutesStr}:00/`)).toBeVisible({
      timeout: 5000,
    });
  }

  /**
   * Set custom timer duration
   */
  async setCustomDuration(minutes: number) {
    await this.page.click('input[aria-label="Custom Time"]');
    await this.page.fill('input[aria-label="Custom Time"]', minutes.toString());
    await this.page.click('button:has-text("Set")');
  }

  /**
   * Start timer
   */
  async start() {
    await this.page.click('button:has-text("Start")');
    await expect(this.page.locator('[aria-label="Timer running"]')).toBeVisible({
      timeout: 5000,
    });
  }

  /**
   * Pause timer
   */
  async pause() {
    await this.page.click('button:has-text("Pause")');
    await expect(this.page.locator('[aria-label="Timer paused"]')).toBeVisible({
      timeout: 5000,
    });
  }

  /**
   * Resume timer
   */
  async resume() {
    await this.page.click('button:has-text("Resume")');
    await expect(this.page.locator('[aria-label="Timer running"]')).toBeVisible({
      timeout: 5000,
    });
  }

  /**
   * Stop (reset) timer
   */
  async stop() {
    await this.page.click('button:has-text("Stop")');
    await expect(this.page.locator('text=/00:00/')).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get current timer display text
   */
  async getDisplayTime(): Promise<string> {
    const time = await this.getText('[role="timer"]');
    return time || '';
  }

  /**
   * Verify timer is running (counting down)
   */
  async verifyRunning() {
    await expect(this.page.locator('[aria-label="Timer running"]')).toBeVisible({
      timeout: 3000,
    });
  }

  /**
   * Verify timer is paused
   */
  async verifyPaused() {
    await expect(this.page.locator('[aria-label="Timer paused"]')).toBeVisible({
      timeout: 3000,
    });
  }

  /**
   * Verify timer is reset
   */
  async verifyReset() {
    const time = await this.getDisplayTime();
    expect(time).toMatch(/00:00/);
  }

  /**
   * Wait for countdown (verify it's running and counting down)
   */
  async waitForCountdown(fromMinutes: number, timeout: number = 5000) {
    const beforeMin = String(fromMinutes - 1).padStart(2, '0');
    await this.page.waitForFunction(
      () => {
        const text = document.body.innerText;
        return new RegExp(`${beforeMin}:|0[0-5]\\d`).test(text);
      },
      { timeout }
    );
  }

  /**
   * Complete full timer flow
   */
  async completeFlow(minutes: number) {
    await this.navigateTo();
    await this.setDurationFromPreset(minutes);
    await this.start();
    await this.waitForCountdown(minutes);
  }
}

/**
 * Audio Page Object
 */
export class AudioPage extends BasePage {
  async navigateTo() {
    await this.navigateToTab('Audio');
  }

  /**
   * Set master volume
   */
  async setMasterVolume(level: number) {
    await this.page.fill('input[aria-label="Master Volume"]', level.toString());
    await expect(this.page.locator(`text=${level}%`)).toBeVisible({ timeout: 3000 });
  }

  /**
   * Get current master volume
   */
  async getMasterVolume(): Promise<number> {
    const input = this.page.locator('input[aria-label="Master Volume"]');
    const value = await input.inputValue();
    return parseInt(value, 10);
  }

  /**
   * Select sound pack
   */
  async selectSoundPack(packName: string) {
    await this.page.click(`button:has-text("${packName}")`);
    await expect(
      this.page.locator(`button:has-text("${packName}")[aria-pressed="true"]`)
    ).toBeVisible({ timeout: 3000 });
  }

  /**
   * Play test sound
   */
  async playTestSound() {
    await this.page.click('button:has-text("Test Sound")');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Toggle background music
   */
  async toggleBackgroundMusic() {
    await this.page.click('button[aria-label="Toggle Background Music"]');
  }

  /**
   * Verify sound pack selected
   */
  async verifySoundPackSelected(packName: string) {
    await expect(
      this.page.locator(`button:has-text("${packName}")[aria-pressed="true"]`)
    ).toBeVisible({ timeout: 3000 });
  }
}

/**
 * Settings Page Object
 */
export class SettingsPage extends BasePage {
  async navigateTo() {
    await this.navigateToTab('Settings');
  }

  /**
   * Change theme
   */
  async changeTheme(themeName: string) {
    await this.page.click(`button:has-text("${themeName}")`);
    await expect(
      this.page.locator(`button:has-text("${themeName}")[aria-pressed="true"]`)
    ).toBeVisible({ timeout: 3000 });
  }

  /**
   * Verify theme is selected
   */
  async verifyThemeSelected(themeName: string) {
    await expect(
      this.page.locator(`button:has-text("${themeName}")[aria-pressed="true"]`)
    ).toBeVisible({ timeout: 3000 });
  }

  /**
   * Get currently selected theme
   */
  async getCurrentTheme(): Promise<string> {
    const buttons = this.page.locator('button[aria-pressed="true"]');
    return (await buttons.first().textContent()) || '';
  }

  /**
   * Change window mode
   */
  async changeWindowMode(mode: 'normal' | 'overlay' | 'floating') {
    const modeLabels = {
      normal: 'Normal Mode',
      overlay: 'Overlay Mode',
      floating: 'Floating Mode',
    };
    await this.page.click(`button:has-text("${modeLabels[mode]}")`);
  }

  /**
   * Verify window mode is active
   */
  async verifyWindowModeActive(mode: 'normal' | 'overlay' | 'floating') {
    const modeLabels = {
      normal: 'Normal Mode',
      overlay: 'Overlay Mode',
      floating: 'Floating Mode',
    };
    await expect(
      this.page.locator(`button:has-text("${modeLabels[mode]}")[aria-pressed="true"]`)
    ).toBeVisible({ timeout: 3000 });
  }

  /**
   * Verify settings persisted (stored in localStorage)
   */
  async verifySettingsPersisted(storeName: string, key: string, expectedValue: any) {
    const stored = await this.getStoredValue(storeName, key);
    expect(stored).toBe(expectedValue);
  }
}

/**
 * Semaphore Page Object (Phase 6+)
 */
export class SemaphorePage extends BasePage {
  async navigateTo() {
    await this.navigateToTab('Semaphore');
  }

  /**
   * Set semaphore state
   */
  async setState(state: 'red' | 'yellow' | 'green') {
    const stateLabels = {
      red: 'Silent Work',
      yellow: 'Quiet Discussion',
      green: 'Normal Discussion',
    };
    await this.page.click(`button:has-text("${stateLabels[state]}")`);
  }

  /**
   * Get current semaphore state
   */
  async getState(): Promise<'red' | 'yellow' | 'green'> {
    if (await this.isVisible('[aria-label="Semaphore red"]')) {
      return 'red';
    } else if (await this.isVisible('[aria-label="Semaphore yellow"]')) {
      return 'yellow';
    }
    return 'green';
  }

  /**
   * Verify state color
   */
  async verifyState(state: 'red' | 'yellow' | 'green') {
    await expect(this.page.locator(`[aria-label="Semaphore ${state}"]`)).toBeVisible({
      timeout: 3000,
    });
  }

  /**
   * Toggle automatic mode
   */
  async toggleAutomaticMode() {
    await this.page.click('button[aria-label="Toggle Automatic Mode"]');
  }

  /**
   * Verify automatic mode is active
   */
  async verifyAutomaticModeActive() {
    await expect(
      this.page.locator('button[aria-label="Toggle Automatic Mode"][aria-pressed="true"]')
    ).toBeVisible({ timeout: 3000 });
  }
}

/**
 * Noise Monitoring Page Object (Phase 5+)
 */
export class NoiseMonitorPage extends BasePage {
  async navigateTo() {
    await this.navigateToTab('Noise');
  }

  /**
   * Grant microphone permission
   */
  async grantMicrophonePermission() {
    await this.page.context().grantPermissions(['microphone']);
  }

  /**
   * Set noise threshold
   */
  async setThreshold(level: number) {
    await this.page.fill('input[aria-label="Noise Threshold"]', level.toString());
    await expect(this.page.locator(`text=${level}dB`)).toBeVisible({ timeout: 3000 });
  }

  /**
   * Get current noise threshold
   */
  async getThreshold(): Promise<number> {
    const input = this.page.locator('input[aria-label="Noise Threshold"]');
    const value = await input.inputValue();
    return parseInt(value, 10);
  }

  /**
   * Verify microphone is active
   */
  async verifyMicrophoneActive() {
    await expect(this.page.locator('[aria-label="Microphone active"]')).toBeVisible({
      timeout: 5000,
    });
  }

  /**
   * Verify noise level is being monitored
   */
  async verifyMonitoring() {
    await expect(this.page.locator('[aria-label="Noise meter"]')).toBeVisible({
      timeout: 3000,
    });
  }
}

/**
 * Class Management Page Object (Phase 7+)
 */
export class ClassManagementPage extends BasePage {
  async navigateTo() {
    await this.navigateToTab('Classes');
  }

  /**
   * Select class from dropdown
   */
  async selectClass(className: string) {
    await this.page.click('select[aria-label="Select Class"]');
    await this.page.click(`option:has-text("${className}")`);
  }

  /**
   * Get selected class
   */
  async getSelectedClass(): Promise<string> {
    const select = this.page.locator('select[aria-label="Select Class"]');
    return (await select.inputValue()) || '';
  }

  /**
   * Upload CSV file
   */
  async uploadCSV(filePath: string) {
    const input = this.page.locator('input[type="file"]');
    await input.setInputFiles(filePath);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Mark student absent
   */
  async markAbsent(studentName: string) {
    const row = this.page.locator(`text=${studentName}`).first();
    const checkbox = row.locator('input[type="checkbox"]');
    await checkbox.click();
    await expect(checkbox).toBeChecked({ timeout: 3000 });
  }

  /**
   * Mark student present
   */
  async markPresent(studentName: string) {
    const row = this.page.locator(`text=${studentName}`).first();
    const checkbox = row.locator('input[type="checkbox"]');
    await checkbox.click();
    await expect(checkbox).not.toBeChecked({ timeout: 3000 });
  }

  /**
   * Select random student
   */
  async selectRandom() {
    await this.page.click('button:has-text("Select Random")');
    await this.page.waitForTimeout(1500); // Wait for animation
  }

  /**
   * Verify student is selected
   */
  async verifyStudentSelected(studentName: string) {
    await expect(this.page.locator(`text=${studentName}[aria-selected="true"]`)).toBeVisible({
      timeout: 3000,
    });
  }
}

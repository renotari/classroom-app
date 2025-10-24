# E2E Tests - Playwright

End-to-end tests for user-facing flows using Playwright.

## Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e tests/e2e/timer.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run with UI debugger
npm run test:e2e -- --ui

# View test report
npm run test:e2e
open playwright-report/index.html
```

## Test Infrastructure

**Configuration**: `playwright.config.ts`
- Browser: Chromium (Desktop Chrome)
- Base URL: `http://localhost:1420`
- WebServer: `npm run dev` (Vite dev server)
- Timeout: 30 seconds per test

**Key Setup**:
- Playwright auto-starts Vite dev server before tests
- Auto-closes server after tests complete
- Screenshots on failure, traces for debugging
- HTML report generated after run

## E2E Test Patterns

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('Timer flow: set 5 minutes and start', async ({ page }) => {
  // Arrange: Navigate to app
  await page.goto('/');

  // Act: Click Timer tab
  await page.click('[aria-label="Timer Tab"]');

  // Assert: Timer tab is visible
  await expect(page.locator('text=Timer')).toBeVisible();
});
```

### Selectors: Use Role-Based Selectors

```typescript
// ✅ GOOD: Accessible and resilient
await page.click('button:has-text("Start")');
await page.getByRole('button', { name: 'Start' }).click();
await page.getByLabel('Timer Input').fill('300');

// ❌ AVOID: Brittle to UI changes
await page.click('.btn-start');
await page.click('#submit-button');
await page.click('div > button:nth-child(2)');
```

### Waiting for Elements

```typescript
// Wait for element to appear
await page.waitForSelector('text=Timer Started');
await expect(page.locator('text=Timer Started')).toBeVisible();

// Wait for specific condition
await page.waitForFunction(() => {
  const time = document.body.innerText;
  return /4:\d{2}/.test(time); // Timer counting down
});

// Wait for network if needed
await page.waitForLoadState('networkidle');
```

### Testing Async Operations

```typescript
test('Timer completes and shows alert', async ({ page }) => {
  await page.goto('/');

  // Set 1 second timer (for testing)
  await page.getByLabel('Custom Time').fill('1');
  await page.getByRole('button', { name: 'Start' }).click();

  // Wait for alert after 1+ second
  await expect(page.locator('text=Time\'s Up!')).toBeVisible({ timeout: 5000 });
});
```

## Critical User Flows to Test

These flows should have E2E tests:

### 1. First-time App Launch
```typescript
test('First-time launch: show theme/window mode selection', async ({ page }) => {
  // Clear localStorage to simulate first launch
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());

  await page.goto('/');

  // Should show settings/onboarding
  await expect(page.locator('text=Settings')).toBeVisible();
});
```

### 2. Timer Complete Flow
```typescript
test('Complete timer flow: 5min → start → complete → alert', async ({ page }) => {
  await page.goto('/');

  // Click 5 min preset
  await page.click('button:has-text("5 min")');
  await expect(page.locator('text=05:00')).toBeVisible();

  // Click Start
  await page.click('button:has-text("Start")');
  await expect(page.locator('text=Running')).toBeVisible();

  // Simulate fast-forward (or wait 5 minutes)
  // TODO: Add timer fast-forward mechanism for testing
});
```

### 3. Window Mode Switching
```typescript
test('Switch between window modes', async ({ page }) => {
  await page.goto('/');

  // Click Settings tab
  await page.click('[aria-label="Settings Tab"]');

  // Click Overlay Mode
  await page.click('button:has-text("Overlay Mode")');
  await expect(page.locator('text=Active')).toBeVisible();

  // Verify window sized correctly
  // Note: Actual window size testing requires Tauri testing
});
```

### 4. Theme Selection
```typescript
test('Change theme and verify colors update', async ({ page }) => {
  await page.goto('/');

  // Click Settings tab
  await page.click('[aria-label="Settings Tab"]');

  // Click alternate theme
  await page.click('button:has-text("Forest Mist")');

  // Verify theme color applied (check CSS variable)
  const bgColor = await page.locator('body').evaluate((el) => {
    return getComputedStyle(el).backgroundColor;
  });
  expect(bgColor).toBeTruthy(); // Should have some color
});
```

### 5. Audio Controls (Phase 4+)
```typescript
test('Play test sound from audio panel', async ({ page }) => {
  await page.goto('/');

  // Click Audio tab
  await page.click('[aria-label="Audio Tab"]');

  // TODO: Need to handle audio context mocking in browser
  // Click "Test Sound"
  // Verify audio plays (mock audio or monitor console)
});
```

### 6. Microphone Permission Flow (Phase 5, EC-000)
```typescript
test('First microphone access: request permission', async ({ page, context }) => {
  // Setup: Grant microphone permission
  await context.grantPermissions(['microphone']);

  await page.goto('/');

  // Click Noise Monitoring tab (Phase 5)
  // Should request/show microphone permission
  // TODO: Implement after Phase 5 feature ships
});
```

## Edge Cases to Test

Reference `docs/edge-cases.md` for full list. Key E2E test scenarios:

- **EC-000**: First-time microphone permission request
- **EC-001**: Handle microphone denied/unavailable gracefully
- **EC-002**: Window stays on-screen after switching modes
- **Theme Persistence**: Change theme, reload, verify theme persists
- **Window Mode Persistence**: Switch to overlay, reload, verify overlay mode persists
- **Multi-tab Navigation**: Switch tabs rapidly, no crashes

## Debugging Failed Tests

### View Test Report
```bash
npm run test:e2e
open playwright-report/index.html
```

### Run Single Test in Headed Mode
```bash
npm run test:e2e -- tests/e2e/timer.spec.ts --headed
```

### Debug with Inspector
```bash
# Run test with inspector (pause and step through)
PWDEBUG=1 npm run test:e2e
```

### Check Screenshots
```
test-results/
├── timer-spec/
│   ├── timer-flow-1.png     # Screenshot of failure
│   └── ...
```

### Common Issues

**"page.goto: net::ERR_CONNECTION_REFUSED"**
- Dev server not running
- Port 1420 not available
- Solution: `npm run dev` in another terminal or restart tests

**"Test timeout exceeded"**
- Element takes too long to appear
- Selector wrong or element doesn't exist
- Solution: Increase timeout or fix selector

**"AudioContext not defined"**
- Web Audio API not available in test environment
- AudioService may be creating actual AudioContext
- Solution: Ensure setup.ts mocks are loaded

## Test Organization

```
tests/e2e/
├── README.md                 # This file
├── timer.spec.ts            # Timer feature tests
├── audio.spec.ts            # Audio system tests (Phase 4)
├── noise.spec.ts            # Noise monitoring tests (Phase 5)
├── settings.spec.ts         # Settings UI tests
└── utils/
    └── helpers.ts           # Shared test helpers
```

## Shared Test Helpers

```typescript
// tests/e2e/utils/helpers.ts
export async function navigateToTab(page, tabName: string) {
  await page.click(`[aria-label="${tabName} Tab"]`);
  await expect(page.locator(`text=${tabName}`)).toBeVisible();
}

export async function switchTheme(page, themeName: string) {
  await navigateToTab(page, 'Settings');
  await page.click(`button:has-text("${themeName}")`);
}
```

Use in tests:
```typescript
import { navigateToTab, switchTheme } from './utils/helpers';

test('...', async ({ page }) => {
  await navigateToTab(page, 'Timer');
  // ...
});
```

## Future: Full Tauri E2E Testing (Phase 14)

When ready to test actual Tauri window management:

1. Update `playwright.config.ts`:
   ```typescript
   webServer: {
     command: 'npm run tauri dev',
     url: 'http://localhost:1420',
     // ... rest of config
   }
   ```

2. Add Tauri-specific tests:
   - Window minimize/maximize/close
   - Window decorations (title bar)
   - App menu (if implemented)
   - System integration

3. Note: These tests will be slower (Tauri build) but more comprehensive

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/locators)
- Tauri E2E Testing: Will implement in Phase 14

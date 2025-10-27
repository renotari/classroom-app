# E2E Testing Guide

Comprehensive guide for writing and maintaining E2E tests using Playwright and our custom helper functions.

## Quick Start

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e tests/e2e/timer.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run with debugging UI
npm run test:e2e -- --ui

# Generate test report
npm run test:e2e
open playwright-report/index.html
```

## Architecture

### Three Levels of Test Utilities

1. **Helper Functions** (`tests/e2e/helpers.ts`)
   - Simple utility functions
   - Used for one-off actions
   - Best for quick, inline test logic
   - Examples: `setTimerDuration()`, `selectClass()`

2. **Page Objects** (`tests/e2e/pages.ts`)
   - Encapsulate page structure and interactions
   - Reusable across multiple tests
   - Hide selector details
   - Examples: `TimerPage`, `AudioPage`, `SettingsPage`

3. **Test Files** (`tests/e2e/*.spec.ts`)
   - Actual test scenarios
   - Use helpers + page objects
   - Focus on test logic, not selectors

### When to Use Which

**Use Helper Functions when**:
- Action is simple and one-line
- Only used in 1-2 tests
- Part of a larger workflow

**Use Page Objects when**:
- Multiple related actions on same page
- Actions reused across 3+ tests
- Need to encapsulate page structure

**Use Workflows (in helpers) when**:
- Common multi-step sequences
- Used across 3+ tests
- Example: `completeTimerFlow()`, `completeFirstTimeSetup()`

## Writing Tests with Helpers

### Pattern 1: Using Helper Functions

```typescript
import { test, expect } from '@playwright/test';
import { navigateToTab, setTimerDuration, startTimer } from './helpers';

test('Timer starts correctly', async ({ page }) => {
  await page.goto('/');
  await navigateToTab(page, 'Timer');
  await setTimerDuration(page, 5);
  await startTimer(page);

  await expect(page.locator('[aria-label="Timer running"]')).toBeVisible();
});
```

### Pattern 2: Using Page Objects

```typescript
import { test } from '@playwright/test';
import { TimerPage } from './pages';

test('Timer starts correctly', async ({ page }) => {
  const timer = new TimerPage(page);

  await page.goto('/');
  await timer.navigateTo();
  await timer.setDurationFromPreset(5);
  await timer.start();
  await timer.verifyRunning();
});
```

### Pattern 3: Using Workflows

```typescript
import { test } from '@playwright/test';
import { completeTimerFlow } from './helpers';

test('Timer countdown works', async ({ page }) => {
  await page.goto('/');
  await completeTimerFlow(page, 5);

  // Timer is now running and counting down
});
```

### Pattern 4: Mixed Approach (Recommended)

```typescript
import { test } from '@playwright/test';
import { TimerPage } from './pages';
import { completeFirstTimeSetup } from './helpers';

test('Full user flow', async ({ page }) => {
  // Workflow for complex setup
  await completeFirstTimeSetup(page, 'Calm');

  // Page object for specific feature
  const timer = new TimerPage(page);
  await timer.setDurationFromPreset(5);
  await timer.start();
  await timer.verifyRunning();

  // Direct selector when nothing else fits
  await page.click('button:has-text("Reset")');
});
```

## Best Practices

### 1. Use Semantic Selectors

```typescript
// ✅ GOOD - Accessible, resilient to UI changes
await page.click('button:has-text("Start")');
await page.getByRole('button', { name: 'Start' }).click();
await page.getByLabel('Timer Input').fill('300');

// ❌ BAD - Brittle, fails with UI refactoring
await page.click('.btn-start');
await page.click('#submit-button');
await page.click('div > button:nth-child(2)');
```

### 2. Wait Properly

```typescript
// ✅ GOOD - Explicit waits with timeout
await expect(page.locator('text=Timer Started')).toBeVisible({ timeout: 5000 });

// ❌ BAD - No timeout, brittle
await page.waitForSelector('text=Timer Started');
```

### 3. Clear Test Names

Test names should describe **WHAT** is tested, not **HOW**:

```typescript
// ✅ GOOD
test('Timer counts down from 5 minutes', async () => {});
test('Audio volume persists after reload', async () => {});
test('Selecting random student updates display', async () => {});

// ❌ BAD
test('Test timer', async () => {});
test('Timer logic works', async () => {});
test('Set volume and reload', async () => {});
```

### 4. Arrange-Act-Assert Pattern

```typescript
test('Timer flow', async ({ page }) => {
  // ARRANGE: Set up initial state
  const timer = new TimerPage(page);
  await page.goto('/');
  await timer.navigateTo();

  // ACT: Perform the action
  await timer.setDurationFromPreset(5);
  await timer.start();

  // ASSERT: Verify outcome
  await timer.verifyRunning();
});
```

### 5. One Scenario Per Test

Each test should test one specific scenario:

```typescript
// ✅ GOOD - Each test is independent
test('Set timer duration', async ({ page }) => {
  const timer = new TimerPage(page);
  await timer.setDurationFromPreset(5);
  // Verify duration set
});

test('Start timer', async ({ page }) => {
  const timer = new TimerPage(page);
  await timer.setDurationFromPreset(5);
  await timer.start();
  // Verify timer started
});

// ❌ BAD - Multiple scenarios in one test
test('Set and start timer', async ({ page }) => {
  const timer = new TimerPage(page);
  await timer.setDurationFromPreset(5);
  // Verify duration
  await timer.start();
  // Verify timer started
  // Too much in one test!
});
```

### 6. Avoid Test Interdependence

```typescript
// ❌ BAD - Tests depend on execution order
let selectedStudent;
test('Select random student', async ({ page }) => {
  selectedStudent = await selectRandom(page);
});
test('Verify selection persisted', async ({ page }) => {
  expect(await getCurrentStudent(page)).toBe(selectedStudent);
});

// ✅ GOOD - Each test is independent
test('Select random student and verify persisted', async ({ page }) => {
  const classPage = new ClassManagementPage(page);
  await classPage.selectRandom();
  const student1 = await classPage.getSelectedStudent();

  await page.reload();

  const student2 = await classPage.getSelectedStudent();
  expect(student1).toBe(student2);
});
```

## Testing Strategy

### Test Scope

**High Priority (Core Features)**:
- Timer: Full cycle (set → start → pause → resume → stop)
- Audio: Volume changes persist, sound pack selection
- Settings: Theme changes persist
- Navigation: Tab switching

**Medium Priority (Phase 5+)**:
- Noise monitoring: Threshold setting, microphone permission
- Semaphore: State changes
- Class management: Student selection, CSV import

**Low Priority (Phase 9+)**:
- Group generation: Algorithm correctness
- Points system: Increment/decrement
- Advanced integrations

### Test Count Guidelines

**Minimum Tests per Feature**:
- Timer: 5-6 tests (duration, start/pause/resume, stop)
- Audio: 3-4 tests (volume, sound pack, persistence)
- Settings: 2-3 tests (theme changes, mode switching)

**Target Coverage**: >70% of user-visible functionality

## Handling Common Scenarios

### Async Operations

```typescript
// Testing audio playback
test('Play test sound', async ({ page }) => {
  const audio = new AudioPage(page);
  await audio.playTestSound();

  // Audio plays asynchronously, just verify no error
  // If you need to verify audio played, use a mock:
  const played = await page.evaluate(() => {
    return (window as any).audioTestState?.isPlaying || false;
  });
  expect(played).toBe(true);
});
```

### File Uploads

```typescript
// CSV import
test('Import students from CSV', async ({ page }) => {
  const classPage = new ClassManagementPage(page);
  await classPage.uploadCSV('./tests/e2e/fixtures/students.csv');

  // Verify import completed
  await expect(page.locator('text=3 students imported')).toBeVisible();
});
```

### Permissions (Microphone, etc.)

```typescript
// First-time microphone permission
test('Request microphone permission', async ({ page, context }) => {
  await context.grantPermissions(['microphone']);

  const noise = new NoiseMonitorPage(page);
  await noise.navigateTo();
  await noise.verifyMicrophoneActive();
});

// Deny microphone permission
test('Handle microphone denied', async ({ page, context }) => {
  // Playwright doesn't support denying yet, but we can test error handling
  // by mocking the getUserMedia failure in setup
});
```

### LocalStorage / State Persistence

```typescript
// Verify settings persist
test('Theme persists after reload', async ({ page }) => {
  const settings = new SettingsPage(page);

  // Set theme
  await page.goto('/');
  await settings.navigateTo();
  await settings.changeTheme('Energy');

  // Verify persisted
  await settings.verifySettingsPersisted('theme-store', 'selectedTheme', 'Energy');

  // Reload and verify
  await page.reload();
  await settings.verifyThemeSelected('Energy');
});
```

## Performance Considerations

### Timeouts

- **Default**: 30 seconds per test
- **Fast operations** (button click, text display): 3-5 seconds
- **Medium operations** (audio playback, animations): 5-10 seconds
- **Slow operations** (file upload, large CSV): 10-30 seconds

```typescript
// Override timeout for slow test
test('Import large CSV file', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds for this test

  const classPage = new ClassManagementPage(page);
  await classPage.uploadCSV('./tests/e2e/fixtures/large_class.csv');
}, { timeout: 60000 });
```

### Parallel Execution

Tests run in parallel by default. Avoid:
- Shared state (localStorage should be cleared per test)
- Port conflicts (each browser instance gets unique port)
- File system conflicts (use unique temp files)

## Debugging Failed Tests

### View Test Report

```bash
npm run test:e2e
open playwright-report/index.html
```

### Run Single Test Headed

```bash
npm run test:e2e tests/e2e/timer.spec.ts -- --headed
```

### Debug with Inspector

```bash
PWDEBUG=1 npm run test:e2e
```

### Check Screenshots

```
test-results/
├── timer-spec/
│   ├── timer-should-count-down-1.png
│   └── ...
```

### Common Issues & Solutions

**"Element not found"**
- Selector is wrong
- Element takes time to appear (increase timeout)
- Element is inside iframe or shadow DOM

**"Timeout waiting for element"**
- Element never appears (navigation issue)
- Selector wrong (verify in DevTools)
- Page not loaded (add `waitForLoadState()`)

**"Click failed: element is not visible"**
- Element is off-screen
- Element is behind another element
- Element height/width is 0

**"Assertion failed: expected true received false"**
- Timing issue (element not ready)
- Selector found wrong element (test first in DevTools)
- State not updated (add explicit wait)

## Example Test Files

### `tests/e2e/timer.spec.ts`

```typescript
import { test } from '@playwright/test';
import { TimerPage } from './pages';

test.describe('Timer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Set timer duration from preset', async ({ page }) => {
    const timer = new TimerPage(page);
    await timer.navigateTo();
    await timer.setDurationFromPreset(5);

    const time = await timer.getDisplayTime();
    expect(time).toMatch(/05:00/);
  });

  test('Start and pause timer', async ({ page }) => {
    const timer = new TimerPage(page);
    await timer.navigateTo();
    await timer.setDurationFromPreset(5);
    await timer.start();
    await timer.verifyRunning();

    await timer.pause();
    await timer.verifyPaused();
  });

  test('Resume paused timer', async ({ page }) => {
    const timer = new TimerPage(page);
    await timer.navigateTo();
    await timer.setDurationFromPreset(5);
    await timer.start();
    await timer.pause();

    await timer.resume();
    await timer.verifyRunning();
  });

  test('Timer counts down', async ({ page }) => {
    const timer = new TimerPage(page);
    await timer.navigateTo();
    await timer.setDurationFromPreset(5);
    await timer.start();

    await timer.waitForCountdown(5, 5000);
  });
});
```

### `tests/e2e/settings.spec.ts`

```typescript
import { test } from '@playwright/test';
import { SettingsPage } from './pages';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Change theme', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.navigateTo();

    await settings.changeTheme('Energy');
    await settings.verifyThemeSelected('Energy');
  });

  test('Theme persists after reload', async ({ page }) => {
    const settings = new SettingsPage(page);

    await settings.navigateTo();
    await settings.changeTheme('Professional');

    await page.reload();
    await settings.navigateTo();
    await settings.verifyThemeSelected('Professional');
  });

  test('Switch window modes', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.navigateTo();

    await settings.changeWindowMode('overlay');
    await settings.verifyWindowModeActive('overlay');

    await settings.changeWindowMode('normal');
    await settings.verifyWindowModeActive('normal');
  });
});
```

## Maintenance Tips

### Regular Reviews

**Weekly**:
- Check test execution time (should be <60s total)
- Review any flaky tests (retry > 2x)

**Monthly**:
- Audit selector brittleness (run tests after UI changes)
- Review test coverage (any missing critical flows?)
- Update documentation

### Refactoring Old Tests

When updating existing tests to use new helpers:

1. Identify common patterns
2. Extract to helper function
3. Update all tests to use helper
4. Verify all tests still pass
5. Commit with message: `test: refactor E2E helpers for [feature]`

### Adding New Features (Phase 7+)

When adding new features:

1. Create new page object in `pages.ts`
2. Add helper functions in `helpers.ts` if needed
3. Write E2E tests before or alongside feature implementation
4. Use TDD: test → feature → refine

## References

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locators](https://playwright.dev/docs/locators)
- [Playwright API Reference](https://playwright.dev/docs/api/class-page)
- Project: `tests/e2e/`, `playwright.config.ts`

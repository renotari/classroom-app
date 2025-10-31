# Comprehensive Testing Guide

This guide provides detailed testing patterns and strategies for the Classroom Management Tool.

## Testing Strategy Overview

### Coverage Targets
- **Target**: >70% coverage across all modules
- **Command**: `npm run test:coverage`
- **CI Integration**: Coverage reports in `coverage/` directory (HTML, JSON, Text)
- **CI Requirement**: Tests fail if coverage drops below 70%

### Test Types
1. **Unit Tests** (Vitest + React Testing Library)
2. **Integration Tests** (React Testing Library)
3. **E2E Tests** (Playwright)

---

## Unit Tests (Vitest + React Testing Library)

### Test Location
`src/tests/unit/[category]/[feature].test.ts`

### Hooks Testing Pattern

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../myHook';

describe('useMyHook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(defaultValue);
  });

  it('should update state correctly', () => {
    const { result } = renderHook(() => useMyHook());
    act(() => {
      result.current.setValue(newValue);
    });
    expect(result.current.value).toBe(newValue);
  });
});
```

### Service Testing Pattern

For AudioService, NoiseMonitorService, and other singleton services:

```typescript
import { AudioService } from '../audioService';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    service = AudioService.getInstance();
  });

  it('should enforce singleton pattern', () => {
    const service2 = AudioService.getInstance();
    expect(service).toBe(service2); // Same instance
  });

  it('should handle errors gracefully', async () => {
    try {
      await service.playSound('invalid-path');
      expect(true).toBe(false); // Should throw
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });
});
```

### Zustand Store Testing Pattern

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTimerStore } from '../timerStore';

describe('useTimerStore', () => {
  beforeEach(() => {
    // Reset store state
    useTimerStore.getState().resetState?.();
  });

  it('should persist state to localStorage', () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.setDuration(300);
    });
    const stored = JSON.parse(localStorage.getItem('timer-store') || '{}');
    expect(stored.duration).toBe(300);
  });
});
```

### Web Audio API Mocking

All audio-related tests use mocked AudioContext:

- AudioContext is auto-mocked in `src/tests/setup.ts`
- MockAudioContext supports: `createGain()`, `createOscillator()`, `createBufferSource()`
- MediaDevices.getUserMedia is also mocked for microphone tests
- **Cleanup**: AudioService singleton is reset after each test

### Edge Case Testing

Reference `docs/edge-cases.md` for the 15 documented edge cases:

- **EC-000, EC-001**: Microphone permission tests (mock navigator.mediaDevices)
- **EC-005**: Missing audio files (test fallback beep generation)
- **EC-008**: AudioContext singleton conflicts (test getInstance returns same instance)
- **EC-004**: Memory leaks after 8+ hours (use Jest/Vitest profiling in Phase 14)

---

## Integration Tests (React Testing Library)

### Test Location
`src/tests/integration/[feature].test.tsx`

### Pattern
Test user flows, not individual units.

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimerComponent } from '../components/Timer';

describe('Timer Component Integration', () => {
  it('should start timer and show completion alert', async () => {
    const user = userEvent.setup();
    render(<TimerComponent />);

    // User sets 5 minutes
    await user.click(screen.getByText('5 min'));

    // User starts timer
    await user.click(screen.getByText('Start'));

    // Verify timer is counting
    await waitFor(() => {
      expect(screen.getByText(/4:59/)).toBeInTheDocument();
    });
  });
});
```

### Critical Scenarios

These scenarios **must** have integration tests:

- Timer completes → Audio alert plays
- Noise exceeds threshold → Semaphore changes color
- CSV imported → Student list updated
- Group generation with impossible rules → Error shown

---

## E2E Tests (Playwright)

### Test Location
`tests/e2e/[feature].spec.ts`

### Reference
**📖 COMPREHENSIVE GUIDE**: Read `docs/e2e-testing-guide.md` for full patterns, best practices, and helper functions.

### Helpers Available

- **Helper Functions** (`tests/e2e/helpers.ts`): 50+ utility functions (e.g., `setTimerDuration()`, `selectClass()`)
- **Page Objects** (`tests/e2e/pages.ts`): 8+ page classes (e.g., `TimerPage`, `AudioPage`, `SettingsPage`)

### Configuration
Assumes Tauri dev server running on `http://localhost:1420`

### Basic Pattern

```typescript
import { test, expect } from '@playwright/test';

test('Timer flow', async ({ page }) => {
  await page.goto('http://localhost:1420');

  // Click Timer tab
  await page.click('[aria-label="Timer"]');

  // Click 5min preset
  await page.click('button:has-text("5 min")');

  // Click Start
  await page.click('button:has-text("Start")');

  // Wait for timer display
  await expect(page.locator('text=/4:5[0-9]/')).toBeVisible();
});
```

### Critical User Flows

These flows **must** have E2E tests:

- First-time app launch (theme selection, window mode)
- Timer full cycle (preset → start → pause → stop)
- Audio controls (test sound, volume adjustment)
- Microphone permission flow (EC-000)
- CSV import and class selection

---

## Coverage Metrics

### Per-Module Coverage Targets

- `useTimer.ts`: 100% (20+ tests) ✅
- `AudioService.ts`: 100% (32+ tests) ✅
- `noiseMonitorService.ts`: 80%+ (Phase 5)
- `groupGenerationService.ts`: 90%+ (Phase 9 - algorithm critical)
- Store files: 85%+ (each store)

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Reports available in:
coverage/
├── index.html     # Visual HTML report
├── coverage.json  # JSON data
└── lcov.info      # LCOV format
```

---

## Testing Best Practices

### 1. Test Names
Describe **WHAT** is tested, not **HOW**:

- ✅ "should play alert sound on timer completion"
- ❌ "calls playSound method"

### 2. Arrange-Act-Assert Pattern

```typescript
// Arrange
const { result } = renderHook(() => useTimer());

// Act
act(() => {
  result.current.setDuration(300);
});

// Assert
expect(result.current.duration).toBe(300);
```

### 3. Avoid Testing Implementation Details

- Test behavior, not internal state
- Use `screen.getByRole()` instead of `container.querySelector()`
- Test user-facing outcomes, not code internals

### 4. Async Operations

Always use `waitFor()` for animations, API calls, and async state updates:

```typescript
await waitFor(() => {
  expect(screen.getByText('Alert')).toBeInTheDocument();
});
```

### 5. Cleanup

Vitest automatically cleans up after each test:

- No need to manually unmount components (done in `setup.ts`)
- AudioService singleton is reset automatically
- LocalStorage is cleared between tests

---

## Test Directory Structure

```
src/tests/
├── setup.ts                     # Global test setup
├── unit/
│   ├── hooks/
│   │   └── useTimer.test.ts    ✅ COMPLETED
│   ├── services/
│   │   ├── audioService.test.ts ✅ COMPLETED
│   │   ├── noiseMonitorService.test.ts (skeleton - PHASE 5)
│   │   └── groupGenerationService.test.ts (skeleton - PHASE 9)
│   └── stores/
│       └── README.md (pattern documentation)
└── integration/
    └── [Future: timer.test.tsx, audio.test.tsx, etc.]

tests/
└── e2e/
    └── [Future: timer.spec.ts, audio.spec.ts, etc.]
```

---

## Test Workflow

When implementing a feature, follow this workflow:

```typescript
// 1. Write the code
✅ src/hooks/useTimer.ts

// 2. Write unit tests
✅ src/tests/unit/hooks/useTimer.test.ts

// 3. Write integration tests (if complex interactions)
✅ src/tests/integration/timer.test.tsx

// 4. Verify tests pass
npm run test

// 5. Check coverage
npm run test:coverage

// 6. Update PROJECT_PLAN.md
// 7. Commit
git commit -m "feat: implement timer with tests"
```

---

## Common Testing Scenarios

### Testing Timers

```typescript
import { vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
});

it('should countdown correctly', () => {
  const { result } = renderHook(() => useTimer());

  act(() => {
    result.current.start(60);
  });

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.timeRemaining).toBe(59);
});
```

### Testing Audio

```typescript
it('should play sound through AudioContext', async () => {
  const audioService = AudioService.getInstance();
  const spy = vi.spyOn(audioService.audioContext, 'createBufferSource');

  await audioService.playSound('alert.mp3');

  expect(spy).toHaveBeenCalled();
});
```

### Testing User Events

```typescript
import userEvent from '@testing-library/user-event';

it('should handle button click', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  await user.click(screen.getByRole('button', { name: 'Start' }));

  expect(screen.getByText('Running')).toBeInTheDocument();
});
```

---

## Debugging Tests

### Common Issues

**Issue**: Tests pass locally but fail in CI
- **Solution**: Check for timezone differences, use fake timers

**Issue**: Tests are flaky
- **Solution**: Use `waitFor()` instead of fixed timeouts, avoid testing implementation details

**Issue**: Coverage not updating
- **Solution**: Delete `coverage/` directory and re-run `npm run test:coverage`

### Useful Commands

```bash
# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npm run test -- useTimer.test.ts

# Run with coverage
npm run test:coverage

# Run in UI mode
npm run test -- --ui

# Debug specific test
npm run test -- --reporter=verbose useTimer.test.ts
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

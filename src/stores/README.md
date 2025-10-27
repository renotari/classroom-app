# Zustand Store Directory

## Store Status Overview

This directory contains all global state management stores using Zustand with persistence middleware.

### ✅ FUNCTIONAL STORES (Ready to Use)

| Store | Phase | Status | Features | Tests |
|-------|-------|--------|----------|-------|
| `themeStore.ts` | 2 | ✅ COMPLETATA | Theme selection, persistence | ✅ Tested |
| `windowModeStore.ts` | 2 | ✅ COMPLETATA | Window modes, floating windows | ✅ Tested |
| `timerStore.ts` | 3 | ✅ COMPLETATA | Duration, state, preset management | ✅ 100% coverage |
| `audioStore.ts` | 4 | ✅ COMPLETATA | Sound packs, volume, alert config | ✅ 100% coverage |
| `noiseStore.ts` | 5 | ✅ COMPLETATA | Levels, thresholds, history, permissions | ✅ Tested |

### 🏗️ SCAFFOLDED STORES (Phase 6+)

| Store | Phase | Status | Purpose | Notes |
|-------|-------|--------|---------|-------|
| `semaphoreStore.ts` | 6 | 🏗️ SKELETON | Traffic light state, manual/auto mode | Not yet implemented |
| `classStore.ts` | 7 | 🏗️ SKELETON | Students, classes, selections, absences | Depends on Phase 7 CSV import |
| `groupsStore.ts` | 8 | 🏗️ SKELETON | Groups, separation rules, algorithm config | Depends on Phase 8 group generation |
| `pointsStore.ts` | 9 | 🏗️ SKELETON | Student points, leaderboards, resets | Optional feature, Phase 9 |

## Architecture & Patterns

### Zustand with Persistence

Each store follows this pattern:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMyStore = create<MyStoreState>()(
  persist(
    (set, get) => ({
      // State
      value: 'initial',

      // Actions
      setValue: (val) => set({ value: val }),

      // Getters (optional)
      getValue: () => get().value,
    }),
    {
      name: 'my-store', // localStorage key
    }
  )
);
```

### Functional vs Scaffolded

**FUNCTIONAL stores** (Phases 1-5):
- Fully implemented
- Tested with >70% coverage
- Ready for production use
- Can be imported and used in components

**SCAFFOLDED stores** (Phases 6+):
- Type definitions in place
- Basic structure defined
- NOT YET IMPLEMENTED
- Will throw `NOT_IMPLEMENTED` error if accessed before Phase X

## Phase-Locked Implementation

To prevent accessing unfinished stores, use `requireFeature()`:

```typescript
import { requireFeature } from '../config/features';
import { useSemaphoreStore } from './semaphoreStore';

export function SemaphoreComponent() {
  // This will throw in dev if phase not complete
  requireFeature('semaphore', 'Semaphore phase not ready yet');

  const { currentColor } = useSemaphoreStore();
  // ...
}
```

Or check with `isFeatureEnabled()`:

```typescript
import { isFeatureEnabled } from '../config/features';

if (isFeatureEnabled('semaphore')) {
  const { currentColor } = useSemaphoreStore();
}
```

## Testing Stores

### Unit Tests
Located in: `src/tests/unit/stores/[store-name].test.ts`

Test pattern with Zustand:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyStore } from '../myStore';

describe('useMyStore', () => {
  beforeEach(() => {
    // Reset localStorage
    useMyStore.getState().resetState?.();
  });

  it('should persist to localStorage', () => {
    const { result } = renderHook(() => useMyStore());

    act(() => {
      result.current.setValue('new value');
    });

    // Check localStorage
    const stored = JSON.parse(
      localStorage.getItem('my-store') || '{}'
    );
    expect(stored.value).toBe('new value');
  });
});
```

### Store State Reset

All stores should provide a `resetState` action for testing:

```typescript
reset: () => set({ /* initial values */ })
```

## Integration with Components

### Using a Store

```typescript
import { useTimerStore } from '../stores/timerStore';

export function TimerComponent() {
  // Get state and actions
  const { duration, isRunning, start, stop } = useTimerStore();

  return (
    <>
      <div>{duration}s</div>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}
```

### Local vs Global State Decision

**Use Global Store (Zustand) when:**
- State needs to persist across components
- Multiple features access the same state
- State survives component unmounting
- Example: Timer duration (used in display + controls)

**Use Local State (useState) when:**
- State is component-specific
- Not shared with other components
- Example: Dropdown open/closed state

See `docs/state-management-guidelines.md` for detailed decision tree.

## Phase Timeline

| Phase | Stores | Status | Week |
|-------|--------|--------|------|
| 1-2 | theme, windowMode | ✅ Complete | W1-2 |
| 3 | timer | ✅ Complete | W3 |
| 4 | audio | ✅ Complete | W4 |
| 5 | noise | ✅ Complete | W5 |
| 6 | semaphore | 🏗️ Planned | W7 |
| 7 | class | 🏗️ Planned | W8-9 |
| 8 | groups | 🏗️ Planned | W10-11 |
| 9+ | points, dice, overlay | 🏗️ Planned | W12-17 |

## Common Issues & Solutions

### Store Not Found

```
Error: Cannot find module './unknownStore'
```

**Solution**: Store hasn't been created yet. Check Phase in PROJECT_PLAN.md.

### Feature Not Enabled

```
Error: Feature "semaphore" is not yet implemented
```

**Solution**: Phase not complete. Check FEATURE_FLAGS in `src/config/features.ts`.

### localStorage Issues

**Problem**: Store state not persisting
**Solution**: Check browser DevTools → Application → localStorage
- Verify key name matches `name` in `persist()`
- Check if localStorage is disabled

**Problem**: Old state after upgrade
**Solution**: Clear localStorage: `localStorage.clear()` in DevTools console

## Adding a New Store

1. Create `newStore.ts` in this directory
2. Define `NewStoreState` interface
3. Create store with `create()` and `persist()`
4. Export `useNewStore` hook
5. Add feature flag check in `src/config/features.ts`
6. Create tests in `src/tests/unit/stores/newStore.test.ts`
7. Document in this README
8. Mark phase as complete once tested

## References

- **Zustand Docs**: https://github.com/pmndrs/zustand
- **State Management Guide**: `docs/state-management-guidelines.md`
- **Feature Flags**: `src/config/features.ts`
- **Phase Timeline**: `PROJECT_PLAN.md`

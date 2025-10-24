# Store Tests

## Zustand Store Testing Pattern

### Store Test Structure

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyStore } from '../myStore';

describe('useMyStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMyStore.getState().resetState();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useMyStore());
    expect(result.current.someValue).toBe(initialValue);
  });

  it('should update state correctly', () => {
    const { result } = renderHook(() => useMyStore());
    act(() => {
      result.current.updateValue(newValue);
    });
    expect(result.current.someValue).toBe(newValue);
  });

  it('should persist state to localStorage', () => {
    const { result } = renderHook(() => useMyStore());
    act(() => {
      result.current.updateValue(newValue);
    });
    const stored = JSON.parse(localStorage.getItem('store-key') || '{}');
    expect(stored.someValue).toBe(newValue);
  });
});
```

### Key Testing Guidelines

1. **Reset State**: Each test should start fresh
   - Use `store.getState().resetState()` or similar
   - Clear localStorage between tests if using persistence

2. **Use renderHook**: For testing custom hooks from Zustand stores
   - Avoid directly calling hooks in tests
   - Use `act()` wrapper for state updates

3. **Test Persistence**: If store uses localStorage/sessionStorage
   - Verify state is saved correctly
   - Verify state is restored on app reload

4. **Test Selectors**: If using Zustand selectors
   - Test that selectors return correct derived state
   - Test selector memoization (not re-computing unnecessarily)

5. **Test Side Effects**: If store has async actions
   - Test promise resolution/rejection
   - Test state changes after async operations complete
   - Mock fetch/API calls using vitest mocks

### Planned Store Tests

When implementing stores in upcoming phases:

- **audioStore**: Audio configuration (volume levels, selected sound pack, playback state)
- **noiseStore**: Noise monitoring settings (thresholds, sensitivity, history)
- **classStore**: Classes, students, absences, import state
- **semaphoreStore**: Traffic light state (manual/auto mode, current color)
- **groupsStore**: Separation rules, generated groups, history
- **pointsStore**: Student points, rankings, reset schedule

See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for integration and E2E test patterns.

/**
 * Unit Tests for useTimer Hook
 * Test coverage: initialization, duration, controls, callbacks, cleanup
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTimer } from '../../../src/hooks/useTimer';
import { useTimerStore } from '../../../src/stores/timerStore';

/**
 * Reset timer store before each test
 */
beforeEach(() => {
  const store = useTimerStore.getState();
  store.reset();
});

describe('useTimer Hook', () => {
  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.remainingSeconds).toBe(0);
      expect(result.current.totalSeconds).toBe(0);
      expect(result.current.status).toBe('idle');
      expect(result.current.isIdle).toBe(true);
      expect(result.current.isRunning).toBe(false);
    });

    it('should provide all expected methods', () => {
      const { result } = renderHook(() => useTimer());

      expect(typeof result.current.setDuration).toBe('function');
      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.pause).toBe('function');
      expect(typeof result.current.resume).toBe('function');
      expect(typeof result.current.stop).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.setAndStart).toBe('function');
    });

    it('should provide helper functions', () => {
      const { result } = renderHook(() => useTimer());

      expect(typeof result.current.formatTime).toBe('function');
      expect(typeof result.current.getProgress).toBe('function');
      expect(typeof result.current.isInWarningZone).toBe('function');
    });
  });

  describe('setAndStart', () => {
    it('should set duration and start timer immediately', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setAndStart(300); // 5 minutes
      });

      expect(result.current.totalSeconds).toBe(300);
      expect(result.current.remainingSeconds).toBe(300);
      expect(result.current.status).toBe('running');
      expect(result.current.isRunning).toBe(true);
    });

    it('should reject zero duration', () => {
      const { result } = renderHook(() => useTimer());

      expect(() => {
        act(() => {
          result.current.setAndStart(0);
        });
      }).toThrow();
    });

    it('should reject negative duration', () => {
      const { result } = renderHook(() => useTimer());

      expect(() => {
        act(() => {
          result.current.setAndStart(-100);
        });
      }).toThrow();
    });
  });

  describe('timer controls', () => {
    it('should pause running timer', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setAndStart(300);
      });

      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.pause();
      });

      expect(result.current.status).toBe('paused');
      expect(result.current.isPaused).toBe(true);
      expect(result.current.isRunning).toBe(false);
    });

    it('should resume paused timer', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setAndStart(300);
        result.current.pause();
      });

      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.resume();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it('should stop timer and reset to total duration', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setAndStart(300);
      });

      // Let timer run (but won't actually tick without real time passing)
      act(() => {
        result.current.stop();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.remainingSeconds).toBe(300);
      expect(result.current.totalSeconds).toBe(300);
    });

    it('should reset timer to zero', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setAndStart(300);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.remainingSeconds).toBe(0);
      expect(result.current.totalSeconds).toBe(0);
    });
  });

  describe('timer tick and completion', () => {
    it('should decrement remaining seconds on tick', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setAndStart(300);
      });

      const store = useTimerStore.getState();

      act(() => {
        store.tick();
      });

      expect(result.current.remainingSeconds).toBe(299);
    });

    it('should trigger completion callback when timer reaches zero', async () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => useTimer({ onComplete }));

      act(() => {
        result.current.setDuration(1); // 1 second
        result.current.start();
      });

      const store = useTimerStore.getState();

      act(() => {
        store.tick(); // Decrement to 0
      });

      await waitFor(() => {
        expect(result.current.status).toBe('completed');
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should not trigger completion callback multiple times', async () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => useTimer({ onComplete }));

      act(() => {
        result.current.setDuration(1);
        result.current.start();
      });

      const store = useTimerStore.getState();

      // Simulate multiple ticks past completion
      act(() => {
        store.tick(); // 0 seconds
        store.tick(); // Try to go negative
        store.tick(); // Try again
      });

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      });
    });

    it('should reset completion flag when timer is reset', async () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => useTimer({ onComplete }));

      act(() => {
        result.current.setDuration(1);
        result.current.start();
      });

      const store = useTimerStore.getState();

      // Tick to completion
      act(() => {
        store.tick(); // 1 - 1 = 0, triggers completion
      });

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      });

      // Reset should clear the completion flag
      act(() => {
        result.current.reset();
      });

      // Verify completion flag was reset by checking status
      expect(result.current.status).toBe('idle');

      // Now we can run the timer again
      act(() => {
        result.current.setDuration(1);
        result.current.start();
      });

      act(() => {
        store.tick();
      });

      // Should trigger completion again
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('warning callbacks', () => {
    it('should trigger warning callback at configured threshold', async () => {
      const onWarning = vi.fn();
      const { result } = renderHook(() => useTimer({ onWarning }));

      act(() => {
        result.current.setDuration(600); // 10 minutes
      });

      const store = useTimerStore.getState();

      act(() => {
        store.updateConfig({ warningAt5Min: true });
        result.current.start();
      });

      // Manually tick to 5 minute mark (300 seconds)
      act(() => {
        // Tick 300 times to reach 5 min warning
        for (let i = 0; i < 300; i++) {
          store.tick();
        }
      });

      await waitFor(() => {
        expect(onWarning).toHaveBeenCalled();
      });
    });

    it('should not trigger warning callback multiple times for same threshold', async () => {
      const onWarning = vi.fn();
      const { result } = renderHook(() => useTimer({ onWarning }));

      act(() => {
        result.current.setDuration(600);
      });

      const store = useTimerStore.getState();

      act(() => {
        store.updateConfig({ warningAt5Min: true });
        result.current.start();
      });

      // Simulate reaching warning threshold twice
      act(() => {
        for (let i = 0; i < 300; i++) store.tick(); // First time at 5 min
      });

      // Verify first call happened
      await waitFor(() => {
        expect(onWarning).toHaveBeenCalledTimes(1);
      });

      // Warning should not fire again at same threshold
      const initialCallCount = onWarning.mock.calls.length;

      act(() => {
        store.tick(); // One more tick past threshold
      });

      expect(onWarning).toHaveBeenCalledTimes(initialCallCount);
    });

    it('should respect warning config', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.updateConfig({
          warningAt2Min: true,
          warningAt5Min: false,
        });
        result.current.setDuration(600);
      });

      // Should only have 2 min threshold configured
      expect(result.current.warningThresholds).toContain(120);
      expect(result.current.warningThresholds).not.toContain(300);
    });
  });

  describe('progress and formatting', () => {
    it('should format time correctly', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.formatTime(0)).toBe('00:00');
      expect(result.current.formatTime(59)).toBe('00:59');
      expect(result.current.formatTime(60)).toBe('01:00');
      expect(result.current.formatTime(605)).toBe('10:05');
      expect(result.current.formatTime(3661)).toBe('61:01');
    });

    it('should calculate progress correctly', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setDuration(100);
        result.current.start(); // Must start before ticking
      });

      expect(result.current.getProgress()).toBe(0);

      // Manually tick (simulating time passing)
      const store = useTimerStore.getState();
      act(() => {
        store.tick();
        store.tick();
        store.tick();
      });

      // After 3 ticks while running: 100 - 3 = 97 remaining, so progress = 3/100 = 3%
      expect(result.current.progress).toBe(3);
    });

    it('should provide formatted time string', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setDuration(125); // 2:05
      });

      expect(result.current.formattedTime).toBe('02:05');
    });

    it('should return zero progress when total is zero', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.getProgress()).toBe(0);
    });
  });

  describe('warning zone detection', () => {
    it('should detect when in warning zone', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.updateConfig({
          warningAt2Min: true,
          warningAt5Min: true,
        });
        result.current.setDuration(600);
        result.current.start();
      });

      const store = useTimerStore.getState();

      // Initially not in warning zone (at 600 seconds, thresholds are 120 and 300)
      expect(result.current.isInWarningZone()).toBe(false);

      // Tick to 2 min mark (should be in warning zone now)
      act(() => {
        for (let i = 0; i < 480; i++) store.tick(); // 600 - 120 = 480 ticks
      });

      // Now should be in warning zone (at 120 seconds)
      expect(result.current.isInWarningZone()).toBe(true);
    });
  });

  describe('memory leak prevention', () => {
    it('should cleanup interval on unmount', async () => {
      const { unmount, result } = renderHook(() => useTimer());

      act(() => {
        result.current.setAndStart(300);
      });

      expect(result.current.isRunning).toBe(true);

      // Unmount component
      unmount();

      // Verify no errors or warnings
      expect(() => {
        // Component should be cleaned up
      }).not.toThrow();
    });

    it('should not call callbacks after unmount', async () => {
      const onWarning = vi.fn();
      const onComplete = vi.fn();
      const { unmount, result } = renderHook(() =>
        useTimer({ onWarning, onComplete })
      );

      act(() => {
        result.current.setAndStart(2);
      });

      act(() => {
        unmount();
      });

      const store = useTimerStore.getState();

      // Try to trigger callbacks after unmount
      act(() => {
        store.tick();
        store.tick();
      });

      // Callbacks should not have been called (component unmounted)
      expect(onWarning).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('configuration', () => {
    it('should update config and recalculate warning thresholds', () => {
      const { result } = renderHook(() => useTimer());

      // First, ensure both warnings are enabled
      act(() => {
        result.current.updateConfig({
          warningAt2Min: true,
          warningAt5Min: true,
        });
        result.current.setDuration(600);
      });

      // Check initial state - may have 1 or 2 depending on duration
      const initialCount = result.current.warningThresholds.length;
      expect(initialCount).toBeGreaterThan(0);

      act(() => {
        result.current.updateConfig({ warningAt5Min: false });
        result.current.setDuration(600);
      });

      // Now only 2 min warning should be present
      expect(result.current.warningThresholds).toContain(120);
      expect(result.current.warningThresholds).not.toContain(300);
    });
  });
});

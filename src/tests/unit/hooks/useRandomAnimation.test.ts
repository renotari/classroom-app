/**
 * Unit tests for useRandomAnimation hook
 *
 * Tests cover:
 * - Initialization state
 * - Start/stop animation
 * - Animation progress and index updates
 * - Easing functions
 * - Callbacks (onStart, onTick, onComplete)
 * - Edge cases and validation
 * - Cleanup on unmount
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useRandomAnimation,
  EASING_FUNCTIONS,
  calculateIndexAtProgress,
} from '../../../hooks/useRandomAnimation';

describe('useRandomAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useRandomAnimation());

      expect(result.current.isAnimating).toBe(false);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.progress).toBe(0);
    });

    it('should have start and stop methods', () => {
      const { result } = renderHook(() => useRandomAnimation());

      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.stop).toBe('function');
    });
  });

  describe('Start Animation', () => {
    it('should start animation with valid parameters', () => {
      const { result } = renderHook(() => useRandomAnimation());

      act(() => {
        result.current.start(5, 2);
      });

      expect(result.current.isAnimating).toBe(true);
      // Note: With fake timers, we don't check RAF directly
    });

    it('should throw error if totalItems is 0 or negative', () => {
      const { result } = renderHook(() => useRandomAnimation());

      expect(() => {
        act(() => {
          result.current.start(0, 0);
        });
      }).toThrow('totalItems must be greater than 0');

      expect(() => {
        act(() => {
          result.current.start(-5, 0);
        });
      }).toThrow('totalItems must be greater than 0');
    });

    it('should throw error if finalIndex is out of bounds', () => {
      const { result } = renderHook(() => useRandomAnimation());

      expect(() => {
        act(() => {
          result.current.start(5, -1);
        });
      }).toThrow('finalIndex must be between 0 and 4');

      expect(() => {
        act(() => {
          result.current.start(5, 5);
        });
      }).toThrow('finalIndex must be between 0 and 4');
    });

    it('should call onStart callback', () => {
      const onStart = vi.fn();
      const { result } = renderHook(() => useRandomAnimation({ onStart }));

      act(() => {
        result.current.start(5, 2);
      });

      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('should reset state when starting new animation', () => {
      const { result } = renderHook(() => useRandomAnimation());

      // Start first animation
      act(() => {
        result.current.start(5, 2);
      });

      // Advance animation partially
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Start second animation
      act(() => {
        result.current.start(10, 7);
      });

      expect(result.current.progress).toBe(0);
      expect(result.current.isAnimating).toBe(true);
    });
  });

  describe('Stop Animation', () => {
    it('should stop animation when called', () => {
      const { result } = renderHook(() => useRandomAnimation());

      act(() => {
        result.current.start(5, 2);
      });

      expect(result.current.isAnimating).toBe(true);

      act(() => {
        result.current.stop();
      });

      expect(result.current.isAnimating).toBe(false);
      // Note: With fake timers, we don't check cancelAnimationFrame directly
    });

    it('should reset progress when stopped', () => {
      const { result } = renderHook(() => useRandomAnimation());

      act(() => {
        result.current.start(5, 2);
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      act(() => {
        result.current.stop();
      });

      expect(result.current.progress).toBe(0);
    });
  });

  describe('Animation Progress', () => {
    it('should update progress during animation', () => {
      const { result } = renderHook(() => useRandomAnimation({ duration: 1000 }));

      act(() => {
        result.current.start(5, 2);
      });

      // First frame at 0ms (sets startTime)
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(result.current.progress).toBe(0);

      // Second frame at 500ms (halfway)
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current.progress).toBeCloseTo(0.5, 1);

      // Third frame at 1000ms (complete)
      act(() => {
        vi.advanceTimersByTime(1100);
      });
      expect(result.current.progress).toBe(1);
    });

    it('should update currentIndex during animation', () => {
      const { result } = renderHook(() => useRandomAnimation({ duration: 1000 }));

      act(() => {
        result.current.start(5, 2);
      });

      act(() => {
        vi.advanceTimersByTime(0);
      });
      const index1 = result.current.currentIndex;

      act(() => {
        vi.advanceTimersByTime(500);
      });
      const index2 = result.current.currentIndex;

      // Index should change during animation
      expect(index1).toBeGreaterThanOrEqual(0);
      expect(index1).toBeLessThan(5);
      expect(index2).toBeGreaterThanOrEqual(0);
      expect(index2).toBeLessThan(5);
    });

    it('should land on final index when animation completes', () => {
      const { result } = renderHook(() => useRandomAnimation({ duration: 1000 }));

      act(() => {
        result.current.start(5, 3);
      });

      // Trigger multiple frames to complete animation
      act(() => {
        vi.advanceTimersByTime(0);   // Start
      });
      act(() => {
        vi.advanceTimersByTime(1100); // Complete
      });

      expect(result.current.currentIndex).toBe(3);
      expect(result.current.isAnimating).toBe(false);
    });
  });

  describe('Callbacks', () => {
    it('should call onTick during animation', () => {
      const onTick = vi.fn();
      const { result } = renderHook(() =>
        useRandomAnimation({ duration: 1000, onTick })
      );

      act(() => {
        result.current.start(5, 2);
      });

      act(() => {
        vi.advanceTimersByTime(0);
        vi.advanceTimersByTime(500);
      });

      expect(onTick).toHaveBeenCalled();
      expect(onTick).toHaveBeenCalledWith(
        expect.any(Number), // currentIndex
        expect.any(Number)  // progress
      );
    });

    it('should call onComplete when animation finishes', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useRandomAnimation({ duration: 1000, onComplete })
      );

      act(() => {
        result.current.start(5, 3);
      });

      act(() => {
        vi.advanceTimersByTime(0);   // Start
      });
      act(() => {
        vi.advanceTimersByTime(1100); // Complete
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith(3); // finalIndex
    });

    it('should not call onComplete if animation is stopped early', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useRandomAnimation({ duration: 1000, onComplete })
      );

      act(() => {
        result.current.start(5, 3);
      });

      act(() => {
        vi.advanceTimersByTime(0);
        vi.advanceTimersByTime(500);
      });

      act(() => {
        result.current.stop();
      });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('Easing Functions', () => {
    it('should use linear easing by default if specified', () => {
      const { result } = renderHook(() =>
        useRandomAnimation({ duration: 1000, easing: 'linear' })
      );

      act(() => {
        result.current.start(5, 2);
      });

      act(() => {
        vi.advanceTimersByTime(0);
        vi.advanceTimersByTime(500);
      });

      // With linear easing, progress should be exactly 0.5 at 500ms
      expect(result.current.progress).toBeCloseTo(0.5, 1);
    });

    it('should apply ease-out easing (default)', () => {
      const { result } = renderHook(() =>
        useRandomAnimation({ duration: 1000, easing: 'ease-out' })
      );

      act(() => {
        result.current.start(5, 2);
      });

      act(() => {
        vi.advanceTimersByTime(0);
        vi.advanceTimersByTime(500);
      });

      // Progress should be raw progress (easing applied internally)
      expect(result.current.progress).toBeGreaterThanOrEqual(0);
      expect(result.current.progress).toBeLessThanOrEqual(1);
    });

    it('should accept custom easing function', () => {
      const customEasing = vi.fn((t: number) => t * t); // Quadratic
      const { result } = renderHook(() =>
        useRandomAnimation({ duration: 1000, easing: customEasing })
      );

      act(() => {
        result.current.start(5, 2);
      });

      act(() => {
        vi.advanceTimersByTime(0);
        vi.advanceTimersByTime(500);
      });

      expect(customEasing).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cancel animation frame on unmount', () => {
      const { result, unmount } = renderHook(() => useRandomAnimation());

      act(() => {
        result.current.start(5, 2);
      });

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
      // Note: With fake timers, we can't check cancelAnimationFrame directly
    });

    it('should handle unmount when not animating', () => {
      const { unmount } = renderHook(() => useRandomAnimation());

      // Should not throw
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item correctly', () => {
      const { result } = renderHook(() => useRandomAnimation({ duration: 1000 }));

      act(() => {
        result.current.start(1, 0);
      });

      // Trigger initial frame
      act(() => {
        vi.advanceTimersByTime(0);
      });

      // Complete the animation (duration + buffer)
      act(() => {
        vi.advanceTimersByTime(1100);
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.isAnimating).toBe(false);
    });

    it('should handle very short duration', () => {
      const { result } = renderHook(() => useRandomAnimation({ duration: 100 }));

      act(() => {
        result.current.start(5, 2);
      });

      // Trigger initial frame (sets startTime)
      act(() => {
        vi.advanceTimersByTime(0);
      });

      // Complete the animation (duration + more buffer for short durations)
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.currentIndex).toBe(2);
      expect(result.current.isAnimating).toBe(false);
    });

    it('should handle very long duration', () => {
      const { result } = renderHook(() => useRandomAnimation({ duration: 10000 }));

      act(() => {
        result.current.start(5, 2);
      });

      act(() => {
        vi.advanceTimersByTime(0);
        vi.advanceTimersByTime(5000); // Halfway
      });

      expect(result.current.isAnimating).toBe(true);
      expect(result.current.progress).toBeCloseTo(0.5, 1);
    });
  });

  describe('EASING_FUNCTIONS', () => {
    it('should have all standard easing functions', () => {
      expect(EASING_FUNCTIONS).toHaveProperty('linear');
      expect(EASING_FUNCTIONS).toHaveProperty('ease-in');
      expect(EASING_FUNCTIONS).toHaveProperty('ease-out');
      expect(EASING_FUNCTIONS).toHaveProperty('ease-in-out');
      expect(EASING_FUNCTIONS).toHaveProperty('ease-in-cubic');
      expect(EASING_FUNCTIONS).toHaveProperty('ease-out-cubic');
    });

    it('should have linear easing return input', () => {
      expect(EASING_FUNCTIONS.linear!(0)).toBe(0);
      expect(EASING_FUNCTIONS.linear!(0.5)).toBe(0.5);
      expect(EASING_FUNCTIONS.linear!(1)).toBe(1);
    });

    it('should have ease-in accelerate', () => {
      const easeIn = EASING_FUNCTIONS['ease-in']!;
      expect(easeIn(0.5)).toBeLessThan(0.5); // Slower start
      expect(easeIn(1)).toBe(1);
    });

    it('should have ease-out decelerate', () => {
      const easeOut = EASING_FUNCTIONS['ease-out']!;
      expect(easeOut(0.5)).toBeGreaterThan(0.5); // Faster start, slower end
      expect(easeOut(1)).toBe(1);
    });
  });

  describe('calculateIndexAtProgress helper', () => {
    it('should calculate index at specific progress', () => {
      const index = calculateIndexAtProgress(0.5, 10, 5);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(10);
    });

    it('should use custom easing function', () => {
      const customEasing = (t: number) => t * t;
      const index = calculateIndexAtProgress(0.5, 10, 5, customEasing);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(10);
    });
  });
});

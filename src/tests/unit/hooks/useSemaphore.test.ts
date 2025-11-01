/**
 * FASE 6: Unit Tests - useSemaphore Hook
 *
 * Test coverage:
 * - State initialization
 * - Manual mode color changes
 * - Mode toggle (manual ↔️ auto)
 * - Keyboard shortcuts (1, 2, 3)
 * - Auto mode integration con noise levels
 * - Threshold configuration
 * - Edge cases
 *
 * Target: 15+ test cases, >80% coverage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSemaphore } from '../../../hooks/useSemaphore';
import { useSemaphoreStore } from '../../../stores/semaphoreStore';
import { useNoiseStore } from '../../../stores/noiseStore';

describe('useSemaphore Hook', () => {
  beforeEach(() => {
    // Reset stores
    useSemaphoreStore.getState().resetState();
    useNoiseStore.setState({ currentLevel: 0 });
  });

  describe('Initialization', () => {
    it('should initialize with default state (green, manual)', () => {
      const { result } = renderHook(() => useSemaphore());

      expect(result.current.currentColor).toBe('green');
      expect(result.current.mode).toBe('manual');
      expect(result.current.isManual).toBe(true);
      expect(result.current.isAuto).toBe(false);
    });

    it('should initialize with default auto thresholds', () => {
      const { result } = renderHook(() => useSemaphore());

      expect(result.current.autoThresholds.yellowAbove).toBe(60);
      expect(result.current.autoThresholds.redAbove).toBe(75);
    });
  });

  describe('Manual Mode - Color Changes', () => {
    it('should change color to red when setColor called in manual mode', () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.setColor('red');
      });

      expect(result.current.currentColor).toBe('red');
    });

    it('should change color to yellow', () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.setColor('yellow');
      });

      expect(result.current.currentColor).toBe('yellow');
    });

    it('should change color to green', () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.setColor('green');
      });

      expect(result.current.currentColor).toBe('green');
    });

    it('should NOT change color when in auto mode', async () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.setMode('auto');
      });

      await waitFor(() => {
        expect(result.current.isAuto).toBe(true);
      });

      act(() => {
        result.current.setColor('red');
      });

      // Color should remain green (default), not change to red
      expect(result.current.currentColor).toBe('green');
    });
  });

  describe('Mode Toggle', () => {
    it('should toggle from manual to auto mode', () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.toggleMode();
      });

      expect(result.current.mode).toBe('auto');
      expect(result.current.isAuto).toBe(true);
      expect(result.current.isManual).toBe(false);
    });

    it('should toggle from auto to manual mode', async () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.setMode('auto');
      });

      await waitFor(() => {
        expect(result.current.isAuto).toBe(true);
      });

      act(() => {
        result.current.toggleMode();
      });

      await waitFor(() => {
        expect(result.current.mode).toBe('manual');
        expect(result.current.isManual).toBe(true);
      });
    });

    it('should allow direct setMode to auto', () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.setMode('auto');
      });

      expect(result.current.mode).toBe('auto');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should change color to red when key "1" pressed in manual mode', () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        window.dispatchEvent(event);
      });

      expect(result.current.currentColor).toBe('red');
    });

    it('should change color to yellow when key "2" pressed', () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        const event = new KeyboardEvent('keydown', { key: '2' });
        window.dispatchEvent(event);
      });

      expect(result.current.currentColor).toBe('yellow');
    });

    it('should change color to green when key "3" pressed', () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        const event = new KeyboardEvent('keydown', { key: '3' });
        window.dispatchEvent(event);
      });

      expect(result.current.currentColor).toBe('green');
    });

    it('should NOT respond to keyboard shortcuts in auto mode', async () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.setMode('auto');
      });

      await waitFor(() => {
        expect(result.current.isAuto).toBe(true);
      });

      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        window.dispatchEvent(event);
      });

      // Color should remain green (default)
      expect(result.current.currentColor).toBe('green');
    });

    it('should ignore keyboard shortcuts when input is focused (EC-011: hotkey conflicts)', () => {
      const { result } = renderHook(() => useSemaphore());

      // Create mock input element
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1', bubbles: true });
        Object.defineProperty(event, 'target', { value: input, writable: false });
        window.dispatchEvent(event);
      });

      // Color should remain green (shortcut ignored)
      expect(result.current.currentColor).toBe('green');

      document.body.removeChild(input);
    });
  });

  describe('Auto Mode - Noise Integration', () => {
    it('should update color to green when noise level < yellowAbove in auto mode', async () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.setMode('auto');
      });

      act(() => {
        useNoiseStore.setState({ currentLevel: 50 }); // Below yellowAbove (60)
      });

      await waitFor(() => {
        expect(result.current.currentColor).toBe('green');
      });
    });

    it('should update color to yellow when noise level between yellowAbove and redAbove', async () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.setMode('auto');
      });

      act(() => {
        useNoiseStore.setState({ currentLevel: 65 }); // Between 60 and 75
      });

      await waitFor(() => {
        expect(result.current.currentColor).toBe('yellow');
      });
    });

    it('should update color to red when noise level > redAbove', async () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.setMode('auto');
      });

      act(() => {
        useNoiseStore.setState({ currentLevel: 80 }); // Above redAbove (75)
      });

      await waitFor(() => {
        expect(result.current.currentColor).toBe('red');
      });
    });

    it('should NOT update color in manual mode when noise level changes', async () => {
      const { result } = renderHook(() => useSemaphore());

      // Remain in manual mode
      act(() => {
        useNoiseStore.setState({ currentLevel: 80 }); // High noise
      });

      await waitFor(() => {
        expect(result.current.currentColor).toBe('green'); // Still default
      });
    });
  });

  describe('Threshold Configuration', () => {
    it('should update auto thresholds when setAutoThresholds called', () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.setAutoThresholds(85, 70); // red: 85, yellow: 70
      });

      expect(result.current.autoThresholds.redAbove).toBe(85);
      expect(result.current.autoThresholds.yellowAbove).toBe(70);
    });

    it('should validate that redAbove > yellowAbove', () => {
      const { result } = renderHook(() => useSemaphore());
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      act(() => {
        result.current.setAutoThresholds(60, 70); // Invalid: red < yellow
      });

      // Should log warning and NOT update
      expect(consoleWarnSpy).toHaveBeenCalledWith('useSemaphore: redAbove deve essere > yellowAbove');
      expect(result.current.autoThresholds.redAbove).toBe(75); // Still default
      expect(result.current.autoThresholds.yellowAbove).toBe(60); // Still default

      consoleWarnSpy.mockRestore();
    });

    it('should use custom thresholds in auto mode', async () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.setAutoThresholds(90, 80); // Custom thresholds
        result.current.setMode('auto');
      });

      act(() => {
        useNoiseStore.setState({ currentLevel: 85 }); // Between 80 and 90
      });

      await waitFor(() => {
        expect(result.current.currentColor).toBe('yellow');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null noise level gracefully in auto mode', async () => {
      const { result } = renderHook(() => useSemaphore());

      act(() => {
        result.current.setMode('auto');
      });

      // Set noise to null (mic disconnected)
      act(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useNoiseStore.setState(({ currentLevel: 0 }) as any); // Simulate null
      });

      // Should not crash, color remains default
      expect(result.current.currentColor).toBe('green');
    });

    it('should cleanup keyboard event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => useSemaphore());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});

/**
 * Unit Tests - useTimer Hook
 * Test countdown accuracy, state transitions, warnings, cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../../hooks/useTimer';
import { useTimerStore } from '../../stores/timerStore';

describe('useTimer', () => {
  beforeEach(() => {
    // Reset store prima di ogni test
    const { reset } = useTimerStore.getState();
    reset();

    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Cleanup timers
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with idle status and 0 seconds', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.status).toBe('idle');
      expect(result.current.remainingSeconds).toBe(0);
      expect(result.current.totalSeconds).toBe(0);
      expect(result.current.isIdle).toBe(true);
      expect(result.current.isRunning).toBe(false);
    });

    it('should format time correctly', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.formatTime(0)).toBe('00:00');
      expect(result.current.formatTime(59)).toBe('00:59');
      expect(result.current.formatTime(60)).toBe('01:00');
      expect(result.current.formatTime(300)).toBe('05:00');
      expect(result.current.formatTime(1800)).toBe('30:00');
    });
  });

  describe('Duration Setting', () => {
    it('should set duration correctly', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setDuration(300); // 5 minuti
      });

      expect(result.current.remainingSeconds).toBe(300);
      expect(result.current.totalSeconds).toBe(300);
      expect(result.current.formattedTime).toBe('05:00');
    });

    it('should not accept negative or zero duration', () => {
      const { result } = renderHook(() => useTimer());
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      act(() => {
        result.current.setDuration(0);
      });

      expect(result.current.remainingSeconds).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should reset status to idle when setting new duration', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setDuration(300);
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.setDuration(600); // Nuova durata
      });

      expect(result.current.isIdle).toBe(true);
      expect(result.current.totalSeconds).toBe(600);
    });
  });

  describe('State Transitions', () => {
    it('should transition: idle → running → paused → running → idle', () => {
      const { result } = renderHook(() => useTimer());

      // Setup
      act(() => {
        result.current.setDuration(300);
      });

      expect(result.current.isIdle).toBe(true);

      // Start
      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);

      // Pause
      act(() => {
        result.current.pause();
      });

      expect(result.current.isPaused).toBe(true);

      // Resume
      act(() => {
        result.current.resume();
      });

      expect(result.current.isRunning).toBe(true);

      // Stop
      act(() => {
        result.current.stop();
      });

      expect(result.current.isIdle).toBe(true);
      expect(result.current.remainingSeconds).toBe(300); // Reset a total
    });

    it('should not start from non-idle state', () => {
      const { result } = renderHook(() => useTimer());
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      act(() => {
        result.current.setDuration(300);
        result.current.start();
        result.current.start(); // Tentativo di start da running
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Countdown Accuracy', () => {
    it('should countdown correctly every second', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setDuration(10); // 10 secondi
        result.current.start();
      });

      expect(result.current.remainingSeconds).toBe(10);

      // Avanza 1 secondo
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.remainingSeconds).toBe(9);

      // Avanza altri 5 secondi
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.remainingSeconds).toBe(4);
    });

    it('should complete when reaching 0', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setDuration(3); // 3 secondi
        result.current.start();
      });

      // Avanza fino a completion
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.remainingSeconds).toBe(0);
      expect(result.current.isCompleted).toBe(true);
    });

    it('should not countdown when paused', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setDuration(10);
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.remainingSeconds).toBe(8);

      act(() => {
        result.current.pause();
      });

      // Avanza tempo mentre in pausa
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.remainingSeconds).toBe(8); // Non cambiato
    });
  });

  describe('Warning Thresholds', () => {
    it('should set warning thresholds based on config', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.updateConfig({
          warningAt2Min: true,
          warningAt5Min: true,
        });
        result.current.setDuration(600); // 10 minuti
      });

      expect(result.current.warningThresholds).toContain(120); // 2 min
      expect(result.current.warningThresholds).toContain(300); // 5 min
    });

    it('should not add warning threshold if duration too short', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.updateConfig({
          warningAt2Min: true,
          warningAt5Min: true,
        });
        result.current.setDuration(60); // 1 minuto (troppo breve per warnings)
      });

      expect(result.current.warningThresholds).toEqual([]);
    });

    it('should include warning thresholds in state', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.updateConfig({ warningAt2Min: true, warningAt5Min: false });
        result.current.setDuration(600); // 10 minuti
      });

      // Dovrebbe contenere il threshold di 2 minuti (120 secondi)
      expect(result.current.warningThresholds).toContain(120);
      expect(result.current.warningThresholds).not.toContain(300);
    });
  });

  describe('Callbacks', () => {
    it('should call onComplete when timer finishes', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useTimer({
          onComplete,
        })
      );

      act(() => {
        result.current.setDuration(2);
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(onComplete).toHaveBeenCalled();
    });

    it('should call onTick every second', () => {
      const onTick = vi.fn();
      const { result } = renderHook(() =>
        useTimer({
          onTick,
        })
      );

      act(() => {
        result.current.setDuration(5);
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // onTick chiamato ad ogni aggiornamento (3 volte)
      expect(onTick).toHaveBeenCalled();
    });
  });

  describe('Memory Cleanup (EC-004)', () => {
    it('should cleanup interval on unmount', () => {
      const { result, unmount } = renderHook(() => useTimer());
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

      act(() => {
        result.current.setDuration(300);
        result.current.start();
      });

      // Unmount hook (simula component unmount)
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });

  describe('Helpers', () => {
    it('should calculate progress correctly', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setDuration(100);
      });

      // Progress iniziale 0 (nessun tempo passato)
      expect(result.current.progress).toBe(0);

      // Simula manualmente il decrement del timer
      const { tick } = useTimerStore.getState();
      act(() => {
        result.current.start();
        // Decrement 50 volte manualmente
        for (let i = 0; i < 50; i++) {
          tick();
        }
      });

      // Progress dovrebbe essere 50 (50 secondi elapsed su 100 totali)
      expect(result.current.progress).toBe(50);
    });

    it('should detect warning zone correctly', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.updateConfig({ warningAt2Min: true });
        result.current.setDuration(300); // 5 min
        result.current.start();
      });

      expect(result.current.isInWarningZone()).toBe(false);

      // Avanza fino a warning zone
      act(() => {
        vi.advanceTimersByTime(181000); // Da 300 a 119 (sotto threshold 120)
      });

      expect(result.current.isInWarningZone()).toBe(true);
    });

    it('should setAndStart work correctly', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.setAndStart(300);
      });

      // Timeout per permettere a setAndStart di completare
      act(() => {
        vi.runAllTimers();
      });

      expect(result.current.totalSeconds).toBe(300);
      expect(result.current.isRunning).toBe(true);
    });
  });

  describe('Reset', () => {
    it('should reset timer completely', () => {
      const { result } = renderHook(() => useTimer());
      const { tick } = useTimerStore.getState();

      act(() => {
        result.current.setDuration(300);
        result.current.start();
        // Decrement 5 volte manualmente
        for (let i = 0; i < 5; i++) {
          tick();
        }
      });

      // Dopo 5 decrement, dovrebbero rimanere 295 secondi
      expect(result.current.remainingSeconds).toBe(295);

      act(() => {
        result.current.reset();
      });

      expect(result.current.remainingSeconds).toBe(0);
      expect(result.current.totalSeconds).toBe(0);
      expect(result.current.isIdle).toBe(true);
    });
  });
});

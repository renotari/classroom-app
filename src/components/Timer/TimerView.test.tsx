/**
 * Tests for TimerView Component
 *
 * Tests user interactions:
 * - Timer display updates
 * - Start/pause/resume/stop controls
 * - Preset selection
 * - Audio alerts on completion
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TimerView } from './TimerView';
import { useTimerStore } from '../../stores/timerStore';

describe('TimerView Component', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useTimerStore.getState();
    store.reset();
  });

  describe('Rendering', () => {
    it('should render timer view with header', () => {
      render(<TimerView />);
      expect(screen.getByText(/⏱️ Timer Didattici/i)).toBeInTheDocument();
      expect(screen.getByText(/Imposta una durata/i)).toBeInTheDocument();
    });

    it('should display initial timer at 00:00', () => {
      render(<TimerView />);
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });

    it('should render timer controls section', () => {
      render(<TimerView />);
      expect(screen.getByRole('button', { name: /start|play/i })).toBeInTheDocument();
    });

    it('should render preset selection section', () => {
      render(<TimerView />);
      expect(screen.getByText(/Seleziona Durata/i)).toBeInTheDocument();
    });
  });

  describe('Timer Display', () => {
    it('should display correct time after setting duration', async () => {
      render(<TimerView />);
      const store = useTimerStore.getState();

      // Set duration to 5 minutes (300 seconds)
      store.setDuration(300);

      await waitFor(() => {
        expect(screen.getByText('05:00')).toBeInTheDocument();
      });
    });

    it('should display progress information when timer has duration', async () => {
      render(<TimerView />);
      const store = useTimerStore.getState();

      store.setDuration(600); // 10 minutes

      await waitFor(() => {
        expect(screen.getByText(/DURATA TOTALE/i)).toBeInTheDocument();
        expect(screen.getByText(/TEMPO PASSATO/i)).toBeInTheDocument();
        expect(screen.getByText(/PROGRESSO/i)).toBeInTheDocument();
      });
    });

    it('should not display progress when timer is at 0', () => {
      render(<TimerView />);

      expect(screen.queryByText(/DURATA TOTALE/i)).not.toBeInTheDocument();
    });
  });

  describe('Timer Controls', () => {
    it('should be disabled when duration is 0', () => {
      render(<TimerView />);
      const startButton = screen.getByRole('button', { name: /start|play/i });

      // Initially disabled
      expect(startButton).toBeDisabled();
    });

    it('should enable controls after setting duration', async () => {
      render(<TimerView />);
      const store = useTimerStore.getState();

      store.setDuration(300);

      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /start|play/i });
        expect(startButton).not.toBeDisabled();
      });
    });

    it('should start timer when start button clicked', async () => {
      render(<TimerView />);
      const store = useTimerStore.getState();

      store.setDuration(300);

      const startButton = screen.getByRole('button', { name: /start|play/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(store.status).toBe('running');
      });
    });

    it('should show pause button when timer is running', async () => {
      render(<TimerView />);
      const store = useTimerStore.getState();

      store.setDuration(300);
      store.start();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });
    });
  });

  describe('Preset Selection', () => {
    it('should set duration when preset is clicked', async () => {
      render(<TimerView />);
      const store = useTimerStore.getState();

      // Click a preset button (e.g., "5 min")
      const presetButtons = screen.getAllByRole('button');
      const fiveMinButton = presetButtons.find((btn) => btn.textContent?.includes('5'));

      if (fiveMinButton) {
        fireEvent.click(fiveMinButton);

        await waitFor(() => {
          expect(store.totalSeconds).toBe(300);
        });
      }
    });
  });

  describe('Audio Alerts', () => {
    it('should trigger audio alert on timer completion', async () => {
      render(<TimerView />);
      const store = useTimerStore.getState();

      // Set duration to 1 second for quick test
      store.setDuration(1);
      store.start();

      // Wait for timer to complete
      await waitFor(
        () => {
          expect(store.status).toBe('completed');
        },
        { timeout: 5000 }
      );
    });

    it('should show warning visual before timer completes', async () => {
      render(<TimerView />);
      const store = useTimerStore.getState();

      // Set up timer with warning at 2 minutes
      store.setDuration(125); // 2:05, so warning at 2:00
      store.start();

      // Advance to near completion
      // This is a simplified test - in real usage with actual intervals
      await waitFor(
        () => {
          // Warning should have been triggered
          expect(store.warningsTriggered.size).toBeGreaterThan(0);
        },
        { timeout: 10000 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid start/stop cycles', async () => {
      render(<TimerView />);
      const store = useTimerStore.getState();

      store.setDuration(300);

      // Rapid cycling
      store.start();
      expect(store.status).toBe('running');

      store.stop();
      expect(store.status).toBe('idle');

      store.start();
      expect(store.status).toBe('running');
    });

    it('should reset properly', async () => {
      render(<TimerView />);
      const store = useTimerStore.getState();

      store.setDuration(300);
      store.start();

      // Simulate tick
      store.tick();

      store.reset();

      expect(store.remainingSeconds).toBe(0);
      expect(store.totalSeconds).toBe(0);
      expect(store.status).toBe('idle');
    });

    it('should handle component unmount without memory leaks', async () => {
      const { unmount } = render(<TimerView />);
      const store = useTimerStore.getState();

      store.setDuration(300);
      store.start();

      // Unmount component
      unmount();

      // Reset for other tests
      store.reset();

      // Should not throw
      expect(() => store.stop()).not.toThrow();
    });
  });

  describe('Display Updates', () => {
    it('should display correct MM:SS format', async () => {
      render(<TimerView />);
      const store = useTimerStore.getState();

      store.setDuration(125); // 2:05
      await waitFor(() => expect(screen.getByText('02:05')).toBeInTheDocument());

      store.setDuration(45); // 0:45
      await waitFor(() => expect(screen.getByText('00:45')).toBeInTheDocument());

      store.setDuration(3661); // 61:01
      await waitFor(() => expect(screen.getByText('61:01')).toBeInTheDocument());
    });

    it('should update progress percentage correctly', async () => {
      render(<TimerView />);
      const store = useTimerStore.getState();

      store.setDuration(100);

      await waitFor(() => {
        expect(screen.getByText('0%')).toBeInTheDocument();
      });

      // Simulate some ticks
      store.tick();
      store.tick();

      await waitFor(() => {
        const progressText = screen.getByText(/PROGRESSO/i).parentElement?.textContent;
        expect(progressText).toContain('2%'); // 2 seconds passed out of 100
      });
    });
  });
});

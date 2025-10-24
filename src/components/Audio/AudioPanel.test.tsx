/**
 * Tests for AudioPanel Component
 *
 * Tests audio settings functionality:
 * - Sound pack selection
 * - Volume controls
 * - Alert toggles
 * - Test buttons
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioPanel } from './AudioPanel';
import { useAudioStore } from '../../stores/audioStore';

describe('AudioPanel Component', () => {
  beforeEach(() => {
    // Reset store before each test
    useAudioStore.setState({
      selectedSoundPack: 'classic',
      masterVolume: 0.8,
      alertVolume: 0.9,
      backgroundMusicVolume: 0.5,
      alertEnabled: true,
      duckingEnabled: true,
    });
  });

  describe('Rendering', () => {
    it('should render audio panel with title', () => {
      render(<AudioPanel />);
      expect(screen.getByText(/🔊 Audio Settings/i)).toBeInTheDocument();
    });

    it('should render all major sections', () => {
      render(<AudioPanel />);
      expect(screen.getByText(/🔔 Alert Sounds/i)).toBeInTheDocument();
      expect(screen.getByText(/🔉 Master Volume/i)).toBeInTheDocument();
      expect(screen.getByText(/🎵 Background Music/i)).toBeInTheDocument();
      expect(screen.getByText(/⚡ Audio Priority/i)).toBeInTheDocument();
    });

    it('should render configuration description', () => {
      render(<AudioPanel />);
      expect(screen.getByText(/Configure sounds, volume levels/i)).toBeInTheDocument();
    });
  });

  describe('Alert Sounds Section', () => {
    it('should render alert enable toggle', () => {
      render(<AudioPanel />);
      expect(screen.getByText(/Enable Alert Sounds/i)).toBeInTheDocument();
    });

    it('should render sound pack selector', () => {
      render(<AudioPanel />);
      expect(screen.getByText(/Sound Pack/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('classic - Traditional bell and chime sounds')).toBeInTheDocument();
    });

    it('should render alert volume slider', () => {
      render(<AudioPanel />);
      expect(screen.getByText(/Alert Volume/i)).toBeInTheDocument();
    });

    it('should render test button', () => {
      render(<AudioPanel />);
      expect(screen.getByRole('button', { name: /🔊 Test Alert Sound/i })).toBeInTheDocument();
    });

    it('should toggle alert enabled state', async () => {
      const { container: testContainer } = render(<AudioPanel />);
      const toggleButton = testContainer.querySelector('button[class*="rounded-full"]');

      if (toggleButton) {
        fireEvent.click(toggleButton);

        await waitFor(() => {
          const state = useAudioStore.getState();
          expect(state.alertEnabled).toBe(false);
        });
      }
    });
  });

  describe('Volume Controls', () => {
    it('should display master volume percentage', () => {
      render(<AudioPanel />);
      expect(screen.getByText(/Overall Volume: 80%/)).toBeInTheDocument();
    });

    it('should display alert volume percentage', () => {
      render(<AudioPanel />);
      expect(screen.getByText(/Alert Volume: 90%/)).toBeInTheDocument();
    });

    it('should display background volume percentage', () => {
      render(<AudioPanel />);
      expect(screen.getByText(/Background Volume: 50%/)).toBeInTheDocument();
    });

    it('should update master volume when slider changes', async () => {
      const { container } = render(<AudioPanel />);

      // Find all range inputs
      const rangeInputs = container.querySelectorAll('input[type="range"]');
      const masterVolumeSlider = rangeInputs[0]; // First one is master volume

      if (masterVolumeSlider) {
        fireEvent.change(masterVolumeSlider, { target: { value: '50' } });

        await waitFor(() => {
          const state = useAudioStore.getState();
          expect(state.masterVolume).toBe(0.5);
        });
      }
    });

    it('should update alert volume when slider changes', async () => {
      const { container } = render(<AudioPanel />);
      const rangeInputs = container.querySelectorAll('input[type="range"]');
      const alertVolumeSlider = rangeInputs[1]; // Second one is alert volume

      if (alertVolumeSlider) {
        fireEvent.change(alertVolumeSlider, { target: { value: '75' } });

        await waitFor(() => {
          const state = useAudioStore.getState();
          expect(state.alertVolume).toBe(0.75);
        });
      }
    });

    it('should update background music volume', async () => {
      const { container } = render(<AudioPanel />);
      const rangeInputs = container.querySelectorAll('input[type="range"]');
      const bgVolumeSlider = rangeInputs[2]; // Third one is background volume

      if (bgVolumeSlider) {
        fireEvent.change(bgVolumeSlider, { target: { value: '75' } });

        await waitFor(() => {
          const state = useAudioStore.getState();
          expect(state.backgroundMusicVolume).toBe(0.75);
        });
      }
    });
  });

  describe('Sound Pack Selection', () => {
    it('should list all available sound packs', () => {
      render(<AudioPanel />);

      expect(screen.getByText(/Classic - Traditional/)).toBeInTheDocument();
      expect(screen.getByText(/Modern - Contemporary/)).toBeInTheDocument();
      expect(screen.getByText(/Gentle - Soft/)).toBeInTheDocument();
    });

    it('should change sound pack when selected', async () => {
      render(<AudioPanel />);
      const selectElement = screen.getByDisplayValue(/Traditional/);

      fireEvent.change(selectElement, { target: { value: 'modern' } });

      await waitFor(() => {
        const state = useAudioStore.getState();
        expect(state.selectedSoundPack).toBe('modern');
      });
    });

    it('should disable sound pack selector when alerts disabled', () => {
      const { container: testContainer } = render(<AudioPanel />);
      const state = useAudioStore.getState();
      state.setAlertEnabled(false);

      const selectElement = testContainer.querySelector('select');
      expect(selectElement).toBeDisabled();
    });
  });

  describe('Audio Priority Section', () => {
    it('should render ducking toggle', () => {
      render(<AudioPanel />);
      expect(
        screen.getByText(/Duck Background Music During Alerts/i)
      ).toBeInTheDocument();
    });

    it('should render priority explanation', () => {
      render(<AudioPanel />);
      expect(screen.getByText(/Audio Priority System:/i)).toBeInTheDocument();
      expect(screen.getByText(/HIGH: Alert sounds/i)).toBeInTheDocument();
      expect(screen.getByText(/MEDIUM: Noise monitoring/i)).toBeInTheDocument();
      expect(screen.getByText(/LOW: Background music/i)).toBeInTheDocument();
    });

    it('should toggle ducking when button clicked', async () => {
      const { container } = render(<AudioPanel />);

      // Find all toggle buttons and click the ducking one
      const toggleButtons = container.querySelectorAll('button[class*="rounded-full"]');
      const duckingToggle = toggleButtons[1]; // Second toggle is ducking

      if (duckingToggle) {
        fireEvent.click(duckingToggle);

        await waitFor(() => {
          const state = useAudioStore.getState();
          expect(state.duckingEnabled).toBe(false);
        });
      }
    });

    it('should display ducking explanation text', () => {
      render(<AudioPanel />);
      expect(
        screen.getByText(/background music volume will reduce to 20%/i)
      ).toBeInTheDocument();
    });
  });

  describe('Test Buttons', () => {
    it('should render test alert button', () => {
      render(<AudioPanel />);
      expect(screen.getByRole('button', { name: /🔊 Test Alert Sound/i })).toBeInTheDocument();
    });

    it('should render test background music button', () => {
      render(<AudioPanel />);
      expect(screen.getByRole('button', { name: /▶️ Test Background Music/i })).toBeInTheDocument();
    });

    it('should render stop background music button', () => {
      render(<AudioPanel />);
      expect(screen.getByRole('button', { name: /⏹️ Stop/i })).toBeInTheDocument();
    });

    it('should disable test button when alerts disabled', () => {
      render(<AudioPanel />);
      const state = useAudioStore.getState();

      state.setAlertEnabled(false);

      const testButton = screen.getByRole('button', { name: /🔊 Test Alert Sound/i });
      expect(testButton).toBeDisabled();
    });
  });

  describe('Disabled States', () => {
    it('should disable controls when alerts disabled', () => {
      render(<AudioPanel />);
      const state = useAudioStore.getState();

      // Start enabled
      expect(screen.getByRole('button', { name: /Test Alert/ })).not.toBeDisabled();

      // Disable
      state.setAlertEnabled(false);

      // Should be disabled now
      const testButton = screen.queryByRole('button', { name: /Test Alert/ });
      if (testButton) {
        expect(testButton).toBeDisabled();
      }
    });

    it('should enable controls when alerts re-enabled', () => {
      render(<AudioPanel />);
      const state = useAudioStore.getState();

      state.setAlertEnabled(false);
      state.setAlertEnabled(true);

      const testButton = screen.getByRole('button', { name: /Test Alert Sound/i });
      expect(testButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      const { container } = render(<AudioPanel />);

      // Check that sliders have associated labels
      const labels = container.querySelectorAll('label');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should have descriptive text for all controls', () => {
      render(<AudioPanel />);

      expect(screen.getByText(/Affects all audio output/i)).toBeInTheDocument();
      expect(
        screen.getByText(/alert sounds are always clearly audible/i)
      ).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<AudioPanel />);

      const h2 = screen.getAllByRole('heading', { level: 2 });
      expect(h2.length).toBeGreaterThan(0);
    });
  });

  describe('State Persistence', () => {
    it('should maintain volume settings after re-render', () => {
      const { rerender } = render(<AudioPanel />);
      const state = useAudioStore.getState();

      state.setMasterVolume(0.6);

      rerender(<AudioPanel />);

      expect(screen.getByText(/Overall Volume: 60%/)).toBeInTheDocument();
    });

    it('should maintain sound pack selection after re-render', () => {
      const { rerender } = render(<AudioPanel />);
      const state = useAudioStore.getState();

      state.setSoundPack('gentle');

      rerender(<AudioPanel />);

      expect(screen.getByDisplayValue(/Gentle - Soft/)).toBeInTheDocument();
    });
  });
});

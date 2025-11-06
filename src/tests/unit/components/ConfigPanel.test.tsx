/**
 * ConfigPanel Component - Unit Tests
 *
 * Tests for:
 * - Exclude absent toggle
 * - Exclude recent count slider
 * - Store integration
 * - Accessibility attributes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { ConfigPanel } from '../../../components/RandomStudent/ConfigPanel';
import { useRandomStudentStore } from '../../../stores/randomStudentStore';

describe('ConfigPanel', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useRandomStudentStore.getState().resetState();
    });
  });

  describe('Rendering', () => {
    it('should render configuration title', () => {
      render(<ConfigPanel />);

      expect(screen.getByText('Configurazione')).toBeInTheDocument();
    });

    it('should render exclude absent toggle', () => {
      render(<ConfigPanel />);

      expect(screen.getByText('Escludi assenti')).toBeInTheDocument();
      expect(
        screen.getByText('Non selezionare studenti segnati come assenti')
      ).toBeInTheDocument();
    });

    it('should render exclude recent count slider', () => {
      render(<ConfigPanel />);

      expect(screen.getByText('Evita selezioni recenti')).toBeInTheDocument();
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });
  });

  describe('Exclude Absent Toggle', () => {
    it('should show toggle in correct initial state', () => {
      render(<ConfigPanel />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true'); // Default is true
    });

    it('should toggle exclude absent when clicked', async () => {
      const user = userEvent.setup();
      render(<ConfigPanel />);

      const toggle = screen.getByRole('switch');
      const initialState = useRandomStudentStore.getState().config.excludeAbsent;

      await user.click(toggle);

      const newState = useRandomStudentStore.getState().config.excludeAbsent;
      expect(newState).toBe(!initialState);
    });

    it('should update store when toggled multiple times', async () => {
      const user = userEvent.setup();
      render(<ConfigPanel />);

      const toggle = screen.getByRole('switch');

      await user.click(toggle);
      expect(useRandomStudentStore.getState().config.excludeAbsent).toBe(false);

      await user.click(toggle);
      expect(useRandomStudentStore.getState().config.excludeAbsent).toBe(true);
    });
  });

  describe('Exclude Recent Count Slider', () => {
    it('should show current value in display', () => {
      render(<ConfigPanel />);

      // Default is 5
      expect(screen.getByText('Ultime 5')).toBeInTheDocument();
    });

    it('should show "Disabilitato" when count is 0', async () => {
      // Set count to 0
      act(() => {
        useRandomStudentStore.getState().updateConfig({ excludeRecentCount: 0 });
      });

      render(<ConfigPanel />);

      expect(screen.getByText('Disabilitato')).toBeInTheDocument();
    });

    it('should have correct slider attributes', () => {
      render(<ConfigPanel />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '10');
      expect(slider).toHaveAttribute('aria-valuenow', '5'); // Default value
    });

    it('should update store when slider value changes', () => {
      render(<ConfigPanel />);

      const slider = screen.getByRole('slider');

      // Simulate slider value change using fireEvent
      fireEvent.change(slider, { target: { value: '7' } });

      const config = useRandomStudentStore.getState().config;
      expect(config.excludeRecentCount).toBe(7);
    });

    it('should show range labels (0, 5, 10)', () => {
      const { container } = render(<ConfigPanel />);

      const labels = container.querySelectorAll('span');
      const labelTexts = Array.from(labels).map((label) => label.textContent);

      expect(labelTexts).toContain('0');
      expect(labelTexts).toContain('5');
      expect(labelTexts).toContain('10');
    });
  });

  describe('Accessibility', () => {
    it('should have role="group" with label', () => {
      const { container } = render(<ConfigPanel />);

      const group = container.querySelector('[role="group"]');
      expect(group).toBeInTheDocument();
      expect(group).toHaveAttribute('aria-label', 'Configurazione selezione casuale');
    });

    it('should have accessible slider label', () => {
      render(<ConfigPanel />);

      const slider = screen.getByLabelText('Numero di selezioni recenti da evitare');
      expect(slider).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<ConfigPanel className="custom-class" />);

      const panel = container.querySelector('.custom-class');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('Store Integration', () => {
    it('should reflect store state changes', () => {
      const { rerender } = render(<ConfigPanel />);

      expect(screen.getByText('Ultime 5')).toBeInTheDocument();

      // Update store
      act(() => {
        useRandomStudentStore.getState().updateConfig({ excludeRecentCount: 3 });
      });

      rerender(<ConfigPanel />);

      expect(screen.getByText('Ultime 3')).toBeInTheDocument();
    });
  });
});

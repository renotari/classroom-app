/**
 * HistoryPanel Component - Unit Tests
 *
 * Tests for:
 * - Empty state display
 * - History list rendering
 * - Clear history button
 * - Student name resolution
 * - maxEntries limitation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { HistoryPanel } from '../../../components/RandomStudent/HistoryPanel';
import { useRandomStudentStore } from '../../../stores/randomStudentStore';
import { useClassStore } from '../../../stores/classStore';

describe('HistoryPanel', () => {
  beforeEach(() => {
    // Reset stores before each test
    act(() => {
      useRandomStudentStore.getState().resetState();
      useClassStore.getState().resetState();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no history', () => {
      render(<HistoryPanel />);

      expect(
        screen.getByText('Nessuna selezione ancora effettuata')
      ).toBeInTheDocument();
    });

    it('should not show clear button when empty', () => {
      render(<HistoryPanel />);

      expect(screen.queryByText('Cancella')).not.toBeInTheDocument();
    });
  });

  describe('History List Rendering', () => {
    beforeEach(() => {
      // Setup class with students
      act(() => {
        const classId = useClassStore.getState().createClass('Test Class');
        useClassStore.getState().addStudent(classId, {
          id: 'student-1',
          name: 'Alice',
          absent: false,
        });
        useClassStore.getState().addStudent(classId, {
          id: 'student-2',
          name: 'Bob',
          absent: false,
        });
        useClassStore.getState().addStudent(classId, {
          id: 'student-3',
          name: 'Charlie',
          absent: false,
        });
      });
    });

    it('should render history entries with student names', () => {
      // Add history entries
      act(() => {
        const store = useRandomStudentStore.getState();
        store.updateConfig({ excludeAbsent: false });
        // Manually set history
        useRandomStudentStore.setState({
          history: ['student-1', 'student-2', 'student-3'],
        });
      });

      render(<HistoryPanel />);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should show order badges (1, 2, 3...)', () => {
      act(() => {
        useRandomStudentStore.setState({
          history: ['student-1', 'student-2'],
        });
      });

      const { container } = render(<HistoryPanel />);

      const badges = container.querySelectorAll('[aria-label*="Selezione numero"]');
      expect(badges.length).toBeGreaterThanOrEqual(2);
    });

    it('should highlight most recent selection', () => {
      act(() => {
        useRandomStudentStore.setState({
          history: ['student-1', 'student-2'],
        });
      });

      render(<HistoryPanel />);

      expect(screen.getByText('Recente')).toBeInTheDocument();
    });

    it('should show "Studente sconosciuto" for missing student IDs', () => {
      act(() => {
        useRandomStudentStore.setState({
          history: ['unknown-id'],
        });
      });

      render(<HistoryPanel />);

      expect(screen.getByText('Studente sconosciuto')).toBeInTheDocument();
    });
  });

  describe('Clear History Button', () => {
    beforeEach(() => {
      act(() => {
        useRandomStudentStore.setState({
          history: ['student-1', 'student-2'],
        });
      });
    });

    it('should show clear button when history exists', () => {
      render(<HistoryPanel />);

      expect(screen.getByText('Cancella')).toBeInTheDocument();
    });

    it('should clear history when button clicked', async () => {
      const user = userEvent.setup();
      render(<HistoryPanel />);

      const clearButton = screen.getByText('Cancella');
      await user.click(clearButton);

      const history = useRandomStudentStore.getState().history;
      expect(history).toHaveLength(0);
    });

    it('should show empty state after clearing', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<HistoryPanel />);

      const clearButton = screen.getByText('Cancella');
      await user.click(clearButton);

      rerender(<HistoryPanel />);

      expect(
        screen.getByText('Nessuna selezione ancora effettuata')
      ).toBeInTheDocument();
    });
  });

  describe('maxEntries Prop', () => {
    beforeEach(() => {
      act(() => {
        // Create history with 15 entries
        const historyEntries = Array.from({ length: 15 }, (_, i) => `student-${i}`);
        useRandomStudentStore.setState({
          history: historyEntries,
        });
      });
    });

    it('should limit displayed entries to maxEntries', () => {
      const { container } = render(<HistoryPanel maxEntries={5} />);

      const listItems = container.querySelectorAll('li');
      expect(listItems.length).toBe(5);
    });

    it('should show "Mostrando X di Y" when history exceeds maxEntries', () => {
      render(<HistoryPanel maxEntries={10} />);

      expect(screen.getByText(/Mostrando 10 di 15 selezioni/i)).toBeInTheDocument();
    });

    it('should not show count message when history fits in maxEntries', () => {
      act(() => {
        useRandomStudentStore.setState({
          history: ['student-1', 'student-2'],
        });
      });

      render(<HistoryPanel maxEntries={10} />);

      expect(screen.queryByText(/Mostrando/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="region" with label', () => {
      const { container } = render(<HistoryPanel />);

      const region = container.querySelector('[role="region"]');
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute('aria-label', 'Cronologia selezioni');
    });

    it('should have accessible list label', () => {
      act(() => {
        useRandomStudentStore.setState({
          history: ['student-1'],
        });
      });

      const { container } = render(<HistoryPanel />);

      const list = container.querySelector('[aria-label="Lista selezioni recenti"]');
      expect(list).toBeInTheDocument();
    });

    it('should have accessible clear button label', () => {
      act(() => {
        useRandomStudentStore.setState({
          history: ['student-1'],
        });
      });

      render(<HistoryPanel />);

      const clearButton = screen.getByLabelText('Cancella cronologia');
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<HistoryPanel className="custom-class" />);

      const panel = container.querySelector('.custom-class');
      expect(panel).toBeInTheDocument();
    });
  });
});

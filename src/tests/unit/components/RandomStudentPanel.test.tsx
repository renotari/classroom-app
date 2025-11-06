/**
 * RandomStudentPanel Component - Integration Tests
 *
 * Tests for:
 * - No active class warning
 * - No students warning
 * - Full selection flow
 * - Error handling
 * - Animation integration
 * - Component integration (all sub-components together)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { RandomStudentPanel } from '../../../components/RandomStudent/RandomStudentPanel';
import { useRandomStudentStore } from '../../../stores/randomStudentStore';
import { useClassStore } from '../../../stores/classStore';

describe('RandomStudentPanel', () => {
  beforeEach(() => {
    // Reset stores before each test
    act(() => {
      useRandomStudentStore.getState().resetState();
      useClassStore.getState().resetState();
    });
  });

  describe('No Active Class Warning', () => {
    it('should show warning when no active class', () => {
      render(<RandomStudentPanel />);

      expect(screen.getByText('Nessuna classe attiva')).toBeInTheDocument();
      expect(
        screen.getByText(/Seleziona o crea una classe nella sezione "Classi"/i)
      ).toBeInTheDocument();
    });

    it('should not show select button when no active class', () => {
      render(<RandomStudentPanel />);

      expect(screen.queryByText('Seleziona Studente')).not.toBeInTheDocument();
    });
  });

  describe('No Students Warning', () => {
    beforeEach(() => {
      act(() => {
        useClassStore.getState().createClass('Empty Class');
      });
    });

    it('should show warning when class has no students', () => {
      render(<RandomStudentPanel />);

      expect(screen.getByText('Nessuno studente nella classe')).toBeInTheDocument();
      expect(
        screen.getByText(/Aggiungi studenti alla classe per poter effettuare selezioni/i)
      ).toBeInTheDocument();
    });

    it('should not show select button when no students', () => {
      render(<RandomStudentPanel />);

      expect(screen.queryByText('Seleziona Studente')).not.toBeInTheDocument();
    });
  });

  describe('Full Component Rendering', () => {
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

    it('should render all sub-components when class has students', () => {
      render(<RandomStudentPanel />);

      // StudentDisplay
      expect(screen.getByText('Clicca per selezionare')).toBeInTheDocument();

      // SelectButton
      expect(screen.getByText('Seleziona Studente')).toBeInTheDocument();

      // ConfigPanel
      expect(screen.getByText('Configurazione')).toBeInTheDocument();

      // HistoryPanel
      expect(screen.getByText('Cronologia')).toBeInTheDocument();
    });

    it('should have select button enabled when students exist', () => {
      render(<RandomStudentPanel />);

      const button = screen.getByText('Seleziona Studente');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Selection Flow', () => {
    beforeEach(() => {
      // Setup class with students
      act(() => {
        const classId = useClassStore.getState().createClass('Test Class');
        ['Alice', 'Bob', 'Charlie'].forEach((name, i) => {
          useClassStore.getState().addStudent(classId, {
            id: `student-${i + 1}`,
            name,
            absent: false,
          });
        });
      });
    });

    it('should trigger selection when button clicked', async () => {
      const user = userEvent.setup();
      render(<RandomStudentPanel />);

      const initialHistory = useRandomStudentStore.getState().history;
      expect(initialHistory).toHaveLength(0);

      const button = screen.getByText('Seleziona Studente');
      await user.click(button);

      // Should update history after selection (async)
      await waitFor(() => {
        const updatedHistory = useRandomStudentStore.getState().history;
        expect(updatedHistory.length).toBeGreaterThan(0);
      });
    });

    it('should show selected student name during or after selection', async () => {
      const user = userEvent.setup();
      render(<RandomStudentPanel />);

      const button = screen.getByText('Seleziona Studente');
      await user.click(button);

      // Either animation is running or complete
      await waitFor(() => {
        const hasName =
          screen.queryByText('Alice') ||
          screen.queryByText('Bob') ||
          screen.queryByText('Charlie');
        expect(hasName).toBeInTheDocument();
      });
    });

    it('should have selected student in store after selection', async () => {
      const user = userEvent.setup();
      render(<RandomStudentPanel />);

      const button = screen.getByText('Seleziona Studente');
      await user.click(button);

      // Wait for selection to complete
      await waitFor(() => {
        const selectedStudent = useRandomStudentStore.getState().selectedStudent;
        expect(selectedStudent).not.toBeNull();
        expect(selectedStudent?.name).toMatch(/Alice|Bob|Charlie/);
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      act(() => {
        const classId = useClassStore.getState().createClass('Test Class');
        useClassStore.getState().addStudent(classId, {
          id: 'student-1',
          name: 'Alice',
          absent: false,
        });
      });
    });

    it('should show error message when selection fails', async () => {
      const user = userEvent.setup();

      // Mock selectRandom to throw error
      const originalSelectRandom = useRandomStudentStore.getState().selectRandom;
      act(() => {
        useRandomStudentStore.setState({
          selectRandom: vi.fn().mockRejectedValue(new Error('Test error')),
        });
      });

      render(<RandomStudentPanel />);

      const button = screen.getByText('Seleziona Studente');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });

      // Restore original function
      act(() => {
        useRandomStudentStore.setState({ selectRandom: originalSelectRandom });
      });
    });

  });

  describe('Configuration Integration', () => {
    beforeEach(() => {
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
      });
    });

    it('should render config panel with exclude absent toggle', () => {
      render(<RandomStudentPanel />);

      // excludeAbsent toggle should be present
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveAttribute('aria-checked', 'true'); // Default is true
    });
  });

  describe('Development Mode', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      act(() => {
        const classId = useClassStore.getState().createClass('Test Class');
        useClassStore.getState().addStudent(classId, {
          id: 'student-1',
          name: 'Alice',
          absent: false,
        });
      });
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should show debug info in development mode', () => {
      process.env.NODE_ENV = 'development';
      const { container } = render(<RandomStudentPanel />);

      const debugInfo = container.querySelector('details');
      expect(debugInfo).toBeInTheDocument();
    });

    it('should not show debug info in production mode', () => {
      process.env.NODE_ENV = 'production';
      const { container } = render(<RandomStudentPanel />);

      const debugInfo = container.querySelector('details');
      expect(debugInfo).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<RandomStudentPanel className="custom-class" />);

      const panel = container.querySelector('.custom-class');
      expect(panel).toBeInTheDocument();
    });
  });
});

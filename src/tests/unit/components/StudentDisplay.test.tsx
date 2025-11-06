/**
 * StudentDisplay Component - Unit Tests
 *
 * Tests for:
 * - Empty state display
 * - Animating state display
 * - Selected state display
 * - Absent student indicator
 * - Accessibility attributes
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudentDisplay } from '../../../components/RandomStudent/StudentDisplay';
import type { Student } from '../../../stores/classStore';

// Test fixtures
const mockStudents: Student[] = [
  { id: '1', name: 'Alice', absent: false },
  { id: '2', name: 'Bob', absent: false },
  { id: '3', name: 'Charlie', absent: true },
];

describe('StudentDisplay', () => {
  describe('Empty State', () => {
    it('should show empty state when no student selected and not animating', () => {
      render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={0}
          isAnimating={false}
          finalStudent={null}
        />
      );

      expect(screen.getByText('Clicca per selezionare')).toBeInTheDocument();
    });

    it('should have reduced font size for empty state', () => {
      const { container } = render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={0}
          isAnimating={false}
          finalStudent={null}
        />
      );

      const display = container.querySelector('[class*="text-4xl"]');
      expect(display).toBeInTheDocument();
    });
  });

  describe('Animating State', () => {
    it('should show current student name during animation', () => {
      render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={1}
          isAnimating={true}
          finalStudent={null}
        />
      );

      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should show "Selezione in corso..." status during animation', () => {
      render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={0}
          isAnimating={true}
          finalStudent={null}
        />
      );

      expect(screen.getByText(/Selezione in corso.../i)).toBeInTheDocument();
    });

    it('should apply blur effect during animation', () => {
      const { container } = render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={0}
          isAnimating={true}
          finalStudent={null}
        />
      );

      const display = container.querySelector('[class*="blur"]');
      expect(display).toBeInTheDocument();
    });
  });

  describe('Selected State', () => {
    it('should show final student name after selection', () => {
      render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={0}
          isAnimating={false}
          finalStudent={mockStudents[0]}
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should show "✓ Selezionato!" status after selection', () => {
      render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={0}
          isAnimating={false}
          finalStudent={mockStudents[1]}
        />
      );

      expect(screen.getByText(/✓ Selezionato!/i)).toBeInTheDocument();
    });

    it('should show absent indicator for absent student', () => {
      render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={2}
          isAnimating={false}
          finalStudent={mockStudents[2]}
        />
      );

      expect(screen.getByText('Charlie')).toBeInTheDocument();
      expect(screen.getByText('Assente')).toBeInTheDocument();
    });

    it('should apply accent border for selected state', () => {
      const { container } = render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={0}
          isAnimating={false}
          finalStudent={mockStudents[0]}
        />
      );

      const display = container.querySelector('[class*="border-accent"]');
      expect(display).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="status" for screen readers', () => {
      const { container } = render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={0}
          isAnimating={false}
          finalStudent={null}
        />
      );

      const status = container.querySelector('[role="status"]');
      expect(status).toBeInTheDocument();
    });

    it('should have aria-live="polite" for dynamic updates', () => {
      const { container } = render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={0}
          isAnimating={false}
          finalStudent={null}
        />
      );

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it('should have aria-atomic="true" for complete announcements', () => {
      const { container } = render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={0}
          isAnimating={false}
          finalStudent={null}
        />
      );

      const atomic = container.querySelector('[aria-atomic="true"]');
      expect(atomic).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty students array gracefully', () => {
      render(
        <StudentDisplay
          students={[]}
          currentIndex={0}
          isAnimating={false}
          finalStudent={null}
        />
      );

      expect(screen.getByText('Clicca per selezionare')).toBeInTheDocument();
    });

    it('should handle currentIndex out of bounds', () => {
      render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={99}
          isAnimating={true}
          finalStudent={null}
        />
      );

      // Should not crash, might show empty or first student
      expect(screen.queryByText(/Selezione in corso/i)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <StudentDisplay
          students={mockStudents}
          currentIndex={0}
          isAnimating={false}
          finalStudent={null}
          className="custom-class"
        />
      );

      const display = container.querySelector('.custom-class');
      expect(display).toBeInTheDocument();
    });
  });
});

/**
 * StudentDisplay Component
 *
 * Large animated display showing student name during random selection.
 * Features:
 * - Large font (96px) for classroom visibility
 * - Smooth transitions between names during animation
 * - Pulse effect on final selection
 * - Empty state when no selection
 *
 * @module StudentDisplay
 */

import React from 'react';
import type { Student } from '../../stores/classStore';

export interface StudentDisplayProps {
  /** Array of all students in the class */
  students: Student[];
  /** Current index being displayed during animation */
  currentIndex: number;
  /** Whether animation is currently running */
  isAnimating: boolean;
  /** Final selected student (null during animation or no selection) */
  finalStudent: Student | null;
  /** Optional CSS class name */
  className?: string;
}

/**
 * StudentDisplay Component
 *
 * Displays student name in large format during random selection animation.
 * Shows cycling names during animation, then reveals final selection.
 *
 * @example
 * ```tsx
 * <StudentDisplay
 *   students={classStudents}
 *   currentIndex={currentIndex}
 *   isAnimating={isAnimating}
 *   finalStudent={selectedStudent}
 * />
 * ```
 */
export function StudentDisplay({
  students,
  currentIndex,
  isAnimating,
  finalStudent,
  className = '',
}: StudentDisplayProps): React.ReactElement {
  // Determine what to display
  let displayName = '';
  let displayState: 'empty' | 'animating' | 'selected' = 'empty';

  if (isAnimating && students.length > 0) {
    // During animation: show cycling name
    const currentStudent = students[currentIndex];
    displayName = currentStudent?.name || '';
    displayState = 'animating';
  } else if (finalStudent) {
    // After animation: show final selection
    displayName = finalStudent.name;
    displayState = 'selected';
  } else {
    // No selection yet
    displayName = 'Clicca per selezionare';
    displayState = 'empty';
  }

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        min-h-[300px] p-8 rounded-xl
        bg-surface border-2
        ${displayState === 'selected' ? 'border-accent' : 'border-transparent'}
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Main Display */}
      <div
        className={`
          text-center font-bold transition-all duration-300
          ${displayState === 'empty' ? 'text-text-secondary text-4xl' : 'text-text-primary text-6xl sm:text-7xl md:text-8xl'}
          ${displayState === 'selected' ? 'animate-pulse-once' : ''}
          ${isAnimating ? 'blur-[1px]' : 'blur-0'}
        `}
      >
        {displayName}
      </div>

      {/* Status Indicator */}
      {displayState !== 'empty' && (
        <div className="mt-6 text-lg text-text-secondary">
          {isAnimating ? (
            <span className="animate-pulse">Selezione in corso...</span>
          ) : (
            <span className="text-accent font-semibold">✓ Selezionato!</span>
          )}
        </div>
      )}

      {/* Student Info (final selection only) */}
      {displayState === 'selected' && finalStudent && (
        <div className="mt-4 text-sm text-text-secondary">
          {finalStudent.absent && (
            <span className="px-3 py-1 rounded-full bg-error/20 text-error">
              Assente
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Add pulse-once animation to Tailwind config if not already present
// @keyframes pulse-once {
//   0%, 100% { opacity: 1; transform: scale(1); }
//   50% { opacity: 0.8; transform: scale(1.05); }
// }

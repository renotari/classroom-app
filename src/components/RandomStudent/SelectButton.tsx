/**
 * SelectButton Component
 *
 * Large touch-friendly button to trigger random student selection.
 * Features:
 * - Minimum 200px × 80px for touch optimization
 * - Clear disabled state
 * - Loading indicator during animation
 * - Icon + text for clarity
 *
 * @module SelectButton
 */

import React from 'react';

export interface SelectButtonProps {
  /** Callback when button is clicked */
  onClick: () => void;
  /** Whether button is disabled (no students, or animation running) */
  disabled?: boolean;
  /** Whether animation is currently running */
  isAnimating?: boolean;
  /** Optional CSS class name */
  className?: string;
}

/**
 * SelectButton Component
 *
 * Primary action button for triggering random student selection.
 *
 * @example
 * ```tsx
 * <SelectButton
 *   onClick={handleSelect}
 *   disabled={students.length === 0}
 *   isAnimating={isAnimating}
 * />
 * ```
 */
export function SelectButton({
  onClick,
  disabled = false,
  isAnimating = false,
  className = '',
}: SelectButtonProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-3
        min-w-[200px] min-h-[80px] px-8 py-4
        text-xl font-semibold
        rounded-xl transition-all duration-200
        ${
          disabled
            ? 'bg-surface text-text-disabled cursor-not-allowed opacity-50'
            : 'bg-primary text-white hover:bg-primary/90 active:scale-95 shadow-lg hover:shadow-xl'
        }
        ${className}
      `}
      aria-label="Seleziona studente casuale"
      aria-busy={isAnimating}
    >
      {/* Icon */}
      {isAnimating ? (
        <svg
          className="w-6 h-6 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}

      {/* Text */}
      <span>{isAnimating ? 'Selezione...' : 'Seleziona Studente'}</span>
    </button>
  );
}

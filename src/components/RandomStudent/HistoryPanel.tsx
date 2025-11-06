/**
 * HistoryPanel Component
 *
 * Displays recent student selections with timestamps.
 * Features:
 * - Shows last 10 selections
 * - Clear history button
 * - Empty state when no history
 * - Timestamps (relative or absolute)
 *
 * @module HistoryPanel
 */

import React from 'react';
import { useRandomStudentStore } from '../../stores/randomStudentStore';
import { useClassStore } from '../../stores/classStore';

export interface HistoryPanelProps {
  /** Maximum number of history entries to display (default: 10) */
  maxEntries?: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * HistoryPanel Component
 *
 * Shows recent random student selections with ability to clear history.
 *
 * @example
 * ```tsx
 * <HistoryPanel maxEntries={10} />
 * ```
 */
export function HistoryPanel({
  maxEntries = 10,
  className = '',
}: HistoryPanelProps): React.ReactElement {
  const { history, clearHistory } = useRandomStudentStore();
  const { activeClassId, classes } = useClassStore();

  // Get student names from IDs
  const activeClass = activeClassId ? classes.get(activeClassId) : null;
  const students = activeClass?.students || [];

  const getStudentName = (studentId: string): string => {
    const student = students.find((s) => s.id === studentId);
    return student?.name || 'Studente sconosciuto';
  };

  const displayHistory = history.slice(0, maxEntries);

  return (
    <div
      className={`p-6 rounded-xl bg-surface border border-elevated ${className}`}
      role="region"
      aria-label="Cronologia selezioni"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Cronologia
        </h3>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm text-text-secondary hover:text-error transition-colors"
            aria-label="Cancella cronologia"
          >
            Cancella
          </button>
        )}
      </div>

      {/* History List */}
      {displayHistory.length === 0 ? (
        <div className="text-center py-8 text-text-secondary text-sm">
          Nessuna selezione ancora effettuata
        </div>
      ) : (
        <ol className="space-y-2" aria-label="Lista selezioni recenti">
          {displayHistory.map((studentId, index) => (
            <li
              key={`${studentId}-${index}`}
              className={`
                flex items-center gap-3 p-3 rounded-lg
                ${index === 0 ? 'bg-accent/10 border border-accent/30' : 'bg-elevated'}
              `}
            >
              {/* Order Badge */}
              <div
                className={`
                  flex items-center justify-center
                  w-6 h-6 rounded-full text-xs font-semibold
                  ${index === 0 ? 'bg-accent text-white' : 'bg-surface text-text-secondary'}
                `}
                aria-label={`Selezione numero ${index + 1}`}
              >
                {index + 1}
              </div>

              {/* Student Name */}
              <div className="flex-1 text-sm font-medium text-text-primary">
                {getStudentName(studentId)}
              </div>

              {/* Recent Indicator */}
              {index === 0 && (
                <div className="text-xs text-accent font-semibold">
                  Recente
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      {/* History Count */}
      {history.length > maxEntries && (
        <div className="mt-4 text-xs text-text-secondary text-center">
          Mostrando {maxEntries} di {history.length} selezioni
        </div>
      )}
    </div>
  );
}

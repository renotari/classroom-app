/**
 * RandomStudentPanel Component
 *
 * Main container for random student selection feature.
 * Integrates:
 * - StudentDisplay (large animated display)
 * - SelectButton (trigger selection)
 * - ConfigPanel (settings)
 * - HistoryPanel (recent selections)
 * - Animation system (useRandomAnimation)
 * - State management (randomStudentStore)
 *
 * @module RandomStudentPanel
 */

import React, { useState } from 'react';
import { useRandomStudentStore } from '../../stores/randomStudentStore';
import { useClassStore } from '../../stores/classStore';
import { useRandomAnimation } from '../../hooks/useRandomAnimation';
import { StudentDisplay } from './StudentDisplay';
import { SelectButton } from './SelectButton';
import { ConfigPanel } from './ConfigPanel';
import { HistoryPanel } from './HistoryPanel';

export interface RandomStudentPanelProps {
  /** Optional CSS class name */
  className?: string;
}

/**
 * RandomStudentPanel Component
 *
 * Complete UI for random student selection feature with animation,
 * configuration, and history tracking.
 *
 * @example
 * ```tsx
 * <RandomStudentPanel />
 * ```
 */
export function RandomStudentPanel({
  className = '',
}: RandomStudentPanelProps): React.ReactElement {
  // State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stores
  const { selectRandom, selectedStudent, setAnimating } = useRandomStudentStore();
  const { activeClassId, classes } = useClassStore();

  // Get active class students
  const activeClass = activeClassId ? classes.get(activeClassId) : null;
  const students = activeClass?.students || [];

  // Animation hook
  const { isAnimating, currentIndex, start } = useRandomAnimation({
    duration: 2000,
    easing: 'ease-out',
    onStart: () => {
      setAnimating(true);
      setErrorMessage(null);
    },
    onComplete: () => {
      setAnimating(false);
    },
  });

  /**
   * Handle selection button click
   */
  const handleSelect = async () => {
    // Clear previous error
    setErrorMessage(null);

    try {
      // Perform selection (updates store)
      await selectRandom();

      // Get selected student from store
      const result = useRandomStudentStore.getState().selectionResult;
      if (!result) {
        throw new Error('Selezione fallita: nessun risultato');
      }

      // Find index of selected student for animation
      const targetIndex = students.findIndex((s) => s.id === result.student.id);
      if (targetIndex === -1) {
        throw new Error('Studente selezionato non trovato nella classe');
      }

      // Start animation
      start(students.length, targetIndex);
    } catch (err) {
      // Handle errors gracefully
      const message = err instanceof Error ? err.message : 'Errore durante la selezione';
      setErrorMessage(message);
      setAnimating(false);
    }
  };

  // Check if selection is possible
  const canSelect = students.length > 0 && !isAnimating;

  return (
    <div className={`flex flex-col gap-6 p-6 ${className}`}>
      {/* No Active Class Warning */}
      {!activeClassId && (
        <div
          className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-warning"
          role="alert"
        >
          <div className="font-semibold mb-1">Nessuna classe attiva</div>
          <div className="text-sm">
            Seleziona o crea una classe nella sezione "Classi" per utilizzare questa funzione.
          </div>
        </div>
      )}

      {/* No Students Warning */}
      {activeClassId && students.length === 0 && (
        <div
          className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-warning"
          role="alert"
        >
          <div className="font-semibold mb-1">Nessuno studente nella classe</div>
          <div className="text-sm">
            Aggiungi studenti alla classe per poter effettuare selezioni casuali.
          </div>
        </div>
      )}

      {/* Main Content */}
      {activeClassId && students.length > 0 && (
        <>
          {/* Student Display */}
          <StudentDisplay
            students={students}
            currentIndex={currentIndex}
            isAnimating={isAnimating}
            finalStudent={selectedStudent}
          />

          {/* Error Message */}
          {errorMessage && (
            <div
              className="p-4 rounded-lg bg-error/10 border border-error/30 text-error"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <SelectButton
              onClick={handleSelect}
              disabled={!canSelect}
              isAnimating={isAnimating}
            />
          </div>

          {/* Two Column Layout: Config + History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConfigPanel />
            <HistoryPanel maxEntries={10} />
          </div>
        </>
      )}

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && students.length > 0 && (
        <details className="text-xs text-text-secondary p-4 bg-surface rounded-lg">
          <summary className="cursor-pointer font-semibold">Debug Info</summary>
          <div className="mt-2 space-y-1 font-mono">
            <div>Studenti totali: {students.length}</div>
            <div>Indice corrente: {currentIndex}</div>
            <div>In animazione: {isAnimating ? 'Sì' : 'No'}</div>
            <div>
              Studente selezionato: {selectedStudent?.name || 'Nessuno'}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}

/**
 * TimerControls Component
 * Bottoni per controllare il timer: Start, Pause, Stop, Reset
 */

import React from 'react';
import type { TimerControlsProps } from '../../types/timer.types';

export const TimerControls: React.FC<TimerControlsProps> = ({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  disabled = false,
}) => {
  const buttonBaseStyles =
    'w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:disabled:scale-100 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg';

  return (
    <div className="flex flex-col gap-6">
      {/* Primary Control */}
      <div className="flex justify-center gap-4">
        {status === 'idle' && (
          <button
            onClick={onStart}
            disabled={disabled}
            className={`${buttonBaseStyles} bg-green-500 hover:bg-green-600 disabled:bg-green-400`}
            aria-label="Start timer"
            title="Avvia il timer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}

        {status === 'running' && (
          <button
            onClick={onPause}
            disabled={disabled}
            className={`${buttonBaseStyles} bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400`}
            aria-label="Pause timer"
            title="Pausa il timer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>
        )}

        {status === 'paused' && (
          <button
            onClick={onResume}
            disabled={disabled}
            className={`${buttonBaseStyles} bg-green-500 hover:bg-green-600 disabled:bg-green-400`}
            aria-label="Resume timer"
            title="Riprendi il timer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}

        {status === 'completed' && (
          <button
            onClick={onReset}
            disabled={disabled}
            className={`${buttonBaseStyles} bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400`}
            aria-label="Reset timer"
            title="Resetta il timer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36M20.49 15a9 9 0 01-14.85 3.36" />
            </svg>
          </button>
        )}
      </div>

      {/* Secondary Controls (Stop & Reset) */}
      {(status === 'running' || status === 'paused') && (
        <div className="flex justify-center gap-4">
          <button
            onClick={onStop}
            disabled={disabled}
            className={`${buttonBaseStyles} bg-red-500 hover:bg-red-600 disabled:bg-red-400 w-14 h-14 md:w-16 md:h-16`}
            aria-label="Stop timer"
            title="Ferma il timer (torna a inizio)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 4h12v12H6z" />
            </svg>
          </button>

          <button
            onClick={onReset}
            disabled={disabled}
            className={`${buttonBaseStyles} bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 w-14 h-14 md:w-16 md:h-16`}
            aria-label="Reset timer"
            title="Resetta completamente a 00:00"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36M20.49 15a9 9 0 01-14.85 3.36" />
            </svg>
          </button>
        </div>
      )}

      {/* Info text */}
      <div className="text-center text-xs md:text-sm text-[var(--text-secondary)]">
        {status === 'idle' &&
          'Premi il pulsante verde per avviare il timer o seleziona una durata'}
        {status === 'running' && 'Il timer è in esecuzione'}
        {status === 'paused' && 'Il timer è in pausa - premi per riprendere'}
        {status === 'completed' && 'Il timer è completato!'}
      </div>
    </div>
  );
};

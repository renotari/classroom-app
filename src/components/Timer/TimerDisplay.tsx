/**
 * TimerDisplay Component
 * Visualizza il countdown in formato MM:SS con font grande
 */

import React, { useMemo } from 'react';
import type { TimerDisplayProps } from '../../types/timer.types';

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  remainingSeconds,
  totalSeconds,
  status,
  showWarning = false,
}) => {
  // Formatta secondi in MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [remainingSeconds]);

  // Calcola percentuale per visual progress
  const progressPercent = useMemo(() => {
    if (totalSeconds === 0) return 0;
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  }, [remainingSeconds, totalSeconds]);

  // Determina colori basati su stato
  const getStatusColor = () => {
    if (status === 'completed') return 'text-green-500';
    if (showWarning) return 'text-orange-500 animate-pulse';
    if (status === 'running') return 'text-[var(--color-primary)]';
    if (status === 'paused') return 'text-yellow-500';
    return 'text-[var(--text-primary)]';
  };

  const getBackgroundColor = () => {
    if (status === 'completed') return 'bg-green-50 dark:bg-green-900/20';
    if (showWarning) return 'bg-orange-50 dark:bg-orange-900/20';
    if (status === 'running') return 'bg-blue-50 dark:bg-blue-900/20';
    return 'bg-[var(--bg-surface)]';
  };

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        w-full rounded-lg transition-all duration-300
        ${getBackgroundColor()}
        ${status === 'running' ? 'shadow-lg' : 'shadow'}
        p-8 md:p-12
      `}
    >
      {/* Display principale MM:SS */}
      <div
        className={`
          font-mono font-bold text-8xl md:text-9xl
          transition-colors duration-300
          ${getStatusColor()}
          select-none tracking-tighter
        `}
      >
        {formattedTime}
      </div>

      {/* Barra di progresso sottile */}
      {totalSeconds > 0 && (
        <div className="w-full mt-8 h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className={`
              h-full transition-all duration-300
              ${showWarning ? 'bg-orange-500' : 'bg-[var(--color-primary)]'}
            `}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Status label */}
      <div className="mt-6 flex items-center gap-3">
        {status === 'running' && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">In esecuzione</span>
          </div>
        )}
        {status === 'paused' && (
          <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">In pausa</span>
        )}
        {status === 'completed' && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Completato!</span>
          </div>
        )}
        {status === 'idle' && totalSeconds > 0 && (
          <span className="text-sm font-medium text-[var(--text-secondary)]">Pronto</span>
        )}
      </div>

      {/* Warning indicator */}
      {showWarning && status === 'running' && (
        <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
          <span className="text-xl">⚠️</span>
          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
            Attenzione: tempo quasi scaduto!
          </span>
        </div>
      )}
    </div>
  );
};

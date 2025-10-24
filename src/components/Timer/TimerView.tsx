/**
 * TimerView Component
 * Container principale che integra TimerDisplay, Controls, e Presets
 */

import React, { useEffect, useState, useRef } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerPresets } from './TimerPresets';

/**
 * Timer principale view per il tab Timer
 */
export const TimerView: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const isMountedRef = useRef(true);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inizializza hook con callbacks
  const timer = useTimer({
    onWarning: () => {
      // Guard: non eseguire callback se component è unmounted
      if (!isMountedRef.current) return;

      setShowWarning(true);
      // Disabilita warning visuale dopo 3 secondi
      // Cancella timeout precedente se esiste per evitare leak
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setShowWarning(false);
        }
      }, 3000);
    },
    onComplete: () => {
      // Guard: non eseguire callback se component è unmounted
      if (!isMountedRef.current) return;

      // Timer finito - potrebbe triggerare audio (FASE 4)
    },
  });

  /**
   * Reset warning visual se il timer viene fermato
   */
  useEffect(() => {
    if (timer.status === 'idle') {
      setShowWarning(false);
    }
  }, [timer.status]);

  /**
   * Cleanup su unmount: evita memory leak da timeout e setState su unmounted component
   * CRITICO per EC-004 (8+ ore uptime)
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-8 p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
          ⏱️ Timer Didattici
        </h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">
          Imposta una durata e gestisci il countdown per le attività di classe
        </p>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col gap-8">
        {/* Display Section */}
        <div className="flex-1 min-h-[300px] flex items-center justify-center">
          <div className="w-full max-w-md">
            <TimerDisplay
              remainingSeconds={timer.remainingSeconds}
              totalSeconds={timer.totalSeconds}
              status={timer.status}
              showWarning={showWarning}
            />
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex justify-center">
          <TimerControls
            status={timer.status}
            onStart={timer.start}
            onPause={timer.pause}
            onResume={timer.resume}
            onStop={timer.stop}
            onReset={timer.reset}
            disabled={timer.totalSeconds === 0}
          />
        </div>

        {/* Presets Section */}
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Seleziona Durata
          </h2>
          <TimerPresets
            onPresetSelect={timer.setAndStart}
            onCustomDuration={timer.setAndStart}
            isRunning={timer.isRunning}
          />
        </div>

        {/* Additional Info Card */}
        {timer.totalSeconds > 0 && (
          <div className="w-full max-w-2xl mx-auto p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--bg-elevated)]">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold text-[var(--text-secondary)]">DURATA TOTALE</p>
                <p className="text-lg font-bold text-[var(--text-primary)] mt-1">
                  {Math.floor(timer.totalSeconds / 60)}:{String(timer.totalSeconds % 60).padStart(2, '0')}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-secondary)]">TEMPO PASSATO</p>
                <p className="text-lg font-bold text-[var(--text-primary)] mt-1">
                  {Math.floor((timer.totalSeconds - timer.remainingSeconds) / 60)}:
                  {String((timer.totalSeconds - timer.remainingSeconds) % 60).padStart(2, '0')}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-secondary)]">PROGRESSO</p>
                <p className="text-lg font-bold text-[var(--text-primary)] mt-1">
                  {Math.round(timer.progress)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-xs text-[var(--text-secondary)] text-center border-t border-[var(--bg-elevated)] pt-4">
        <p>
          💡 Suggerimento: Seleziona un preset rapido o inserisci una durata personalizzata per
          iniziare
        </p>
      </div>
    </div>
  );
};

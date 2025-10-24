/**
 * Timer Store (Zustand)
 * Gestisce lo stato del timer con persistence su localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TimerState, TimerConfig } from '../types/timer.types';

// Debug logging (disabile in production)
const DEBUG_TIMER = import.meta.env.DEV;
const debugLog = (msg: string) => {
  if (DEBUG_TIMER) console.log(`[TimerStore] ${msg}`);
};

interface TimerStore extends TimerState {
  // Configuration (persistente)
  config: TimerConfig;

  // Actions
  setDuration: (seconds: number) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  tick: () => void;
  updateConfig: (config: Partial<TimerConfig>) => void;
  triggerWarning: (threshold: number) => void;
}

const DEFAULT_CONFIG: TimerConfig = {
  warningAt2Min: true,
  warningAt5Min: true,
  lastUsedDuration: 300, // 5 minuti di default
};

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      // State iniziale
      remainingSeconds: 0,
      totalSeconds: 0,
      status: 'idle',
      warningThresholds: [],
      warningsTriggered: new Set<number>(),
      config: DEFAULT_CONFIG,

      /**
       * Imposta la durata del timer
       * Reset warnings e status
       */
      setDuration: (seconds: number) => {
        if (seconds <= 0) {
          const error = new Error('Timer duration must be > 0 seconds');
          console.error(error);
          throw error;
        }

        const { config } = get();
        const warningThresholds: number[] = [];

        // Calcola warning thresholds basati su config
        if (config.warningAt2Min && seconds > 120) {
          warningThresholds.push(120);
        }
        if (config.warningAt5Min && seconds > 300) {
          warningThresholds.push(300);
        }

        set({
          remainingSeconds: seconds,
          totalSeconds: seconds,
          status: 'idle',
          warningThresholds,
          warningsTriggered: new Set<number>(),
          config: {
            ...config,
            lastUsedDuration: seconds,
          },
        });

        debugLog(`Duration set to ${seconds}s (${Math.floor(seconds / 60)}min)`);
      },

      /**
       * Avvia il timer (da idle)
       */
      start: () => {
        const { status, remainingSeconds } = get();

        if (status !== 'idle') {
          throw new Error('Timer can only start from idle state');
        }

        if (remainingSeconds === 0) {
          throw new Error('Cannot start timer with 0 seconds remaining');
        }

        set({ status: 'running' });
        debugLog('Started');
      },

      /**
       * Mette in pausa il timer (da running)
       */
      pause: () => {
        const { status } = get();

        if (status !== 'running') {
          throw new Error('Timer can only pause from running state');
        }

        set({ status: 'paused' });
        debugLog('Paused');
      },

      /**
       * Riprende il timer (da paused)
       */
      resume: () => {
        const { status } = get();

        if (status !== 'paused') {
          throw new Error('Timer can only resume from paused state');
        }

        set({ status: 'running' });
        debugLog('Resumed');
      },

      /**
       * Ferma il timer e resetta a totalSeconds (mantiene durata)
       */
      stop: () => {
        const { totalSeconds } = get();

        set({
          remainingSeconds: totalSeconds,
          status: 'idle',
          warningsTriggered: new Set<number>(),
        });

        debugLog('Stopped, reset to total duration');
      },

      /**
       * Reset completo del timer
       */
      reset: () => {
        set({
          remainingSeconds: 0,
          totalSeconds: 0,
          status: 'idle',
          warningThresholds: [],
          warningsTriggered: new Set<number>(),
        });

        debugLog('Reset to 0');
      },

      /**
       * Decrementa il timer di 1 secondo (chiamato ogni 1s da useTimer)
       * Gestisce completion e warning triggers
       */
      tick: () => {
        const { remainingSeconds, status, warningThresholds, warningsTriggered } = get();

        if (status !== 'running') {
          return;
        }

        const newRemaining = remainingSeconds - 1;

        // Timer completato
        if (newRemaining <= 0) {
          set({
            remainingSeconds: 0,
            status: 'completed',
          });
          debugLog('Completed!');
          return;
        }

        // Check warning thresholds
        const newWarningsTriggered = new Set(warningsTriggered);
        for (const threshold of warningThresholds) {
          if (newRemaining === threshold && !warningsTriggered.has(threshold)) {
            newWarningsTriggered.add(threshold);
            debugLog(`Warning at ${threshold}s`);

            // Trigger warning callback (sarà gestito da useTimer)
            // Per ora solo log, FASE 4 aggiungerà audio
          }
        }

        set({
          remainingSeconds: newRemaining,
          warningsTriggered: newWarningsTriggered,
        });
      },

      /**
       * Aggiorna la configurazione timer
       */
      updateConfig: (configUpdate: Partial<TimerConfig>) => {
        const { config } = get();
        const newConfig = { ...config, ...configUpdate };

        set({ config: newConfig });
        debugLog('Config updated');
      },

      /**
       * Marca un warning come triggerato (usato da useTimer per callbacks)
       */
      triggerWarning: (threshold: number) => {
        const { warningsTriggered } = get();
        const newWarningsTriggered = new Set(warningsTriggered);
        newWarningsTriggered.add(threshold);
        set({ warningsTriggered: newWarningsTriggered });
      },
    }),
    {
      name: 'classroom-timer-storage',
      version: 1,
      // Persisti solo la configurazione, non lo stato runtime del timer
      partialize: (state) => ({
        config: state.config,
      }),
    }
  )
);

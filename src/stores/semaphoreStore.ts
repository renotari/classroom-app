/**
 * FASE 6: Semaphore (Traffic Light) Store
 *
 * State management for traffic light system
 * - Current state (red/yellow/green)
 * - Manual vs automatic mode
 * - Integration with noise levels
 *
 * TODO: Implement in FASE 6
 * Reference: docs/technical-spec.md section Semaphore System
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SemaphoreColor = 'red' | 'yellow' | 'green';
export type SemaphoreMode = 'manual' | 'auto';

export interface SemaphoreStoreState {
  // Current state
  currentColor: SemaphoreColor;
  mode: SemaphoreMode;

  // Auto mode configuration
  autoModeThresholds: {
    redAbove: number; // dB
    yellowAbove: number; // dB
  };

  // Actions
  setColor: (color: SemaphoreColor) => void;
  setMode: (mode: SemaphoreMode) => void;
  setAutoThresholds: (redAbove: number, yellowAbove: number) => void;
  updateColorFromNoise: (noiseLevelDb: number) => void;
  resetState: () => void;
}

const initialState = {
  currentColor: 'green' as const,
  mode: 'manual' as const,
  autoModeThresholds: {
    redAbove: 75, // dB
    yellowAbove: 60, // dB
  },
};

export const useSemaphoreStore = create<SemaphoreStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      setColor: (color: SemaphoreColor) => {
        set({ currentColor: color });
      },

      setMode: (mode: SemaphoreMode) => {
        set({ mode });
      },

      setAutoThresholds: (redAbove: number, yellowAbove: number) => {
        set({
          autoModeThresholds: {
            redAbove,
            yellowAbove,
          },
        });
      },

      updateColorFromNoise: (noiseLevelDb: number) => {
        set((state) => {
          if (state.mode === 'manual') {
            return state; // Don't auto-update in manual mode
          }

          let newColor: SemaphoreColor = 'green';
          if (noiseLevelDb > state.autoModeThresholds.redAbove) {
            newColor = 'red';
          } else if (noiseLevelDb > state.autoModeThresholds.yellowAbove) {
            newColor = 'yellow';
          }

          return { currentColor: newColor };
        });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: 'semaphore-store',
      version: 1,
    }
  )
);

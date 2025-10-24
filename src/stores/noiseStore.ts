/**
 * FASE 5: Noise Monitoring Store
 *
 * State management for noise monitoring feature
 * - Current noise level (dB)
 * - Threshold configuration
 * - Alert settings
 * - Historical data
 *
 * TODO: Implement in FASE 5
 * Reference: docs/technical-spec.md section Noise Monitoring
 * Reference: docs/edge-cases.md EC-000, EC-001, EC-004
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NoiseStoreState {
  // Current state
  currentLevel: number; // dB

  // Configuration
  thresholdGreen: number; // dB level for green
  thresholdYellow: number; // dB level for yellow
  thresholdRed: number; // dB level for red (alert)

  // Alerts
  enableAlerts: boolean;
  alertVolume: number; // 0-100

  // History (last 10 minutes)
  history: Array<{ timestamp: number; level: number }>;
  maxHistoryPoints: number;

  // Actions
  setCurrentLevel: (level: number) => void;
  setThresholds: (green: number, yellow: number, red: number) => void;
  setEnableAlerts: (enabled: boolean) => void;
  setAlertVolume: (volume: number) => void;
  addHistoryPoint: (level: number) => void;
  clearHistory: () => void;
  resetState: () => void;
}

const initialState = {
  currentLevel: 0,
  thresholdGreen: 40,
  thresholdYellow: 60,
  thresholdRed: 75,
  enableAlerts: true,
  alertVolume: 70,
  history: [],
  maxHistoryPoints: 600, // 10 minutes at 1 sample/second
};

export const useNoiseStore = create<NoiseStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentLevel: (level: number) => {
        set({ currentLevel: Math.max(0, Math.min(120, level)) });
      },

      setThresholds: (green: number, yellow: number, red: number) => {
        set({
          thresholdGreen: green,
          thresholdYellow: yellow,
          thresholdRed: red,
        });
      },

      setEnableAlerts: (enabled: boolean) => {
        set({ enableAlerts: enabled });
      },

      setAlertVolume: (volume: number) => {
        set({ alertVolume: Math.max(0, Math.min(100, volume)) });
      },

      addHistoryPoint: (level: number) => {
        set((state) => {
          const newHistory = [...state.history, { timestamp: Date.now(), level }];
          // Keep only last maxHistoryPoints entries
          if (newHistory.length > state.maxHistoryPoints) {
            newHistory.shift();
          }
          return { history: newHistory };
        });
      },

      clearHistory: () => {
        set({ history: [] });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: 'noise-store',
      version: 1,
    }
  )
);

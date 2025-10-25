/**
 * FASE 5: Noise Monitoring Store
 *
 * State management for noise monitoring feature
 * - Current noise level (0-100 normalized)
 * - Threshold configuration (verde/giallo/rosso)
 * - Alert settings
 * - Historical data (10 minutes)
 * - Monitoring status & permission
 * - Microphone onboarding state
 *
 * Reference: docs/technical-spec.md section Noise Monitoring
 * Reference: docs/edge-cases.md EC-000, EC-001, EC-004
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PermissionStatus = 'pending' | 'granted' | 'denied' | 'error';
export type NoiseLevel = 'green' | 'yellow' | 'red'; // State colors

export interface NoiseStoreState {
  // Current state
  currentLevel: number; // 0-100 (normalized)
  currentNoiseLevel: NoiseLevel; // Categorized level

  // Microphone & monitoring
  microphonePermission: PermissionStatus;
  isMonitoring: boolean;
  isCalibrated: boolean;

  // Configuration (thresholds for 0-100 scale)
  thresholdGreen: number; // Max level for green (default 50)
  thresholdYellow: number; // Max level for yellow (default 70)
  thresholdRed: number; // Max level for red (default 100)

  // Alerts
  enableAlerts: boolean;
  alertVolume: number; // 0-100

  // History (last 10 minutes, 600 samples @ 1 sample/sec)
  history: Array<{ timestamp: number; level: number }>;
  maxHistoryPoints: number; // 600 = 10 minutes

  // Actions: State setters
  setCurrentLevel: (level: number) => void;
  setThresholds: (green: number, yellow: number, red: number) => void;
  setEnableAlerts: (enabled: boolean) => void;
  setAlertVolume: (volume: number) => void;
  setMicrophonePermission: (status: PermissionStatus) => void;
  setIsMonitoring: (monitoring: boolean) => void;
  setIsCalibrated: (calibrated: boolean) => void;
  addHistoryPoint: (level: number) => void;
  clearHistory: () => void;
  resetState: () => void;
}

const initialState = {
  currentLevel: 0,
  currentNoiseLevel: 'green' as const,
  microphonePermission: 'pending' as const,
  isMonitoring: false,
  isCalibrated: false,
  thresholdGreen: 50,
  thresholdYellow: 70,
  thresholdRed: 100,
  enableAlerts: true,
  alertVolume: 70,
  history: [],
  maxHistoryPoints: 600, // 10 minutes at 1 sample/second
};

/**
 * Helper function: determine noise level category from absolute level
 */
function getNoiseLevelCategory(level: number, thresholds: { green: number; yellow: number; red: number }): NoiseLevel {
  if (level <= thresholds.green) return 'green';
  if (level <= thresholds.yellow) return 'yellow';
  return 'red';
}

export const useNoiseStore = create<NoiseStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentLevel: (level: number) => {
        const clampedLevel = Math.max(0, Math.min(100, level));
        const state = get();
        const newNoiseLevel = getNoiseLevelCategory(clampedLevel, {
          green: state.thresholdGreen,
          yellow: state.thresholdYellow,
          red: state.thresholdRed,
        });

        set({
          currentLevel: clampedLevel,
          currentNoiseLevel: newNoiseLevel,
        });
      },

      setThresholds: (green: number, yellow: number, red: number) => {
        const cleanGreen = Math.max(0, Math.min(100, green));
        const cleanYellow = Math.max(0, Math.min(100, yellow));
        const cleanRed = Math.max(0, Math.min(100, red));

        // Ensure: green < yellow < red
        const sorted = [cleanGreen, cleanYellow, cleanRed].sort((a, b) => a - b);

        const state = get();
        const newNoiseLevel = getNoiseLevelCategory(state.currentLevel, {
          green: sorted[0],
          yellow: sorted[1],
          red: sorted[2],
        });

        set({
          thresholdGreen: sorted[0],
          thresholdYellow: sorted[1],
          thresholdRed: sorted[2],
          currentNoiseLevel: newNoiseLevel,
        });
      },

      setEnableAlerts: (enabled: boolean) => {
        set({ enableAlerts: enabled });
      },

      setAlertVolume: (volume: number) => {
        set({ alertVolume: Math.max(0, Math.min(100, volume)) });
      },

      setMicrophonePermission: (status: PermissionStatus) => {
        set({ microphonePermission: status });
      },

      setIsMonitoring: (monitoring: boolean) => {
        set({ isMonitoring: monitoring });
      },

      setIsCalibrated: (calibrated: boolean) => {
        set({ isCalibrated: calibrated });
      },

      addHistoryPoint: (level: number) => {
        set((state) => {
          const newHistory = [...state.history, { timestamp: Date.now(), level }];
          // Keep only last maxHistoryPoints entries (circular buffer)
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

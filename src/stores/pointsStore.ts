/**
 * FASE 10: Points System Store (Optional)
 *
 * State management for student points/rankings
 * - Track individual student points
 * - Leaderboard/rankings
 * - Reset schedule
 *
 * TODO: Implement in FASE 10 (optional for MVP)
 * Reference: docs/technical-spec.md section Points System
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudentPoints {
  studentId: string;
  name: string;
  points: number;
  lastUpdated: number;
}

export interface PointsStoreState {
  // Points data (keyed by studentId)
  studentPoints: Map<string, StudentPoints>;

  // Reset schedule
  lastResetDate: number | null;
  resetIntervalDays: number;

  // Actions
  addPoints: (studentId: string, name: string, points: number) => void;
  subtractPoints: (studentId: string, points: number) => void;
  setPoints: (studentId: string, points: number) => void;
  getLeaderboard: () => StudentPoints[];
  resetAll: () => void;
  setResetInterval: (days: number) => void;
  resetState: () => void;
}

const initialState = {
  studentPoints: new Map(),
  lastResetDate: null,
  resetIntervalDays: 7, // Weekly reset
};

export const usePointsStore = create<PointsStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addPoints: (studentId: string, name: string, points: number) => {
        set((state) => {
          const newMap = new Map(state.studentPoints);
          const existing = newMap.get(studentId);
          if (existing) {
            existing.points += points;
            existing.lastUpdated = Date.now();
          } else {
            newMap.set(studentId, {
              studentId,
              name,
              points,
              lastUpdated: Date.now(),
            });
          }
          return { studentPoints: newMap };
        });
      },

      subtractPoints: (studentId: string, points: number) => {
        set((state) => {
          const newMap = new Map(state.studentPoints);
          const existing = newMap.get(studentId);
          if (existing) {
            existing.points = Math.max(0, existing.points - points);
            existing.lastUpdated = Date.now();
          }
          return { studentPoints: newMap };
        });
      },

      setPoints: (studentId: string, points: number) => {
        set((state) => {
          const newMap = new Map(state.studentPoints);
          const existing = newMap.get(studentId);
          if (existing) {
            existing.points = Math.max(0, points);
            existing.lastUpdated = Date.now();
          }
          return { studentPoints: newMap };
        });
      },

      getLeaderboard: () => {
        const state = get();
        return Array.from(state.studentPoints.values()).sort((a, b) => b.points - a.points);
      },

      resetAll: () => {
        set((state) => {
          const newMap = new Map(state.studentPoints);
          newMap.forEach((record) => {
            record.points = 0;
            record.lastUpdated = Date.now();
          });
          return {
            studentPoints: newMap,
            lastResetDate: Date.now(),
          };
        });
      },

      setResetInterval: (days: number) => {
        set({ resetIntervalDays: days });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: 'points-store',
      version: 1,
    }
  )
);

/**
 * Random Student Store
 *
 * Manages state for random student selection feature with:
 * - Selection history tracking (persisted to localStorage)
 * - Configuration management (persisted to localStorage)
 * - Animation state for UI
 * - Integration with classStore for student data
 *
 * @module randomStudentStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Student } from './classStore';
import {
  selectRandomStudent,
  DEFAULT_SELECTION_CONFIG,
  type RandomSelectionConfig,
  type RandomSelectionResult,
} from '../services/randomStudentService';

/**
 * State interface for random student selection
 */
export interface RandomStudentState {
  // Current selection state (ephemeral - not persisted)
  selectedStudent: Student | null;
  selectionResult: RandomSelectionResult | null;
  isAnimating: boolean;

  // History (persisted) - array of student IDs, most recent first
  history: string[];

  // Configuration (persisted)
  config: RandomSelectionConfig;

  // Actions
  /**
   * Select a random student from the active class
   * @param classId - Optional class ID (defaults to active class from classStore)
   * @throws Error if no active class or no students available
   */
  selectRandom: (classId?: string) => Promise<void>;

  /**
   * Clear the selection history
   */
  clearHistory: () => void;

  /**
   * Update configuration (partial update)
   * @param partial - Partial configuration to merge
   */
  updateConfig: (partial: Partial<RandomSelectionConfig>) => void;

  /**
   * Set animation state (for UI slot machine effect)
   * @param value - Whether animation is playing
   */
  setAnimating: (value: boolean) => void;

  /**
   * Reset all state to defaults (useful for testing)
   */
  resetState: () => void;
}

/**
 * Initial state for the store
 */
const initialState = {
  selectedStudent: null,
  selectionResult: null,
  isAnimating: false,
  history: [],
  config: { ...DEFAULT_SELECTION_CONFIG },
};

/**
 * Random Student Store
 *
 * Uses Zustand with persist middleware for history and config.
 * Selection state is ephemeral and resets on app restart.
 */
export const useRandomStudentStore = create<RandomStudentState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Actions
      selectRandom: async (classId?: string) => {
        const state = get();

        // Get classStore dynamically to avoid circular dependency
        const { useClassStore } = await import('./classStore');
        const classStore = useClassStore.getState();

        // Determine which class to use
        const targetClassId = classId || classStore.activeClassId;
        if (!targetClassId) {
          throw new Error('No active class selected. Please select or create a class first.');
        }

        // Get students from class
        const classData = classStore.classes.get(targetClassId);
        if (!classData) {
          throw new Error(`Class not found: ${targetClassId}`);
        }

        const students = classData.students;
        if (students.length === 0) {
          throw new Error('No students in the class. Please add students first.');
        }

        // Perform selection
        const result = selectRandomStudent(students, state.history, state.config);

        // Update state
        set({
          selectedStudent: result.student,
          selectionResult: result,
          // Add to history (most recent first)
          history: [result.student.id, ...state.history].slice(0, 50), // Keep max 50 entries
        });
      },

      clearHistory: () => {
        set({ history: [] });
      },

      updateConfig: (partial: Partial<RandomSelectionConfig>) => {
        set((state) => ({
          config: { ...state.config, ...partial },
        }));
      },

      setAnimating: (value: boolean) => {
        set({ isAnimating: value });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: 'random-student-store',
      // Only persist history and config, not ephemeral state
      partialize: (state) => ({
        history: state.history,
        config: state.config,
      }),
    }
  )
);

/**
 * Selector hook: Get current selected student
 */
export const useSelectedStudent = () =>
  useRandomStudentStore((state) => state.selectedStudent);

/**
 * Selector hook: Get selection history
 */
export const useSelectionHistory = () =>
  useRandomStudentStore((state) => state.history);

/**
 * Selector hook: Get configuration
 */
export const useRandomConfig = () =>
  useRandomStudentStore((state) => state.config);

/**
 * Selector hook: Get animation state
 */
export const useIsAnimating = () =>
  useRandomStudentStore((state) => state.isAnimating);

/**
 * Selector hook: Get last selection result metadata
 */
export const useSelectionResult = () =>
  useRandomStudentStore((state) => state.selectionResult);

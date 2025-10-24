/**
 * FASE 9: Groups & Separation Rules Store
 *
 * State management for group generation and separation rules
 * - Store separation rules
 * - Store generated groups
 * - Track generation history
 *
 * TODO: Implement in FASE 9
 * Reference: docs/technical-spec.md section Group Generation
 * Reference: docs/edge-cases.md EC-007
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SeparationRule {
  id: string;
  studentA: string;
  studentB: string;
  priority: 'hard' | 'soft'; // hard rules must be respected, soft are best-effort
}

export interface GeneratedGroup {
  id: string;
  members: string[]; // Student IDs
  generatedAt: number;
}

export interface GroupsStoreState {
  // Separation rules
  separationRules: Map<string, SeparationRule>;

  // Generated groups
  generatedGroups: GeneratedGroup[];
  lastGeneration: number | null;

  // Generation status
  generationInProgress: boolean;
  generationError: string | null;

  // Actions
  addSeparationRule: (studentA: string, studentB: string, priority: 'hard' | 'soft') => string;
  removeSeparationRule: (ruleId: string) => void;
  updateSeparationRule: (ruleId: string, priority: 'hard' | 'soft') => void;
  setGeneratedGroups: (groups: GeneratedGroup[]) => void;
  clearGeneratedGroups: () => void;
  setGenerationInProgress: (inProgress: boolean) => void;
  setGenerationError: (error: string | null) => void;
  resetState: () => void;
}

const initialState = {
  separationRules: new Map(),
  generatedGroups: [],
  lastGeneration: null,
  generationInProgress: false,
  generationError: null,
};

export const useGroupsStore = create<GroupsStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      addSeparationRule: (studentA: string, studentB: string, priority: 'hard' | 'soft') => {
        const ruleId = `rule_${Date.now()}_${Math.random()}`;
        set((state) => {
          const newRules = new Map(state.separationRules);
          newRules.set(ruleId, {
            id: ruleId,
            studentA,
            studentB,
            priority,
          });
          return { separationRules: newRules };
        });
        return ruleId;
      },

      removeSeparationRule: (ruleId: string) => {
        set((state) => {
          const newRules = new Map(state.separationRules);
          newRules.delete(ruleId);
          return { separationRules: newRules };
        });
      },

      updateSeparationRule: (ruleId: string, priority: 'hard' | 'soft') => {
        set((state) => {
          const newRules = new Map(state.separationRules);
          const rule = newRules.get(ruleId);
          if (rule) {
            rule.priority = priority;
          }
          return { separationRules: newRules };
        });
      },

      setGeneratedGroups: (groups: GeneratedGroup[]) => {
        set({
          generatedGroups: groups,
          lastGeneration: Date.now(),
          generationInProgress: false,
        });
      },

      clearGeneratedGroups: () => {
        set({ generatedGroups: [], generationError: null });
      },

      setGenerationInProgress: (inProgress: boolean) => {
        set({ generationInProgress: inProgress });
      },

      setGenerationError: (error: string | null) => {
        set({ generationError: error, generationInProgress: false });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: 'groups-store',
      version: 1,
    }
  )
);

/**
 * FASE 7: Class Management Store
 *
 * State management for classes and students
 * - Manage multiple classes
 * - Student lists per class
 * - Absence tracking
 * - Import/export states
 *
 * TODO: Implement in FASE 7
 * Reference: docs/technical-spec.md section Class Management
 * Reference: docs/edge-cases.md EC-006, EC-009
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Student {
  id: string;
  name: string;
  absent: boolean;
  notes?: string;
}

export interface ClassData {
  id: string;
  name: string;
  students: Student[];
  createdAt: number;
  updatedAt: number;
}

export interface ClassStoreState {
  // Current selection
  activeClassId: string | null;

  // Classes data
  classes: Map<string, ClassData>;

  // Import state
  importInProgress: boolean;
  importError: string | null;

  // Actions
  createClass: (name: string) => string; // Returns classId
  deleteClass: (id: string) => void;
  selectClass: (id: string) => void;
  addStudent: (classId: string, student: Student) => void;
  removeStudent: (classId: string, studentId: string) => void;
  updateStudent: (classId: string, student: Student) => void;
  toggleAbsence: (classId: string, studentId: string) => void;
  importFromCSV: (classId: string, csvText: string) => Promise<void>;
  exportToCSV: (classId: string) => string;
  resetState: () => void;
}

const initialState = {
  activeClassId: null,
  classes: new Map(),
  importInProgress: false,
  importError: null,
};

export const useClassStore = create<ClassStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      createClass: (name: string) => {
        const classId = `class_${Date.now()}`;
        const newClass: ClassData = {
          id: classId,
          name,
          students: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => {
          const newClasses = new Map(state.classes);
          newClasses.set(classId, newClass);
          return { classes: newClasses, activeClassId: classId };
        });
        return classId;
      },

      deleteClass: (id: string) => {
        set((state) => {
          const newClasses = new Map(state.classes);
          newClasses.delete(id);
          const newActiveId = state.activeClassId === id ? null : state.activeClassId;
          return { classes: newClasses, activeClassId: newActiveId };
        });
      },

      selectClass: (id: string) => {
        set({ activeClassId: id });
      },

      addStudent: (classId: string, student: Student) => {
        set((state) => {
          const classes = new Map(state.classes);
          const classData = classes.get(classId);
          if (classData) {
            classData.students.push(student);
            classData.updatedAt = Date.now();
          }
          return { classes };
        });
      },

      removeStudent: (classId: string, studentId: string) => {
        set((state) => {
          const classes = new Map(state.classes);
          const classData = classes.get(classId);
          if (classData) {
            classData.students = classData.students.filter((s) => s.id !== studentId);
            classData.updatedAt = Date.now();
          }
          return { classes };
        });
      },

      updateStudent: (classId: string, student: Student) => {
        set((state) => {
          const classes = new Map(state.classes);
          const classData = classes.get(classId);
          if (classData) {
            const index = classData.students.findIndex((s) => s.id === student.id);
            if (index !== -1) {
              classData.students[index] = student;
              classData.updatedAt = Date.now();
            }
          }
          return { classes };
        });
      },

      toggleAbsence: (classId: string, studentId: string) => {
        set((state) => {
          const classes = new Map(state.classes);
          const classData = classes.get(classId);
          if (classData) {
            const student = classData.students.find((s) => s.id === studentId);
            if (student) {
              student.absent = !student.absent;
              classData.updatedAt = Date.now();
            }
          }
          return { classes };
        });
      },

      importFromCSV: async (_classId: string, _csvText: string) => {
        set({ importInProgress: true, importError: null });
        try {
          // TODO: Implement CSV parsing with Papaparse
          // Expected format: name,email (optional)
          // Should handle encoding detection (EC-006)
          // Should validate max 30 students (EC-009)
          set({ importInProgress: false });
        } catch (error) {
          set({
            importInProgress: false,
            importError: error instanceof Error ? error.message : 'Import failed',
          });
          throw error;
        }
      },

      exportToCSV: (classId: string) => {
        const state = get();
        const classData = state.classes.get(classId);
        if (!classData) return '';

        // CSV format: name,absent
        const header = 'Name,Absent';
        const rows = classData.students.map((s) => `${s.name},${s.absent ? 'yes' : 'no'}`);
        return [header, ...rows].join('\n');
      },

      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: 'class-store',
      version: 1,
    }
  )
);

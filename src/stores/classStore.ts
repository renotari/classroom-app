/**
 * FASE 7: Class Management Store
 *
 * State management for classes and students
 * - Manage multiple classes
 * - Student lists per class
 * - Absence tracking
 * - Import/export states
 *
 * IMPLEMENTED: FASE 7
 * Reference: docs/technical-spec.md section Class Management
 * Reference: docs/edge-cases.md EC-006, EC-009
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseCSV, exportToCSV as exportCSVService } from '../services/csvParsingService';

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
            classes.set(classId, {
              ...classData,
              students: [...classData.students, student],
              updatedAt: Date.now(),
            });
          }
          return { classes };
        });
      },

      removeStudent: (classId: string, studentId: string) => {
        set((state) => {
          const classes = new Map(state.classes);
          const classData = classes.get(classId);
          if (classData) {
            classes.set(classId, {
              ...classData,
              students: classData.students.filter((s) => s.id !== studentId),
              updatedAt: Date.now(),
            });
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
              const newStudents = [...classData.students];
              newStudents[index] = student;
              classes.set(classId, {
                ...classData,
                students: newStudents,
                updatedAt: Date.now(),
              });
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
            const studentIndex = classData.students.findIndex((s) => s.id === studentId);
            if (studentIndex !== -1) {
              const newStudents = [...classData.students];
              newStudents[studentIndex] = {
                ...newStudents[studentIndex],
                absent: !newStudents[studentIndex].absent,
              };
              classes.set(classId, {
                ...classData,
                students: newStudents,
                updatedAt: Date.now(),
              });
            }
          }
          return { classes };
        });
      },

      importFromCSV: async (classId: string, csvText: string) => {
        set({ importInProgress: true, importError: null });
        try {
          // Parse CSV using csvParsingService (handles EC-006, EC-009)
          const parseResult = parseCSV(csvText);

          if (!parseResult.success || parseResult.students.length === 0) {
            const errorMsg = parseResult.errors.join(', ') || 'Nessun studente valido trovato';
            set({
              importInProgress: false,
              importError: errorMsg,
            });
            throw new Error(errorMsg);
          }

          // Get current class
          const state = get();
          const classes = new Map(state.classes);
          const classData = classes.get(classId);

          if (!classData) {
            set({
              importInProgress: false,
              importError: 'Classe non trovata',
            });
            throw new Error('Classe non trovata');
          }

          // Replace students with imported students
          classes.set(classId, {
            ...classData,
            students: parseResult.students,
            updatedAt: Date.now(),
          });

          set({
            classes,
            importInProgress: false,
            importError: null,
          });
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

        // Export using csvParsingService
        return exportCSVService(classData.students, {
          includeAbsent: true,
          includeNotes: true,
          delimiter: ',',
        });
      },

      resetState: () => {
        set({
          activeClassId: null,
          classes: new Map(),
          importInProgress: false,
          importError: null,
        });
      },
    }),
    {
      name: 'class-store',
      version: 1,
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          // Convert classes array back to Map
          if (state.classes && Array.isArray(state.classes)) {
            state.classes = new Map(state.classes);
          }
          return { state };
        },
        setItem: (name, value) => {
          // Convert Map to array for JSON serialization
          const state = {
            ...value.state,
            classes: Array.from(value.state.classes.entries()),
          };
          localStorage.setItem(name, JSON.stringify({ state }));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

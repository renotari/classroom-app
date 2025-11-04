/**
 * Class Management Store (Zustand)
 * Manages classes, students, and absences with localStorage persistence
 * FASE 7 - Class & Students Management
 *
 * Reference: docs/technical-spec.md section Class Management
 * Reference: docs/edge-cases.md EC-006, EC-009
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Class, Student } from '../types/class';
import { createClass, createStudent } from '../types/class';
import { debug } from '../utils/debug';

// Debug logging (disabled in production)
const DEBUG_CLASS = import.meta.env.DEV;
const debugLog = (msg: string) => {
  if (DEBUG_CLASS) debug.log(`[ClassStore] ${msg}`);
};

interface ClassStoreState {
  // State
  classes: Class[];
  selectedClassId: string | null;

  // Computed getters
  getSelectedClass: () => Class | null;
  getPresentStudents: (classId?: string) => Student[];
  getAbsentStudents: (classId?: string) => Student[];
  getStudentCount: (classId?: string) => number;

  // Class management actions
  addClass: (name: string) => string; // Returns new class ID
  updateClass: (classId: string, updates: Partial<Pick<Class, 'name'>>) => void;
  removeClass: (classId: string) => void;
  selectClass: (classId: string) => void;

  // Student management actions
  addStudent: (classId: string, firstName: string, lastName: string) => void;
  updateStudent: (
    classId: string,
    studentId: string,
    updates: Partial<Student>
  ) => void;
  removeStudent: (classId: string, studentId: string) => void;
  importStudents: (classId: string, students: Student[]) => void;

  // Absence management actions
  toggleAbsence: (classId: string, studentId: string) => void;
  setAbsence: (classId: string, studentId: string, isAbsent: boolean) => void;
  resetAbsences: (classId: string) => void;

  // Utility actions
  resetState: () => void;
}

const INITIAL_STATE = {
  classes: [],
  selectedClassId: null,
};

export const useClassStore = create<ClassStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...INITIAL_STATE,

      // Computed getters
      getSelectedClass: () => {
        const { classes, selectedClassId } = get();
        return classes.find((c) => c.id === selectedClassId) || null;
      },

      getPresentStudents: (classId?: string) => {
        const targetClassId = classId || get().selectedClassId;
        if (!targetClassId) return [];

        const targetClass = get().classes.find((c) => c.id === targetClassId);
        if (!targetClass) return [];

        return targetClass.students.filter((s) => !s.isAbsent);
      },

      getAbsentStudents: (classId?: string) => {
        const targetClassId = classId || get().selectedClassId;
        if (!targetClassId) return [];

        const targetClass = get().classes.find((c) => c.id === targetClassId);
        if (!targetClass) return [];

        return targetClass.students.filter((s) => s.isAbsent);
      },

      getStudentCount: (classId?: string) => {
        const targetClassId = classId || get().selectedClassId;
        if (!targetClassId) return 0;

        const targetClass = get().classes.find((c) => c.id === targetClassId);
        return targetClass?.students.length || 0;
      },

      // Class management actions
      addClass: (name: string) => {
        const newClass = createClass(name);
        debugLog(`Adding new class: ${name} (ID: ${newClass.id})`);

        set((state) => ({
          classes: [...state.classes, newClass],
        }));

        return newClass.id;
      },

      updateClass: (classId: string, updates: Partial<Pick<Class, 'name'>>) => {
        debugLog(`Updating class ${classId}`);

        set((state) => ({
          classes: state.classes.map((c) =>
            c.id === classId
              ? { ...c, ...updates, updatedAt: new Date() }
              : c
          ),
        }));
      },

      removeClass: (classId: string) => {
        debugLog(`Removing class ${classId}`);

        set((state) => ({
          classes: state.classes.filter((c) => c.id !== classId),
          // Deselect if removing selected class
          selectedClassId:
            state.selectedClassId === classId ? null : state.selectedClassId,
        }));
      },

      selectClass: (classId: string) => {
        debugLog(`Selecting class ${classId}`);

        const classExists = get().classes.some((c) => c.id === classId);
        if (!classExists) {
          console.error(`[ClassStore] Class ${classId} not found`);
          return;
        }

        set({ selectedClassId: classId });
      },

      // Student management actions
      addStudent: (classId: string, firstName: string, lastName: string) => {
        debugLog(`Adding student: ${firstName} ${lastName} to class ${classId}`);

        const newStudent = createStudent(firstName, lastName);

        set((state) => ({
          classes: state.classes.map((c) =>
            c.id === classId
              ? {
                  ...c,
                  students: [...c.students, newStudent],
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      updateStudent: (
        classId: string,
        studentId: string,
        updates: Partial<Student>
      ) => {
        debugLog(`Updating student ${studentId} in class ${classId}`);

        set((state) => ({
          classes: state.classes.map((c) =>
            c.id === classId
              ? {
                  ...c,
                  students: c.students.map((s) =>
                    s.id === studentId ? { ...s, ...updates } : s
                  ),
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      removeStudent: (classId: string, studentId: string) => {
        debugLog(`Removing student ${studentId} from class ${classId}`);

        set((state) => ({
          classes: state.classes.map((c) =>
            c.id === classId
              ? {
                  ...c,
                  students: c.students.filter((s) => s.id !== studentId),
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      importStudents: (classId: string, students: Student[]) => {
        debugLog(
          `Importing ${students.length} students to class ${classId}`
        );

        set((state) => ({
          classes: state.classes.map((c) =>
            c.id === classId
              ? {
                  ...c,
                  students: [...c.students, ...students],
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      // Absence management actions
      toggleAbsence: (classId: string, studentId: string) => {
        debugLog(`Toggling absence for student ${studentId} in class ${classId}`);

        set((state) => ({
          classes: state.classes.map((c) =>
            c.id === classId
              ? {
                  ...c,
                  students: c.students.map((s) =>
                    s.id === studentId ? { ...s, isAbsent: !s.isAbsent } : s
                  ),
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      setAbsence: (classId: string, studentId: string, isAbsent: boolean) => {
        debugLog(
          `Setting absence for student ${studentId} in class ${classId}: ${isAbsent}`
        );

        set((state) => ({
          classes: state.classes.map((c) =>
            c.id === classId
              ? {
                  ...c,
                  students: c.students.map((s) =>
                    s.id === studentId ? { ...s, isAbsent } : s
                  ),
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      resetAbsences: (classId: string) => {
        debugLog(`Resetting all absences for class ${classId}`);

        set((state) => ({
          classes: state.classes.map((c) =>
            c.id === classId
              ? {
                  ...c,
                  students: c.students.map((s) => ({ ...s, isAbsent: false })),
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      // Utility actions
      resetState: () => {
        debugLog('Resetting class store to initial state');
        set(INITIAL_STATE);
      },
    }),
    {
      name: 'class-store', // localStorage key
      // Exclude computed getters from persistence
      partialize: (state) => ({
        classes: state.classes,
        selectedClassId: state.selectedClassId,
      }),
    }
  )
);

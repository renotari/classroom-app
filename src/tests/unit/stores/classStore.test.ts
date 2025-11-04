/**
 * Class Store Unit Tests
 * FASE 7 - Class Management
 *
 * Tests store operations:
 * - Class CRUD (create, update, delete, select)
 * - Student management (add, update, remove, import)
 * - Absence tracking (toggle, set, reset)
 * - Persistence (localStorage)
 * - Computed getters
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClassStore } from '../../../stores/classStore';
import type { Student } from '../../../types/class';

describe('useClassStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Reset store after each test
    act(() => {
      useClassStore.getState().resetState();
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useClassStore());

      expect(result.current.classes).toEqual([]);
      expect(result.current.selectedClassId).toBeNull();
      expect(result.current.getSelectedClass()).toBeNull();
    });
  });

  describe('Class CRUD Operations', () => {
    it('should add a new class', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string;
      act(() => {
        classId = result.current.addClass('3A Matematica');
      });

      expect(result.current.classes).toHaveLength(1);
      expect(result.current.classes[0].name).toBe('3A Matematica');
      expect(result.current.classes[0].id).toBe(classId);
      expect(result.current.classes[0].students).toEqual([]);
    });

    it('should add multiple classes', () => {
      const { result } = renderHook(() => useClassStore());

      act(() => {
        result.current.addClass('3A');
        result.current.addClass('3B');
        result.current.addClass('3C');
      });

      expect(result.current.classes).toHaveLength(3);
      expect(result.current.classes.map((c) => c.name)).toEqual(['3A', '3B', '3C']);
    });

    it('should update class name', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string;
      act(() => {
        classId = result.current.addClass('3A');
      });

      act(() => {
        result.current.updateClass(classId, { name: '3A Matematica Avanzata' });
      });

      expect(result.current.classes[0].name).toBe('3A Matematica Avanzata');
    });

    it('should remove a class', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.addClass('3B');
      });

      act(() => {
        result.current.removeClass(classId);
      });

      expect(result.current.classes).toHaveLength(1);
      expect(result.current.classes[0].name).toBe('3B');
    });

    it('should deselect class when removed', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.selectClass(classId);
      });

      expect(result.current.selectedClassId).toBe(classId);

      act(() => {
        result.current.removeClass(classId);
      });

      expect(result.current.selectedClassId).toBeNull();
    });
  });

  describe('Class Selection', () => {
    it('should select a class', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.selectClass(classId);
      });

      expect(result.current.selectedClassId).toBe(classId);
      expect(result.current.getSelectedClass()?.name).toBe('3A');
    });

    it('should switch between classes', () => {
      const { result } = renderHook(() => useClassStore());

      let class1Id: string, class2Id: string;
      act(() => {
        class1Id = result.current.addClass('3A');
        class2Id = result.current.addClass('3B');
        result.current.selectClass(class1Id);
      });

      expect(result.current.selectedClassId).toBe(class1Id);

      act(() => {
        result.current.selectClass(class2Id);
      });

      expect(result.current.selectedClassId).toBe(class2Id);
      expect(result.current.getSelectedClass()?.name).toBe('3B');
    });
  });

  describe('Student Management', () => {
    it('should add a student to a class', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.addStudent(classId, 'Mario', 'Rossi');
      });

      const targetClass = result.current.classes.find((c) => c.id === classId);
      expect(targetClass?.students).toHaveLength(1);
      expect(targetClass?.students[0].firstName).toBe('Mario');
      expect(targetClass?.students[0].lastName).toBe('Rossi');
      expect(targetClass?.students[0].isAbsent).toBe(false);
    });

    it('should add multiple students', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.addStudent(classId, 'Mario', 'Rossi');
        result.current.addStudent(classId, 'Giulia', 'Bianchi');
        result.current.addStudent(classId, 'Luca', 'Verdi');
      });

      const targetClass = result.current.classes.find((c) => c.id === classId);
      expect(targetClass?.students).toHaveLength(3);
    });

    it('should update student data', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string, studentId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.addStudent(classId, 'Mario', 'Rossi');
      });

      const targetClass = result.current.classes.find((c) => c.id === classId);
      studentId = targetClass!.students[0].id;

      act(() => {
        result.current.updateStudent(classId, studentId, {
          firstName: 'Maria',
          notes: 'Test note',
        });
      });

      const updatedClass = result.current.classes.find((c) => c.id === classId);
      expect(updatedClass?.students[0].firstName).toBe('Maria');
      expect(updatedClass?.students[0].lastName).toBe('Rossi');
      expect(updatedClass?.students[0].notes).toBe('Test note');
    });

    it('should remove a student', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string, studentId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.addStudent(classId, 'Mario', 'Rossi');
        result.current.addStudent(classId, 'Giulia', 'Bianchi');
      });

      const targetClass = result.current.classes.find((c) => c.id === classId);
      studentId = targetClass!.students[0].id;

      act(() => {
        result.current.removeStudent(classId, studentId);
      });

      const updatedClass = result.current.classes.find((c) => c.id === classId);
      expect(updatedClass?.students).toHaveLength(1);
      expect(updatedClass?.students[0].firstName).toBe('Giulia');
    });

    it('should import multiple students at once', () => {
      const { result } = renderHook(() => useClassStore());

      const students: Student[] = [
        { id: '1', firstName: 'Mario', lastName: 'Rossi', isAbsent: false },
        { id: '2', firstName: 'Giulia', lastName: 'Bianchi', isAbsent: false },
        { id: '3', firstName: 'Luca', lastName: 'Verdi', isAbsent: false },
      ];

      let classId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.importStudents(classId, students);
      });

      const targetClass = result.current.classes.find((c) => c.id === classId);
      expect(targetClass?.students).toHaveLength(3);
      expect(targetClass?.students[0].firstName).toBe('Mario');
    });
  });

  describe('Absence Management', () => {
    it('should toggle student absence', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string, studentId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.addStudent(classId, 'Mario', 'Rossi');
      });

      const targetClass = result.current.classes.find((c) => c.id === classId);
      studentId = targetClass!.students[0].id;

      expect(targetClass?.students[0].isAbsent).toBe(false);

      act(() => {
        result.current.toggleAbsence(classId, studentId);
      });

      const updatedClass = result.current.classes.find((c) => c.id === classId);
      expect(updatedClass?.students[0].isAbsent).toBe(true);

      act(() => {
        result.current.toggleAbsence(classId, studentId);
      });

      const retoggledClass = result.current.classes.find((c) => c.id === classId);
      expect(retoggledClass?.students[0].isAbsent).toBe(false);
    });

    it('should set specific absence state', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string, studentId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.addStudent(classId, 'Mario', 'Rossi');
      });

      const targetClass = result.current.classes.find((c) => c.id === classId);
      studentId = targetClass!.students[0].id;

      act(() => {
        result.current.setAbsence(classId, studentId, true);
      });

      const updatedClass = result.current.classes.find((c) => c.id === classId);
      expect(updatedClass?.students[0].isAbsent).toBe(true);

      act(() => {
        result.current.setAbsence(classId, studentId, false);
      });

      const retoggledClass = result.current.classes.find((c) => c.id === classId);
      expect(retoggledClass?.students[0].isAbsent).toBe(false);
    });

    it('should reset all absences', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.addStudent(classId, 'Mario', 'Rossi');
        result.current.addStudent(classId, 'Giulia', 'Bianchi');
        result.current.addStudent(classId, 'Luca', 'Verdi');
      });

      const targetClass = result.current.classes.find((c) => c.id === classId);
      const studentIds = targetClass!.students.map((s) => s.id);

      act(() => {
        result.current.setAbsence(classId, studentIds[0], true);
        result.current.setAbsence(classId, studentIds[2], true);
      });

      let updatedClass = result.current.classes.find((c) => c.id === classId);
      expect(updatedClass?.students.filter((s) => s.isAbsent)).toHaveLength(2);

      act(() => {
        result.current.resetAbsences(classId);
      });

      updatedClass = result.current.classes.find((c) => c.id === classId);
      expect(updatedClass?.students.filter((s) => s.isAbsent)).toHaveLength(0);
    });
  });

  describe('Computed Getters', () => {
    it('should get present students', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.addStudent(classId, 'Mario', 'Rossi');
        result.current.addStudent(classId, 'Giulia', 'Bianchi');
        result.current.addStudent(classId, 'Luca', 'Verdi');
        result.current.selectClass(classId);
      });

      const targetClass = result.current.classes.find((c) => c.id === classId);
      const studentIds = targetClass!.students.map((s) => s.id);

      act(() => {
        result.current.setAbsence(classId, studentIds[1], true);
      });

      const presentStudents = result.current.getPresentStudents();
      expect(presentStudents).toHaveLength(2);
      expect(presentStudents.map((s) => s.firstName)).toEqual(['Mario', 'Luca']);
    });

    it('should get absent students', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.addStudent(classId, 'Mario', 'Rossi');
        result.current.addStudent(classId, 'Giulia', 'Bianchi');
        result.current.addStudent(classId, 'Luca', 'Verdi');
        result.current.selectClass(classId);
      });

      const targetClass = result.current.classes.find((c) => c.id === classId);
      const studentIds = targetClass!.students.map((s) => s.id);

      act(() => {
        result.current.setAbsence(classId, studentIds[0], true);
        result.current.setAbsence(classId, studentIds[2], true);
      });

      const absentStudents = result.current.getAbsentStudents();
      expect(absentStudents).toHaveLength(2);
      expect(absentStudents.map((s) => s.firstName)).toEqual(['Mario', 'Luca']);
    });

    it('should get student count', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string;
      act(() => {
        classId = result.current.addClass('3A');
        result.current.selectClass(classId);
      });

      expect(result.current.getStudentCount()).toBe(0);

      act(() => {
        result.current.addStudent(classId, 'Mario', 'Rossi');
        result.current.addStudent(classId, 'Giulia', 'Bianchi');
      });

      expect(result.current.getStudentCount()).toBe(2);
    });
  });

  describe('Persistence', () => {
    it('should restore state from localStorage', () => {
      // First session: create data
      const { result: result1 } = renderHook(() => useClassStore());

      let classId: string;
      act(() => {
        classId = result1.current.addClass('3A');
        result1.current.addStudent(classId, 'Mario', 'Rossi');
        result1.current.selectClass(classId);
      });

      // Simulate app restart by creating new hook instance
      const { result: result2 } = renderHook(() => useClassStore());

      expect(result2.current.classes).toHaveLength(1);
      expect(result2.current.classes[0].name).toBe('3A');
      expect(result2.current.classes[0].students).toHaveLength(1);
      expect(result2.current.selectedClassId).toBe(classId);
    });

    it('should not persist computed getters', () => {
      const { result } = renderHook(() => useClassStore());

      act(() => {
        const classId = result.current.addClass('3A');
        result.current.selectClass(classId);
      });

      const stored = JSON.parse(localStorage.getItem('class-store') || '{}');
      expect(stored.getSelectedClass).toBeUndefined();
      expect(stored.getPresentStudents).toBeUndefined();
      expect(stored.getAbsentStudents).toBeUndefined();
    });
  });

  describe('Reset State', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useClassStore());

      act(() => {
        const classId = result.current.addClass('3A');
        result.current.addStudent(classId, 'Mario', 'Rossi');
        result.current.selectClass(classId);
      });

      expect(result.current.classes).toHaveLength(1);
      expect(result.current.selectedClassId).not.toBeNull();

      act(() => {
        result.current.resetState();
      });

      expect(result.current.classes).toEqual([]);
      expect(result.current.selectedClassId).toBeNull();
    });
  });
});

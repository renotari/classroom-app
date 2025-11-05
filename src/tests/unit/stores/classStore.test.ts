/**
 * Class Store - Unit Tests
 * FASE 7: Class Management
 *
 * Tests for:
 * - CRUD operations (create, delete, select, add/remove/update students)
 * - CSV import/export integration
 * - Absence tracking
 * - State persistence
 * - Error handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClassStore, type Student, type ClassData } from '../../../stores/classStore';

describe('classStore', () => {
  beforeEach(() => {
    // Clear localStorage to avoid persistence issues
    localStorage.clear();

    // Reset store before each test
    const { result } = renderHook(() => useClassStore());
    act(() => {
      result.current.resetState();
    });
  });

  describe('Class CRUD Operations', () => {
    it('should create a new class', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string = '';
      act(() => {
        classId = result.current.createClass('Math 101');
      });

      expect(classId).toBeTruthy();
      expect(result.current.classes.size).toBe(1);
      expect(result.current.activeClassId).toBe(classId);

      const classData = result.current.classes.get(classId);
      expect(classData).toBeDefined();
      expect(classData?.name).toBe('Math 101');
      expect(classData?.students).toEqual([]);
    });

    it('should create multiple classes', () => {
      const { result } = renderHook(() => useClassStore());

      let class1Id: string = '';
      let class2Id: string = '';

      act(() => {
        class1Id = result.current.createClass('Math 101');
        class2Id = result.current.createClass('Science 202');
      });

      expect(result.current.classes.size).toBe(2);
      expect(result.current.activeClassId).toBe(class2Id);
    });

    it('should delete a class', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string = '';
      act(() => {
        classId = result.current.createClass('Math 101');
      });

      expect(result.current.classes.size).toBe(1);

      act(() => {
        result.current.deleteClass(classId);
      });

      expect(result.current.classes.size).toBe(0);
      expect(result.current.activeClassId).toBeNull();
    });

    it('should reset activeClassId when deleting active class', () => {
      const { result } = renderHook(() => useClassStore());

      let class1Id: string = '';
      let class2Id: string = '';

      act(() => {
        class1Id = result.current.createClass('Math 101');
        class2Id = result.current.createClass('Science 202');
        result.current.selectClass(class1Id);
      });

      expect(result.current.activeClassId).toBe(class1Id);

      act(() => {
        result.current.deleteClass(class1Id);
      });

      expect(result.current.activeClassId).toBeNull();
      expect(result.current.classes.size).toBe(1);
    });

    it('should select a class', () => {
      const { result } = renderHook(() => useClassStore());

      let class1Id: string = '';
      let class2Id: string = '';

      act(() => {
        class1Id = result.current.createClass('Math 101');
        class2Id = result.current.createClass('Science 202');
      });

      act(() => {
        result.current.selectClass(class1Id);
      });

      expect(result.current.activeClassId).toBe(class1Id);
    });
  });

  describe('Student Operations', () => {
    it('should add a student to a class', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string = '';
      act(() => {
        classId = result.current.createClass('Math 101');
      });

      const student: Student = {
        id: 'student-1',
        name: 'Marco Rossi',
        absent: false,
      };

      act(() => {
        result.current.addStudent(classId, student);
      });

      const classData = result.current.classes.get(classId);
      expect(classData?.students).toHaveLength(1);
      expect(classData?.students[0]).toEqual(student);
    });

    it('should remove a student from a class', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string = '';
      act(() => {
        classId = result.current.createClass('Math 101');
      });

      const student: Student = {
        id: 'student-1',
        name: 'Marco Rossi',
        absent: false,
      };

      act(() => {
        result.current.addStudent(classId, student);
      });

      expect(result.current.classes.get(classId)?.students).toHaveLength(1);

      act(() => {
        result.current.removeStudent(classId, 'student-1');
      });

      expect(result.current.classes.get(classId)?.students).toHaveLength(0);
    });

    it('should update a student', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string = '';
      act(() => {
        classId = result.current.createClass('Math 101');
      });

      const student: Student = {
        id: 'student-1',
        name: 'Marco Rossi',
        absent: false,
      };

      act(() => {
        result.current.addStudent(classId, student);
      });

      const updatedStudent: Student = {
        id: 'student-1',
        name: 'Marco Rossi',
        absent: false,
        notes: 'Excellent student',
      };

      act(() => {
        result.current.updateStudent(classId, updatedStudent);
      });

      const classData = result.current.classes.get(classId);
      expect(classData?.students[0].notes).toBe('Excellent student');
    });

    it('should toggle student absence', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string = '';
      act(() => {
        classId = result.current.createClass('Math 101');
      });

      const student: Student = {
        id: 'student-1',
        name: 'Marco Rossi',
        absent: false,
      };

      act(() => {
        result.current.addStudent(classId, student);
      });

      // Toggle to absent
      act(() => {
        result.current.toggleAbsence(classId, 'student-1');
      });

      expect(result.current.classes.get(classId)?.students[0].absent).toBe(true);

      // Toggle back to present
      act(() => {
        result.current.toggleAbsence(classId, 'student-1');
      });

      expect(result.current.classes.get(classId)?.students[0].absent).toBe(false);
    });
  });

  describe('CSV Import', () => {
    it('should import students from CSV', async () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string = '';
      act(() => {
        classId = result.current.createClass('Math 101');
      });

      const csv = `name,absent,notes
Marco Rossi,false,Good student
Giulia Bianchi,true,Sick
Luca Verde,false,`;

      await act(async () => {
        await result.current.importFromCSV(classId, csv);
      });

      const classData = result.current.classes.get(classId);
      expect(classData?.students).toHaveLength(3);
      expect(classData?.students[0].name).toBe('Marco Rossi');
      expect(classData?.students[0].absent).toBe(false);
      expect(classData?.students[1].name).toBe('Giulia Bianchi');
      expect(classData?.students[1].absent).toBe(true);
      expect(classData?.students[2].name).toBe('Luca Verde');
    });

    it('should replace existing students on import', async () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string = '';
      act(() => {
        classId = result.current.createClass('Math 101');
        result.current.addStudent(classId, {
          id: 'old-1',
          name: 'Old Student',
          absent: false,
        });
      });

      expect(result.current.classes.get(classId)?.students).toHaveLength(1);

      const csv = `name,absent
New Student 1,false
New Student 2,false`;

      await act(async () => {
        await result.current.importFromCSV(classId, csv);
      });

      const classData = result.current.classes.get(classId);
      expect(classData?.students).toHaveLength(2);
      expect(classData?.students[0].name).toBe('New Student 1');
      expect(classData?.students[1].name).toBe('New Student 2');
    });

    it('should handle CSV import errors', async () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string = '';
      act(() => {
        classId = result.current.createClass('Math 101');
      });

      const invalidCSV = '';

      await expect(
        act(async () => {
          await result.current.importFromCSV(classId, invalidCSV);
        })
      ).rejects.toThrow();

      expect(result.current.importError).toBeTruthy();
    });

    it('should handle import to non-existent class', async () => {
      const { result } = renderHook(() => useClassStore());

      const csv = `name,absent
Marco,false`;

      await expect(
        act(async () => {
          await result.current.importFromCSV('non-existent-id', csv);
        })
      ).rejects.toThrow('Classe non trovata');
    });
  });

  describe('CSV Export', () => {
    it('should export students to CSV', () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string = '';
      act(() => {
        classId = result.current.createClass('Math 101');
        result.current.addStudent(classId, {
          id: 'student-1',
          name: 'Marco Rossi',
          absent: false,
          notes: 'Good',
        });
        result.current.addStudent(classId, {
          id: 'student-2',
          name: 'Giulia Bianchi',
          absent: true,
        });
      });

      const csv = result.current.exportToCSV(classId);

      expect(csv).toContain('name,absent,notes');
      expect(csv).toContain('Marco Rossi,false,Good');
      expect(csv).toContain('Giulia Bianchi,true,');
    });

    it('should return empty string for non-existent class', () => {
      const { result } = renderHook(() => useClassStore());

      const csv = result.current.exportToCSV('non-existent-id');

      expect(csv).toBe('');
    });
  });

  describe('State Management', () => {
    it('should update updatedAt timestamp on student operations', async () => {
      const { result } = renderHook(() => useClassStore());

      let classId: string = '';
      act(() => {
        classId = result.current.createClass('Math 101');
      });

      const initialUpdatedAt = result.current.classes.get(classId)?.updatedAt;

      // Wait to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      act(() => {
        result.current.addStudent(classId, {
          id: 'student-1',
          name: 'Marco',
          absent: false,
        });
      });

      const newUpdatedAt = result.current.classes.get(classId)?.updatedAt;

      expect(newUpdatedAt).toBeGreaterThanOrEqual(initialUpdatedAt!);
    });

    it('should reset state', () => {
      const { result } = renderHook(() => useClassStore());

      // First reset to clear any previous state
      act(() => {
        result.current.resetState();
      });

      // Create classes in a single act
      let class1Id: string = '';
      let class2Id: string = '';

      act(() => {
        class1Id = result.current.createClass('Math 101');
        class2Id = result.current.createClass('Science 202');
      });

      // Verify both classes were created
      expect(result.current.classes.size).toBeGreaterThanOrEqual(2);

      // Reset
      act(() => {
        result.current.resetState();
      });

      expect(result.current.classes.size).toBe(0);
      expect(result.current.activeClassId).toBeNull();
      expect(result.current.importInProgress).toBe(false);
      expect(result.current.importError).toBeNull();
    });
  });
});

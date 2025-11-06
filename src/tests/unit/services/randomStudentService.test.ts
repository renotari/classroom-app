/**
 * Unit tests for randomStudentService
 *
 * Tests cover:
 * - Helper functions (getSecureRandomIndex, getEligibleStudents, filterByHistory, validateConfig)
 * - Main selectRandomStudent function
 * - Edge cases (empty class, all absent, all in history)
 * - Randomness distribution
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Student } from '../../../types';
import {
  selectRandomStudent,
  getSecureRandomIndex,
  getEligibleStudents,
  filterByHistory,
  validateConfig,
  DEFAULT_SELECTION_CONFIG,
  type RandomSelectionConfig,
} from '../../../services/randomStudentService';

// Test fixtures
const createStudent = (id: string, name: string, absent = false): Student => ({
  id,
  name,
  absent,
});

const mockStudents: Student[] = [
  createStudent('1', 'Alice', false),
  createStudent('2', 'Bob', false),
  createStudent('3', 'Charlie', true), // Absent
  createStudent('4', 'Diana', false),
  createStudent('5', 'Eve', false),
  createStudent('6', 'Frank', true), // Absent
];

describe('randomStudentService', () => {
  describe('getSecureRandomIndex', () => {
    it('should return number within valid range', () => {
      const max = 10;
      const index = getSecureRandomIndex(max);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(max);
      expect(Number.isInteger(index)).toBe(true);
    });

    it('should throw error for non-positive max', () => {
      expect(() => getSecureRandomIndex(0)).toThrow('Max must be a positive integer');
      expect(() => getSecureRandomIndex(-5)).toThrow('Max must be a positive integer');
    });

    it('should throw error for non-integer max', () => {
      expect(() => getSecureRandomIndex(5.5)).toThrow('Max must be a positive integer');
    });

    it('should use crypto.getRandomValues (not Math.random)', () => {
      const spy = vi.spyOn(crypto, 'getRandomValues');
      getSecureRandomIndex(10);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should produce varied results over multiple calls', () => {
      // Test distribution: generate 100 random indices
      // With max=10, we expect some variation (not all same)
      const results = new Set<number>();
      for (let i = 0; i < 100; i++) {
        results.add(getSecureRandomIndex(10));
      }
      // Expect at least 5 different values (statistical test)
      expect(results.size).toBeGreaterThanOrEqual(5);
    });
  });

  describe('getEligibleStudents', () => {
    it('should return all students when excludeAbsent is false', () => {
      const result = getEligibleStudents(mockStudents, false);
      expect(result).toHaveLength(6);
      expect(result).toEqual(mockStudents);
    });

    it('should exclude absent students when excludeAbsent is true', () => {
      const result = getEligibleStudents(mockStudents, true);
      expect(result).toHaveLength(4);
      expect(result.every((s) => !s.absent)).toBe(true);
      expect(result.map((s) => s.name)).toEqual(['Alice', 'Bob', 'Diana', 'Eve']);
    });

    it('should return a copy (not mutate original array)', () => {
      const result = getEligibleStudents(mockStudents, false);
      expect(result).not.toBe(mockStudents);
      expect(result).toEqual(mockStudents);
    });

    it('should return empty array if all students absent and excludeAbsent true', () => {
      const allAbsent = mockStudents.map((s) => ({ ...s, absent: true }));
      const result = getEligibleStudents(allAbsent, true);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterByHistory', () => {
    const students = [
      createStudent('1', 'Alice'),
      createStudent('2', 'Bob'),
      createStudent('3', 'Charlie'),
      createStudent('4', 'Diana'),
      createStudent('5', 'Eve'),
    ];

    it('should return all students when history is empty', () => {
      const result = filterByHistory(students, [], 5);
      expect(result).toHaveLength(5);
      expect(result).toEqual(students);
    });

    it('should return all students when excludeCount is 0', () => {
      const result = filterByHistory(students, ['1', '2'], 0);
      expect(result).toHaveLength(5);
    });

    it('should exclude students in recent history', () => {
      const history = ['2', '4']; // Bob, Diana recently selected
      const result = filterByHistory(students, history, 2);
      expect(result).toHaveLength(3);
      expect(result.map((s) => s.name)).toEqual(['Alice', 'Charlie', 'Eve']);
    });

    it('should only exclude up to excludeCount recent selections', () => {
      const history = ['1', '2', '3', '4', '5']; // All 5 in history
      const result = filterByHistory(students, history, 3);
      expect(result).toHaveLength(2);
      // Should exclude first 3 (Alice, Bob, Charlie), keep last 2
      expect(result.map((s) => s.name)).toEqual(['Diana', 'Eve']);
    });

    it('should return a copy (not mutate original array)', () => {
      const result = filterByHistory(students, [], 0);
      expect(result).not.toBe(students);
      expect(result).toEqual(students);
    });

    it('should return empty array if all students in recent history', () => {
      const history = ['1', '2', '3', '4', '5'];
      const result = filterByHistory(students, history, 10);
      expect(result).toHaveLength(0);
    });
  });

  describe('validateConfig', () => {
    it('should validate valid config', () => {
      const config: RandomSelectionConfig = {
        excludeAbsent: true,
        excludeRecentCount: 5,
        useWeightedSelection: false,
      };
      expect(validateConfig(config)).toBe(true);
    });

    it('should throw error for non-boolean excludeAbsent', () => {
      const config = {
        excludeAbsent: 'true' as unknown as boolean,
        excludeRecentCount: 5,
        useWeightedSelection: false,
      };
      expect(() => validateConfig(config)).toThrow('excludeAbsent must be a boolean');
    });

    it('should throw error for non-integer excludeRecentCount', () => {
      const config: RandomSelectionConfig = {
        excludeAbsent: true,
        excludeRecentCount: 5.5,
        useWeightedSelection: false,
      };
      expect(() => validateConfig(config)).toThrow('excludeRecentCount must be an integer between 0 and 10');
    });

    it('should throw error for negative excludeRecentCount', () => {
      const config: RandomSelectionConfig = {
        excludeAbsent: true,
        excludeRecentCount: -1,
        useWeightedSelection: false,
      };
      expect(() => validateConfig(config)).toThrow('excludeRecentCount must be an integer between 0 and 10');
    });

    it('should throw error for excludeRecentCount > 10', () => {
      const config: RandomSelectionConfig = {
        excludeAbsent: true,
        excludeRecentCount: 15,
        useWeightedSelection: false,
      };
      expect(() => validateConfig(config)).toThrow('excludeRecentCount must be an integer between 0 and 10');
    });

    it('should throw error for non-boolean useWeightedSelection', () => {
      const config = {
        excludeAbsent: true,
        excludeRecentCount: 5,
        useWeightedSelection: 'false' as unknown as boolean,
      };
      expect(() => validateConfig(config)).toThrow('useWeightedSelection must be a boolean');
    });
  });

  describe('selectRandomStudent', () => {
    it('should select a random student from the class', () => {
      const result = selectRandomStudent(mockStudents, [], DEFAULT_SELECTION_CONFIG);

      expect(result.student).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.wasInHistory).toBe(false);
      expect(result.eligibleCount).toBe(4); // 4 present students
      expect(result.availableCount).toBe(4);
    });

    it('should exclude absent students when excludeAbsent is true', () => {
      const config = { ...DEFAULT_SELECTION_CONFIG, excludeAbsent: true };
      const result = selectRandomStudent(mockStudents, [], config);

      expect(result.student.absent).toBe(false);
    });

    it('should include absent students when excludeAbsent is false', () => {
      const config = { ...DEFAULT_SELECTION_CONFIG, excludeAbsent: false };
      const result = selectRandomStudent(mockStudents, [], config);

      // With excludeAbsent false, eligible count should be 6 (all students)
      expect(result.eligibleCount).toBe(6);
    });

    it('should avoid students in recent history', () => {
      const history = ['1', '2']; // Alice, Bob recently selected
      const config = { ...DEFAULT_SELECTION_CONFIG, excludeRecentCount: 5 };

      // Run multiple times to ensure history filtering works
      const results = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const result = selectRandomStudent(mockStudents, history, config);
        results.add(result.student.id);
      }

      // Should never select Alice (1) or Bob (2) - they're in history
      expect(results.has('1')).toBe(false);
      expect(results.has('2')).toBe(false);
    });

    it('should fallback to eligible pool if all in history', () => {
      // All eligible students in history
      const history = ['1', '2', '4', '5']; // All 4 present students
      const config = { ...DEFAULT_SELECTION_CONFIG, excludeRecentCount: 10 };

      const result = selectRandomStudent(mockStudents, history, config);

      expect(result.student).toBeDefined();
      expect(result.wasInHistory).toBe(true); // Indicates fallback occurred
      expect(result.availableCount).toBe(0); // No available after history filter
      expect(result.eligibleCount).toBe(4); // But still 4 eligible (fallback pool)
    });

    it('should throw error for empty class', () => {
      expect(() => selectRandomStudent([], [], DEFAULT_SELECTION_CONFIG)).toThrow(
        'Cannot select from empty class'
      );
    });

    it('should throw error if all students absent and excludeAbsent true', () => {
      const allAbsent = mockStudents.map((s) => ({ ...s, absent: true }));
      const config = { ...DEFAULT_SELECTION_CONFIG, excludeAbsent: true };

      expect(() => selectRandomStudent(allAbsent, [], config)).toThrow(
        'No eligible students available'
      );
    });

    it('should respect excludeRecentCount = 0 (no history filtering)', () => {
      const history = ['1', '2', '3', '4', '5'];
      const config = { ...DEFAULT_SELECTION_CONFIG, excludeRecentCount: 0 };

      const result = selectRandomStudent(mockStudents, history, config);

      // With excludeRecentCount=0, history should be ignored
      expect(result.wasInHistory).toBe(false);
      expect(result.availableCount).toBe(4); // Same as eligible (history ignored)
    });

    it('should produce varied results over multiple calls (distribution test)', () => {
      const config = { ...DEFAULT_SELECTION_CONFIG, excludeAbsent: true };
      const results = new Map<string, number>();

      // Select 100 times
      for (let i = 0; i < 100; i++) {
        const result = selectRandomStudent(mockStudents, [], config);
        const count = results.get(result.student.id) || 0;
        results.set(result.student.id, count + 1);
      }

      // With 4 eligible students, expect each selected at least once
      // (Statistical test - 100 selections should cover all 4)
      expect(results.size).toBeGreaterThanOrEqual(3); // Allow some statistical variance

      // No single student should be selected >70% of the time (test fairness)
      for (const count of results.values()) {
        expect(count).toBeLessThan(70);
      }
    });

    it('should use default config if not provided', () => {
      const result = selectRandomStudent(mockStudents, []);

      // Default config should exclude absent students
      expect(result.student.absent).toBe(false);
      expect(result.eligibleCount).toBe(4);
    });

    it('should return correct metadata', () => {
      const history = ['1']; // Alice in history
      const config = { ...DEFAULT_SELECTION_CONFIG, excludeRecentCount: 5 };

      const result = selectRandomStudent(mockStudents, history, config);

      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.timestamp).toBeLessThanOrEqual(Date.now());
      expect(result.eligibleCount).toBe(4); // 4 present students
      expect(result.availableCount).toBe(3); // 4 - 1 (Alice in history)
      expect(typeof result.wasInHistory).toBe('boolean');
    });
  });

  describe('DEFAULT_SELECTION_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_SELECTION_CONFIG.excludeAbsent).toBe(true);
      expect(DEFAULT_SELECTION_CONFIG.excludeRecentCount).toBe(5);
      expect(DEFAULT_SELECTION_CONFIG.useWeightedSelection).toBe(false);
    });
  });
});

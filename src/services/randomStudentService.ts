/**
 * Random Student Selection Service
 *
 * Provides cryptographically secure random student selection with:
 * - True randomness using crypto.getRandomValues (not Math.random)
 * - History-aware selection (avoid recent picks)
 * - Absence filtering
 * - Comprehensive edge case handling
 *
 * @module randomStudentService
 */

import type { Student } from '../types';

/**
 * Configuration for random student selection
 */
export interface RandomSelectionConfig {
  /** If true, exclude absent students from selection pool */
  excludeAbsent: boolean;
  /** Number of recent selections to avoid (0-10, default: 5) */
  excludeRecentCount: number;
  /** Future: Use weighted selection (less frequent students get higher weight) */
  useWeightedSelection: boolean;
}

/**
 * Result of a random student selection
 */
export interface RandomSelectionResult {
  /** The selected student */
  student: Student;
  /** Timestamp when selection occurred */
  timestamp: number;
  /** Whether student was in recent history (but selected anyway due to no alternatives) */
  wasInHistory: boolean;
  /** Total number of eligible students before history filtering */
  eligibleCount: number;
  /** Number of students after history filtering */
  availableCount: number;
}

/**
 * Default configuration for random selection
 */
export const DEFAULT_SELECTION_CONFIG: RandomSelectionConfig = {
  excludeAbsent: true,
  excludeRecentCount: 5,
  useWeightedSelection: false,
};

/**
 * Get a cryptographically secure random index within a range
 * Uses crypto.getRandomValues for true randomness (not Math.random)
 *
 * @param max - Maximum value (exclusive)
 * @returns Random integer between 0 (inclusive) and max (exclusive)
 * @throws Error if max is not a positive integer
 *
 * @example
 * const index = getSecureRandomIndex(10); // 0-9
 */
export function getSecureRandomIndex(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new Error('Max must be a positive integer');
  }

  // Use crypto.getRandomValues for cryptographically secure randomness
  // This is better than Math.random() which is predictable
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);

  // Convert to range [0, max)
  return randomBuffer[0] % max;
}

/**
 * Filter students based on presence/absence
 *
 * @param students - Array of students to filter
 * @param excludeAbsent - If true, only return present students
 * @returns Filtered array of students
 *
 * @example
 * const presentStudents = getEligibleStudents(allStudents, true);
 */
export function getEligibleStudents(
  students: Student[],
  excludeAbsent: boolean
): Student[] {
  if (!excludeAbsent) {
    return [...students]; // Return copy to avoid mutation
  }

  return students.filter((student) => !student.absent);
}

/**
 * Filter out students who were recently selected
 *
 * @param students - Array of students to filter
 * @param history - Array of recently selected student IDs (most recent first)
 * @param excludeCount - Number of recent selections to exclude
 * @returns Filtered array of students
 *
 * @example
 * const availableStudents = filterByHistory(eligible, ['id1', 'id2'], 5);
 */
export function filterByHistory(
  students: Student[],
  history: string[],
  excludeCount: number
): Student[] {
  if (excludeCount === 0 || history.length === 0) {
    return [...students];
  }

  // Get recent IDs to exclude (limit to excludeCount)
  const recentIds = new Set(history.slice(0, excludeCount));

  return students.filter((student) => !recentIds.has(student.id));
}

/**
 * Select a random student from the class
 *
 * This is the main function for random student selection. It:
 * 1. Filters students based on configuration (presence, history)
 * 2. Uses cryptographically secure random selection
 * 3. Handles edge cases (empty class, all absent, all in history)
 * 4. Returns detailed result with metadata
 *
 * @param students - Array of all students in the class
 * @param history - Array of recently selected student IDs (most recent first)
 * @param config - Configuration for selection behavior
 * @returns Selection result with student and metadata
 * @throws Error if no students available for selection
 *
 * @example
 * const result = selectRandomStudent(students, history, config);
 * console.log(`Selected: ${result.student.name}`);
 * console.log(`Eligible: ${result.eligibleCount}, Available: ${result.availableCount}`);
 */
export function selectRandomStudent(
  students: Student[],
  history: string[],
  config: RandomSelectionConfig = DEFAULT_SELECTION_CONFIG
): RandomSelectionResult {
  // Edge case: Empty class
  if (students.length === 0) {
    throw new Error('Cannot select from empty class. Please add students first.');
  }

  // Step 1: Filter by presence/absence
  const eligible = getEligibleStudents(students, config.excludeAbsent);

  // Edge case: All students absent
  if (eligible.length === 0) {
    throw new Error('No eligible students available. All students are marked absent.');
  }

  // Step 2: Filter by history
  const available = filterByHistory(eligible, history, config.excludeRecentCount);

  // Edge case: All eligible students in recent history
  // Fallback: Select from eligible pool (ignore history this time)
  const pool = available.length > 0 ? available : eligible;
  const wasInHistory = available.length === 0;

  // Step 3: Cryptographically secure random selection
  const randomIndex = getSecureRandomIndex(pool.length);
  const selectedStudent = pool[randomIndex];

  // Step 4: Return detailed result
  return {
    student: selectedStudent,
    timestamp: Date.now(),
    wasInHistory,
    eligibleCount: eligible.length,
    availableCount: available.length,
  };
}

/**
 * Validate selection configuration
 *
 * @param config - Configuration to validate
 * @returns True if valid, throws Error if invalid
 * @throws Error with descriptive message if configuration is invalid
 *
 * @example
 * validateConfig({ excludeAbsent: true, excludeRecentCount: 5, useWeightedSelection: false });
 */
export function validateConfig(config: RandomSelectionConfig): boolean {
  if (typeof config.excludeAbsent !== 'boolean') {
    throw new Error('excludeAbsent must be a boolean');
  }

  if (!Number.isInteger(config.excludeRecentCount) ||
      config.excludeRecentCount < 0 ||
      config.excludeRecentCount > 10) {
    throw new Error('excludeRecentCount must be an integer between 0 and 10');
  }

  if (typeof config.useWeightedSelection !== 'boolean') {
    throw new Error('useWeightedSelection must be a boolean');
  }

  return true;
}

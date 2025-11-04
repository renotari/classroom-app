/**
 * Data models for Class Management (FASE 7)
 *
 * Defines Student and Class interfaces with TypeScript strict mode.
 */

/**
 * Represents a single student in a class
 */
export interface Student {
  /** Unique identifier (UUID) */
  id: string;

  /** First name */
  firstName: string;

  /** Last name */
  lastName: string;

  /** Whether the student is absent today */
  isAbsent: boolean;

  /** Optional notes about the student */
  notes?: string;

  /** Points for rewards system (Phase 10 - optional) */
  points?: number;
}

/**
 * Represents a classroom with students
 */
export interface Class {
  /** Unique identifier (UUID) */
  id: string;

  /** Class name (e.g., "3A Matematica") */
  name: string;

  /** List of students in this class */
  students: Student[];

  /** When this class was created */
  createdAt: Date;

  /** When this class was last updated */
  updatedAt: Date;
}

/**
 * Result of CSV parsing operation
 */
export interface CSVParseResult {
  /** Whether parsing was successful */
  success: boolean;

  /** Parsed students (if successful) */
  students: Student[];

  /** Validation errors/warnings */
  errors: string[];

  /** Number of rows processed */
  rowCount: number;
}

/**
 * Helper to get student's full name
 */
export function getStudentFullName(student: Student): string {
  return `${student.firstName} ${student.lastName}`.trim();
}

/**
 * Helper to create a new student with defaults
 */
export function createStudent(
  firstName: string,
  lastName: string,
  id?: string
): Student {
  return {
    id: id || crypto.randomUUID(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    isAbsent: false,
    notes: '',
    points: 0,
  };
}

/**
 * Helper to create a new class with defaults
 */
export function createClass(name: string, id?: string): Class {
  const now = new Date();
  return {
    id: id || crypto.randomUUID(),
    name: name.trim(),
    students: [],
    createdAt: now,
    updatedAt: now,
  };
}

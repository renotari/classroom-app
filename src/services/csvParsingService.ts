/**
 * CSV Parsing Service
 * FASE 7: Class Management - CSV Import/Export
 *
 * Handles CSV file parsing with:
 * - Multiple delimiter support (comma, semicolon, tab, pipe)
 * - Encoding detection (UTF-8, Windows-1252, ISO-8859-1)
 * - Italian character support (è, à, ò, ù)
 * - Data validation (max 30 students, required fields)
 * - Error handling and user feedback
 *
 * Edge Cases Handled:
 * - EC-006: CSV encoding/dirty data
 * - EC-009: Classes >30 students
 *
 * Reference: docs/technical-spec.md § CSV Import
 * Reference: docs/edge-cases.md EC-006, EC-009
 */

import Papa from 'papaparse';
import type { Student } from '../stores/classStore';

/**
 * CSV parsing configuration
 */
const CSV_CONFIG = {
  MAX_STUDENTS: 30,
  REQUIRED_FIELDS: ['name'] as const,
  DELIMITERS_TO_GUESS: [',', '\t', '|', ';'] as const,
  ENCODINGS: ['UTF-8', 'Windows-1252', 'ISO-8859-1'] as const,
} as const;

/**
 * CSV parsing result
 */
export interface CSVParseResult {
  success: boolean;
  students: Student[];
  errors: string[];
  warnings: string[];
  metadata: {
    totalRows: number;
    validRows: number;
    skippedRows: number;
    detectedDelimiter?: string;
    detectedEncoding?: string;
  };
}

/**
 * CSV row data (raw from Papaparse)
 */
interface CSVRowData {
  [key: string]: unknown;
  name?: string;
  Name?: string;
  nome?: string;
  student?: string;
  absent?: string | boolean;
  notes?: string;
}

/**
 * Parse CSV file content
 *
 * @param csvText - CSV file content as string
 * @param encoding - Optional encoding hint (default: UTF-8)
 * @returns Parse result with students or errors
 */
export function parseCSV(
  csvText: string,
  encoding: string = 'UTF-8'
): CSVParseResult {
  const result: CSVParseResult = {
    success: false,
    students: [],
    errors: [],
    warnings: [],
    metadata: {
      totalRows: 0,
      validRows: 0,
      skippedRows: 0,
      detectedEncoding: encoding,
    },
  };

  // Validate input
  if (!csvText || csvText.trim() === '') {
    result.errors.push('Il file CSV è vuoto');
    return result;
  }

  // Parse with Papaparse
  const parseResult = Papa.parse<CSVRowData>(csvText, {
    header: true,
    dynamicTyping: false, // Keep as strings for validation
    skipEmptyLines: true,
    delimitersToGuess: CSV_CONFIG.DELIMITERS_TO_GUESS as unknown as string[],
    transformHeader: (header: string) => header.trim(),
    transform: (value: string) => value.trim(),
  });

  // Check for critical parse errors (not warnings)
  const criticalErrors = parseResult.errors.filter(
    (err) => err.type === 'FieldMismatch' || err.type === 'Quotes'
  );
  if (criticalErrors.length > 0) {
    result.warnings.push(
      ...criticalErrors.map(
        (err) => `Warning riga ${err.row}: ${err.message}`
      )
    );
  }

  // Store metadata
  result.metadata.detectedDelimiter = parseResult.meta.delimiter;
  result.metadata.totalRows = parseResult.data.length;

  // Validate data exists
  if (parseResult.data.length === 0) {
    result.errors.push('Nessun dato trovato nel file CSV');
    return result;
  }

  // Check student limit (EC-009)
  if (parseResult.data.length > CSV_CONFIG.MAX_STUDENTS) {
    result.errors.push(
      `Troppi studenti (${parseResult.data.length}). Massimo consentito: ${CSV_CONFIG.MAX_STUDENTS}. Suggeriamo di dividere la classe in più file.`
    );
    return result;
  }

  // Process each row
  const processedStudents: Student[] = [];
  const seenNames = new Set<string>();

  parseResult.data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because: +1 for 1-based, +1 for header

    // Extract name from multiple possible column names
    const name = extractStudentName(row);

    if (!name || name === '') {
      result.errors.push(`Riga ${rowNumber}: Nome studente mancante`);
      result.metadata.skippedRows++;
      return;
    }

    // Check for duplicate names
    if (seenNames.has(name.toLowerCase())) {
      result.warnings.push(
        `Riga ${rowNumber}: Nome duplicato "${name}" (mantenuto comunque)`
      );
    }
    seenNames.add(name.toLowerCase());

    // Create student object
    const student: Student = {
      id: crypto.randomUUID(),
      name,
      absent: parseAbsentStatus(row.absent),
      notes: row.notes || undefined,
    };

    processedStudents.push(student);
    result.metadata.validRows++;
  });

  // Set result
  result.students = processedStudents;
  result.success = result.errors.length === 0 && processedStudents.length > 0;

  return result;
}

/**
 * Extract student name from row (tries multiple column names)
 */
function extractStudentName(row: CSVRowData): string {
  const possibleNames = [
    row.name,
    row.Name,
    row.nome,
    row.student,
    row.Nome,
    row.Student,
    row.NOME,
    row.NAME,
  ];

  for (const name of possibleNames) {
    if (typeof name === 'string' && name.trim() !== '') {
      return name.trim();
    }
  }

  return '';
}

/**
 * Parse absent status from various formats
 */
function parseAbsentStatus(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    // True values: "absent", "assente", "true", "1", "yes", "si", "sì"
    if (['absent', 'assente', 'true', '1', 'yes', 'si', 'sì'].includes(normalized)) {
      return true;
    }
  }

  // Default: not absent
  return false;
}

/**
 * Export students to CSV format
 *
 * @param students - Array of students to export
 * @param includeAbsent - Include absent column (default: true)
 * @param includeNotes - Include notes column (default: true)
 * @returns CSV string
 */
export function exportToCSV(
  students: Student[],
  options: {
    includeAbsent?: boolean;
    includeNotes?: boolean;
    delimiter?: ',' | ';' | '\t';
  } = {}
): string {
  const {
    includeAbsent = true,
    includeNotes = true,
    delimiter = ',',
  } = options;

  if (students.length === 0) {
    return '';
  }

  // Build header
  const headers: string[] = ['name'];
  if (includeAbsent) headers.push('absent');
  if (includeNotes) headers.push('notes');

  // Build rows
  const rows = students.map((student) => {
    const row: string[] = [escapeCSVValue(student.name)];
    if (includeAbsent) row.push(student.absent ? 'true' : 'false');
    if (includeNotes) row.push(escapeCSVValue(student.notes || ''));
    return row.join(delimiter);
  });

  // Combine header + rows
  return [headers.join(delimiter), ...rows].join('\n');
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCSVValue(value: string): string {
  if (!value) return '';

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Validate CSV file before parsing (quick check)
 *
 * @param file - File object
 * @returns Validation result
 */
export function validateCSVFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  const validTypes = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];
  const validExtensions = ['.csv', '.txt'];

  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidType && !hasValidExtension) {
    return {
      valid: false,
      error: 'Formato file non valido. Sono accettati solo file CSV o TXT.',
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File troppo grande. Dimensione massima: 5MB.',
    };
  }

  // Check file is not empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Il file è vuoto.',
    };
  }

  return { valid: true };
}

/**
 * Read file as text with encoding detection
 *
 * @param file - File object
 * @param encoding - Optional encoding (default: UTF-8)
 * @returns Promise<string> file content
 */
export function readFileAsText(
  file: File,
  encoding: string = 'UTF-8'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        resolve(text);
      } else {
        reject(new Error('Impossibile leggere il file come testo'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Errore durante la lettura del file'));
    };

    // Read with specified encoding
    reader.readAsText(file, encoding);
  });
}

/**
 * Attempt to parse CSV with multiple encodings
 * Tries UTF-8 first, then falls back to Windows-1252 and ISO-8859-1
 *
 * @param file - File object
 * @returns Promise<CSVParseResult>
 */
export async function parseCSVFile(file: File): Promise<CSVParseResult> {
  // Validate file first
  const validation = validateCSVFile(file);
  if (!validation.valid) {
    return {
      success: false,
      students: [],
      errors: [validation.error || 'File non valido'],
      warnings: [],
      metadata: {
        totalRows: 0,
        validRows: 0,
        skippedRows: 0,
      },
    };
  }

  // Try UTF-8 first
  let text = await readFileAsText(file, 'UTF-8');
  let result = parseCSV(text, 'UTF-8');

  // If UTF-8 fails or has issues with special characters, try Windows-1252
  if (!result.success || hasEncodingIssues(text)) {
    try {
      text = await readFileAsText(file, 'Windows-1252');
      const windowsResult = parseCSV(text, 'Windows-1252');

      // Use Windows-1252 result if better
      if (windowsResult.success || windowsResult.students.length > result.students.length) {
        result = windowsResult;
      }
    } catch (error) {
      // Keep UTF-8 result if Windows-1252 fails
    }
  }

  return result;
}

/**
 * Check if text has encoding issues (e.g., replacement characters)
 */
function hasEncodingIssues(text: string): boolean {
  // Check for Unicode replacement character
  if (text.includes('\uFFFD')) {
    return true;
  }

  // Check for common encoding issues with Italian characters
  const badPatterns = [
    'Ã¨', // è encoded wrong
    'Ã ', // à encoded wrong
    'Ã²', // ò encoded wrong
    'Ã¹', // ù encoded wrong
  ];

  return badPatterns.some((pattern) => text.includes(pattern));
}

/**
 * Service instance (for testing/mocking)
 */
export const csvParsingService = {
  parseCSV,
  parseCSVFile,
  exportToCSV,
  validateCSVFile,
  readFileAsText,
};

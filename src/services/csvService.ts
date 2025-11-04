/**
 * CSV Service - Student Import/Export
 * FASE 7 - Class Management
 *
 * Handles CSV parsing with:
 * - Encoding detection (UTF-8, ISO-8859-1, Windows-1252) - EC-006
 * - Delimiter detection (comma, semicolon, tab)
 * - Validation (max 30 students, required fields) - EC-009
 * - Error handling with Italian messages
 *
 * Expected CSV format: nome;cognome;classe (optional)
 * Or: firstName;lastName;class (optional)
 */

import Papa from 'papaparse';
import type { Student, CSVParseResult } from '../types/class';
import { createStudent } from '../types/class';
import { debug } from '../utils/debug';

const DEBUG_CSV = import.meta.env.DEV;
const debugLog = (msg: string) => {
  if (DEBUG_CSV) debug.log(`[CSVService] ${msg}`);
};

// Constants
const MAX_STUDENTS = 30; // EC-009: Hard limit
const SUPPORTED_DELIMITERS = [',', ';', '\t', '|'] as const;

/**
 * Parse CSV file and extract students
 *
 * @param file - CSV file from file input
 * @returns Parse result with students or errors
 */
export async function parseCSV(file: File): Promise<CSVParseResult> {
  debugLog(`Parsing CSV file: ${file.name} (${file.size} bytes)`);

  try {
    // Read file content
    const content = await readFileAsText(file);

    // Parse with Papaparse
    return new Promise((resolve) => {
      Papa.parse(content, {
        header: true,
        dynamicTyping: false, // Keep all as strings for validation
        skipEmptyLines: true,
        delimitersToGuess: [...SUPPORTED_DELIMITERS],
        transformHeader: (header) => normalizeHeader(header),
        complete: (results) => {
          debugLog(`Parsed ${results.data.length} rows`);
          const parseResult = processParseResults(results as Papa.ParseResult<Record<string, unknown>>);
          resolve(parseResult);
        },
        error: (error: Error) => {
          debugLog(`Parse error: ${error.message}`);
          resolve({
            success: false,
            students: [],
            errors: [`Errore durante la lettura del file: ${error.message}`],
            rowCount: 0,
          });
        },
      });
    });
  } catch (error) {
    debugLog(`File read error: ${error}`);
    return {
      success: false,
      students: [],
      errors: [
        `Impossibile leggere il file: ${
          error instanceof Error ? error.message : 'errore sconosciuto'
        }`,
      ],
      rowCount: 0,
    };
  }
}

/**
 * Read file as text with encoding detection
 */
async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      resolve(text);
    };

    reader.onerror = () => {
      reject(new Error('Errore durante la lettura del file'));
    };

    // Try UTF-8 first (most common)
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Normalize header names to standard format
 * Handles variations: nome/name/firstName, cognome/lastName/surname
 */
function normalizeHeader(header: string): string {
  const normalized = header.trim().toLowerCase();

  // Map Italian and English variations to standard names
  if (normalized === 'nome' || normalized === 'name' || normalized === 'firstname') {
    return 'firstName';
  }
  if (
    normalized === 'cognome' ||
    normalized === 'lastname' ||
    normalized === 'surname'
  ) {
    return 'lastName';
  }
  if (normalized === 'classe' || normalized === 'class') {
    return 'class';
  }

  // Return as-is for unknown headers
  return normalized;
}

/**
 * Process Papaparse results and validate data
 */
function processParseResults(
  results: Papa.ParseResult<Record<string, unknown>>
): CSVParseResult {
  const errors: string[] = [];
  const students: Student[] = [];
  const rawData = results.data as Array<Record<string, string>>;

  // Validation: Check if empty
  if (rawData.length === 0) {
    errors.push('Il file CSV è vuoto');
    return {
      success: false,
      students: [],
      errors,
      rowCount: 0,
    };
  }

  // Validation: EC-009 - Max 30 students
  if (rawData.length > MAX_STUDENTS) {
    errors.push(
      `Troppi studenti nel file (${rawData.length}). Il limite massimo è ${MAX_STUDENTS}.`
    );
    errors.push(
      `Suggerimento: dividi la classe in più file o rimuovi ${
        rawData.length - MAX_STUDENTS
      } studenti.`
    );
    return {
      success: false,
      students: [],
      errors,
      rowCount: rawData.length,
    };
  }

  // Process each row
  rawData.forEach((row, index) => {
    const rowNumber = index + 2; // +1 for 1-indexed, +1 for header row

    // Extract and validate fields
    const firstName = (row.firstName || row.nome || '').trim();
    const lastName = (row.lastName || row.cognome || '').trim();

    // Validation: Required fields
    if (!firstName || !lastName) {
      if (!firstName && !lastName) {
        errors.push(`Riga ${rowNumber}: Nome e cognome mancanti`);
      } else if (!firstName) {
        errors.push(`Riga ${rowNumber}: Nome mancante (cognome: ${lastName})`);
      } else {
        errors.push(`Riga ${rowNumber}: Cognome mancante (nome: ${firstName})`);
      }
      return; // Skip this row
    }

    // EC-006: Validate Italian characters
    if (!isValidName(firstName)) {
      errors.push(
        `Riga ${rowNumber}: Nome contiene caratteri non validi: "${firstName}"`
      );
      return;
    }
    if (!isValidName(lastName)) {
      errors.push(
        `Riga ${rowNumber}: Cognome contiene caratteri non validi: "${lastName}"`
      );
      return;
    }

    // Create student
    const student = createStudent(firstName, lastName);
    students.push(student);
  });

  // Success if we have at least one student and no critical errors
  const success = students.length > 0 && errors.length === 0;

  debugLog(
    `Processed ${students.length} students with ${errors.length} errors`
  );

  return {
    success,
    students,
    errors,
    rowCount: rawData.length,
  };
}

/**
 * Validate name contains only letters, spaces, hyphens, and apostrophes
 * Allows Italian characters: à è é ì ò ù
 */
function isValidName(name: string): boolean {
  // Allow: letters (including accented), spaces, hyphens, apostrophes
  const validNameRegex = /^[a-zA-ZÀ-ÿ' -]+$/;
  return validNameRegex.test(name) && name.length > 0 && name.length <= 50;
}

/**
 * Export students to CSV format
 *
 * @param students - Students to export
 * @returns CSV string (with semicolon delimiter for Excel compatibility)
 */
export function exportToCSV(students: Student[]): string {
  debugLog(`Exporting ${students.length} students to CSV`);

  // Header
  const header = 'nome;cognome;presente';

  // Rows
  const rows = students.map((s) => {
    const presente = s.isAbsent ? 'no' : 'si';
    return `${s.firstName};${s.lastName};${presente}`;
  });

  return [header, ...rows].join('\n');
}

/**
 * Download CSV file (browser download)
 *
 * @param csv - CSV content
 * @param filename - Filename for download
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  debugLog(`Downloaded CSV: ${filename}`);
}

/**
 * Get example CSV content for template
 */
export function getExampleCSV(): string {
  return `nome;cognome;classe
Mario;Rossi;3A
Giulia;Bianchi;3A
Luca;Verdi;3A
Sofia;Romano;3A
Alessandro;Ferrari;3A`;
}

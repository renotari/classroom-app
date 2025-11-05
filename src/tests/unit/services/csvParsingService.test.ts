/**
 * CSV Parsing Service - Unit Tests
 * FASE 7: Class Management - CSV Import
 *
 * Tests for EC-006 (CSV encoding/dirty data) and EC-009 (>30 students)
 *
 * Coverage:
 * - Basic CSV parsing (comma, semicolon, tab delimiters)
 * - Italian character support (UTF-8, Windows-1252)
 * - Validation (max 30 students, required fields)
 * - Error handling (empty file, malformed data)
 * - Export to CSV
 * - File validation
 */

import { describe, it, expect } from 'vitest';
import {
  parseCSV,
  exportToCSV,
  validateCSVFile,
} from '../../../services/csvParsingService';
import type { Student } from '../../../stores/classStore';

describe('csvParsingService', () => {
  describe('parseCSV - Basic Parsing', () => {
    it('should parse valid CSV with comma delimiter', () => {
      const csv = `name,absent,notes
Marco,false,Good student
Giulia,false,
Luca,true,Sick`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
      expect(result.students[0]!.name).toBe('Marco');
      expect(result.students[0]!.absent).toBe(false);
      expect(result.students[1]!.name).toBe('Giulia');
      expect(result.students[2]!.name).toBe('Luca');
      expect(result.students[2]!.absent).toBe(true);
    });

    it('should parse CSV with semicolon delimiter', () => {
      const csv = `name;absent;notes
Sofia;false;Excellent
Andrea;true;`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(2);
      expect(result.metadata.detectedDelimiter).toBe(';');
      expect(result.students[0]!.name).toBe('Sofia');
      expect(result.students[1]!.name).toBe('Andrea');
    });

    it('should parse CSV with tab delimiter', () => {
      const csv = `name\tabsent\tnotes
Elena\tfalse\t
Francesco\tfalse\tGood`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(2);
      expect(result.metadata.detectedDelimiter).toBe('\t');
      expect(result.students[0]!.name).toBe('Elena');
    });

    it('should parse CSV with only name column', () => {
      const csv = `name
Matteo
Chiara
Davide`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(3);
      expect(result.students[0]!.name).toBe('Matteo');
      expect(result.students[0]!.absent).toBe(false); // Default
      expect(result.students[1]!.name).toBe('Chiara');
      expect(result.students[2]!.name).toBe('Davide');
    });
  });

  describe('parseCSV - Italian Characters (EC-006)', () => {
    it('should handle Italian characters correctly', () => {
      const csv = `name,absent,notes
Nicolò,false,
Martìn,false,
José,false,
François,false,`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(4);
      expect(result.students[0]!.name).toBe('Nicolò');
      expect(result.students[1]!.name).toBe('Martìn');
      expect(result.students[2]!.name).toBe('José');
      expect(result.students[3]!.name).toBe('François');
    });

    it('should handle names with accents (è, à, ò, ù)', () => {
      const csv = `name
Renée
André
Zoè
Simòn`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(4);
      expect(result.students[0]!.name).toBe('Renée');
      expect(result.students[1]!.name).toBe('André');
      expect(result.students[2]!.name).toBe('Zoè');
      expect(result.students[3]!.name).toBe('Simòn');
    });
  });

  describe('parseCSV - Column Name Variations', () => {
    it('should recognize "Name" with capital N', () => {
      const csv = `Name,absent
Giovanni,false`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students[0]!.name).toBe('Giovanni');
    });

    it('should recognize "nome" (Italian)', () => {
      const csv = `nome,assente
Francesca,false`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students[0]!.name).toBe('Francesca');
    });

    it('should recognize "student" column', () => {
      const csv = `student,absent
Alessandro,false`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students[0]!.name).toBe('Alessandro');
    });
  });

  describe('parseCSV - Whitespace Handling (EC-006)', () => {
    it('should trim whitespace from names', () => {
      const csv = `name,absent
  Marco  ,false
 Giulia ,false`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students[0]!.name).toBe('Marco');
      expect(result.students[1]!.name).toBe('Giulia');
    });

    it('should trim whitespace from headers', () => {
      const csv = `  name  ,  absent  ,  notes
Marco,false,Good`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students[0]!.name).toBe('Marco');
    });

    it('should skip empty lines', () => {
      const csv = `name,absent

Marco,false

Giulia,false

`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(2);
      expect(result.students[0]!.name).toBe('Marco');
      expect(result.students[1]!.name).toBe('Giulia');
    });
  });

  describe('parseCSV - Validation (EC-009)', () => {
    it('should reject CSV with >30 students', () => {
      // Generate CSV with 31 students
      const headers = 'name,absent\n';
      const rows = Array.from({ length: 31 }, (_, i) => `Student${i},false`).join('\n');
      const csv = headers + rows;

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Troppi studenti');
      expect(result.errors[0]).toContain('31');
      expect(result.errors[0]).toContain('30');
    });

    it('should accept CSV with exactly 30 students', () => {
      // Generate CSV with 30 students
      const headers = 'name,absent\n';
      const rows = Array.from({ length: 30 }, (_, i) => `Student${i},false`).join('\n');
      const csv = headers + rows;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(30);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject rows with missing name', () => {
      const csv = `name,absent
Marco,false
,false
Giulia,false`;

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Nome studente mancante');
      expect(result.metadata.skippedRows).toBe(1);
      expect(result.metadata.validRows).toBe(2);
    });
  });

  describe('parseCSV - Error Handling', () => {
    it('should reject empty CSV', () => {
      const csv = '';

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Il file CSV è vuoto');
    });

    it('should reject CSV with only whitespace', () => {
      const csv = '   \n  \n  ';

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Il file CSV è vuoto');
    });

    it('should reject CSV with only headers', () => {
      const csv = 'name,absent,notes\n';

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Nessun dato trovato nel file CSV');
    });
  });

  describe('parseCSV - Absent Status Parsing', () => {
    it('should parse absent as true for "absent" string', () => {
      const csv = `name,absent
Marco,absent`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students[0]!.absent).toBe(true);
    });

    it('should parse absent as true for "assente" (Italian)', () => {
      const csv = `name,absent
Marco,assente`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students[0]!.absent).toBe(true);
    });

    it('should parse absent as true for "true" string', () => {
      const csv = `name,absent
Marco,true`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students[0]!.absent).toBe(true);
    });

    it('should parse absent as true for "1"', () => {
      const csv = `name,absent
Marco,1`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students[0]!.absent).toBe(true);
    });

    it('should parse absent as false for "false", "0", empty', () => {
      const csv = `name,absent
Marco,false
Giulia,0
Luca,`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students[0]!.absent).toBe(false);
      expect(result.students[1]!.absent).toBe(false);
      expect(result.students[2]!.absent).toBe(false);
    });
  });

  describe('parseCSV - Duplicate Names', () => {
    it('should warn about duplicate names but keep them', () => {
      const csv = `name,absent
Marco,false
Giulia,false
Marco,false`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(3);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('duplicato');
      expect(result.warnings[0]).toContain('Marco');
    });
  });

  describe('parseCSV - Metadata', () => {
    it('should return correct metadata', () => {
      const csv = `name,absent
Marco,false

Giulia,false
,false`;

      const result = parseCSV(csv);

      expect(result.metadata.totalRows).toBe(3); // 3 non-empty rows
      expect(result.metadata.validRows).toBe(2); // 2 valid students
      expect(result.metadata.skippedRows).toBe(1); // 1 row with missing name
      expect(result.metadata.detectedDelimiter).toBe(',');
      expect(result.metadata.detectedEncoding).toBe('UTF-8');
    });
  });

  describe('exportToCSV', () => {
    it('should export students to CSV format', () => {
      const students: Student[] = [
        { id: '1', name: 'Marco', absent: false },
        { id: '2', name: 'Giulia', absent: true, notes: 'Sick' },
        { id: '3', name: 'Luca', absent: false, notes: 'Good student' },
      ];

      const csv = exportToCSV(students);

      expect(csv).toContain('name,absent,notes');
      expect(csv).toContain('Marco,false,');
      expect(csv).toContain('Giulia,true,Sick');
      expect(csv).toContain('Luca,false,Good student');
    });

    it('should export with semicolon delimiter', () => {
      const students: Student[] = [
        { id: '1', name: 'Marco', absent: false },
      ];

      const csv = exportToCSV(students, { delimiter: ';' });

      expect(csv).toContain('name;absent;notes');
      expect(csv).toContain('Marco;false;');
    });

    it('should export without absent column', () => {
      const students: Student[] = [
        { id: '1', name: 'Marco', absent: false },
      ];

      const csv = exportToCSV(students, { includeAbsent: false });

      expect(csv).toContain('name,notes');
      expect(csv).not.toContain('absent');
      expect(csv).toContain('Marco,');
    });

    it('should export without notes column', () => {
      const students: Student[] = [
        { id: '1', name: 'Marco', absent: false, notes: 'Test' },
      ];

      const csv = exportToCSV(students, { includeNotes: false });

      expect(csv).toContain('name,absent');
      expect(csv).not.toContain('notes');
      expect(csv).toContain('Marco,false');
    });

    it('should escape values with commas', () => {
      const students: Student[] = [
        { id: '1', name: 'Marco Rossi', absent: false, notes: 'Good, excellent student' },
      ];

      const csv = exportToCSV(students);

      expect(csv).toContain('"Good, excellent student"');
    });

    it('should handle empty student list', () => {
      const csv = exportToCSV([]);

      expect(csv).toBe('');
    });
  });

  describe('validateCSVFile', () => {
    it('should accept valid CSV file', () => {
      const file = new File(['name,absent\nMarco,false'], 'students.csv', {
        type: 'text/csv',
      });

      const result = validateCSVFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept TXT file', () => {
      const file = new File(['name,absent\nMarco,false'], 'students.txt', {
        type: 'text/plain',
      });

      const result = validateCSVFile(file);

      expect(result.valid).toBe(true);
    });

    it('should reject non-CSV file types', () => {
      const file = new File(['test'], 'document.pdf', {
        type: 'application/pdf',
      });

      const result = validateCSVFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato file non valido');
    });

    it('should reject empty file', () => {
      const file = new File([], 'empty.csv', {
        type: 'text/csv',
      });

      const result = validateCSVFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('vuoto');
    });

    it('should reject file >5MB', () => {
      const largeContent = 'a'.repeat(6 * 1024 * 1024); // 6MB
      const file = new File([largeContent], 'large.csv', {
        type: 'text/csv',
      });

      const result = validateCSVFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('troppo grande');
    });
  });
});

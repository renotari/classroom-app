/**
 * CSV Service Unit Tests
 * FASE 7 - Class Management
 *
 * Tests CSV parsing with:
 * - Valid CSV files
 * - Italian characters (EC-006)
 * - Dirty data (EC-006): extra whitespace, empty rows
 * - Max 30 students validation (EC-009)
 * - Error handling
 */

import { describe, it, expect } from 'vitest';
import { parseCSV, exportToCSV, getExampleCSV } from '../../../services/csvService';
import type { Student } from '../../../types/class';

describe('csvService', () => {
  describe('parseCSV - Valid CSV', () => {
    it('should parse valid CSV with semicolon delimiter', async () => {
      const csvContent = 'nome;cognome\nMario;Rossi\nGiulia;Bianchi';
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(2);
      expect(result.students[0].firstName).toBe('Mario');
      expect(result.students[0].lastName).toBe('Rossi');
      expect(result.students[1].firstName).toBe('Giulia');
      expect(result.students[1].lastName).toBe('Bianchi');
      expect(result.errors).toHaveLength(0);
    });

    it('should parse CSV with comma delimiter', async () => {
      const csvContent = 'firstName,lastName\nLuca,Verdi\nSofia,Romano';
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(2);
      expect(result.students[0].firstName).toBe('Luca');
      expect(result.students[1].firstName).toBe('Sofia');
    });

    it('should normalize header variations', async () => {
      const csvContent = 'Name;Surname\nAlessandro;Ferrari\nFrancesca;Colombo';
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(2);
    });
  });

  describe('parseCSV - EC-006: Italian Characters', () => {
    it('should handle Italian accented characters', async () => {
      const csvContent = 'nome;cognome\nJosé;García\nNicolò;Martìn\nAndré;Müller';
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(3);
      expect(result.students[0].firstName).toBe('José');
      expect(result.students[1].firstName).toBe('Nicolò');
      expect(result.students[2].firstName).toBe('André');
    });

    it('should handle apostrophes and hyphens in names', async () => {
      const csvContent = "nome;cognome\nMarie-Claire;O'Connor\nJean-Luc;D'Angelo";
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(2);
      expect(result.students[0].firstName).toBe('Marie-Claire');
      expect(result.students[1].lastName).toBe("D'Angelo");
    });
  });

  describe('parseCSV - EC-006: Dirty Data', () => {
    it('should skip empty rows', async () => {
      const csvContent = 'nome;cognome\n\n\nMario;Rossi\n\n\nGiulia;Bianchi\n\n';
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(2);
    });

    it('should trim whitespace from names', async () => {
      const csvContent = 'nome;cognome\n  Mario  ;  Rossi  \n   Giulia   ;   Bianchi   ';
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(true);
      expect(result.students[0].firstName).toBe('Mario');
      expect(result.students[0].lastName).toBe('Rossi');
      expect(result.students[1].firstName).toBe('Giulia');
    });

    it('should detect tab delimiter', async () => {
      const csvContent = 'nome\tcognome\nMario\tRossi\nGiulia\tBianchi';
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(2);
    });
  });

  describe('parseCSV - EC-009: Max 30 Students', () => {
    it('should accept exactly 30 students', async () => {
      const names = ['Mario', 'Giulia', 'Luca', 'Sofia', 'Alessandro', 'Francesca',
                     'Matteo', 'Chiara', 'Lorenzo', 'Elena', 'Andrea', 'Sara',
                     'Francesco', 'Alice', 'Davide', 'Martina', 'Gabriele', 'Anna',
                     'Riccardo', 'Federica', 'Tommaso', 'Beatrice', 'Marco', 'Valentina',
                     'Filippo', 'Giorgia', 'Simone', 'Camilla', 'Nicola', 'Elisa'];
      const surnames = ['Rossi', 'Bianchi', 'Verdi', 'Romano', 'Ferrari', 'Colombo',
                        'Ricci', 'Marino', 'Greco', 'Bruno', 'Galli', 'Conti',
                        'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi',
                        'Moretti', 'Barbieri', 'Fontana', 'Santoro', 'Mariani', 'Rinaldi',
                        'Caruso', 'Ferrara', 'Gallo', 'Martini', 'Leone', 'Longo'];
      const rows = names.map((name, i) => `${name};${surnames[i]}`);
      const csvContent = `nome;cognome\n${rows.join('\n')}`;
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(30);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject more than 30 students', async () => {
      const rows = Array.from({ length: 35 }, (_, i) => {
        const baseNames = ['Mario', 'Giulia', 'Luca', 'Sofia', 'Alessandro'];
        const baseSurnames = ['Rossi', 'Bianchi', 'Verdi', 'Romano', 'Ferrari'];
        return `${baseNames[i % 5]};${baseSurnames[i % 5]}`;
      });
      const csvContent = `nome;cognome\n${rows.join('\n')}`;
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(false);
      expect(result.students).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('35');
      expect(result.errors[0]).toContain('30');
    });
  });

  describe('parseCSV - Validation Errors', () => {
    it('should report missing first name', async () => {
      const csvContent = 'nome;cognome\n;Rossi\nGiulia;Bianchi';
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(false);
      expect(result.students).toHaveLength(1); // Only Giulia
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Nome mancante');
    });

    it('should report missing last name', async () => {
      const csvContent = 'nome;cognome\nMario;\nGiulia;Bianchi';
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(false);
      expect(result.students).toHaveLength(1);
      expect(result.errors[0]).toContain('Cognome mancante');
    });

    it('should report empty CSV file', async () => {
      const csvContent = 'nome;cognome\n';
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(false);
      expect(result.students).toHaveLength(0);
      expect(result.errors[0]).toContain('vuoto');
    });

    it('should validate name length and characters', async () => {
      const tooLongName = 'A'.repeat(60);
      const csvContent = `nome;cognome\n${tooLongName};Rossi`;
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      const result = await parseCSV(file);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('non validi');
    });
  });

  describe('exportToCSV', () => {
    it('should export students to CSV format', () => {
      const students: Student[] = [
        {
          id: '1',
          firstName: 'Mario',
          lastName: 'Rossi',
          isAbsent: false,
        },
        {
          id: '2',
          firstName: 'Giulia',
          lastName: 'Bianchi',
          isAbsent: true,
        },
      ];

      const csv = exportToCSV(students);

      expect(csv).toContain('nome;cognome;presente');
      expect(csv).toContain('Mario;Rossi;si');
      expect(csv).toContain('Giulia;Bianchi;no');
    });
  });

  describe('getExampleCSV', () => {
    it('should return valid example CSV', () => {
      const example = getExampleCSV();

      expect(example).toContain('nome;cognome;classe');
      expect(example).toContain('Mario;Rossi');
    });
  });
});

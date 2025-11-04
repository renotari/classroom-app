/**
 * CSVImportModal Component
 * FASE 7 - Class Management
 *
 * Modal for importing students from CSV file
 * Handles EC-006 (encoding), EC-009 (max 30 students)
 */

import { useState } from 'react';
import { parseCSV } from '../../services/csvService';
import { useClassStore } from '../../stores/classStore';
import type { Student } from '../../types/class';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
}

export function CSVImportModal({
  isOpen,
  onClose,
  classId,
  className,
}: CSVImportModalProps) {
  const importStudents = useClassStore((state) => state.importStudents);

  const [file, setFile] = useState<File | null>(null);
  const [previewStudents, setPreviewStudents] = useState<Student[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewStudents([]);
    setErrors([]);
    setImportSuccess(false);
    setIsProcessing(true);

    try {
      const result = await parseCSV(selectedFile);

      if (result.success) {
        setPreviewStudents(result.students);
        setErrors([]);
      } else {
        setPreviewStudents([]);
        setErrors(result.errors);
      }
    } catch (error) {
      setErrors([
        `Errore durante il parsing: ${
          error instanceof Error ? error.message : 'errore sconosciuto'
        }`,
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    importStudents(classId, previewStudents);
    setImportSuccess(true);
    setTimeout(() => {
      onClose();
      resetState();
    }, 1500);
  };

  const handleCancel = () => {
    onClose();
    resetState();
  };

  const resetState = () => {
    setFile(null);
    setPreviewStudents([]);
    setErrors([]);
    setImportSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-elevated flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary">Importa Studenti</h2>
            <p className="text-sm text-secondary mt-1">
              Classe: <span className="font-semibold">{className}</span>
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-elevated rounded-lg transition-colors"
            aria-label="Chiudi"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Seleziona file CSV
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div
                  className="px-4 py-3 bg-elevated border-2 border-dashed border-elevated
                           rounded-lg hover:border-accent transition-colors text-center"
                >
                  {file ? (
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-secondary mt-1">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <p className="text-secondary">
                      Clicca per selezionare un file CSV
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Seleziona file CSV"
                />
              </label>

              {/* Download Template */}
              <a
                href="/template_studenti.csv"
                download="template_studenti.csv"
                className="px-4 py-3 bg-info/20 text-info rounded-lg hover:bg-info/30
                         transition-colors font-medium whitespace-nowrap"
              >
                📥 Template
              </a>
            </div>

            {/* Format Help */}
            <div className="mt-3 p-3 bg-info/10 border border-info/30 rounded-lg">
              <p className="text-sm text-info">
                <strong>Formato richiesto:</strong> nome;cognome;classe
              </p>
              <p className="text-xs text-info/80 mt-1">
                Il file deve essere in formato CSV con separatore punto e virgola
                (;)
              </p>
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
              <p className="mt-3 text-secondary">Elaborazione file in corso...</p>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg">
              <h4 className="font-semibold text-error mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Errori trovati ({errors.length})
              </h4>
              <ul className="text-sm space-y-1 text-error/90">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Students */}
          {previewStudents.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-success"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Anteprima Studenti ({previewStudents.length})
              </h4>

              <div className="max-h-64 overflow-y-auto border border-elevated rounded-lg">
                <table className="w-full">
                  <thead className="bg-elevated sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium">
                        #
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium">
                        Nome
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium">
                        Cognome
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewStudents.map((student, index) => (
                      <tr
                        key={student.id}
                        className="border-t border-elevated hover:bg-elevated/50"
                      >
                        <td className="px-4 py-2 text-sm text-secondary">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2">{student.firstName}</td>
                        <td className="px-4 py-2">{student.lastName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Success Message */}
          {importSuccess && (
            <div className="p-4 bg-success/10 border border-success/30 rounded-lg text-center">
              <p className="text-success font-semibold">
                ✓ {previewStudents.length} studenti importati con successo!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-elevated flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-elevated rounded-lg hover:bg-surface
                     transition-colors font-medium"
          >
            Annulla
          </button>
          <button
            onClick={handleImport}
            disabled={previewStudents.length === 0 || importSuccess}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90
                     disabled:opacity-50 disabled:cursor-not-allowed transition-opacity
                     font-medium"
          >
            Importa {previewStudents.length > 0 && `(${previewStudents.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

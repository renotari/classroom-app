/**
 * CSVImportModal Component
 * FASE 7: Class Management
 *
 * Modal for importing students from CSV file
 * Handles EC-006 (encoding/dirty data) and EC-009 (>30 students)
 */

import { useState, useRef } from 'react';
import { useClassStore } from '../../stores/classStore';
import { parseCSVFile } from '../../services/csvParsingService';
import type { CSVParseResult } from '../../services/csvParsingService';

interface CSVImportModalProps {
  classId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CSVImportModal({
  classId,
  onClose,
  onSuccess,
}: CSVImportModalProps) {
  const { importFromCSV } = useClassStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setParseResult(null);

    try {
      const result = await parseCSVFile(file);
      setParseResult(result);

      if (!result.success) {
        setError(result.errors.join('\n'));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Errore durante la lettura del file'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!parseResult || !parseResult.success) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Generate CSV text from students
      const csvText = [
        'name,absent,notes',
        ...parseResult.students.map(
          (s) => `${s.name},${s.absent},${s.notes || ''}`
        ),
      ].join('\n');

      await importFromCSV(classId, csvText);
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Errore durante l\'importazione'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-elevated">
          <h2 className="text-xl font-semibold">Importa Studenti da CSV</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
            aria-label="Chiudi"
          >
            <svg
              className="w-5 h-5"
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
        <div className="flex-1 overflow-y-auto p-6">
          {/* Instructions */}
          {!parseResult && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Formato CSV richiesto:</h3>
              <div className="bg-surface rounded-lg p-4 font-mono text-sm">
                name,absent,notes
                <br />
                Marco Rossi,false,
                <br />
                Giulia Bianchi,true,Malata
                <br />
                Luca Verde,false,Ottimo studente
              </div>
              <div className="mt-4 text-sm text-text-secondary space-y-1">
                <p>• Delimitatori supportati: virgola, punto e virgola, tab</p>
                <p>• Encoding: UTF-8, Windows-1252</p>
                <p>• Massimo: 30 studenti per classe</p>
                <p>• Colonna "name" obbligatoria</p>
              </div>
            </div>
          )}

          {/* File Input */}
          {!parseResult && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full px-6 py-4 rounded-lg bg-primary text-white hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Elaborazione...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Seleziona File CSV
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-error bg-opacity-20 border border-error text-error">
              <div className="font-medium mb-2">Errore:</div>
              <div className="text-sm whitespace-pre-wrap">{error}</div>
            </div>
          )}

          {/* Preview */}
          {parseResult && parseResult.success && (
            <div>
              <div className="mb-4">
                <h3 className="font-medium mb-2">
                  Anteprima ({parseResult.students.length} studenti)
                </h3>
                {parseResult.warnings.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-warning bg-opacity-20 border border-warning text-warning text-sm">
                    <div className="font-medium mb-1">Avvisi:</div>
                    {parseResult.warnings.map((warning, i) => (
                      <div key={i}>• {warning}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {parseResult.students.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-surface-elevated"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{student.name}</div>
                      {student.notes && (
                        <div className="text-sm text-text-secondary">
                          {student.notes}
                        </div>
                      )}
                    </div>
                    <div
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${
                          student.absent
                            ? 'bg-error bg-opacity-20 text-error'
                            : 'bg-success bg-opacity-20 text-success'
                        }
                      `}
                    >
                      {student.absent ? 'Assente' : 'Presente'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-lg bg-surface-elevated text-sm">
                <div className="flex justify-between">
                  <span>Totale studenti:</span>
                  <span className="font-medium">
                    {parseResult.metadata.validRows}
                  </span>
                </div>
                {parseResult.metadata.skippedRows > 0 && (
                  <div className="flex justify-between mt-1 text-warning">
                    <span>Righe saltate:</span>
                    <span className="font-medium">
                      {parseResult.metadata.skippedRows}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-surface-elevated">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            Annulla
          </button>
          {parseResult && parseResult.success && (
            <button
              onClick={handleConfirmImport}
              disabled={isProcessing}
              className="px-6 py-2 rounded-lg bg-success text-white hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Importazione...' : 'Conferma Importazione'}
            </button>
          )}
          {parseResult && !parseResult.success && (
            <button
              onClick={() => {
                setParseResult(null);
                setError(null);
              }}
              className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-opacity-90 transition-colors"
            >
              Riprova
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

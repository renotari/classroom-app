/**
 * ClassManagementPanel Component
 * FASE 7: Class Management
 *
 * Main panel for class and student management
 */

import { useState } from 'react';
import { useClassStore } from '../../stores/classStore';
import { ClassSelector } from './ClassSelector';
import { StudentList } from './StudentList';
import { AddStudentForm } from './AddStudentForm';
import { CSVImportModal } from './CSVImportModal';
import { CSVExportButton } from './CSVExportButton';
import { MarkAbsencesModal } from './MarkAbsencesModal';

export function ClassManagementPanel() {
  const { activeClassId, removeStudent } = useClassStore();

  const [showImportModal, setShowImportModal] = useState(false);
  const [showAbsencesModal, setShowAbsencesModal] = useState(false);

  if (!activeClassId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <svg
          className="w-16 h-16 text-text-secondary mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <h2 className="text-xl font-semibold mb-2">Nessuna Classe Selezionata</h2>
        <p className="text-text-secondary mb-6">
          Crea una nuova classe per iniziare
        </p>
        <ClassSelector />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 pb-6 border-b border-surface-elevated">
        <ClassSelector />
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex flex-wrap gap-3 py-6">
        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
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
          Importa CSV
        </button>

        <CSVExportButton classId={activeClassId} />

        <button
          onClick={() => setShowAbsencesModal(true)}
          className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          Segna Presenze
        </button>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          <AddStudentForm classId={activeClassId} />

          <StudentList
            classId={activeClassId}
            onRemoveStudent={(studentId) => removeStudent(activeClassId, studentId)}
          />
        </div>
      </div>

      {/* Modals */}
      {showImportModal && (
        <CSVImportModal
          classId={activeClassId}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => setShowImportModal(false)}
        />
      )}

      {showAbsencesModal && (
        <MarkAbsencesModal
          classId={activeClassId}
          onClose={() => setShowAbsencesModal(false)}
        />
      )}
    </div>
  );
}

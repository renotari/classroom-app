/**
 * ClassManagementPanel Component
 * FASE 7 - Class Management
 *
 * Main container for class management features
 */

import { useState } from 'react';
import { useClassStore } from '../../stores/classStore';
import { ClassSelector } from './ClassSelector';
import { ManageClassesModal } from './ManageClassesModal';
import { CSVImportModal } from './CSVImportModal';
import { MarkAbsencesPanel } from './MarkAbsencesPanel';

type ActiveView = 'overview' | 'absences' | 'students';

export function ClassManagementPanel() {
  const getSelectedClass = useClassStore((state) => state.getSelectedClass);

  const [showManageModal, setShowManageModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('overview');

  const selectedClass = getSelectedClass();

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      {/* Class Selector */}
      <ClassSelector onManageClick={() => setShowManageModal(true)} />

      {/* Main Content */}
      {!selectedClass ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold mb-2">Nessuna classe selezionata</h3>
            <p className="text-secondary mb-6">
              Crea o seleziona una classe per iniziare
            </p>
            <button
              onClick={() => setShowManageModal(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90
                       transition-opacity font-medium"
            >
              Gestisci Classi
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6">
          {/* Action Tabs */}
          <div className="flex gap-2 border-b border-elevated pb-2">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeView === 'overview'
                  ? 'bg-primary text-white'
                  : 'bg-elevated hover:bg-surface'
              }`}
            >
              Panoramica
            </button>
            <button
              onClick={() => setActiveView('absences')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeView === 'absences'
                  ? 'bg-primary text-white'
                  : 'bg-elevated hover:bg-surface'
              }`}
            >
              Segna Assenze
            </button>
            <button
              onClick={() => setActiveView('students')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeView === 'students'
                  ? 'bg-primary text-white'
                  : 'bg-elevated hover:bg-surface'
              }`}
            >
              Lista Studenti
            </button>
          </div>

          {/* View Content */}
          <div className="flex-1 overflow-y-auto">
            {activeView === 'overview' && (
              <OverviewView
                classId={selectedClass.id}
                className={selectedClass.name}
                onImportClick={() => setShowImportModal(true)}
              />
            )}

            {activeView === 'absences' && (
              <MarkAbsencesPanel classId={selectedClass.id} />
            )}

            {activeView === 'students' && (
              <StudentsListView classId={selectedClass.id} />
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ManageClassesModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
      />

      {selectedClass && (
        <CSVImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          classId={selectedClass.id}
          className={selectedClass.name}
        />
      )}
    </div>
  );
}

// Overview View Component
function OverviewView({
  classId,
  onImportClick,
}: {
  classId: string;
  className: string;
  onImportClick: () => void;
}) {
  const getStudentCount = useClassStore((state) => state.getStudentCount);
  const getPresentStudents = useClassStore((state) => state.getPresentStudents);
  const getAbsentStudents = useClassStore((state) => state.getAbsentStudents);

  const totalStudents = getStudentCount(classId);
  const presentCount = getPresentStudents(classId).length;
  const absentCount = getAbsentStudents(classId).length;

  return (
    <div className="space-y-6">
      {/* Class Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-elevated rounded-xl border border-elevated">
          <p className="text-sm text-secondary mb-1">Totale Studenti</p>
          <p className="text-3xl font-bold">{totalStudents}</p>
        </div>
        <div className="p-6 bg-success/10 rounded-xl border border-success/30">
          <p className="text-sm text-success/80 mb-1">Presenti Oggi</p>
          <p className="text-3xl font-bold text-success">{presentCount}</p>
        </div>
        <div className="p-6 bg-error/10 rounded-xl border border-error/30">
          <p className="text-sm text-error/80 mb-1">Assenti Oggi</p>
          <p className="text-3xl font-bold text-error">{absentCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Azioni Rapide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onImportClick}
            className="p-6 bg-elevated rounded-xl border-2 border-elevated
                     hover:border-accent transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
                <svg
                  className="w-6 h-6 text-accent"
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
              </div>
              <div>
                <h4 className="font-semibold mb-1">Importa Studenti da CSV</h4>
                <p className="text-sm text-secondary">
                  Carica un file CSV con l'elenco degli studenti
                </p>
              </div>
            </div>
          </button>

          <button
            className="p-6 bg-elevated rounded-xl border-2 border-elevated
                     hover:border-primary/50 transition-all text-left group
                     opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Genera Gruppi</h4>
                <p className="text-sm text-secondary">
                  Crea gruppi casuali con regole di separazione
                </p>
                <p className="text-xs text-warning mt-1">
                  Disponibile in FASE 9
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Students List View Component
function StudentsListView({ classId }: { classId: string }) {
  const getSelectedClass = useClassStore((state) => state.getSelectedClass);
  const selectedClass = getSelectedClass();

  if (!selectedClass || selectedClass.id !== classId) {
    return <div className="text-center py-8 text-secondary">Classe non trovata</div>;
  }

  const { students } = selectedClass;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Studenti ({students.length})
      </h3>

      {students.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-elevated rounded-lg">
          <p className="text-secondary">Nessuno studente in questa classe</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student, index) => (
            <div
              key={student.id}
              className="p-4 bg-elevated rounded-lg border border-elevated"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-sm text-secondary">#{index + 1}</p>
                </div>
                {student.isAbsent && (
                  <span className="px-2 py-1 bg-error/20 text-error text-xs rounded-full">
                    Assente
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

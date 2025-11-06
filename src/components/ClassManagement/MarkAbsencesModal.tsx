/**
 * MarkAbsencesModal Component
 * FASE 7: Class Management
 *
 * Modal for marking student absences with checklist UI
 */

import { useClassStore } from '../../stores/classStore';

interface MarkAbsencesModalProps {
  classId: string;
  onClose: () => void;
}

export function MarkAbsencesModal({ classId, onClose }: MarkAbsencesModalProps) {
  const { classes, toggleAbsence } = useClassStore();
  const classData = classes.get(classId);

  if (!classData) {
    return null;
  }

  const presentCount = classData.students.filter((s) => !s.absent).length;
  const absentCount = classData.students.length - presentCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-elevated">
          <div>
            <h2 className="text-xl font-semibold">Segna Presenze/Assenze</h2>
            <div className="text-sm text-text-secondary mt-1">
              {classData.name} - {classData.students.length} studenti
            </div>
          </div>
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

        {/* Summary */}
        <div className="flex gap-4 p-4 bg-surface border-b border-surface-elevated">
          <div className="flex-1 text-center p-3 rounded-lg bg-success bg-opacity-20">
            <div className="text-2xl font-bold text-success">{presentCount}</div>
            <div className="text-sm">Presenti</div>
          </div>
          <div className="flex-1 text-center p-3 rounded-lg bg-error bg-opacity-20">
            <div className="text-2xl font-bold text-error">{absentCount}</div>
            <div className="text-sm">Assenti</div>
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto p-6">
          {classData.students.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              Nessuno studente in questa classe
            </div>
          ) : (
            <div className="space-y-2">
              {classData.students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => toggleAbsence(classId, student.id)}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left
                    ${
                      student.absent
                        ? 'border-error bg-error bg-opacity-5'
                        : 'border-success bg-success bg-opacity-5'
                    }
                    hover:scale-[1.02]
                  `}
                >
                  {/* Checkbox */}
                  <div
                    className={`
                      w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors
                      ${
                        student.absent
                          ? 'border-error bg-transparent'
                          : 'border-success bg-success'
                      }
                    `}
                  >
                    {!student.absent && (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Student Name */}
                  <div className="flex-1">
                    <div
                      className={`font-medium ${student.absent ? 'line-through opacity-60' : ''}`}
                    >
                      {student.name}
                    </div>
                    {student.notes && (
                      <div className="text-sm text-text-secondary mt-1">
                        {student.notes}
                      </div>
                    )}
                  </div>

                  {/* Status */}
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
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-surface-elevated">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-opacity-90 transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

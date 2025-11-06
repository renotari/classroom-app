/**
 * StudentList Component
 * FASE 7: Class Management
 *
 * Display list of students with absence indicators
 */

import { useClassStore, type Student } from '../../stores/classStore';

interface StudentListProps {
  classId: string;
  onEditStudent?: (student: Student) => void;
  onRemoveStudent?: (studentId: string) => void;
}

export function StudentList({
  classId,
  onEditStudent,
  onRemoveStudent,
}: StudentListProps) {
  const { classes, toggleAbsence } = useClassStore();
  const classData = classes.get(classId);

  if (!classData) {
    return (
      <div className="text-center py-8 text-text-secondary">
        Classe non trovata
      </div>
    );
  }

  if (classData.students.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        Nessuno studente in questa classe.
        <br />
        Aggiungi studenti manualmente o importa da CSV.
      </div>
    );
  }

  const presentCount = classData.students.filter((s) => !s.absent).length;
  const absentCount = classData.students.length - presentCount;

  return (
    <div>
      {/* Summary */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="px-3 py-1 rounded-lg bg-success bg-opacity-20 text-success">
          Presenti: {presentCount}
        </div>
        <div className="px-3 py-1 rounded-lg bg-error bg-opacity-20 text-error">
          Assenti: {absentCount}
        </div>
        <div className="px-3 py-1 rounded-lg bg-surface-elevated">
          Totale: {classData.students.length}
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-2">
        {classData.students.map((student) => (
          <div
            key={student.id}
            className={`
              flex items-center gap-4 p-4 rounded-lg border transition-all
              ${
                student.absent
                  ? 'bg-error bg-opacity-5 border-error border-opacity-30 opacity-60'
                  : 'bg-surface border-surface-elevated hover:border-primary'
              }
            `}
          >
            {/* Absence Toggle */}
            <button
              onClick={() => toggleAbsence(classId, student.id)}
              className={`
                w-6 h-6 rounded border-2 flex items-center justify-center transition-colors
                ${
                  student.absent
                    ? 'border-error bg-error'
                    : 'border-success bg-success'
                }
              `}
              aria-label={
                student.absent ? 'Segna come presente' : 'Segna come assente'
              }
              title={student.absent ? 'Presente' : 'Assente'}
            >
              {!student.absent && (
                <svg
                  className="w-4 h-4 text-white"
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
              {student.absent && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>

            {/* Student Name */}
            <div className="flex-1">
              <div
                className={`font-medium ${student.absent ? 'line-through' : ''}`}
              >
                {student.name}
              </div>
              {student.notes && (
                <div className="text-sm text-text-secondary mt-1">
                  {student.notes}
                </div>
              )}
            </div>

            {/* Status Badge */}
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

            {/* Actions */}
            <div className="flex gap-2">
              {onEditStudent && (
                <button
                  onClick={() => onEditStudent(student)}
                  className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
                  aria-label="Modifica studente"
                  title="Modifica"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              )}
              {onRemoveStudent && (
                <button
                  onClick={() => {
                    if (
                      confirm(`Rimuovere ${student.name} dalla classe?`)
                    ) {
                      onRemoveStudent(student.id);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-error hover:bg-opacity-20 transition-colors text-error"
                  aria-label="Rimuovi studente"
                  title="Rimuovi"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * MarkAbsencesPanel Component
 * FASE 7 - Class Management
 *
 * Panel for marking student absences with checklist UI
 */

import { useClassStore } from '../../stores/classStore';
import { getStudentFullName } from '../../types/class';

interface MarkAbsencesPanelProps {
  classId: string;
}

export function MarkAbsencesPanel({ classId }: MarkAbsencesPanelProps) {
  const toggleAbsence = useClassStore((state) => state.toggleAbsence);
  const resetAbsences = useClassStore((state) => state.resetAbsences);
  const getSelectedClass = useClassStore((state) => state.getSelectedClass);

  const selectedClass = getSelectedClass();

  if (!selectedClass || selectedClass.id !== classId) {
    return (
      <div className="text-center py-8 text-secondary">
        Classe non trovata
      </div>
    );
  }

  const { students } = selectedClass;
  const presentCount = students.filter((s) => !s.isAbsent).length;
  const absentCount = students.filter((s) => s.isAbsent).length;

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-secondary">Presenti</p>
            <p className="text-2xl font-bold text-success">{presentCount}</p>
          </div>
          <div>
            <p className="text-sm text-secondary">Assenti</p>
            <p className="text-2xl font-bold text-error">{absentCount}</p>
          </div>
          <div>
            <p className="text-sm text-secondary">Totale</p>
            <p className="text-2xl font-bold">{students.length}</p>
          </div>
        </div>

        {/* Reset Button */}
        {absentCount > 0 && (
          <button
            onClick={() => resetAbsences(classId)}
            className="px-4 py-2 bg-info/20 text-info rounded-lg hover:bg-info/30
                     transition-colors font-medium"
            aria-label="Reset assenze (tutti presenti)"
          >
            Reset Assenze
          </button>
        )}
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-elevated rounded-lg">
          <p className="text-secondary mb-2">Nessuno studente in questa classe</p>
          <p className="text-sm text-secondary">
            Importa studenti da CSV per iniziare
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => toggleAbsence(classId, student.id)}
              className={`
                w-full px-4 py-3 rounded-lg text-left transition-all
                flex items-center gap-3 group
                ${
                  student.isAbsent
                    ? 'bg-error/10 border-2 border-error/30 hover:bg-error/20'
                    : 'bg-elevated border-2 border-transparent hover:border-accent/30'
                }
              `}
              aria-label={`${getStudentFullName(student)} - ${
                student.isAbsent ? 'assente' : 'presente'
              }`}
            >
              {/* Checkbox */}
              <div
                className={`
                  w-6 h-6 rounded border-2 flex items-center justify-center
                  transition-all
                  ${
                    student.isAbsent
                      ? 'bg-error border-error'
                      : 'bg-elevated border-elevated group-hover:border-accent'
                  }
                `}
              >
                {!student.isAbsent && (
                  <svg
                    className="w-4 h-4 text-success"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {student.isAbsent && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {/* Student Name */}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    student.isAbsent ? 'text-error line-through' : ''
                  }`}
                >
                  {getStudentFullName(student)}
                </p>
              </div>

              {/* Status Badge */}
              <div
                className={`
                  px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    student.isAbsent
                      ? 'bg-error text-white'
                      : 'bg-success/20 text-success'
                  }
                `}
              >
                {student.isAbsent ? 'Assente' : 'Presente'}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

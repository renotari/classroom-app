/**
 * ClassSelector Component
 * FASE 7 - Class Management
 *
 * Dropdown to select active class with summary info
 */

import { useClassStore } from '../../stores/classStore';

interface ClassSelectorProps {
  onManageClick: () => void;
}

export function ClassSelector({ onManageClick }: ClassSelectorProps) {
  const classes = useClassStore((state) => state.classes);
  const selectedClassId = useClassStore((state) => state.selectedClassId);
  const selectClass = useClassStore((state) => state.selectClass);
  const getAbsentStudents = useClassStore((state) => state.getAbsentStudents);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="flex items-center gap-4">
      {/* Class Selector Dropdown */}
      <div className="flex-1">
        <label htmlFor="class-select" className="block text-sm font-medium mb-2">
          Classe Selezionata
        </label>
        {classes.length === 0 ? (
          <div className="p-4 border-2 border-dashed rounded-lg text-center">
            <p className="text-secondary mb-2">Nessuna classe creata</p>
            <button
              onClick={onManageClick}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Crea Prima Classe
            </button>
          </div>
        ) : (
          <select
            id="class-select"
            value={selectedClassId || ''}
            onChange={(e) => selectClass(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-elevated rounded-lg
                     text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent
                     cursor-pointer transition-all"
            aria-label="Seleziona classe"
          >
            {!selectedClassId && (
              <option value="" disabled>
                Seleziona una classe...
              </option>
            )}
            {classes.map((classItem) => {
              const totalStudents = classItem.students.length;
              const absentStudents = getAbsentStudents(classItem.id).length;

              return (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name} ({totalStudents} studenti
                  {absentStudents > 0
                    ? `, ${absentStudents} assenti`
                    : ', tutti presenti'}
                  )
                </option>
              );
            })}
          </select>
        )}
      </div>

      {/* Manage Button */}
      <div className="flex items-end">
        <button
          onClick={onManageClick}
          className="px-6 py-3 bg-elevated hover:bg-primary hover:text-white
                   rounded-lg transition-all font-medium border border-elevated
                   flex items-center gap-2"
          aria-label="Gestisci classi"
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Gestisci
        </button>
      </div>

      {/* Selected Class Summary */}
      {selectedClass && (
        <div className="hidden lg:block px-4 py-3 bg-elevated rounded-lg border border-elevated">
          <div className="text-sm text-secondary">
            {selectedClass.students.length} studenti totali
          </div>
        </div>
      )}
    </div>
  );
}

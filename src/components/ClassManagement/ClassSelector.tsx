/**
 * ClassSelector Component
 * FASE 7: Class Management
 *
 * Dropdown to select active class and manage classes
 */

import { useClassStore } from '../../stores/classStore';

interface ClassSelectorProps {
  onManageClasses?: () => void;
}

export function ClassSelector({ onManageClasses }: ClassSelectorProps) {
  const { classes, activeClassId, selectClass, createClass } = useClassStore();

  const classArray = Array.from(classes.values());
  const activeClass = activeClassId ? classes.get(activeClassId) : null;

  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = event.target.value;
    if (classId === '__create_new__') {
      const name = prompt('Nome della nuova classe:');
      if (name && name.trim()) {
        const newClassId = createClass(name.trim());
        selectClass(newClassId);
      }
    } else if (classId) {
      selectClass(classId);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <label htmlFor="class-selector" className="block text-sm font-medium mb-2">
          Classe Attiva
        </label>
        <select
          id="class-selector"
          value={activeClassId || ''}
          onChange={handleClassChange}
          className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-elevated focus:border-primary focus:outline-none"
        >
          <option value="" disabled>
            Seleziona una classe...
          </option>
          {classArray.map((classData) => (
            <option key={classData.id} value={classData.id}>
              {classData.name} ({classData.students.length} studenti)
            </option>
          ))}
          <option value="__create_new__" className="font-semibold">
            + Crea Nuova Classe
          </option>
        </select>
      </div>

      {onManageClasses && (
        <button
          onClick={onManageClasses}
          className="px-4 py-2 rounded-lg bg-primary text-text-primary hover:bg-opacity-90 transition-colors"
          aria-label="Gestisci classi"
        >
          Gestisci
        </button>
      )}

      {activeClass && (
        <div className="text-sm text-text-secondary">
          <div>Studenti: {activeClass.students.length}</div>
          <div>
            Presenti:{' '}
            {activeClass.students.filter((s) => !s.absent).length}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ManageClassesModal Component
 * FASE 7 - Class Management
 *
 * Modal for creating, editing, and deleting classes
 */

import { useState } from 'react';
import { useClassStore } from '../../stores/classStore';

interface ManageClassesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageClassesModal({ isOpen, onClose }: ManageClassesModalProps) {
  const classes = useClassStore((state) => state.classes);
  const addClass = useClassStore((state) => state.addClass);
  const updateClass = useClassStore((state) => state.updateClass);
  const removeClass = useClassStore((state) => state.removeClass);

  const [newClassName, setNewClassName] = useState('');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddClass = () => {
    if (newClassName.trim()) {
      addClass(newClassName.trim());
      setNewClassName('');
    }
  };

  const handleUpdateClass = () => {
    if (editingClassId && editingName.trim()) {
      updateClass(editingClassId, { name: editingName.trim() });
      setEditingClassId(null);
      setEditingName('');
    }
  };

  const handleDeleteClass = (classId: string) => {
    removeClass(classId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-elevated flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">Gestisci Classi</h2>
          <button
            onClick={onClose}
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
          {/* Add New Class */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Nuova Classe</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
                placeholder="Nome classe (es. 3A Matematica)"
                className="flex-1 px-4 py-3 bg-elevated border border-elevated rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Nome nuova classe"
              />
              <button
                onClick={handleAddClass}
                disabled={!newClassName.trim()}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90
                         disabled:opacity-50 disabled:cursor-not-allowed transition-opacity
                         font-medium"
              >
                Aggiungi
              </button>
            </div>
          </div>

          {/* Classes List */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Classi Esistenti ({classes.length})
            </h3>

            {classes.length === 0 ? (
              <p className="text-secondary text-center py-8">
                Nessuna classe creata. Aggiungi la tua prima classe qui sopra.
              </p>
            ) : (
              <div className="space-y-3">
                {classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="p-4 bg-elevated rounded-lg border border-elevated"
                  >
                    {editingClassId === classItem.id ? (
                      /* Edit Mode */
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateClass();
                            if (e.key === 'Escape') setEditingClassId(null);
                          }}
                          className="flex-1 px-3 py-2 bg-surface border border-elevated rounded
                                   focus:outline-none focus:ring-2 focus:ring-accent"
                          autoFocus
                        />
                        <button
                          onClick={handleUpdateClass}
                          className="px-4 py-2 bg-accent text-white rounded hover:opacity-90"
                        >
                          Salva
                        </button>
                        <button
                          onClick={() => setEditingClassId(null)}
                          className="px-4 py-2 bg-elevated rounded hover:bg-surface"
                        >
                          Annulla
                        </button>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {classItem.name}
                          </h4>
                          <p className="text-sm text-secondary">
                            {classItem.students.length} studenti
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setEditingClassId(classItem.id);
                              setEditingName(classItem.name);
                            }}
                            className="p-2 hover:bg-surface rounded transition-colors"
                            aria-label="Rinomina classe"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          {/* Delete Button */}
                          {deleteConfirmId === classItem.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeleteClass(classItem.id)}
                                className="px-3 py-2 bg-error text-white rounded text-sm
                                         hover:opacity-90"
                              >
                                Conferma
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3 py-2 bg-elevated rounded text-sm
                                         hover:bg-surface"
                              >
                                Annulla
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(classItem.id)}
                              className="p-2 hover:bg-error/20 rounded transition-colors
                                       text-error"
                              aria-label="Elimina classe"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-elevated flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90
                     transition-opacity font-medium"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

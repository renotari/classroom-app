/**
 * AddStudentForm Component
 * FASE 7: Class Management
 *
 * Simple form to add a student manually
 */

import { useState } from 'react';
import { useClassStore } from '../../stores/classStore';

interface AddStudentFormProps {
  classId: string;
  onSuccess?: () => void;
}

export function AddStudentForm({ classId, onSuccess }: AddStudentFormProps) {
  const { addStudent } = useClassStore();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    addStudent(classId, {
      id: crypto.randomUUID(),
      name: name.trim(),
      absent: false,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setName('');
    setNotes('');
    setIsExpanded(false);

    onSuccess?.();
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full px-6 py-4 rounded-lg border-2 border-dashed border-surface-elevated hover:border-primary transition-colors flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Aggiungi Studente Manualmente
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-lg bg-surface border border-surface-elevated"
    >
      <div className="mb-4">
        <label htmlFor="student-name" className="block text-sm font-medium mb-2">
          Nome Studente *
        </label>
        <input
          id="student-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Es: Marco Rossi"
          className="w-full px-4 py-2 rounded-lg bg-primary border border-surface-elevated focus:border-primary focus:outline-none"
          autoFocus
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="student-notes" className="block text-sm font-medium mb-2">
          Note (opzionale)
        </label>
        <input
          id="student-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Es: Ottimo studente"
          className="w-full px-4 py-2 rounded-lg bg-primary border border-surface-elevated focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 px-4 py-2 rounded-lg bg-success text-white hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Aggiungi
        </button>
        <button
          type="button"
          onClick={() => {
            setName('');
            setNotes('');
            setIsExpanded(false);
          }}
          className="px-4 py-2 rounded-lg hover:bg-surface-elevated transition-colors"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}

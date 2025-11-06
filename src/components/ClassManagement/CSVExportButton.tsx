/**
 * CSVExportButton Component
 * FASE 7: Class Management
 *
 * Button to export current class to CSV file
 */

import { useClassStore } from '../../stores/classStore';

interface CSVExportButtonProps {
  classId: string;
}

export function CSVExportButton({ classId }: CSVExportButtonProps) {
  const { classes, exportToCSV } = useClassStore();
  const classData = classes.get(classId);

  const handleExport = () => {
    if (!classData) return;

    const csvContent = exportToCSV(classId);
    if (!csvContent) {
      alert('Nessun dato da esportare');
      return;
    }

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${classData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!classData || classData.students.length === 0) {
    return null;
  }

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface transition-colors flex items-center gap-2"
      aria-label="Esporta CSV"
      title="Esporta come CSV"
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
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Esporta CSV
    </button>
  );
}

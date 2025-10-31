/**
 * FASE 6: ModeToggle Component
 *
 * Switch control per modalità Manual/Auto
 * - Toggle visivo con animazione
 * - Indicatore stato attivo
 * - Help text
 */

interface ModeToggleProps {
  mode: 'manual' | 'auto';
  onToggle: () => void;
}

export function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  const isAuto = mode === 'auto';

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg" data-testid="mode-toggle">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Modalità: {isAuto ? 'Automatica' : 'Manuale'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isAuto
              ? 'Il semaforo reagisce al livello di rumore'
              : 'Controllo manuale tramite pulsanti o tasti'}
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={onToggle}
          className={`
            relative inline-flex h-8 w-16
            items-center rounded-full
            transition-colors duration-300
            focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500
            ${isAuto ? 'bg-blue-600' : 'bg-gray-400'}
          `}
          role="switch"
          aria-checked={isAuto}
          aria-label="Toggle modalità automatica"
          data-testid="mode-toggle-switch"
        >
          <span
            className={`
              inline-block h-6 w-6
              transform rounded-full bg-white
              transition-transform duration-300 shadow-lg
              ${isAuto ? 'translate-x-9' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Mode Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${isAuto ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
        <span className="text-gray-600 dark:text-gray-400">
          {isAuto ? 'Auto mode attivo' : 'Manual mode attivo'}
        </span>
      </div>

      {/* Help Text (Auto Mode) */}
      {isAuto && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            💡 <strong>Auto mode:</strong> Il colore del semaforo cambia automaticamente in base al livello di rumore rilevato. Configura le soglie qui sotto.
          </p>
        </div>
      )}
    </div>
  );
}

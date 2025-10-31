/**
 * FASE 6: ManualControls Component
 *
 * 3 large buttons per controllo manuale colori semaforo
 * - Touch-friendly (64x64px minimum)
 * - Active state indicator
 * - Disabled quando mode === 'auto'
 * - Keyboard shortcut hints
 */

import { SemaphoreColor } from '../../stores/semaphoreStore';

interface ManualControlsProps {
  currentColor: SemaphoreColor;
  isManual: boolean;
  onColorChange: (color: SemaphoreColor) => void;
}

const BUTTON_CONFIG: Record<SemaphoreColor, {
  label: string;
  bgColor: string;
  bgHover: string;
  borderColor: string;
  borderActive: string;
  shortcut: string;
}> = {
  red: {
    label: 'Rosso',
    bgColor: 'bg-red-500',
    bgHover: 'hover:bg-red-600',
    borderColor: 'border-red-700',
    borderActive: 'border-red-900',
    shortcut: '1',
  },
  yellow: {
    label: 'Giallo',
    bgColor: 'bg-yellow-400',
    bgHover: 'hover:bg-yellow-500',
    borderColor: 'border-yellow-600',
    borderActive: 'border-yellow-800',
    shortcut: '2',
  },
  green: {
    label: 'Verde',
    bgColor: 'bg-green-500',
    bgHover: 'hover:bg-green-600',
    borderColor: 'border-green-700',
    borderActive: 'border-green-900',
    shortcut: '3',
  },
};

export function ManualControls({ currentColor, isManual, onColorChange }: ManualControlsProps) {
  const renderButton = (color: SemaphoreColor) => {
    const config = BUTTON_CONFIG[color];
    const isActive = currentColor === color;

    return (
      <button
        key={color}
        onClick={() => onColorChange(color)}
        disabled={!isManual}
        className={`
          relative
          min-w-[80px] min-h-[80px]
          px-6 py-4
          ${config.bgColor}
          ${isManual ? config.bgHover : 'opacity-50 cursor-not-allowed'}
          border-4
          ${isActive ? `${config.borderActive} ring-4 ring-offset-2 ring-gray-800` : config.borderColor}
          rounded-xl
          text-white font-bold text-lg
          shadow-lg
          transition-all duration-200
          ${isManual ? 'active:scale-95' : ''}
          focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-gray-600
        `}
        role="button"
        aria-pressed={isActive}
        aria-label={`Imposta semaforo su ${config.label}`}
        data-testid={`manual-control-${color}`}
      >
        <div className="flex flex-col items-center gap-1">
          <span>{config.label}</span>
          {isManual && (
            <kbd className="text-xs px-2 py-0.5 bg-black/20 rounded">
              {config.shortcut}
            </kbd>
          )}
        </div>

        {/* Active indicator */}
        {isActive && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4" data-testid="manual-controls">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Controllo Manuale
      </h3>

      <div className="flex flex-wrap gap-4 justify-center">
        {renderButton('red')}
        {renderButton('yellow')}
        {renderButton('green')}
      </div>

      {!isManual && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Controlli disabilitati in modalità automatica
        </p>
      )}
    </div>
  );
}

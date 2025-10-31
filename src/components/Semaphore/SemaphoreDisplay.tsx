/**
 * FASE 6: SemaphoreDisplay Component
 *
 * Large visual indicator con 3 stati (Red/Yellow/Green)
 * - Circular design (300px diameter)
 * - Smooth transitions tra colori
 * - Pulse animation su red
 * - Accessibility labels
 */

import { SemaphoreColor } from '../../stores/semaphoreStore';

interface SemaphoreDisplayProps {
  currentColor: SemaphoreColor;
  mode: 'manual' | 'auto';
}

const COLOR_CONFIG: Record<SemaphoreColor, {
  bg: string;
  border: string;
  label: string;
  description: string;
}> = {
  red: {
    bg: 'bg-red-500',
    border: 'border-red-600',
    label: 'Rosso - Silenzio',
    description: 'Lavoro silenzioso, niente parlato',
  },
  yellow: {
    bg: 'bg-yellow-400',
    border: 'border-yellow-500',
    label: 'Giallo - Discussione tranquilla',
    description: 'Discussione tranquilla permessa',
  },
  green: {
    bg: 'bg-green-500',
    border: 'border-green-600',
    label: 'Verde - Lavoro di gruppo',
    description: 'Discussione normale e lavoro di gruppo',
  },
};

export function SemaphoreDisplay({ currentColor, mode }: SemaphoreDisplayProps) {
  const config = COLOR_CONFIG[currentColor];
  const isPulseAnimation = currentColor === 'red';

  return (
    <div className="flex flex-col items-center gap-6" data-testid="semaphore-display">
      {/* Main Circle */}
      <div
        className={`
          relative
          w-64 h-64 sm:w-80 sm:h-80
          rounded-full
          ${config.bg}
          border-8 ${config.border}
          shadow-2xl
          transition-all duration-500 ease-in-out
          ${isPulseAnimation ? 'animate-pulse' : ''}
        `}
        role="status"
        aria-label={`Semaforo: ${config.label}`}
        aria-live="polite"
      >
        {/* Inner glow effect */}
        <div className="absolute inset-4 rounded-full bg-white/20" />

        {/* Mode indicator badge */}
        <div className="absolute -top-2 -right-2 px-3 py-1 bg-gray-800 text-white text-xs font-semibold rounded-full shadow-lg">
          {mode === 'manual' ? 'Manuale' : 'Auto'}
        </div>
      </div>

      {/* Label Text */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {config.label}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {config.description}
        </p>
      </div>

      {/* Keyboard hint (solo manual mode) */}
      {mode === 'manual' && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Usa i tasti <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">1</kbd>{' '}
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">2</kbd>{' '}
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">3</kbd>{' '}
          per cambiare stato
        </div>
      )}
    </div>
  );
}

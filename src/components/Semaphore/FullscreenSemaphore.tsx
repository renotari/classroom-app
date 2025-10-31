/**
 * FASE 6: FullscreenSemaphore Component
 *
 * Modalità fullscreen per proiezione
 * - Occupa tutto lo schermo
 * - Solo cerchio semaforo + stato testuale
 * - ESC per uscire
 * - Background usa colore tema corrente
 */

import { useEffect } from 'react';
import { SemaphoreColor } from '../../stores/semaphoreStore';

interface FullscreenSemaphoreProps {
  currentColor: SemaphoreColor;
  onClose: () => void;
}

const COLOR_CONFIG: Record<SemaphoreColor, {
  bg: string;
  border: string;
  label: string;
  description: string;
}> = {
  red: {
    bg: 'bg-red-500',
    border: 'border-red-700',
    label: 'SILENZIO',
    description: 'Lavoro silenzioso - Niente parlato',
  },
  yellow: {
    bg: 'bg-yellow-400',
    border: 'border-yellow-600',
    label: 'DISCUSSIONE TRANQUILLA',
    description: 'Parlate a bassa voce',
  },
  green: {
    bg: 'bg-green-500',
    border: 'border-green-700',
    label: 'LAVORO DI GRUPPO',
    description: 'Discussione normale permessa',
  },
};

export function FullscreenSemaphore({ currentColor, onClose }: FullscreenSemaphoreProps) {
  const config = COLOR_CONFIG[currentColor];

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900"
      data-testid="fullscreen-semaphore"
    >
      {/* Close Button (top right) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        aria-label="Chiudi fullscreen"
      >
        <span className="text-lg">✕ Chiudi (ESC)</span>
      </button>

      {/* Giant Semaphore Circle */}
      <div className="flex flex-col items-center gap-12">
        <div
          className={`
            w-96 h-96
            rounded-full
            ${config.bg}
            border-[16px] ${config.border}
            shadow-2xl
            transition-all duration-500 ease-in-out
            ${currentColor === 'red' ? 'animate-pulse' : ''}
          `}
          role="status"
          aria-label={`Semaforo fullscreen: ${config.label}`}
        >
          {/* Inner glow */}
          <div className="absolute inset-8 rounded-full bg-white/20" />
        </div>

        {/* Large Text */}
        <div className="text-center space-y-4">
          <h1 className="text-7xl font-bold text-white tracking-wider">
            {config.label}
          </h1>
          <p className="text-3xl text-gray-300">
            {config.description}
          </p>
        </div>
      </div>

      {/* Instructions (bottom) */}
      <div className="absolute bottom-8 text-center text-gray-400 text-sm">
        <p>Premi <kbd className="px-3 py-1 bg-gray-800 rounded">ESC</kbd> per uscire dal fullscreen</p>
      </div>
    </div>
  );
}

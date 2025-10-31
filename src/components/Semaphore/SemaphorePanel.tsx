/**
 * FASE 6: SemaphorePanel Component
 *
 * Container principale per tab Semaphore
 * - Integra tutti i componenti semaforo
 * - Layout responsive
 * - Gestisce fullscreen mode
 * - Sound alerts opzionali
 */

import { useState } from 'react';
import { useSemaphore } from '../../hooks/useSemaphore';
import { useSemaphoreAudio } from '../../hooks/useSemaphoreAudio';
import { SemaphoreDisplay } from './SemaphoreDisplay';
import { ManualControls } from './ManualControls';
import { ModeToggle } from './ModeToggle';
import { AutoModeConfig } from './AutoModeConfig';
import { FullscreenSemaphore } from './FullscreenSemaphore';

export function SemaphorePanel() {
  const {
    currentColor,
    mode,
    isManual,
    isAuto,
    setColor,
    toggleMode,
    autoThresholds,
    setAutoThresholds,
  } = useSemaphore();

  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sound alerts (opzionale)
  useSemaphoreAudio({
    enabled: soundAlertsEnabled,
    currentColor,
  });

  return (
    <>
      <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto" data-testid="semaphore-panel">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Semaforo Classe
          </h1>
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500"
            data-testid="fullscreen-button"
          >
            📺 Modalità Fullscreen
          </button>
        </div>

        {/* Mode Toggle */}
        <ModeToggle mode={mode} onToggle={toggleMode} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Display */}
          <div className="flex justify-center items-center">
            <SemaphoreDisplay currentColor={currentColor} mode={mode} />
          </div>

          {/* Right Column: Controls */}
          <div className="flex flex-col gap-6">
            {/* Manual Controls */}
            <ManualControls
              currentColor={currentColor}
              isManual={isManual}
              onColorChange={setColor}
            />

            {/* Auto Mode Config (solo se auto mode attivo) */}
            {isAuto && (
              <AutoModeConfig
                yellowAbove={autoThresholds.yellowAbove}
                redAbove={autoThresholds.redAbove}
                onThresholdsChange={setAutoThresholds}
              />
            )}

            {/* Sound Alerts Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex flex-col gap-1">
                <label htmlFor="sound-alerts" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allerta sonora su cambio stato
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Suono quando il semaforo cambia colore
                </p>
              </div>
              <button
                id="sound-alerts"
                onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
                className={`
                  relative inline-flex h-6 w-11
                  items-center rounded-full
                  transition-colors duration-300
                  focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500
                  ${soundAlertsEnabled ? 'bg-blue-600' : 'bg-gray-400'}
                `}
                role="switch"
                aria-checked={soundAlertsEnabled}
                data-testid="sound-alerts-toggle"
              >
                <span
                  className={`
                    inline-block h-4 w-4
                    transform rounded-full bg-white
                    transition-transform duration-300 shadow-md
                    ${soundAlertsEnabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
            ℹ️ Come funziona il semaforo
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• <strong>Rosso:</strong> Lavoro silenzioso, niente parlato</li>
            <li>• <strong>Giallo:</strong> Discussione tranquilla permessa (bassa voce)</li>
            <li>• <strong>Verde:</strong> Discussione normale e lavoro di gruppo</li>
            <li>• <strong>Manuale:</strong> Cambia colore cliccando i pulsanti o con tasti 1, 2, 3</li>
            <li>• <strong>Auto:</strong> Il colore si aggiorna automaticamente in base al rumore rilevato</li>
          </ul>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <FullscreenSemaphore
          currentColor={currentColor}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
}

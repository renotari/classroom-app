/**
 * FASE 6: AutoModeConfig Component
 *
 * Configurazione soglie per auto mode
 * - 2 sliders: yellowAbove e redAbove
 * - Live preview: mostra colore che sarebbe attivo
 * - Validation: redAbove > yellowAbove sempre
 */

import { useState } from 'react';
import { useNoiseStore } from '../../stores/noiseStore';

interface AutoModeConfigProps {
  yellowAbove: number;
  redAbove: number;
  onThresholdsChange: (redAbove: number, yellowAbove: number) => void;
}

export function AutoModeConfig({ yellowAbove, redAbove, onThresholdsChange }: AutoModeConfigProps) {
  const currentNoiseLevel = useNoiseStore((state) => state.currentLevel);

  const [localYellow, setLocalYellow] = useState(yellowAbove);
  const [localRed, setLocalRed] = useState(redAbove);

  // Calcola quale colore sarebbe attivo con noise level corrente
  const getPreviewColor = (): 'red' | 'yellow' | 'green' => {
    if (currentNoiseLevel === null) return 'green';
    if (currentNoiseLevel > localRed) return 'red';
    if (currentNoiseLevel > localYellow) return 'yellow';
    return 'green';
  };

  const handleYellowChange = (value: number) => {
    setLocalYellow(value);
    // Assicura che red > yellow
    if (value >= localRed) {
      const newRed = value + 5;
      setLocalRed(newRed);
      onThresholdsChange(newRed, value);
    } else {
      onThresholdsChange(localRed, value);
    }
  };

  const handleRedChange = (value: number) => {
    setLocalRed(value);
    // Assicura che red > yellow
    if (value <= localYellow) {
      const newYellow = value - 5;
      setLocalYellow(newYellow);
      onThresholdsChange(value, newYellow);
    } else {
      onThresholdsChange(value, localYellow);
    }
  };

  const previewColor = getPreviewColor();
  const previewColorBg = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-400',
    green: 'bg-green-500',
  }[previewColor];

  const previewColorLabel = {
    red: 'Rosso',
    yellow: 'Giallo',
    green: 'Verde',
  }[previewColor];

  return (
    <div className="flex flex-col gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800" data-testid="auto-mode-config">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Configurazione Soglie Auto Mode
      </h3>

      {/* Yellow Threshold Slider */}
      <div className="flex flex-col gap-2">
        <label htmlFor="yellow-threshold" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Soglia Giallo (Discussione tranquilla)
        </label>
        <div className="flex items-center gap-3">
          <input
            id="yellow-threshold"
            type="range"
            min="30"
            max="90"
            step="5"
            value={localYellow}
            onChange={(e) => handleYellowChange(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            data-testid="yellow-threshold-slider"
          />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 min-w-[50px] text-right">
            {localYellow} dB
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Rumore sopra questa soglia → Giallo
        </p>
      </div>

      {/* Red Threshold Slider */}
      <div className="flex flex-col gap-2">
        <label htmlFor="red-threshold" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Soglia Rosso (Troppo rumore)
        </label>
        <div className="flex items-center gap-3">
          <input
            id="red-threshold"
            type="range"
            min="40"
            max="100"
            step="5"
            value={localRed}
            onChange={(e) => handleRedChange(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-red-500"
            data-testid="red-threshold-slider"
          />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 min-w-[50px] text-right">
            {localRed} dB
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Rumore sopra questa soglia → Rosso
        </p>
      </div>

      {/* Live Preview */}
      {currentNoiseLevel !== null && (
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Livello rumore attuale:</p>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{currentNoiseLevel.toFixed(0)} dB</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Stato attuale:</span>
              <div className={`w-8 h-8 rounded-full ${previewColorBg} border-2 border-gray-600`} />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{previewColorLabel}</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <p>• <strong>Verde:</strong> 0 - {localYellow} dB</p>
        <p>• <strong>Giallo:</strong> {localYellow} - {localRed} dB</p>
        <p>• <strong>Rosso:</strong> &gt; {localRed} dB</p>
      </div>
    </div>
  );
}

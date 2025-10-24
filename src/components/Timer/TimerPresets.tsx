/**
 * TimerPresets Component
 * Bottoni preset rapidi (5, 10, 15, 30 min) e input custom
 */

import React, { useState, useCallback } from 'react';
import type { TimerPresetsProps } from '../../types/timer.types';

const PRESET_BUTTONS = [
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '30 min', seconds: 1800 },
];

export const TimerPresets: React.FC<TimerPresetsProps> = ({
  onPresetSelect,
  onCustomDuration,
  isRunning,
}) => {
  const [customMinutes, setCustomMinutes] = useState('');
  const [customSeconds, setCustomSeconds] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  /**
   * Gestisce la selezione di un preset
   */
  const handlePresetClick = useCallback(
    (seconds: number) => {
      setCustomMinutes('');
      setCustomSeconds('');
      setShowCustomInput(false);
      onPresetSelect(seconds);
    },
    [onPresetSelect]
  );

  /**
   * Gestisce l'input custom
   */
  const handleCustomDuration = useCallback(() => {
    const mins = parseInt(customMinutes) || 0;
    const secs = parseInt(customSeconds) || 0;
    const totalSeconds = mins * 60 + secs;

    if (totalSeconds <= 0) {
      alert('Inserisci una durata valida (almeno 1 secondo)');
      return;
    }

    onCustomDuration(totalSeconds);
    setCustomMinutes('');
    setCustomSeconds('');
    setShowCustomInput(false);
  }, [customMinutes, customSeconds, onCustomDuration]);

  /**
   * Gestisce il tasto Enter
   */
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleCustomDuration();
      }
    },
    [handleCustomDuration]
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Preset Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PRESET_BUTTONS.map((preset) => (
          <button
            key={preset.seconds}
            onClick={() => handlePresetClick(preset.seconds)}
            disabled={isRunning}
            className={`
              px-4 py-3 rounded-lg font-semibold text-sm md:text-base
              transition-all duration-200
              touch-target-min disabled:opacity-50 disabled:cursor-not-allowed
              ${
                isRunning
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                  : 'bg-[var(--color-primary)] text-white hover:shadow-lg active:scale-95 hover:brightness-110'
              }
            `}
            aria-label={`Set timer to ${preset.label}`}
            title={isRunning ? 'Ferma il timer per cambiare durata' : `Imposta timer a ${preset.label}`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Duration Input */}
      <div className="flex flex-col gap-3">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            disabled={isRunning}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                isRunning
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--color-secondary)] hover:text-white'
              }
            `}
            aria-label="Custom duration"
            title={isRunning ? 'Ferma il timer per inserire durata custom' : 'Inserisci una durata personalizzata'}
          >
            ⚙️ Durata Personalizzata
          </button>
        ) : (
          <div className="flex flex-col gap-3 p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--bg-elevated)]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="custom-minutes" className="text-xs font-semibold text-[var(--text-secondary)]">
                  Minuti
                </label>
                <input
                  id="custom-minutes"
                  type="number"
                  min="0"
                  max="999"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="0"
                  className={`
                    w-full mt-1 px-3 py-2 rounded border-2
                    text-center font-semibold
                    bg-white dark:bg-[var(--bg-elevated)]
                    border-[var(--bg-elevated)] focus:border-[var(--color-primary)]
                    transition-colors outline-none
                    text-[var(--text-primary)]
                  `}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="custom-seconds" className="text-xs font-semibold text-[var(--text-secondary)]">
                  Secondi
                </label>
                <input
                  id="custom-seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="0"
                  className={`
                    w-full mt-1 px-3 py-2 rounded border-2
                    text-center font-semibold
                    bg-white dark:bg-[var(--bg-elevated)]
                    border-[var(--bg-elevated)] focus:border-[var(--color-primary)]
                    transition-colors outline-none
                    text-[var(--text-primary)]
                  `}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleCustomDuration}
                className="flex-1 px-3 py-2 bg-green-500 text-white rounded font-medium text-sm hover:bg-green-600 active:scale-95 transition-all"
                aria-label="Apply custom duration"
              >
                ✓ Applica
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomMinutes('');
                  setCustomSeconds('');
                }}
                className="flex-1 px-3 py-2 bg-gray-400 text-white rounded font-medium text-sm hover:bg-gray-500 active:scale-95 transition-all"
                aria-label="Cancel custom duration"
              >
                ✕ Annulla
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Inserisci minuti e secondi, poi premi Applica (o Enter)
            </p>
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-[var(--text-secondary)] text-center">
        💡 Seleziona un preset o imposta una durata personalizzata
      </p>
    </div>
  );
};

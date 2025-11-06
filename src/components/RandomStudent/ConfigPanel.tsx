/**
 * ConfigPanel Component
 *
 * Settings panel for random student selection configuration.
 * Features:
 * - Toggle: Exclude absent students
 * - Slider: Number of recent selections to avoid (0-10)
 * - Real-time updates to store
 * - Clear visual feedback
 *
 * @module ConfigPanel
 */

import React from 'react';
import { useRandomStudentStore } from '../../stores/randomStudentStore';

export interface ConfigPanelProps {
  /** Optional CSS class name */
  className?: string;
}

/**
 * ConfigPanel Component
 *
 * Allows teacher to configure random selection behavior.
 *
 * @example
 * ```tsx
 * <ConfigPanel />
 * ```
 */
export function ConfigPanel({ className = '' }: ConfigPanelProps): React.ReactElement {
  const { config, updateConfig } = useRandomStudentStore();

  return (
    <div
      className={`p-6 rounded-xl bg-surface border border-elevated ${className}`}
      role="group"
      aria-label="Configurazione selezione casuale"
    >
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Configurazione
      </h3>

      {/* Exclude Absent Toggle */}
      <div className="mb-6">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex-1">
            <div className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
              Escludi assenti
            </div>
            <div className="text-xs text-text-secondary mt-1">
              Non selezionare studenti segnati come assenti
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            role="switch"
            aria-checked={config.excludeAbsent}
            onClick={() => updateConfig({ excludeAbsent: !config.excludeAbsent })}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full
              transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
              ${config.excludeAbsent ? 'bg-accent' : 'bg-elevated'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${config.excludeAbsent ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </label>
      </div>

      {/* Exclude Recent Count Slider */}
      <div>
        <label className="block">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-text-primary">
              Evita selezioni recenti
            </div>
            <div className="text-sm font-semibold text-accent">
              {config.excludeRecentCount === 0
                ? 'Disabilitato'
                : `Ultime ${config.excludeRecentCount}`}
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={config.excludeRecentCount}
            onChange={(e) =>
              updateConfig({ excludeRecentCount: parseInt(e.target.value, 10) })
            }
            className="w-full h-2 rounded-lg appearance-none cursor-pointer
              bg-elevated
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-accent
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-accent
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer
            "
            aria-label="Numero di selezioni recenti da evitare"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={config.excludeRecentCount}
          />

          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>

          <div className="text-xs text-text-secondary mt-2">
            Evita di riselezionare studenti già chiamati recentemente
          </div>
        </label>
      </div>
    </div>
  );
}

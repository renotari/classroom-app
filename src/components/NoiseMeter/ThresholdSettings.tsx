/**
 * ThresholdSettings Component
 * Configure noise level thresholds (green/yellow/red)
 */

interface ThresholdSettingsProps {
  greenThreshold: number;
  yellowThreshold: number;
  redThreshold: number;
  onThresholdsChange: (green: number, yellow: number, red: number) => void;
  enableAlerts: boolean;
  onEnableAlertsChange: (enabled: boolean) => void;
  alertVolume: number;
  onAlertVolumeChange: (volume: number) => void;
}

export function ThresholdSettings({
  greenThreshold,
  yellowThreshold,
  redThreshold,
  onThresholdsChange,
  enableAlerts,
  onEnableAlertsChange,
  alertVolume,
  onAlertVolumeChange,
}: ThresholdSettingsProps) {
  const handleGreenChange = (value: number) => {
    onThresholdsChange(value, yellowThreshold, redThreshold);
  };

  const handleYellowChange = (value: number) => {
    onThresholdsChange(greenThreshold, value, redThreshold);
  };

  const handleRedChange = (value: number) => {
    onThresholdsChange(greenThreshold, yellowThreshold, value);
  };

  return (
    <div className="space-y-6 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)]">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">Configurazione Soglie</h3>

      {/* Green Threshold Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10b981]" />
            Soglia Verde
          </label>
          <span className="text-sm font-semibold text-[#10b981]">{greenThreshold}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={greenThreshold}
          onChange={(e) => handleGreenChange(parseInt(e.target.value))}
          className="w-full h-2 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[#10b981]"
        />
        <p className="text-xs text-[var(--text-secondary)]">
          Livello massimo per indicare silenzio (lavoro silenzioso)
        </p>
      </div>

      {/* Yellow Threshold Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
            Soglia Gialla
          </label>
          <span className="text-sm font-semibold text-[#f59e0b]">{yellowThreshold}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={yellowThreshold}
          onChange={(e) => handleYellowChange(parseInt(e.target.value))}
          className="w-full h-2 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
        />
        <p className="text-xs text-[var(--text-secondary)]">
          Livello massimo per discussione tranquilla
        </p>
      </div>

      {/* Red Threshold Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
            Soglia Rossa
          </label>
          <span className="text-sm font-semibold text-[#ef4444]">{redThreshold}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={redThreshold}
          onChange={(e) => handleRedChange(parseInt(e.target.value))}
          className="w-full h-2 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[#ef4444]"
        />
        <p className="text-xs text-[var(--text-secondary)]">
          Livello massimo prima di troppo rumore (trigger alert)
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border-color)]" />

      {/* Alert Settings */}
      <div className="space-y-4">
        {/* Enable Alerts Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--text-primary)]">
            Abilita Avvisi Sonori
          </label>
          <button
            onClick={() => onEnableAlertsChange(!enableAlerts)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              enableAlerts ? 'bg-[var(--accent-color)]' : 'bg-[var(--bg-secondary)]'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                enableAlerts ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        {/* Alert Volume Slider */}
        {enableAlerts && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                🔊 Volume Avviso
              </label>
              <span className="text-sm font-semibold text-[var(--accent-color)]">{alertVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={alertVolume}
              onChange={(e) => onAlertVolumeChange(parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

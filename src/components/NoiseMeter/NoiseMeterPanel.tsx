/**
 * NoiseMeterPanel Component
 * Main panel for noise monitoring with controls, visualization, and history
 */

import { useEffect, useState } from 'react';
import { useNoiseMeter } from '../../hooks/useNoiseMeter';
import { PermissionDeniedFallback } from '../MicrophoneOnboarding/PermissionDeniedFallback';
import { NoiseMeterVisualization } from './NoiseMeterVisualization';
import { ThresholdSettings } from './ThresholdSettings';
import { NoiseHistory } from './NoiseHistory';

export function NoiseMeterPanel() {
  const {
    currentLevel,
    currentNoiseLevel,
    isMonitoring,
    isCalibrated,
    thresholds,
    history,
    microphoneGranted,
    startMonitoring,
    stopMonitoring,
    calibrate,
    setThresholds,
    clearHistory,
  } = useNoiseMeter();

  const [showSettings, setShowSettings] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-start monitoring if permission granted
  useEffect(() => {
    if (microphoneGranted && !isMonitoring && !isStarting) {
      setIsStarting(true);
      setError(null);
      startMonitoring()
        .catch((err) => {
          const msg = err instanceof Error ? err.message : 'Errore sconosciuto';
          setError(`Impossibile avviare il monitoraggio: ${msg}`);
        })
        .finally(() => setIsStarting(false));
    }
  }, [microphoneGranted, isMonitoring, isStarting, startMonitoring]);

  // Handle start/stop monitoring
  const handleToggleMonitoring = async () => {
    if (isMonitoring) {
      stopMonitoring();
      setError(null);
    } else {
      setIsStarting(true);
      setError(null);
      try {
        const success = await startMonitoring();
        if (!success) {
          setError('Impossibile avviare il monitoraggio. Verifica i permessi del microfono.');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Errore sconosciuto';
        setError(`Errore: ${msg}`);
      } finally {
        setIsStarting(false);
      }
    }
  };

  // If microphone permission denied, show fallback
  if (!microphoneGranted) {
    return <PermissionDeniedFallback featureName="Monitoraggio Rumore" />;
  }

  return (
    <div className="space-y-6 h-full overflow-auto pb-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center justify-between gap-3">
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 font-bold"
            aria-label="Chiudi errore"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            🎤 Monitoraggio Rumore
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {isMonitoring
              ? 'Monitoraggio in corso...'
              : 'Premi "Avvia" per iniziare il monitoraggio'}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {/* Start/Stop Button */}
          <button
            onClick={handleToggleMonitoring}
            disabled={isStarting}
            className={`px-6 py-2 rounded font-semibold transition-all ${
              isMonitoring
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[var(--accent-color)] hover:bg-opacity-80 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isStarting ? 'In corso...' : isMonitoring ? 'Arresta' : 'Avvia'}
          </button>

          {/* Calibrate Button */}
          <button
            onClick={calibrate}
            disabled={!isMonitoring}
            className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-primary)] rounded font-semibold transition-all border border-[var(--border-color)]"
            title="Calibra il livello di silenzio attuale"
          >
            📏 Calibra
          </button>

          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`px-4 py-2 rounded font-semibold transition-all border border-[var(--border-color)] ${
              showSettings
                ? 'bg-[var(--accent-color)] text-white'
                : 'bg-[var(--bg-tertiary)] hover:bg-opacity-80 text-[var(--text-primary)]'
            }`}
          >
            ⚙️ Impostazioni
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-4 gap-3">
        {/* Current Level */}
        <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Livello Attuale</p>
          <p className="text-3xl font-bold text-[var(--accent-color)]">{Math.round(currentLevel)}</p>
        </div>

        {/* Status */}
        <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Stato</p>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                currentNoiseLevel === 'green'
                  ? 'bg-[#10b981]'
                  : currentNoiseLevel === 'yellow'
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#ef4444]'
              }`}
            />
            <span className="text-sm font-semibold text-[var(--text-primary)] capitalize">
              {currentNoiseLevel === 'green'
                ? 'Silenzio'
                : currentNoiseLevel === 'yellow'
                  ? 'Discussione'
                  : 'Troppo Rumore'}
            </span>
          </div>
        </div>

        {/* Monitoring Status */}
        <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Monitoraggio</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-[#10b981]' : 'bg-[#6b7280]'}`} />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {isMonitoring ? 'Attivo' : 'Fermo'}
            </span>
          </div>
        </div>

        {/* Calibration Status */}
        <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Calibrazione</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isCalibrated ? 'bg-[#10b981]' : 'bg-[#f59e0b]'}`} />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {isCalibrated ? 'Calibrato' : 'Non calibrato'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualization & Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visualization */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Visualizzazione</h2>
            <NoiseMeterVisualization
              level={currentLevel}
              noiseLevel={currentNoiseLevel}
              thresholds={thresholds}
            />
          </div>

          {/* History Chart */}
          <NoiseHistory history={history} />
        </div>

        {/* Settings Panel */}
        <div className="lg:col-span-1">
          {showSettings && (
            <ThresholdSettings
              greenThreshold={thresholds.green}
              yellowThreshold={thresholds.yellow}
              redThreshold={thresholds.red}
              onThresholdsChange={setThresholds}
              enableAlerts={true}
              onEnableAlertsChange={() => {}}
              alertVolume={70}
              onAlertVolumeChange={() => {}}
            />
          )}

          {/* Info Panel */}
          {!showSettings && (
            <div className="space-y-4 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              <h3 className="font-semibold text-[var(--text-primary)]">ℹ️ Informazioni</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Verde (Silenzio)</p>
                  <p className="text-[var(--text-primary)]">
                    Livello: 0-{thresholds.green}
                    <br />
                    <span className="text-xs text-[var(--text-secondary)]">
                      Indicato per lavoro silenzioso e concentrazione
                    </span>
                  </p>
                </div>

                <div className="border-t border-[var(--border-color)]" />

                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Giallo (Discussione)</p>
                  <p className="text-[var(--text-primary)]">
                    Livello: {thresholds.green}-{thresholds.yellow}
                    <br />
                    <span className="text-xs text-[var(--text-secondary)]">
                      Discussione tranquilla e controllata
                    </span>
                  </p>
                </div>

                <div className="border-t border-[var(--border-color)]" />

                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Rosso (Troppo Rumore)</p>
                  <p className="text-[var(--text-primary)]">
                    Livello: {thresholds.yellow}+
                    <br />
                    <span className="text-xs text-[var(--text-secondary)]">
                      Rumore eccessivo - richiedere attenzione
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-[var(--border-color)] pt-4 space-y-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full py-2 bg-[var(--accent-color)] hover:bg-opacity-80 text-white rounded font-semibold transition-all text-sm"
                >
                  Modifica Soglie
                </button>
                <button
                  onClick={clearHistory}
                  className="w-full py-2 bg-[var(--bg-tertiary)] hover:bg-opacity-80 text-[var(--text-primary)] rounded font-semibold transition-all text-sm border border-[var(--border-color)]"
                >
                  Cancella Storico
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

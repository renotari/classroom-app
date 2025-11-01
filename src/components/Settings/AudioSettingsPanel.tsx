import { debug } from '../../utils/debug';
/**
 * AudioSettingsPanel Component
 * Displays audio settings controls for Phase 4 Audio System
 * - Sound pack selection
 * - Volume controls (master, alert, background music)
 * - Alert preferences
 */

import { useAudioStore, SOUND_PACKS } from '../../stores/audioStore';
import { AudioService } from '../../services/audioService';

export function AudioSettingsPanel() {
  const {
    selectedSoundPack,
    setSoundPack,
    masterVolume,
    setMasterVolume,
    alertVolume,
    setAlertVolume,
    backgroundMusicVolume,
    setBackgroundMusicVolume,
    backgroundMusicEnabled,
    setBackgroundMusicEnabled,
    alertEnabled,
    setAlertEnabled,
    duckingEnabled,
    setDuckingEnabled,
  } = useAudioStore();

  const handlePlayAlert = async () => {
    try {
      const audioService = AudioService.getInstance();
      await audioService.playAlert('timerEnd');
    } catch (error) {
      debug.error('Failed to play test alert:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sound Pack Selection */}
      <div>
        <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
          🎵 Sound Pack
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(SOUND_PACKS).map(([key, pack]) => (
            <button
              key={key}
              onClick={() => setSoundPack(key)}
              className={`
                p-4 rounded-lg text-left transition-all
                ${
                  selectedSoundPack === key
                    ? 'ring-2 ring-[var(--color-primary)] bg-[var(--bg-elevated)]'
                    : 'ring-1 ring-[var(--bg-elevated)] hover:ring-[var(--color-secondary)]'
                }
              `}
              aria-pressed={selectedSoundPack === key}
            >
              <h4 className="font-semibold text-[var(--text-primary)]">
                {pack.name}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {pack.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Volume Controls */}
      <div className="space-y-4">
        {/* Master Volume */}
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              🔊 Master Volume
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {Math.round(masterVolume * 100)}%
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(masterVolume * 100)}
            onChange={(e) => setMasterVolume(Number(e.target.value) / 100)}
            className="w-full h-2 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
            aria-label="Master Volume"
          />
        </div>

        {/* Alert Volume */}
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              🔔 Alert Volume
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {Math.round(alertVolume * 100)}%
            </span>
          </label>
          <div className="flex gap-2 items-end">
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(alertVolume * 100)}
              onChange={(e) => setAlertVolume(Number(e.target.value) / 100)}
              className="flex-1 h-2 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
              aria-label="Alert Volume"
            />
            <button
              onClick={handlePlayAlert}
              className="px-3 py-2 rounded-md text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors whitespace-nowrap"
              title="Play test alert"
            >
              Test
            </button>
          </div>
        </div>

        {/* Background Music Volume */}
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              🎶 Background Music Volume
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {Math.round(backgroundMusicVolume * 100)}%
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(backgroundMusicVolume * 100)}
            onChange={(e) =>
              setBackgroundMusicVolume(Number(e.target.value) / 100)
            }
            className="w-full h-2 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
            aria-label="Background Music Volume"
          />
        </div>
      </div>

      {/* Alert Preferences */}
      <div className="space-y-3">
        {/* Enable Alerts */}
        <label className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--bg-elevated)] cursor-pointer hover:border-[var(--color-primary)] transition-colors">
          <input
            type="checkbox"
            checked={alertEnabled}
            onChange={(e) => setAlertEnabled(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
            aria-label="Enable audio alerts"
          />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Enable audio alerts
          </span>
        </label>

        {/* Enable Background Music */}
        <label className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--bg-elevated)] cursor-pointer hover:border-[var(--color-primary)] transition-colors">
          <input
            type="checkbox"
            checked={backgroundMusicEnabled}
            onChange={(e) => setBackgroundMusicEnabled(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
            aria-label="Enable background music"
          />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Enable background music
          </span>
        </label>

        {/* Enable Audio Ducking */}
        <label className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--bg-elevated)] cursor-pointer hover:border-[var(--color-primary)] transition-colors">
          <input
            type="checkbox"
            checked={duckingEnabled}
            onChange={(e) => setDuckingEnabled(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
            aria-label="Enable audio ducking"
          />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Duck background music when alerts play
          </span>
        </label>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-[var(--color-info)]/10 border border-[var(--color-info)] text-sm text-[var(--text-secondary)]">
        <p>
          💡 <strong>Pro Tip:</strong> Use the Test button to preview alerts
          before class. Audio ducking automatically lowers background music when
          alerts play.
        </p>
      </div>
    </div>
  );
}

/**
 * AudioPanel Component
 *
 * Settings and controls for audio system:
 * - Sound pack selection
 * - Volume controls
 * - Audio alerts preferences
 * - Background music settings
 */

import React from 'react';
import { useAudioStore, SOUND_PACKS } from '../../stores/audioStore';
import { useAudioService } from '../../hooks/useAudioService';

export const AudioPanel: React.FC = () => {
  const audioService = useAudioService();

  // Audio store state & actions
  const {
    selectedSoundPack,
    setSoundPack,
    masterVolume,
    setMasterVolume,
    alertVolume,
    setAlertVolume,
    backgroundMusicVolume,
    setBackgroundMusicVolume,
    alertEnabled,
    setAlertEnabled,
    duckingEnabled,
    setDuckingEnabled,
    availableSoundPacks
  } = useAudioStore();

  /**
   * Test alert sound playback
   */
  const handleTestAlert = async () => {
    await audioService.playAlert();
  };

  /**
   * Test background music playback
   */
  const handleTestBackgroundMusic = async () => {
    // For demo, use a test URL
    // In real app, user would select a file
    // Note: volume is set from the store, not passed here
    await audioService.playBackgroundMusic('/sounds/background-demo.wav');
  };

  /**
   * Stop background music test
   */
  const handleStopBackgroundMusic = () => {
    audioService.stopBackgroundMusic();
  };

  return (
    <div className="h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          🔊 Audio Settings
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Configure sounds, volume levels, and audio preferences
        </p>
      </div>

      {/* ============ Alert Sounds Section ============ */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🔔</span> Alert Sounds
        </h3>

        {/* Alert Enabled Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Enable Alert Sounds
          </label>
          <button
            onClick={() => setAlertEnabled(!alertEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              alertEnabled ? 'bg-green-500' : 'bg-gray-300'
            } flex items-center ${alertEnabled ? 'justify-end' : 'justify-start'} p-1`}
          >
            <div className="w-4 h-4 bg-white rounded-full" />
          </button>
        </div>

        {/* Sound Pack Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Sound Pack
          </label>
          <select
            value={selectedSoundPack}
            onChange={(e) => setSoundPack(e.target.value)}
            disabled={!alertEnabled}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50"
          >
            {availableSoundPacks.map((packKey) => {
              const pack = SOUND_PACKS[packKey];
              return pack ? (
                <option key={packKey} value={packKey}>
                  {pack.name} - {pack.description}
                </option>
              ) : null;
            })}
          </select>
        </div>

        {/* Alert Volume Slider */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Alert Volume: {Math.round(alertVolume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(alertVolume * 100)}
            onChange={(e) => setAlertVolume(parseInt(e.target.value) / 100)}
            disabled={!alertEnabled}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
        </div>

        {/* Test Button */}
        <button
          onClick={handleTestAlert}
          disabled={!alertEnabled}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md font-medium transition-colors disabled:cursor-not-allowed"
        >
          🔊 Test Alert Sound
        </button>
      </div>

      {/* ============ Master Volume Section ============ */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🔉</span> Master Volume
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Overall Volume: {Math.round(masterVolume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(masterVolume * 100)}
            onChange={(e) => setMasterVolume(parseInt(e.target.value) / 100)}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Affects all audio output from the application
          </p>
        </div>
      </div>

      {/* ============ Background Music Section ============ */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🎵</span> Background Music
        </h3>

        {/* Background Music Volume */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Background Volume: {Math.round(backgroundMusicVolume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(backgroundMusicVolume * 100)}
            onChange={(e) => setBackgroundMusicVolume(parseInt(e.target.value) / 100)}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Test Background Music Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleTestBackgroundMusic}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
          >
            ▶️ Test Background Music
          </button>
          <button
            onClick={handleStopBackgroundMusic}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-colors"
          >
            ⏹️ Stop
          </button>
        </div>
      </div>

      {/* ============ Audio Priority Section ============ */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span>⚡</span> Audio Priority
        </h3>

        {/* Ducking Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Duck Background Music During Alerts
          </label>
          <button
            onClick={() => setDuckingEnabled(!duckingEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              duckingEnabled ? 'bg-green-500' : 'bg-gray-300'
            } flex items-center ${duckingEnabled ? 'justify-end' : 'justify-start'} p-1`}
          >
            <div className="w-4 h-4 bg-white rounded-full" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          When enabled, background music volume will reduce to 20% when an alert sound plays,
          then restore to full volume after the alert finishes. This ensures alert sounds are
          always clearly audible.
        </p>

        {/* Priority Explanation */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-900 dark:text-blue-200">
            <strong>Audio Priority System:</strong>
            <br />
            🔴 HIGH: Alert sounds (always play)
            <br />
            🟠 MEDIUM: Noise monitoring (continuous)
            <br />
            🟡 LOW: Background music (duckable during alerts)
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioPanel;

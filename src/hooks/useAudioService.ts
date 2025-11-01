import { debug } from '../utils/debug';
/**
 * Hook: useAudioService
 *
 * Provides convenient access to AudioService singleton
 * with Zustand store integration
 */

import { useCallback } from 'react';
import { audioService } from '../services/audioService';
import { useAudioStore } from '../stores/audioStore';
import { AudioCallbacks, AudioError } from '../types/audio.types';

export const useAudioService = () => {
  // Use selective subscriptions to prevent unnecessary re-renders
  // Each selector only subscribes to the specific state it needs
  const alertEnabled = useAudioStore((state) => state.alertEnabled);
  const alertVolume = useAudioStore((state) => state.alertVolume);
  const backgroundMusicEnabled = useAudioStore((state) => state.backgroundMusicEnabled);
  const backgroundMusicVolume = useAudioStore((state) => state.backgroundMusicVolume);
  const duckingEnabled = useAudioStore((state) => state.duckingEnabled);
  const getAlertSoundUrl = useAudioStore((state) => state.getAlertSoundUrl);

  /**
   * Play an alert sound with store configuration
   * Automatically uses selected sound pack and volume
   */
  const playAlert = useCallback(
    async (type: 'timerEnd' | 'attention' | 'transition' = 'timerEnd', callbacks?: AudioCallbacks) => {
      if (!alertEnabled) {
        return;
      }

      // Get sound URL from store
      const soundUrl = getAlertSoundUrl(type);

      // Update service config with current volume settings
      audioService.setConfig({
        alertVolume,
        duckingFactor: duckingEnabled ? 0.2 : 1.0 // Don't duck if disabled
      });

      try {
        await audioService.playAlert(soundUrl, callbacks);
      } catch (error) {
        debug.error('[useAudioService] Error playing alert:', error);
        callbacks?.onError?.(error as AudioError);
      }
    },
    [alertEnabled, alertVolume, duckingEnabled, getAlertSoundUrl]
  );

  /**
   * Play background music with store configuration
   */
  const playBackgroundMusic = useCallback(
    async (url: string) => {
      if (!backgroundMusicEnabled) {
        return;
      }

      // Update service config
      audioService.setConfig({
        backgroundMusicVolume
      });

      try {
        await audioService.playBackgroundMusic(url, backgroundMusicVolume);
      } catch (error) {
        debug.error('[useAudioService] Error playing background music:', error);
      }
    },
    [backgroundMusicEnabled, backgroundMusicVolume]
  );

  /**
   * Stop background music
   */
  const stopBackgroundMusic = useCallback(() => {
    audioService.stopBackgroundMusic();
  }, []);

  /**
   * Pause background music
   */
  const pauseBackgroundMusic = useCallback(() => {
    audioService.pauseBackgroundMusic();
  }, []);

  /**
   * Resume background music
   */
  const resumeBackgroundMusic = useCallback(async () => {
    await audioService.resumeBackgroundMusic();
  }, []);

  /**
   * Get background music state
   */
  const getBackgroundMusicState = useCallback(() => {
    return audioService.getBackgroundMusicState();
  }, []);

  /**
   * Check if background music is playing
   */
  const isBackgroundMusicPlaying = useCallback(() => {
    return audioService.isBackgroundMusicPlaying();
  }, []);

  /**
   * Get the underlying AudioService (for advanced usage)
   */
  const getService = useCallback(() => {
    return audioService;
  }, []);

  return {
    playAlert,
    playBackgroundMusic,
    stopBackgroundMusic,
    pauseBackgroundMusic,
    resumeBackgroundMusic,
    getBackgroundMusicState,
    isBackgroundMusicPlaying,
    getService
  };
};

import { debug } from '../utils/debug';
/**
 * Audio Store - Zustand
 *
 * Manages global audio state:
 * - Selected sound pack (Classic, Modern, Gentle)
 * - Volume levels
 * - Custom sounds
 * - User preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SoundPack } from '../types/audio.types';

// ============ Sound Packs Library ============
export const SOUND_PACKS: Record<string, SoundPack> = {
  classic: {
    name: 'Classic',
    description: 'Traditional bell and chime sounds',
    sounds: {
      timerEnd: '/sounds/classic/timer-end.wav',
      attention: '/sounds/classic/attention.wav',
      transition: '/sounds/classic/transition.wav'
    }
  },
  modern: {
    name: 'Modern',
    description: 'Contemporary digital sounds',
    sounds: {
      timerEnd: '/sounds/modern/timer-end.wav',
      attention: '/sounds/modern/attention.wav',
      transition: '/sounds/modern/transition.wav'
    }
  },
  gentle: {
    name: 'Gentle',
    description: 'Soft, non-intrusive sounds',
    sounds: {
      timerEnd: '/sounds/gentle/timer-end.wav',
      attention: '/sounds/gentle/attention.wav',
      transition: '/sounds/gentle/transition.wav'
    }
  }
};

// ============ Store State & Actions ============
export interface AudioStoreState {
  // Sound pack selection
  selectedSoundPack: string; // Key from SOUND_PACKS
  availableSoundPacks: string[]; // Keys of available packs

  // Volume settings (0-1)
  masterVolume: number;
  alertVolume: number;
  backgroundMusicVolume: number;

  // Background music
  backgroundMusicEnabled: boolean;
  backgroundMusicUrl: string | null; // User's custom music path

  // Alert preferences
  alertEnabled: boolean;
  duckingEnabled: boolean; // Duck background when alert plays

  // Custom sounds (future feature)
  customSounds: Record<string, string>; // name → URL

  // Actions
  setSoundPack: (packKey: string) => void;
  setMasterVolume: (volume: number) => void;
  setAlertVolume: (volume: number) => void;
  setBackgroundMusicVolume: (volume: number) => void;
  setBackgroundMusicUrl: (url: string | null) => void;
  setBackgroundMusicEnabled: (enabled: boolean) => void;
  setAlertEnabled: (enabled: boolean) => void;
  setDuckingEnabled: (enabled: boolean) => void;
  addCustomSound: (name: string, url: string) => void;
  removeCustomSound: (name: string) => void;

  // Getters
  getCurrentSoundPack: () => SoundPack | null;
  getAlertSoundUrl: (type: 'timerEnd' | 'attention' | 'transition') => string;
}

// Create store with persistence
export const useAudioStore = create<AudioStoreState>()(
  persist(
    (set, get) => ({
      // ============ Initial State ============
      selectedSoundPack: 'classic',
      availableSoundPacks: Object.keys(SOUND_PACKS),
      masterVolume: 0.8,
      alertVolume: 0.9,
      backgroundMusicVolume: 0.5,
      backgroundMusicEnabled: false,
      backgroundMusicUrl: null,
      alertEnabled: true,
      duckingEnabled: true,
      customSounds: {},

      // ============ Actions - Sound Pack ============
      setSoundPack: (packKey: string) => {
        if (SOUND_PACKS[packKey]) {
          set({ selectedSoundPack: packKey });
        } else {
          debug.warn(`[AudioStore] Unknown sound pack: ${packKey}`);
        }
      },

      // ============ Actions - Volume ============
      setMasterVolume: (volume: number) => {
        const clamped = Math.max(0, Math.min(1, volume));
        set({ masterVolume: clamped });
      },

      setAlertVolume: (volume: number) => {
        const clamped = Math.max(0, Math.min(1, volume));
        set({ alertVolume: clamped });
      },

      setBackgroundMusicVolume: (volume: number) => {
        const clamped = Math.max(0, Math.min(1, volume));
        set({ backgroundMusicVolume: clamped });
      },

      // ============ Actions - Background Music ============
      setBackgroundMusicUrl: (url: string | null) => {
        set({ backgroundMusicUrl: url });
      },

      setBackgroundMusicEnabled: (enabled: boolean) => {
        set({ backgroundMusicEnabled: enabled });
      },

      // ============ Actions - Alert Preferences ============
      setAlertEnabled: (enabled: boolean) => {
        set({ alertEnabled: enabled });
      },

      setDuckingEnabled: (enabled: boolean) => {
        set({ duckingEnabled: enabled });
      },

      // ============ Actions - Custom Sounds ============
      addCustomSound: (name: string, url: string) => {
        set((state) => ({
          customSounds: {
            ...state.customSounds,
            [name]: url
          }
        }));
      },

      removeCustomSound: (name: string) => {
        set((state) => {
          const customSounds = { ...state.customSounds };
          delete customSounds[name];
          return { customSounds };
        });
      },

      // ============ Getters ============
      getCurrentSoundPack: () => {
        const packKey = get().selectedSoundPack;
        return SOUND_PACKS[packKey] || null;
      },

      getAlertSoundUrl: (type: 'timerEnd' | 'attention' | 'transition') => {
        const soundPack = get().getCurrentSoundPack();
        return soundPack?.sounds[type] || '/sounds/classic/timer-end.wav';
      }
    }),
    {
      name: 'audio-store', // localStorage key
      version: 1
    }
  )
);

// ============ Helpful Hooks for Common Tasks ============

/**
 * Hook to get current sound pack
 */
export const useCurrentSoundPack = () => {
  const getCurrentSoundPack = useAudioStore((state) => state.getCurrentSoundPack);
  return getCurrentSoundPack();
};

/**
 * Hook to get alert sound URL (with fallback)
 */
export const useAlertSoundUrl = (type: 'timerEnd' | 'attention' | 'transition' = 'timerEnd') => {
  return useAudioStore((state) => state.getAlertSoundUrl(type));
};

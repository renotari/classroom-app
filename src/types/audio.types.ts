/**
 * Audio System Types
 *
 * CRITICAL: AudioContext singleton pattern - Only ONE AudioContext per app
 */

/**
 * Priority levels for audio playback
 * - HIGH: Alert sounds (interrupt background music)
 * - MEDIUM: Noise monitoring (continuous, non-blocking)
 * - LOW: Background music (duckable when alerts play)
 */
export enum AudioPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

/**
 * Audio event callbacks
 */
export interface AudioCallbacks {
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Decoded audio buffer cache entry
 */
export interface AudioBufferCacheEntry {
  buffer: AudioBuffer;
  url: string;
  loadedAt: number;
}

/**
 * Audio playback state
 */
export interface AudioPlaybackState {
  isPlaying: boolean;
  currentSource: AudioBufferSourceNode | null;
  currentGain: GainNode | null;
  priority: AudioPriority;
}

/**
 * Background music state
 */
export interface BackgroundMusicState {
  isPlaying: boolean;
  url: string | null;
  volume: number; // 0-1
  source: AudioBufferSourceNode | null;
  gain: GainNode | null;
  startTime: number;
  pausedAt: number;
}

/**
 * Sound library definition
 */
export interface SoundPack {
  name: string;
  description: string;
  sounds: {
    timerEnd: string; // URL path
    attention: string; // URL path
    transition: string; // URL path
  };
}

/**
 * Audio service configuration
 */
export interface AudioServiceConfig {
  masterVolume: number; // 0-1
  backgroundMusicVolume: number; // 0-1
  alertVolume: number; // 0-1
  duckingFactor: number; // 0-1, 0.2 = 20% volume during alert
  fadeInDuration: number; // ms
  fadeOutDuration: number; // ms
  maxCacheSize: number; // number of audio buffers to cache
}

/**
 * Error types for audio operations
 */
export class AudioError extends Error {
  constructor(
    public code: 'DECODE_ERROR' | 'LOAD_ERROR' | 'CONTEXT_ERROR' | 'FILE_NOT_FOUND',
    message: string
  ) {
    super(message);
    this.name = 'AudioError';
  }
}

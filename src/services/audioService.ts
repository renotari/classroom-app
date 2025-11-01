import { debug, DEBUG } from '../utils/debug';
/**
 * AudioService - Singleton pattern
 *
 * CRITICAL: This is the ONLY place AudioContext is instantiated.
 * All audio operations in the app go through this singleton.
 *
 * Pattern:
 * - Private constructor prevents direct instantiation
 * - Static getInstance() ensures only one instance
 * - All modules use AudioService.getInstance() to get reference
 *
 * Test requirement: Verify no other `new AudioContext()` in codebase
 */

import {
  AudioError,
  AudioServiceConfig,
  BackgroundMusicState,
  AudioCallbacks
} from '../types/audio.types';


// ============ Configuration Constants ============
/** Default master volume level (0-1 scale) */
const DEFAULT_MASTER_VOLUME = 0.8;

/** Default background music volume level (0-1 scale) */
const DEFAULT_BACKGROUND_MUSIC_VOLUME = 0.5;

/** Audio ducking factor - percentage of volume to reduce background music during alerts */
const DEFAULT_DUCKING_FACTOR = 0.2; // 20% volume

/** Fade in duration for audio transitions in milliseconds */
const DEFAULT_FADE_IN_DURATION_MS = 500;

/** Fade out duration for audio transitions in milliseconds */
const DEFAULT_FADE_OUT_DURATION_MS = 300;

/** Maximum number of audio buffers to keep in cache */
const DEFAULT_MAX_CACHE_SIZE = 20;

/** Amplitude multiplier for generated beep tones (for safety) */
const BEEP_TONE_AMPLITUDE = 0.3;

/** Default beep tone frequency in Hz (A4 note) */
const DEFAULT_BEEP_FREQUENCY_HZ = 440;

/** Default beep tone duration in seconds */
const DEFAULT_BEEP_DURATION_SEC = 0.5;

/** Volume transition time constant in seconds (for setTargetAtTime) */
const VOLUME_TRANSITION_TIME_CONSTANT = 0.1;

export class AudioService {
  private static instance: AudioService;

  // ============ Audio Context (SINGLETON CORE) ============
  private audioContext: AudioContext;
  private masterGain: GainNode;

  // ============ Cache & State ============
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private backgroundMusicState: BackgroundMusicState;
  private config: AudioServiceConfig;

  // ============ Currently Playing Alert ============
  private currentAlertSource: AudioBufferSourceNode | null = null;
  private currentAlertGain: GainNode | null = null;

  // ============ Constructor (Private) ============
  private constructor(config?: Partial<AudioServiceConfig>) {
    // Initialize AudioContext - happens ONLY ONCE in entire app
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);

    // Default configuration
    this.config = {
      masterVolume: DEFAULT_MASTER_VOLUME,
      backgroundMusicVolume: DEFAULT_BACKGROUND_MUSIC_VOLUME,
      alertVolume: DEFAULT_MASTER_VOLUME,
      duckingFactor: DEFAULT_DUCKING_FACTOR,
      fadeInDuration: DEFAULT_FADE_IN_DURATION_MS,
      fadeOutDuration: DEFAULT_FADE_OUT_DURATION_MS,
      maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
      ...config
    };

    // Initialize master volume
    this.masterGain.gain.value = this.config.masterVolume;

    // Background music state
    this.backgroundMusicState = {
      isPlaying: false,
      url: null,
      volume: this.config.backgroundMusicVolume,
      source: null,
      gain: null,
      startTime: 0,
      pausedAt: 0
    };

    if (DEBUG) {
      debug.log('[AudioService] Singleton instance created');
      debug.log(`[AudioService] AudioContext state: ${this.audioContext.state}`);
    }
  }

  // ============ Singleton Access ============
  /**
   * Get the singleton instance of AudioService
   * ALWAYS use this method - never instantiate directly
   */
  static getInstance(config?: Partial<AudioServiceConfig>): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService(config);
    }
    return AudioService.instance;
  }

  /**
   * Get the underlying AudioContext
   * Use this sparingly - only for modules that need direct context access
   */
  getContext(): AudioContext {
    return this.audioContext;
  }

  /**
   * Get the master gain node
   * Used for volume control and audio ducking
   */
  getMasterGain(): GainNode {
    return this.masterGain;
  }

  /**
   * Set the master volume level
   * @param volume - Volume level (0-1)
   */
  setMasterVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.masterGain.gain.value = clampedVolume;
    this.config.masterVolume = clampedVolume;
    if (DEBUG) debug.log(`[AudioService] Master volume set to ${clampedVolume}`);
  }

  // ============ Audio File Loading ============
  /**
   * Validate audio file URL for security
   * Prevents path traversal and ensures valid audio URLs
   *
   * @param url - URL to validate
   * @throws AudioError if URL is invalid
   */
  private validateAudioUrl(url: string): void {
    // Check for absolute URLs (http/https)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return; // Allow absolute URLs
    }

    // Check for relative paths starting with /sounds/ (safelist)
    if (url.startsWith('/sounds/')) {
      return; // Allow safe sound directory
    }

    // Reject anything else to prevent path traversal
    throw new AudioError(
      'LOAD_ERROR',
      `Invalid audio file path: "${url}". Use /sounds/* for relative paths or http(s):// for absolute URLs`
    );
  }

  /**
   * Load and decode an audio file
   * Results are cached to avoid re-decoding
   *
   * @param url - Path to audio file (relative or absolute)
   * @returns Decoded AudioBuffer or null if failed
   * @throws AudioError if URL is invalid
   */
  async loadAudioFile(url: string): Promise<AudioBuffer | null> {
    try {
      // Validate URL first (security check)
      this.validateAudioUrl(url);

      // Check cache first
      if (this.audioBufferCache.has(url)) {
        if (DEBUG) debug.log(`[AudioService] Cache hit: ${url}`);
        return this.audioBufferCache.get(url)!;
      }

      // Fetch the audio file
      const response = await fetch(url);
      if (!response.ok) {
        throw new AudioError('FILE_NOT_FOUND', `Audio file not found: ${url}`);
      }

      // Read as ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();

      // Decode audio data
      let audioBuffer: AudioBuffer;
      try {
        audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      } catch (decodeError) {
        throw new AudioError(
          'DECODE_ERROR',
          `Failed to decode audio file ${url}: ${decodeError instanceof Error ? decodeError.message : 'Unknown error'}`
        );
      }

      // Cache the decoded buffer
      this.audioBufferCache.set(url, audioBuffer);

      // Cleanup cache if too large
      if (this.audioBufferCache.size > this.config.maxCacheSize) {
        const firstKey = this.audioBufferCache.keys().next().value as string;
        if (firstKey) {
          this.audioBufferCache.delete(firstKey);
          if (DEBUG) debug.log(`[AudioService] Cache full, removed oldest entry`);
        }
      }

      if (DEBUG) debug.log(`[AudioService] Loaded and cached: ${url}`);
      return audioBuffer;
    } catch (error) {
      const audioError = error instanceof AudioError
        ? error
        : new AudioError(
          'LOAD_ERROR',
          `Failed to load audio file ${url}: ${error instanceof Error ? error.message : String(error)}`
        );

      debug.error(`[AudioService] ${audioError.message}`);

      // Fallback: Generate beep tone
      return this.generateBeepTone(440, 0.5);
    }
  }

  // ============ Beep Tone Fallback ============
  /**
   * Generate a simple beep tone
   * Used as fallback when audio files can't be loaded
   *
   * @param frequency - Frequency in Hz (default 440 = A4 note)
   * @param duration - Duration in seconds
   * @returns Generated AudioBuffer
   */
  private generateBeepTone(
    frequency: number = DEFAULT_BEEP_FREQUENCY_HZ,
    duration: number = DEFAULT_BEEP_DURATION_SEC
  ): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = sampleRate * duration;

    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Generate sine wave
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * BEEP_TONE_AMPLITUDE;
    }

    if (DEBUG) debug.log(`[AudioService] Generated beep tone: ${frequency}Hz, ${duration}s`);
    return buffer;
  }

  // ============ Alert Sounds (HIGH Priority) ============
  /**
   * Play an alert sound
   * - Interrupts background music (ducks it to 20%)
   * - Waits for audio to complete
   * - Restores background music volume after
   *
   * @param url - Path to audio file
   * @param callbacks - Optional callbacks for start/end/error
   */
  async playAlert(url: string, callbacks?: AudioCallbacks): Promise<void> {
    try {
      if (DEBUG) debug.log(`[AudioService] Playing alert: ${url}`);

      // Stop any currently playing alert
      this.stopAlert();

      // Load audio file
      const audioBuffer = await this.loadAudioFile(url);
      if (!audioBuffer) {
        throw new AudioError('LOAD_ERROR', `Could not load alert sound: ${url}`);
      }

      // Duck background music if playing
      if (this.backgroundMusicState.isPlaying) {
        this.duckBackgroundMusic();
      }

      // Create source and gain nodes for this alert
      const source = this.audioContext.createBufferSource();
      const gain = this.audioContext.createGain();

      // Setup alert volume
      source.buffer = audioBuffer;
      gain.gain.value = this.config.alertVolume;

      // Connect: source → gain → masterGain → destination
      source.connect(gain);
      gain.connect(this.masterGain);

      // Store reference for later cleanup
      this.currentAlertSource = source;
      this.currentAlertGain = gain;

      // Callback on start
      callbacks?.onPlayStart?.();

      // Play the sound
      source.start(0);

      // Wait for sound to finish
      const duration = audioBuffer.duration * 1000; // Convert to ms
      await new Promise(resolve => setTimeout(resolve, duration));

      // Cleanup
      this.stopAlert();

      // Restore background music volume if it was ducked
      if (this.backgroundMusicState.isPlaying) {
        this.restoreBackgroundMusicVolume();
      }

      // Callback on end
      callbacks?.onPlayEnd?.();
    } catch (error) {
      const audioError = error instanceof AudioError ? error : new AudioError(
        'CONTEXT_ERROR',
        `Error playing alert: ${error instanceof Error ? error.message : String(error)}`
      );

      debug.error(`[AudioService] ${audioError.message}`);
      callbacks?.onError?.(audioError);
    }
  }

  /**
   * Stop the currently playing alert immediately
   */
  private stopAlert(): void {
    if (this.currentAlertSource) {
      try {
        this.currentAlertSource.stop();
        this.currentAlertSource.disconnect();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Already stopped, ignore
      }
      this.currentAlertSource = null;
    }

    if (this.currentAlertGain) {
      this.currentAlertGain.disconnect();
      this.currentAlertGain = null;
    }

    if (DEBUG) debug.log(`[AudioService] Alert stopped`);
  }

  // ============ Background Music (LOW Priority) ============
  /**
   * Play background music (loops)
   * Can be paused/resumed, volume adjustable
   *
   * @param url - Path to audio file
   * @param volume - Volume level 0-1
   */
  async playBackgroundMusic(url: string, volume: number = this.config.backgroundMusicVolume): Promise<void> {
    try {
      if (DEBUG) debug.log(`[AudioService] Playing background music: ${url}`);

      // Stop existing background music
      this.stopBackgroundMusic();

      // Load audio file
      const audioBuffer = await this.loadAudioFile(url);
      if (!audioBuffer) {
        throw new AudioError('LOAD_ERROR', `Could not load background music: ${url}`);
      }

      // Create source and gain nodes
      const source = this.audioContext.createBufferSource();
      const gain = this.audioContext.createGain();

      // Setup background music
      source.buffer = audioBuffer;
      source.loop = true;
      gain.gain.value = volume;

      // Connect: source → gain → masterGain → destination
      source.connect(gain);
      gain.connect(this.masterGain);

      // Store state
      this.backgroundMusicState.isPlaying = true;
      this.backgroundMusicState.url = url;
      this.backgroundMusicState.volume = volume;
      this.backgroundMusicState.source = source;
      this.backgroundMusicState.gain = gain;
      this.backgroundMusicState.startTime = this.audioContext.currentTime;
      this.backgroundMusicState.pausedAt = 0;

      // Start playback
      source.start(0);

      if (DEBUG) debug.log(`[AudioService] Background music started`);
    } catch (error) {
      const audioError = error instanceof AudioError ? error : new AudioError(
        'CONTEXT_ERROR',
        `Error playing background music: ${error instanceof Error ? error.message : String(error)}`
      );

      debug.error(`[AudioService] ${audioError.message}`);
    }
  }

  /**
   * Stop background music immediately
   */
  stopBackgroundMusic(): void {
    if (this.backgroundMusicState.source) {
      try {
        this.backgroundMusicState.source.stop();
        this.backgroundMusicState.source.disconnect();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Already stopped, ignore
      }
    }

    if (this.backgroundMusicState.gain) {
      this.backgroundMusicState.gain.disconnect();
    }

    this.backgroundMusicState.isPlaying = false;
    this.backgroundMusicState.source = null;
    this.backgroundMusicState.gain = null;

    if (DEBUG) debug.log(`[AudioService] Background music stopped`);
  }

  /**
   * Pause background music (for resuming later)
   */
  pauseBackgroundMusic(): void {
    if (!this.backgroundMusicState.isPlaying || !this.backgroundMusicState.source) {
      return;
    }

    try {
      this.backgroundMusicState.source.stop();
      this.backgroundMusicState.pausedAt = this.audioContext.currentTime;
      this.backgroundMusicState.isPlaying = false;
      if (DEBUG) debug.log(`[AudioService] Background music paused`);
    } catch (e) {
      debug.error('[AudioService] Error pausing background music:', e);
    }
  }

  /**
   * Resume background music after pause
   */
  async resumeBackgroundMusic(): Promise<void> {
    if (this.backgroundMusicState.url && this.backgroundMusicState.pausedAt > 0) {
      await this.playBackgroundMusic(
        this.backgroundMusicState.url,
        this.backgroundMusicState.volume
      );
      if (DEBUG) debug.log(`[AudioService] Background music resumed`);
    }
  }

  // ============ Audio Ducking (for alert priority) ============
  /**
   * Duck background music volume to config.duckingFactor
   * Called when alert starts playing
   */
  private duckBackgroundMusic(): void {
    if (this.backgroundMusicState.gain && this.backgroundMusicState.isPlaying) {
      const currentVolume = this.backgroundMusicState.gain.gain.value;
      const duckedVolume = currentVolume * this.config.duckingFactor;

      this.backgroundMusicState.gain.gain.setTargetAtTime(
        duckedVolume,
        this.audioContext.currentTime,
        VOLUME_TRANSITION_TIME_CONSTANT
      );

      if (DEBUG) debug.log(`[AudioService] Background music ducked: ${(duckedVolume * 100).toFixed(0)}%`);
    }
  }

  /**
   * Restore background music volume to original
   * Called after alert finishes
   */
  private restoreBackgroundMusicVolume(): void {
    if (this.backgroundMusicState.gain && this.backgroundMusicState.isPlaying) {
      this.backgroundMusicState.gain.gain.setTargetAtTime(
        this.backgroundMusicState.volume,
        this.audioContext.currentTime,
        VOLUME_TRANSITION_TIME_CONSTANT
      );

      if (DEBUG) debug.log(`[AudioService] Background music restored`);
    }
  }

  // ============ Configuration ============
  /**
   * Update service configuration
   */
  setConfig(partial: Partial<AudioServiceConfig>): void {
    this.config = { ...this.config, ...partial };
    this.masterGain.gain.value = this.config.masterVolume;
    this.backgroundMusicState.volume = this.config.backgroundMusicVolume;
    if (DEBUG) debug.log(`[AudioService] Configuration updated`);
  }

  /**
   * Get current configuration
   */
  getConfig(): AudioServiceConfig {
    return { ...this.config };
  }

  // ============ State & Monitoring ============
  /**
   * Get background music state
   */
  getBackgroundMusicState(): BackgroundMusicState {
    return { ...this.backgroundMusicState };
  }

  /**
   * Check if background music is playing
   */
  isBackgroundMusicPlaying(): boolean {
    return this.backgroundMusicState.isPlaying;
  }

  /**
   * Clear the audio buffer cache
   * Useful for freeing memory in long sessions
   */
  clearCache(): void {
    this.audioBufferCache.clear();
    if (DEBUG) debug.log(`[AudioService] Audio buffer cache cleared`);
  }

  /**
   * Get cache statistics (for debugging)
   */
  getCacheStats(): { size: number; buffers: string[] } {
    return {
      size: this.audioBufferCache.size,
      buffers: Array.from(this.audioBufferCache.keys())
    };
  }
}

// Export singleton instance for convenient access
export const audioService = AudioService.getInstance();

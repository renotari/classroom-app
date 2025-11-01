import { debug, DEBUG } from '../utils/debug';
/**
 * AudioMonitoringService - Singleton pattern
 *
 * CRITICAL: Monitora livello rumore in real-time usando Web Audio API AnalyserNode.
 * Pattern identico a AudioService (FASE 4):
 * - Private constructor prevents direct instantiation
 * - Static getInstance() ensures only one instance
 * - Riutilizza AudioContext dalla AudioService singleton (NO duplicates)
 *
 * Features:
 * - Real-time noise level measurement in dB
 * - Frequency data for visualization
 * - Automatic calibration
 * - Graceful handling of denied microphone access
 */

import { AudioService } from './audioService';


/**
 * Audio monitoring configuration
 */
interface AudioMonitoringConfig {
  /** FFT size for frequency analysis (default 2048) */
  fftSize: number;
  /** Min dB value (for scaling) */
  minDb: number;
  /** Max dB value (for scaling) */
  maxDb: number;
  /** Smoothing factor (0-1, default 0.8) */
  smoothing: number;
}

/**
 * AudioMonitoringService singleton class
 */
export class AudioMonitoringService {
  private static instance: AudioMonitoringService;

  // ============ Audio API ============
  private audioService: AudioService;
  private audioContext: AudioContext;
  private mediaStream: MediaStream | null = null;
  private mediaStreamAudioSource: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;

  // ============ State ============
  private isMonitoring = false;
  private isCalibrated = false;
  private baselineLevel = 0; // Baseline noise level for calibration

  // ============ Data ============
  private currentLevel = 0; // 0-100 (normalized)
  private frequencyData: Uint8Array | null = null;
  private timeDomainData: Uint8Array | null = null;

  // ============ Callbacks ============
  private monitoringCallbacks: ((level: number) => void)[] = [];

  // ============ Animation Frame ============
  private animationFrameId: number | null = null;

  // ============ Configuration ============
  private config: AudioMonitoringConfig;

  /**
   * Private constructor (singleton pattern)
   */
  private constructor(config?: Partial<AudioMonitoringConfig>) {
    this.audioService = AudioService.getInstance();
    this.audioContext = this.audioService.getContext();

    this.config = {
      fftSize: 2048,
      minDb: -100,
      maxDb: -10,
      smoothing: 0.8,
      ...config,
    };

    if (DEBUG) {
      debug.log('[AudioMonitoringService] Singleton instance created');
      debug.log(`[AudioMonitoringService] Using shared AudioContext from AudioService`);
    }
  }

  /**
   * Get singleton instance
   * ALWAYS use this method - never instantiate directly
   */
  static getInstance(config?: Partial<AudioMonitoringConfig>): AudioMonitoringService {
    if (!AudioMonitoringService.instance) {
      AudioMonitoringService.instance = new AudioMonitoringService(config);
    }
    return AudioMonitoringService.instance;
  }

  /**
   * Start monitoring microphone audio
   * @param mediaStream - MediaStream from getUserMedia
   * @returns true if monitoring started successfully
   */
  startMonitoring(mediaStream: MediaStream): boolean {
    if (this.isMonitoring) {
      if (DEBUG) debug.log('[AudioMonitoringService] Already monitoring, ignoring start request');
      return false;
    }

    try {
      // Resume AudioContext if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch((err) => {
          debug.warn('[AudioMonitoringService] Failed to resume AudioContext:', err);
        });
      }

      this.mediaStream = mediaStream;

      // Create media stream source
      this.mediaStreamAudioSource = this.audioContext.createMediaStreamSource(mediaStream);

      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = this.config.smoothing;

      // Connect: mediaStream → analyser → speakers (so we can still hear audio if needed)
      this.mediaStreamAudioSource.connect(this.analyser);
      // this.analyser.connect(this.audioContext.destination); // Optional: send to speakers

      // Initialize data arrays
      const bufferLength = this.analyser.frequencyBinCount;
      this.frequencyData = new Uint8Array(bufferLength);
      this.timeDomainData = new Uint8Array(this.analyser.fftSize);

      // Start animation loop
      this.isMonitoring = true;
      this.updateLevel();

      if (DEBUG) {
        debug.log('[AudioMonitoringService] Monitoring started');
        debug.log(`[AudioMonitoringService] FFT size: ${this.config.fftSize}`);
        debug.log(`[AudioMonitoringService] Buffer length: ${bufferLength}`);
      }

      return true;
    } catch (error) {
      debug.error('[AudioMonitoringService] Error starting monitoring:', error);
      this.isMonitoring = false;
      return false;
    }
  }

  /**
   * Stop monitoring microphone audio
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    try {
      // Cancel animation frame
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // Disconnect nodes
      if (this.mediaStreamAudioSource) {
        this.mediaStreamAudioSource.disconnect();
        this.mediaStreamAudioSource = null;
      }

      if (this.analyser) {
        this.analyser.disconnect();
        this.analyser = null;
      }

      // Stop media stream tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
        this.mediaStream = null;
      }

      this.isMonitoring = false;
      this.currentLevel = 0;
      this.monitoringCallbacks = [];

      if (DEBUG) {
        debug.log('[AudioMonitoringService] Monitoring stopped');
      }
    } catch (error) {
      debug.error('[AudioMonitoringService] Error stopping monitoring:', error);
    }
  }

  /**
   * Update noise level - called via requestAnimationFrame
   * Private method
   */
  private updateLevel(): void {
    if (!this.isMonitoring || !this.analyser || !this.frequencyData) {
      return;
    }

    // Get frequency data
    this.analyser.getByteFrequencyData(this.frequencyData);

    // Calculate RMS (Root Mean Square) level
    let sum = 0;
    const dataLength = this.frequencyData.length;
    for (let i = 0; i < dataLength; i++) {
      const byte = this.frequencyData[i] ?? 0;
      const value = byte / 255.0;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / dataLength);

    // Convert RMS to dB (20 * log10(rms))
    const db = rms > 0 ? 20 * Math.log10(rms) : this.config.minDb;

    // Clamp dB to configured range
    const clampedDb = Math.max(
      this.config.minDb,
      Math.min(this.config.maxDb, db)
    );

    // Normalize to 0-100 scale
    const dbRange = this.config.maxDb - this.config.minDb;
    const normalized = ((clampedDb - this.config.minDb) / dbRange) * 100;

    this.currentLevel = Math.max(0, Math.min(100, normalized));

    // Call monitoring callbacks
    this.monitoringCallbacks.forEach((callback) => {
      callback(this.currentLevel);
    });

    // Request next frame
    this.animationFrameId = requestAnimationFrame(() => this.updateLevel());
  }

  /**
   * Get current noise level (0-100)
   */
  getCurrentLevel(): number {
    return this.currentLevel;
  }

  /**
   * Get frequency data for visualization
   * Returns Uint8Array of frequency bins (0-255 each)
   */
  getFrequencyData(): Uint8Array | null {
    if (!this.isMonitoring || !this.frequencyData) {
      return null;
    }

    // Get fresh data
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyData);
    }

    return this.frequencyData;
  }

  /**
   * Get time domain (waveform) data for visualization
   */
  getTimeDomainData(): Uint8Array | null {
    if (!this.isMonitoring || !this.timeDomainData || !this.analyser) {
      return null;
    }

    this.analyser.getByteTimeDomainData(this.timeDomainData);
    return this.timeDomainData;
  }

  /**
   * Calibrate: record baseline noise level
   * Call this during silent period to establish baseline
   */
  calibrate(): void {
    if (!this.isMonitoring) {
      debug.warn('[AudioMonitoringService] Cannot calibrate - not monitoring');
      return;
    }

    // Use current level as baseline
    this.baselineLevel = this.currentLevel;
    this.isCalibrated = true;

    if (DEBUG) {
      debug.log('[AudioMonitoringService] Calibrated. Baseline level:', this.baselineLevel);
    }
  }

  /**
   * Check if monitoring is active
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Check if calibrated
   */
  isCalibratedCheck(): boolean {
    return this.isCalibrated;
  }

  /**
   * Get baseline level
   */
  getBaselineLevel(): number {
    return this.baselineLevel;
  }

  /**
   * Subscribe to level updates
   * Callback receives level (0-100) on each frame update
   */
  onLevelChange(callback: (level: number) => void): () => void {
    this.monitoringCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.monitoringCallbacks = this.monitoringCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Get analyser node (for advanced operations)
   * Use sparingly - prefer public methods
   */
  getAnalyserNode(): AnalyserNode | null {
    return this.analyser;
  }

  /**
   * Get audio context (for advanced operations)
   * Shared with AudioService singleton
   */
  getAudioContext(): AudioContext {
    return this.audioContext;
  }

  /**
   * Reset monitoring state
   * Useful for testing
   */
  reset(): void {
    this.stopMonitoring();
    this.baselineLevel = 0;
    this.isCalibrated = false;
    this.currentLevel = 0;
    this.monitoringCallbacks = [];
  }
}

/**
 * Test helper: reset singleton for testing
 * WARNING: Only use in test environment!
 */
export function resetAudioMonitoringServiceForTesting(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (AudioMonitoringService as any).instance = undefined;
}

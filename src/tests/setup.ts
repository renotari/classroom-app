import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

type AudioContextState = 'suspended' | 'running' | 'closed';

// Cleanup dopo ogni test
afterEach(() => {
  cleanup();
  // Clear AudioService singleton for test isolation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).AudioService = undefined;
});

// Mock dell'AudioContext per i test
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).AudioContext = class MockAudioContext {
  private _currentTime: number = 0;
  private _state: AudioContextState = 'running';

  createGain() {
    return {
      gain: { value: 1, setTargetAtTime: () => {} },
      connect: () => {},
      disconnect: () => {},
    };
  }

  createOscillator() {
    return {
      frequency: { value: 440 },
      connect: () => {},
      start: () => {},
      stop: () => {},
      disconnect: () => {},
    };
  }

  createBufferSource() {
    return {
      buffer: null,
      loop: false,
      connect: () => {},
      start: () => {},
      stop: () => {},
      disconnect: () => {},
    };
  }

  createBuffer(channels: number, length: number, sampleRate: number) {
    return {
      length,
      sampleRate,
      numberOfChannels: channels,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getChannelData: (_channel: number) => new Float32Array(length),
      copyFromChannel: () => {},
      copyToChannel: () => {},
    };
  }

  createAnalyser() {
    return {
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteTimeDomainData: () => {},
      getByteFrequencyData: () => {},
      connect: () => {},
      disconnect: () => {},
    };
  }

  createMediaStreamSource(stream: MediaStream) {
    return {
      mediaStream: stream,
      connect: () => {},
      disconnect: () => {},
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  decodeAudioData(_arrayBuffer: ArrayBuffer) {
    // Create a mock decoded audio buffer
    return Promise.resolve({
      length: 44100,
      sampleRate: 44100,
      numberOfChannels: 1,
      duration: 1,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getChannelData: (_channel: number) => new Float32Array(44100),
      copyFromChannel: () => {},
      copyToChannel: () => {},
    });
  }

  get destination() {
    return {};
  }

  get currentTime() {
    return this._currentTime;
  }

  get state(): AudioContextState {
    return this._state;
  }

  get sampleRate() {
    return 44100;
  }

  close() {
    return Promise.resolve();
  }

  resume() {
    this._state = 'running';
    return Promise.resolve();
  }

  suspend() {
    this._state = 'suspended';
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Mock del MediaDevices per noise monitoring
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: () => Promise.resolve({
      getTracks: () => [],
      getAudioTracks: () => [],
      getVideoTracks: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  },
});

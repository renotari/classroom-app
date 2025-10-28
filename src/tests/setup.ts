import '@testing-library/jest-dom';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

type AudioContextState = 'suspended' | 'running' | 'closed';

// Initialize localStorage mock for Zustand persist middleware
beforeEach(() => {
  // Mock localStorage for test environment
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
});

// Cleanup dopo ogni test
afterEach(() => {
  cleanup();
  // Clear localStorage
  window.localStorage.clear();
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gain = new (globalThis as any).GainNode();
    return gain;
  }

  createOscillator() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const osc = new (globalThis as any).OscillatorNode();
    return osc;
  }

  createBufferSource() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const source = new (globalThis as any).AudioBufferSourceNode();
    return source;
  }

  createBuffer(channels: number, length: number, sampleRate: number) {
    return {
      length,
      sampleRate,
      numberOfChannels: channels,
      getChannelData: (_channel: number) => new Float32Array(length),
      copyFromChannel: () => {},
      copyToChannel: () => {},
    };
  }

  createAnalyser() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analyser = new (globalThis as any).AnalyserNode();
    return analyser;
  }

  createMediaStreamSource(stream: MediaStream) {
    if (!stream) {
      throw new Error('MediaStream is required');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const source = new (globalThis as any).MediaStreamAudioSourceNode();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (source as any).mediaStream = stream;
    return source;
  }

  decodeAudioData(_arrayBuffer: ArrayBuffer) {
    // Create a mock decoded audio buffer
    return Promise.resolve({
      length: 44100,
      sampleRate: 44100,
      numberOfChannels: 1,
      duration: 1,
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

// Mock Web Audio API node types for instanceof checks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).AnalyserNode = class AnalyserNode {
  fftSize = 2048;
  frequencyBinCount = 1024;
  getByteTimeDomainData() {}
  getByteFrequencyData() {}
  connect() {}
  disconnect() {}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).GainNode = class GainNode {
  gain = { value: 1, setTargetAtTime: () => {} };
  connect() {}
  disconnect() {}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).OscillatorNode = class OscillatorNode {
  frequency = { value: 440 };
  connect() {}
  start() {}
  stop() {}
  disconnect() {}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).AudioBufferSourceNode = class AudioBufferSourceNode {
  buffer = null;
  loop = false;
  connect() {}
  start() {}
  stop() {}
  disconnect() {}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).MediaStreamAudioSourceNode = class MediaStreamAudioSourceNode {
  connect() {}
  disconnect() {}
};

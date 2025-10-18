import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup dopo ogni test
afterEach(() => {
  cleanup();
});

// Mock dell'AudioContext per i test
global.AudioContext = class MockAudioContext {
  createGain() {
    return {
      gain: { value: 1 },
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
    };
  }
  createBufferSource() {
    return {
      buffer: null,
      connect: () => {},
      start: () => {},
      stop: () => {},
    };
  }
  createAnalyser() {
    return {
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteTimeDomainData: () => {},
      connect: () => {},
    };
  }
  get destination() {
    return {};
  }
  get currentTime() {
    return 0;
  }
  close() {
    return Promise.resolve();
  }
  resume() {
    return Promise.resolve();
  }
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

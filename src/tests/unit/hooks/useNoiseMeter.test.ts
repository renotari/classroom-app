/**
 * useNoiseMeter Hook Unit Tests
 * Target: 15+ test cases
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNoiseMeter } from '../../../hooks/useNoiseMeter';
import { useNoiseStore } from '../../../stores/noiseStore';

// Mock audio monitoring service
vi.mock('../../../services/audioMonitoringService', () => ({
  AudioMonitoringService: {
    getInstance: vi.fn(() => ({
      startMonitoring: vi.fn().mockReturnValue(true),
      stopMonitoring: vi.fn(),
      getCurrentLevel: vi.fn().mockReturnValue(50),
      calibrate: vi.fn(),
      onLevelChange: vi.fn((_cb) => {
        // Return unsubscribe function - don't call callback during registration
        // Callback will be tested separately
        return () => {};
      }),
      isMonitoringActive: vi.fn().mockReturnValue(false),
      isCalibratedCheck: vi.fn().mockReturnValue(false),
    })),
  },
  resetAudioMonitoringServiceForTesting: vi.fn(),
}));

// Mock microphone permission hook
vi.mock('../../../hooks/useMicrophonePermission', () => ({
  useMicrophonePermission: vi.fn(() => ({
    status: 'granted',
    isGranted: true,
    isDenied: false,
    isPending: false,
    isError: false,
    requestPermission: vi.fn().mockResolvedValue('granted'),
  })),
}));

describe('useNoiseMeter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store
    useNoiseStore.getState().resetState();
  });

  afterEach(() => {
    useNoiseStore.getState().resetState();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useNoiseMeter());

    act(() => {
      expect(result.current.currentLevel).toBeGreaterThanOrEqual(0);
      expect(result.current.currentLevel).toBeLessThanOrEqual(100);
      expect(result.current.isMonitoring).toBeDefined();
      expect(result.current.isCalibrated).toBeDefined();
    });
  });

  it('should have correct threshold values', () => {
    const { result } = renderHook(() => useNoiseMeter());

    act(() => {
      expect(result.current.thresholds.green).toBe(50);
      expect(result.current.thresholds.yellow).toBe(70);
      expect(result.current.thresholds.red).toBe(100);
    });
  });

  it('should start monitoring', async () => {
    const { result } = renderHook(() => useNoiseMeter());

    const success = await act(async () => {
      return await result.current.startMonitoring();
    });

    expect(success).toBeDefined();
  });

  it('should stop monitoring', () => {
    const { result } = renderHook(() => useNoiseMeter());

    expect(() => {
      act(() => {
        result.current.stopMonitoring();
      });
    }).not.toThrow();
  });

  it('should calibrate when monitoring', () => {
    const { result } = renderHook(() => useNoiseMeter());

    expect(() => {
      act(() => {
        result.current.calibrate();
      });
    }).not.toThrow();
  });

  it('should update thresholds', () => {
    const { result, rerender } = renderHook(() => useNoiseMeter());

    act(() => {
      result.current.setThresholds(40, 65, 90);
    });

    rerender();

    act(() => {
      expect(result.current.thresholds.green).toBe(40);
      expect(result.current.thresholds.yellow).toBe(65);
      expect(result.current.thresholds.red).toBe(90);
    });
  });

  it('should add history point', () => {
    const { result, rerender } = renderHook(() => useNoiseMeter());

    const initialLength = result.current.history.length;

    act(() => {
      result.current.addHistoryPoint(75);
    });

    rerender();

    act(() => {
      expect(result.current.history.length).toBe(initialLength + 1);
    });
  });

  it('should clear history', () => {
    const { result, rerender } = renderHook(() => useNoiseMeter());

    act(() => {
      result.current.addHistoryPoint(75);
      result.current.addHistoryPoint(80);
    });

    rerender();

    act(() => {
      expect(result.current.history.length).toBeGreaterThan(0);
      result.current.clearHistory();
    });

    rerender();

    act(() => {
      expect(result.current.history.length).toBe(0);
    });
  });

  it('should determine noise level color', () => {
    const { result } = renderHook(() => useNoiseMeter());

    // Check initial noise level
    expect(['green', 'yellow', 'red']).toContain(result.current.currentNoiseLevel);
  });

  it('should have microphone granted status', () => {
    const { result } = renderHook(() => useNoiseMeter());

    expect(result.current.microphoneGranted).toBe(true);
  });

  it('should return history array', () => {
    const { result } = renderHook(() => useNoiseMeter());

    expect(Array.isArray(result.current.history)).toBe(true);
  });

  it('should return all required methods', () => {
    const { result } = renderHook(() => useNoiseMeter());

    expect(typeof result.current.startMonitoring).toBe('function');
    expect(typeof result.current.stopMonitoring).toBe('function');
    expect(typeof result.current.calibrate).toBe('function');
    expect(typeof result.current.setThresholds).toBe('function');
    expect(typeof result.current.addHistoryPoint).toBe('function');
    expect(typeof result.current.clearHistory).toBe('function');
  });

  it('should have consistent threshold ordering', () => {
    const { result } = renderHook(() => useNoiseMeter());

    expect(result.current.thresholds.green).toBeLessThanOrEqual(result.current.thresholds.yellow);
    expect(result.current.thresholds.yellow).toBeLessThanOrEqual(result.current.thresholds.red);
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useNoiseMeter());

    expect(() => unmount()).not.toThrow();
  });
});

import { debug } from '../utils/debug';
/**
 * useNoiseMeter Hook
 * Manages noise monitoring lifecycle and integration with AudioMonitoringService + store
 */

import { useEffect, useCallback, useRef } from 'react';
import { AudioMonitoringService } from '../services/audioMonitoringService';
import { useNoiseStore } from '../stores/noiseStore';
import { useMicrophonePermission } from './useMicrophonePermission';

interface UseNoiseMeterReturn {
  // State from store
  currentLevel: number; // 0-100
  currentNoiseLevel: 'green' | 'yellow' | 'red';
  isMonitoring: boolean;
  isCalibrated: boolean;
  thresholds: {
    green: number;
    yellow: number;
    red: number;
  };
  history: Array<{ timestamp: number; level: number }>;

  // Permission state
  microphoneGranted: boolean;

  // Actions
  startMonitoring: () => Promise<boolean>;
  stopMonitoring: () => void;
  calibrate: () => void;
  setThresholds: (green: number, yellow: number, red: number) => void;
  addHistoryPoint: (level: number) => void;
  clearHistory: () => void;
}

const HISTORY_UPDATE_INTERVAL_MS = 1000; // Add to history every 1 second

export function useNoiseMeter(): UseNoiseMeterReturn {
  const {
    currentLevel,
    currentNoiseLevel,
    isMonitoring,
    isCalibrated,
    thresholdGreen,
    thresholdYellow,
    thresholdRed,
    history,
    setCurrentLevel,
    setIsMonitoring,
    setIsCalibrated,
    setThresholds,
    setMicrophonePermission,
    addHistoryPoint,
    clearHistory,
  } = useNoiseStore();

  const { status: permissionStatus, requestPermission } = useMicrophonePermission();

  const monitoringService = useRef<AudioMonitoringService | null>(null);
  const levelUnsubscribeRef = useRef<(() => void) | null>(null);
  const historyIntervalRef = useRef<number | null>(null);

  // Initialize service
  useEffect(() => {
    monitoringService.current = AudioMonitoringService.getInstance();
    return () => {
      // Cleanup on unmount
      if (levelUnsubscribeRef.current) {
        levelUnsubscribeRef.current();
      }
      if (historyIntervalRef.current) {
        clearInterval(historyIntervalRef.current);
      }
    };
  }, []);

  // Update permission status in store
  useEffect(() => {
    setMicrophonePermission(permissionStatus);
  }, [permissionStatus, setMicrophonePermission]);

  // Start monitoring
  const startMonitoring = useCallback(async (): Promise<boolean> => {
    if (!monitoringService.current) {
      debug.error('AudioMonitoringService not initialized');
      return false;
    }

    // Check permission
    if (permissionStatus !== 'granted') {
      const result = await requestPermission();
      if (result !== 'granted') {
        debug.error('Microphone permission not granted');
        setMicrophonePermission('denied');
        return false;
      }
      setMicrophonePermission('granted');
    }

    try {
      // Request microphone access
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start monitoring
      const started = monitoringService.current.startMonitoring(mediaStream);
      if (!started) {
        debug.error('Failed to start monitoring');
        return false;
      }

      // Subscribe to level updates
      levelUnsubscribeRef.current = monitoringService.current.onLevelChange((level) => {
        setCurrentLevel(level);
      });

      // Start history interval
      historyIntervalRef.current = window.setInterval(() => {
        addHistoryPoint(monitoringService.current!.getCurrentLevel());
      }, HISTORY_UPDATE_INTERVAL_MS);

      setIsMonitoring(true);
      return true;
    } catch (error) {
      debug.error('Error starting monitoring:', error);
      setIsMonitoring(false);
      return false;
    }
  }, [permissionStatus, requestPermission, setCurrentLevel, setIsMonitoring, setMicrophonePermission, addHistoryPoint]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (!monitoringService.current) {
      return;
    }

    // Unsubscribe from level updates
    if (levelUnsubscribeRef.current) {
      levelUnsubscribeRef.current();
      levelUnsubscribeRef.current = null;
    }

    // Stop history interval
    if (historyIntervalRef.current) {
      clearInterval(historyIntervalRef.current);
      historyIntervalRef.current = null;
    }

    // Stop monitoring
    monitoringService.current.stopMonitoring();
    setIsMonitoring(false);
  }, [setIsMonitoring]);

  // Calibrate
  const calibrate = useCallback(() => {
    if (!monitoringService.current || !isMonitoring) {
      debug.warn('Cannot calibrate - not monitoring');
      return;
    }

    monitoringService.current.calibrate();
    setIsCalibrated(true);
  }, [isMonitoring, setIsCalibrated]);

  // Auto-cleanup on unmount - always cleanup regardless of state
  useEffect(() => {
    return () => {
      // Always cleanup on unmount, regardless of monitoring state
      if (levelUnsubscribeRef.current) {
        levelUnsubscribeRef.current();
      }
      if (historyIntervalRef.current) {
        clearInterval(historyIntervalRef.current);
      }
      if (monitoringService.current?.isMonitoringActive()) {
        monitoringService.current.stopMonitoring();
      }
    };
  }, []); // Empty deps - cleanup only on unmount

  return {
    currentLevel,
    currentNoiseLevel,
    isMonitoring,
    isCalibrated,
    thresholds: {
      green: thresholdGreen,
      yellow: thresholdYellow,
      red: thresholdRed,
    },
    history,
    microphoneGranted: permissionStatus === 'granted',
    startMonitoring,
    stopMonitoring,
    calibrate,
    setThresholds,
    addHistoryPoint,
    clearHistory,
  };
}

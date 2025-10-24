/**
 * useTimer Hook
 * Hook personalizzato per gestire il timer con setInterval e cleanup automatico
 * Previene memory leak (EC-004) con cleanup su unmount
 */

import { useEffect, useCallback, useRef } from 'react';
import { useTimerStore } from '../stores/timerStore';

// Debug logging (disabile in production)
const DEBUG_TIMER = import.meta.env.DEV;
const debugLog = (msg: string) => {
  if (DEBUG_TIMER) console.log(`[Timer] ${msg}`);
};

/**
 * Callbacks opzionali per eventi timer
 */
export interface TimerCallbacks {
  /** Chiamato quando il timer viene completato (00:00) */
  onComplete?: () => void;

  /** Chiamato quando un warning threshold viene raggiunto */
  onWarning?: (remainingSeconds: number) => void;

  /** Chiamato ogni tick (ogni secondo) */
  onTick?: (remainingSeconds: number) => void;
}

/**
 * Hook per gestire il timer con interval management automatico
 */
export function useTimer(callbacks?: TimerCallbacks) {
  const {
    remainingSeconds,
    totalSeconds,
    status,
    warningThresholds,
    warningsTriggered,
    config,
    setDuration,
    start,
    pause,
    resume,
    stop,
    reset,
    tick,
    updateConfig,
  } = useTimerStore();

  // Ref per callbacks (evita re-creazione interval ad ogni callback change)
  const callbacksRef = useRef<TimerCallbacks | undefined>(callbacks);
  callbacksRef.current = callbacks;

  // Ref per tracciare completion già emesso
  const completionEmittedRef = useRef(false);

  // Ref per tracciare warnings emessi (per evitare duplicati callback)
  const emittedWarningsRef = useRef<Set<number>>(new Set());

  /**
   * Effect per gestire il setInterval quando timer è running
   * CRITICO: cleanup function per prevenire memory leak (EC-004)
   */
  useEffect(() => {
    if (status !== 'running') {
      return;
    }

    debugLog('Timer interval started');

    const intervalId = setInterval(() => {
      tick();
    }, 1000);

    // CLEANUP CRITICO: evita memory leak
    return () => {
      debugLog('Timer interval cleared');
      clearInterval(intervalId);
    };
  }, [status, tick]);

  /**
   * Effect per gestire callbacks di warning
   * Monitora warningsTriggered dal store (dove viene aggiornato in tick())
   */
  useEffect(() => {
    // Detecta nuovi warning triggerati (elementi in warningsTriggered che non erano emessi prima)
    for (const threshold of warningsTriggered) {
      if (!emittedWarningsRef.current.has(threshold)) {
        emittedWarningsRef.current.add(threshold);
        debugLog(`⚠️ Warning triggered at ${threshold}s`);
        callbacksRef.current?.onWarning?.(remainingSeconds);
      }
    }
  }, [warningsTriggered, remainingSeconds]);

  /**
   * Effect per gestire callback di completion
   */
  useEffect(() => {
    if (status === 'completed' && !completionEmittedRef.current) {
      completionEmittedRef.current = true;
      debugLog('✅ Timer completion triggered');

      // Trigger callback se presente
      callbacksRef.current?.onComplete?.();
    }

    // Reset flags quando timer torna idle
    if (status === 'idle') {
      completionEmittedRef.current = false;
      emittedWarningsRef.current.clear();
    }
  }, [status]);

  /**
   * Effect per gestire callback di tick
   */
  useEffect(() => {
    if (status === 'running') {
      callbacksRef.current?.onTick?.(remainingSeconds);
    }
  }, [remainingSeconds, status]);

  /**
   * Helper: Imposta durata e avvia immediatamente
   * Nota: Zustand è sincrono, quindi setDuration aggiorna immediatamente lo stato
   */
  const setAndStart = useCallback(
    (seconds: number) => {
      setDuration(seconds);
      start();
    },
    [setDuration, start]
  );

  /**
   * Helper: Formatta secondi in MM:SS
   */
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  /**
   * Helper: Calcola percentuale completamento
   */
  const getProgress = useCallback((): number => {
    if (totalSeconds === 0) return 0;
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  }, [remainingSeconds, totalSeconds]);

  /**
   * Helper: Check se siamo in warning zone
   */
  const isInWarningZone = useCallback((): boolean => {
    return warningThresholds.some((threshold) => remainingSeconds <= threshold);
  }, [remainingSeconds, warningThresholds]);

  return {
    // State
    remainingSeconds,
    totalSeconds,
    status,
    config,
    warningThresholds,

    // Actions
    setDuration,
    start,
    pause,
    resume,
    stop,
    reset,
    updateConfig,
    setAndStart,

    // Helpers
    formatTime,
    getProgress,
    isInWarningZone,

    // Computed
    isIdle: status === 'idle',
    isRunning: status === 'running',
    isPaused: status === 'paused',
    isCompleted: status === 'completed',
    formattedTime: formatTime(remainingSeconds),
    progress: getProgress(),
  };
}

import { debug } from '../utils/debug';
/**
 * FASE 6: useSemaphore Hook
 *
 * Custom hook per gestione semaforo (traffic light)
 * - Manual mode: controllo diretto colori
 * - Auto mode: colore basato su livello rumore
 * - Keyboard shortcuts: 1, 2, 3 per Red/Yellow/Green
 * - Integrazione con NoiseStore per auto mode
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useSemaphoreStore, SemaphoreColor } from '../stores/semaphoreStore';
import { useNoiseStore } from '../stores/noiseStore';

export interface UseSemaphoreReturn {
  currentColor: SemaphoreColor;
  mode: 'manual' | 'auto';
  isManual: boolean;
  isAuto: boolean;
  setColor: (color: SemaphoreColor) => void;
  toggleMode: () => void;
  setMode: (mode: 'manual' | 'auto') => void;
  autoThresholds: {
    redAbove: number;
    yellowAbove: number;
  };
  setAutoThresholds: (redAbove: number, yellowAbove: number) => void;
}

export function useSemaphore(): UseSemaphoreReturn {
  // Store state
  const currentColor = useSemaphoreStore((state) => state.currentColor);
  const mode = useSemaphoreStore((state) => state.mode);
  const autoThresholds = useSemaphoreStore((state) => state.autoModeThresholds);
  const setColorStore = useSemaphoreStore((state) => state.setColor);
  const setModeStore = useSemaphoreStore((state) => state.setMode);
  const setAutoThresholdsStore = useSemaphoreStore((state) => state.setAutoThresholds);
  const updateColorFromNoise = useSemaphoreStore((state) => state.updateColorFromNoise);

  // Noise level for auto mode
  const noiseLevel = useNoiseStore((state) => state.currentLevel);

  // Derived state
  const isManual = useMemo(() => mode === 'manual', [mode]);
  const isAuto = useMemo(() => mode === 'auto', [mode]);

  // Actions
  const setColor = useCallback((color: SemaphoreColor) => {
    if (isManual) {
      setColorStore(color);
    }
  }, [isManual, setColorStore]);

  const toggleMode = useCallback(() => {
    setModeStore(isManual ? 'auto' : 'manual');
  }, [isManual, setModeStore]);

  const setMode = useCallback((newMode: 'manual' | 'auto') => {
    setModeStore(newMode);
  }, [setModeStore]);

  const setAutoThresholds = useCallback((redAbove: number, yellowAbove: number) => {
    if (redAbove > yellowAbove) {
      setAutoThresholdsStore(redAbove, yellowAbove);
    } else {
      debug.warn('useSemaphore: redAbove deve essere > yellowAbove');
    }
  }, [setAutoThresholdsStore]);

  // Auto mode: aggiorna colore in base a noise level
  useEffect(() => {
    if (isAuto && noiseLevel !== null) {
      updateColorFromNoise(noiseLevel);
    }
  }, [isAuto, noiseLevel, updateColorFromNoise]);

  // Keyboard shortcuts (solo manual mode)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignora se input/textarea è focused (EC-011: hotkey conflicts)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Shortcuts solo in manual mode
      if (isManual) {
        if (e.key === '1') {
          e.preventDefault();
          setColorStore('red');
        } else if (e.key === '2') {
          e.preventDefault();
          setColorStore('yellow');
        } else if (e.key === '3') {
          e.preventDefault();
          setColorStore('green');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isManual, setColorStore]);

  return {
    currentColor,
    mode,
    isManual,
    isAuto,
    setColor,
    toggleMode,
    setMode,
    autoThresholds,
    setAutoThresholds,
  };
}

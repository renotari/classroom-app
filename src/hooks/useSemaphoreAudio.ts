/**
 * FASE 6: useSemaphoreAudio Hook
 *
 * Hook per gestire sound alerts quando cambia stato semaforo
 * - Usa AudioService singleton (FASE 4)
 * - Opzionale: può essere disabilitato
 * - Suona solo se colorePrecedente !== coloreCorrente
 */

import { useEffect, useRef } from 'react';
import { SemaphoreColor } from '../stores/semaphoreStore';
import { AudioService } from '../services/audioService';

export interface UseSemaphoreAudioOptions {
  enabled: boolean;
  currentColor: SemaphoreColor;
}

export function useSemaphoreAudio({ enabled, currentColor }: UseSemaphoreAudioOptions): void {
  const previousColorRef = useRef<SemaphoreColor | null>(null);
  const audioService = AudioService.getInstance();

  useEffect(() => {
    // Skip se disabled o primo render
    if (!enabled || previousColorRef.current === null) {
      previousColorRef.current = currentColor;
      return;
    }

    // Suona solo se colore cambiato
    if (previousColorRef.current !== currentColor) {
      // Usa fallback beep tone se file non disponibile
      // AudioService già gestisce fallback in playAlert()
      audioService.playAlert('semaphore-change').catch((err: unknown) => {
        console.warn('useSemaphoreAudio: Failed to play sound alert', err);
      });

      previousColorRef.current = currentColor;
    }
  }, [enabled, currentColor, audioService]);
}

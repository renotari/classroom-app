/**
 * useMicrophonePermission Hook
 * Gestisce richiesta e stato dei permessi microfono
 * Implementa EC-000 (first-time permission flow) e EC-001 (denied handling)
 */

import { useState, useEffect } from 'react';

export type PermissionStatus = 'pending' | 'granted' | 'denied' | 'error';

interface UseMicrophonePermissionReturn {
  status: PermissionStatus;
  isGranted: boolean;
  isDenied: boolean;
  isPending: boolean;
  isError: boolean;
  errorMessage: string | null;
  requestPermission: () => Promise<PermissionStatus>;
}

const MICROPHONE_PERMISSION_KEY = 'microphone-permission-granted';
const MICROPHONE_ONBOARDED_KEY = 'microphone-onboarded';

export function useMicrophonePermission(): UseMicrophonePermissionReturn {
  const [status, setStatus] = useState<PermissionStatus>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if navigator.mediaDevices is available
  const isMediaDevicesAvailable = () => {
    return (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  };

  // Check stored permission on mount
  useEffect(() => {
    const checkStoredPermission = async () => {
      if (!isMediaDevicesAvailable()) {
        setStatus('error');
        setErrorMessage('Browser non supporta accesso al microfono (MediaDevices API non disponibile)');
        return;
      }

      // Check if we already have cached permission
      const cachedPermission = localStorage.getItem(MICROPHONE_PERMISSION_KEY);
      if (cachedPermission === 'true') {
        setStatus('granted');
      } else if (cachedPermission === 'false') {
        setStatus('denied');
        setErrorMessage('Accesso al microfono negato. Abilita il microfono nelle impostazioni del browser.');
      }
    };

    checkStoredPermission();
  }, []);

  const requestPermission = async (): Promise<PermissionStatus> => {
    if (!isMediaDevicesAvailable()) {
      setStatus('error');
      const msg = 'Browser non supporta accesso al microfono';
      setErrorMessage(msg);
      return 'error';
    }

    try {
      setStatus('pending');
      setErrorMessage(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // If we got here, permission was granted
      // Clean up: stop all tracks
      stream.getTracks().forEach((track) => {
        track.stop();
      });

      // Save permission state
      localStorage.setItem(MICROPHONE_PERMISSION_KEY, 'true');
      localStorage.setItem(MICROPHONE_ONBOARDED_KEY, 'true');

      setStatus('granted');
      setErrorMessage(null);

      return 'granted';
    } catch (error) {
      let msg = 'Errore nell\'accesso al microfono';

      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          msg = 'Accesso al microfono negato. Abilita il microfono nelle impostazioni del browser.';
          localStorage.setItem(MICROPHONE_PERMISSION_KEY, 'false');
          setStatus('denied');
        } else if (error.name === 'NotFoundError') {
          msg = 'Nessun microfono disponibile sul dispositivo';
          localStorage.setItem(MICROPHONE_PERMISSION_KEY, 'false');
          setStatus('error');
        } else if (error.name === 'SecurityError') {
          msg = 'Accesso al microfono bloccato per motivi di sicurezza (HTTPS richiesto)';
          setStatus('error');
        } else {
          msg = `Errore: ${error.message}`;
          setStatus('error');
        }
      }

      setErrorMessage(msg);
      return status === 'granted' ? 'granted' : 'denied';
    }
  };

  return {
    status,
    isGranted: status === 'granted',
    isDenied: status === 'denied',
    isPending: status === 'pending',
    isError: status === 'error',
    errorMessage,
    requestPermission,
  };
}

/**
 * Helper function: check if user has been shown onboarding
 */
export function hasShownMicrophoneOnboarding(): boolean {
  return localStorage.getItem(MICROPHONE_ONBOARDED_KEY) === 'true';
}

/**
 * Helper function: reset microphone onboarding state
 */
export function resetMicrophoneOnboarding(): void {
  localStorage.removeItem(MICROPHONE_ONBOARDED_KEY);
}

/**
 * Helper function: get stored permission status
 */
export function getStoredMicrophonePermission(): PermissionStatus {
  const stored = localStorage.getItem(MICROPHONE_PERMISSION_KEY);
  if (stored === 'true') return 'granted';
  if (stored === 'false') return 'denied';
  return 'pending';
}

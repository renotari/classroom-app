/**
 * MicrophonePermissionFlow Component
 * Modal per onboarding microphone permissions al primo avvio
 * Implementa EC-000 (first-time permission flow)
 */

import { useEffect } from 'react';
import { useMicrophonePermission, hasShownMicrophoneOnboarding } from '../../hooks/useMicrophonePermission';

interface MicrophonePermissionFlowProps {
  onComplete?: (granted: boolean) => void;
  isOpen?: boolean;
}

export function MicrophonePermissionFlow({ onComplete, isOpen = true }: MicrophonePermissionFlowProps) {
  const { status, isGranted, isDenied, isError, errorMessage, requestPermission } =
    useMicrophonePermission();

  // Auto-close if already has permission or onboarding done
  useEffect(() => {
    if (isGranted && hasShownMicrophoneOnboarding()) {
      onComplete?.(true);
    }
  }, [isGranted, onComplete]);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    onComplete?.(result === 'granted');
  };

  const handleSkip = () => {
    onComplete?.(false);
  };

  // Don't render if already has permission or in test mode
  if (isGranted || !isOpen || hasShownMicrophoneOnboarding()) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 border border-[var(--border-color)]">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="text-5xl">🎤</div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-4">
          Abilita il Microfono
        </h2>

        {/* Description */}
        <p className="text-[var(--text-secondary)] text-center mb-6">
          Il monitoraggio del rumore della classe aiuta a rilevare il livello di attenzione degli
          studenti. Per attivare questa funzione, autorizza l'accesso al microfono.
        </p>

        {/* Error message if denied or error */}
        {(isDenied || isError) && errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="text-sm">{errorMessage}</p>
            {isDenied && (
              <p className="text-xs mt-2">
                Puoi abilitare il microfono in qualsiasi momento nelle impostazioni del browser.
              </p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {/* Primary button */}
          <button
            onClick={handleRequestPermission}
            disabled={status === 'pending'}
            className="flex-1 bg-[var(--accent-color)] hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-all duration-200"
          >
            {status === 'pending' ? 'Richiesta in corso...' : 'Consenti Microfono'}
          </button>

          {/* Secondary button */}
          <button
            onClick={handleSkip}
            disabled={status === 'pending'}
            className="flex-1 bg-[var(--bg-tertiary)] hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-primary)] font-semibold py-2 px-4 rounded transition-all duration-200 border border-[var(--border-color)]"
          >
            Salta
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-[var(--text-secondary)] text-center mt-6">
          Puoi modificare questa scelta in qualsiasi momento nelle impostazioni dell'app.
        </p>
      </div>
    </div>
  );
}

/**
 * PermissionDeniedFallback Component
 * Placeholder visualizzato quando accesso microfono è negato
 * Implementa EC-001 (graceful degradation)
 */

interface PermissionDeniedFallbackProps {
  featureName?: string;
  onRetryClick?: () => void;
}

export function PermissionDeniedFallback({
  featureName = 'Monitoraggio Rumore',
  onRetryClick,
}: PermissionDeniedFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      {/* Icon */}
      <div className="text-6xl opacity-50">🔇</div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">
        {featureName} Non Disponibile
      </h2>

      {/* Description */}
      <p className="text-[var(--text-secondary)] text-center max-w-md">
        L'accesso al microfono è stato negato. Per utilizzare questa funzione, devi autorizzare il
        microfono.
      </p>

      {/* Steps */}
      <div className="mt-6 bg-[var(--bg-tertiary)] rounded-lg p-4 max-w-md w-full border border-[var(--border-color)]">
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          Come abilitare il microfono:
        </p>
        <ol className="text-sm text-[var(--text-secondary)] space-y-2">
          <li className="flex gap-2">
            <span className="font-semibold">1.</span>
            <span>Clicca l'icona lucchetto nella barra degli indirizzi</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">2.</span>
            <span>Trova "Microfono" e seleziona "Consenti"</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">3.</span>
            <span>Ricarica l'applicazione</span>
          </li>
        </ol>
      </div>

      {/* Retry button */}
      {onRetryClick && (
        <button
          onClick={onRetryClick}
          className="mt-6 bg-[var(--accent-color)] hover:bg-opacity-80 text-white font-semibold py-2 px-6 rounded transition-all duration-200"
        >
          Riprova
        </button>
      )}
    </div>
  );
}

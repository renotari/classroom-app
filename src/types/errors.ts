/**
 * Error Type Definitions and Error Codes
 *
 * Centralizes error handling with typed error codes
 * Prevents generic Error throws and enables consistent error reporting
 *
 * References: CLAUDE.md § Principi di Sviluppo - Codice
 * Pattern: TypeScript strict + error codes instead of magic strings
 */

/**
 * Standardized Error Codes
 * Format: [DOMAIN]_[NUMBER]
 * Domains: AUDIO, NOISE, TIMER, CSV, WINDOW, GENERAL
 */
export const ERROR_CODES = {
  // Audio/Music System (AUDIO_XXX)
  AUDIO_CONTEXT_INIT_FAILED: 'AUDIO_001',
  AUDIO_FILE_DECODE_FAILED: 'AUDIO_002',
  AUDIO_FILE_NOT_FOUND: 'AUDIO_003',
  AUDIO_VOLUME_OUT_OF_RANGE: 'AUDIO_004',
  AUDIO_PLAYBACK_FAILED: 'AUDIO_005',

  // Noise Monitoring (NOISE_XXX)
  NOISE_PERMISSION_DENIED: 'NOISE_001',
  NOISE_DEVICE_UNAVAILABLE: 'NOISE_002',
  NOISE_STREAM_INVALID: 'NOISE_003',
  NOISE_ANALYSER_FAILED: 'NOISE_004',
  NOISE_CALIBRATION_FAILED: 'NOISE_005',

  // Timer (TIMER_XXX)
  TIMER_INVALID_DURATION: 'TIMER_001',
  TIMER_STATE_INVALID: 'TIMER_002',
  TIMER_INTERVAL_FAILED: 'TIMER_003',

  // CSV Import (CSV_XXX)
  CSV_FILE_NOT_FOUND: 'CSV_001',
  CSV_ENCODING_DETECTION_FAILED: 'CSV_002',
  CSV_PARSE_FAILED: 'CSV_003',
  CSV_INVALID_FORMAT: 'CSV_004',
  CSV_MAX_STUDENTS_EXCEEDED: 'CSV_005',

  // Window Management (WINDOW_XXX)
  WINDOW_POSITION_INVALID: 'WINDOW_001',
  WINDOW_CREATION_FAILED: 'WINDOW_002',
  WINDOW_OUT_OF_BOUNDS: 'WINDOW_003',

  // General (GENERAL_XXX)
  GENERAL_UNKNOWN: 'GENERAL_001',
  GENERAL_NOT_IMPLEMENTED: 'GENERAL_002',
  GENERAL_INVALID_ARGUMENT: 'GENERAL_003',
} as const;

/**
 * Error code type
 */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Custom AppError class for typed errors
 * Provides context, error code, and optional details
 */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly context?: Record<string, unknown>,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  /**
   * Convert to loggable object
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
      originalError: this.originalError instanceof Error
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : this.originalError,
    };
  }

  /**
   * User-friendly error message (localized)
   * In production, these come from i18n
   */
  getUserMessage(): string {
    const messages: Record<ErrorCode, string> = {
      // Audio errors
      AUDIO_001: 'Errore nell\'inizializzazione audio',
      AUDIO_002: 'Impossibile decodificare il file audio',
      AUDIO_003: 'File audio non trovato',
      AUDIO_004: 'Volume non valido',
      AUDIO_005: 'Errore nella riproduzione audio',

      // Noise errors
      NOISE_001: 'Permesso microfono negato',
      NOISE_002: 'Nessun microfono disponibile',
      NOISE_003: 'Stream audio non valido',
      NOISE_004: 'Errore nell\'analizzatore audio',
      NOISE_005: 'Errore nella calibrazione',

      // Timer errors
      TIMER_001: 'Durata timer non valida',
      TIMER_002: 'Stato timer non valido',
      TIMER_003: 'Errore nell\'esecuzione del timer',

      // CSV errors
      CSV_001: 'File CSV non trovato',
      CSV_002: 'Errore nel rilevamento della codifica',
      CSV_003: 'Errore nel parsing del CSV',
      CSV_004: 'Formato CSV non valido',
      CSV_005: 'Troppi studenti (massimo 30)',

      // Window errors
      WINDOW_001: 'Posizione finestra non valida',
      WINDOW_002: 'Errore nella creazione della finestra',
      WINDOW_003: 'Finestra fuori dallo schermo',

      // General errors
      GENERAL_001: 'Errore sconosciuto',
      GENERAL_002: 'Funzionalità non ancora implementata',
      GENERAL_003: 'Argomento non valido',
    };

    return messages[this.code] || this.message;
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Safe error handler that ensures AppError
 * If error is already AppError, returns it
 * If error is another Error, wraps it
 * If error is unknown, creates generic AppError
 */
export function ensureAppError(
  error: unknown,
  fallbackCode: ErrorCode = ERROR_CODES.GENERAL_UNKNOWN
): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      fallbackCode,
      error.message,
      { originalErrorType: error.name },
      error
    );
  }

  return new AppError(
    fallbackCode,
    String(error),
    { unknownErrorType: typeof error },
    error
  );
}

/**
 * Logger for errors with code tracking
 * In production, integrate with error tracking service (Sentry, etc.)
 */
export class ErrorLogger {
  /**
   * Log an error with tracking
   */
  static log(error: AppError, context?: Record<string, unknown>) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...error.toJSON(),
      additionalContext: context,
    };

    // Console in dev
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR LOG]', logEntry);
    }

    // In production, send to error tracking service
    // Example: Sentry.captureException(error, { contexts: { app: logEntry } })

    return logEntry;
  }

  /**
   * Report error to monitoring service
   * Implement this with your error tracking tool (Sentry, etc.)
   */
  static async report(error: AppError, userContext?: Record<string, unknown>) {
    const report = {
      error: error.toJSON(),
      userContext,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };

    // TODO: Integrate with error tracking service
    // await fetch('/api/errors', { method: 'POST', body: JSON.stringify(report) });

    console.log('[ERROR REPORT]', report);
  }
}

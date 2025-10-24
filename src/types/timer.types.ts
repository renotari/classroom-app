/**
 * Timer Types
 * Definizioni TypeScript per il sistema Timer
 */

/**
 * Stato corrente del timer
 * - idle: Timer non attivo, pronto per essere avviato
 * - running: Timer in esecuzione, countdown attivo
 * - paused: Timer in pausa, può essere ripreso
 * - completed: Timer completato (raggiunto 00:00)
 */
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

/**
 * Valori preset per timer rapidi (in secondi)
 * - 300 = 5 minuti
 * - 600 = 10 minuti
 * - 900 = 15 minuti
 * - 1800 = 30 minuti
 */
export type TimerPresetValue = 300 | 600 | 900 | 1800;

/**
 * Stato completo del timer
 */
export interface TimerState {
  /** Secondi rimanenti nel countdown */
  remainingSeconds: number;

  /** Durata totale del timer (per calcolare percentuale) */
  totalSeconds: number;

  /** Stato corrente del timer */
  status: TimerStatus;

  /** Soglie di warning in secondi (es. [120, 300] per 2min e 5min) */
  warningThresholds: number[];

  /** Ultima durata usata (per ripristino) */
  lastUsedDuration?: number;

  /** Flags per tracciare quali warning sono già stati triggerati */
  warningsTriggered: Set<number>;
}

/**
 * Configurazione timer persistente
 */
export interface TimerConfig {
  /** Abilita warning a 2 minuti dalla fine */
  warningAt2Min: boolean;

  /** Abilita warning a 5 minuti dalla fine */
  warningAt5Min: boolean;

  /** Preset personalizzati opzionali (in secondi) */
  customPresets?: number[];

  /** Ultima durata usata (per quick-restart) */
  lastUsedDuration?: number;
}

/**
 * Props per componenti Timer
 */
export interface TimerDisplayProps {
  /** Secondi rimanenti da visualizzare */
  remainingSeconds: number;

  /** Durata totale (per progress bar opzionale) */
  totalSeconds: number;

  /** Status per styling condizionale */
  status: TimerStatus;

  /** Mostra warning visual */
  showWarning?: boolean;
}

export interface TimerControlsProps {
  /** Stato corrente del timer */
  status: TimerStatus;

  /** Callback per start */
  onStart: () => void;

  /** Callback per pause */
  onPause: () => void;

  /** Callback per resume (da paused) */
  onResume: () => void;

  /** Callback per stop (reset a totalSeconds) */
  onStop: () => void;

  /** Callback per reset completo */
  onReset: () => void;

  /** Disabilita tutti i controlli */
  disabled?: boolean;
}

export interface TimerPresetsProps {
  /** Callback quando un preset viene selezionato */
  onPresetSelect: (seconds: number) => void;

  /** Callback quando un custom duration viene impostato */
  onCustomDuration: (seconds: number) => void;

  /** Timer attualmente in esecuzione (disabilita preset) */
  isRunning: boolean;
}

/**
 * Window Mode Types
 * Definisce i tipi per la gestione delle modalità finestra
 */

export type WindowMode = 'normal' | 'overlay' | 'fullscreen';

export interface WindowModeState {
  mode: WindowMode;
  setMode: (mode: WindowMode) => Promise<void>;
}

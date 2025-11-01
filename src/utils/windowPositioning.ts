import { debug } from './debug';
/**
 * Window Positioning Utilities
 * Gestisce EC-002: Windows Outside Screen Bounds
 *
 * Assicura che le finestre siano sempre visibili anche dopo disconnect multi-monitor
 */

export interface WindowPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const STORAGE_KEY = 'classroom-window-positions';
const DEFAULT_POSITION = { x: 100, y: 100 };
const MIN_VISIBLE_PIXELS = 50; // Minimo numero di pixel visibili

/**
 * Valida e corregge la posizione di una finestra per assicurarsi che sia visibile
 */
export function validateWindowPosition(
  position: WindowPosition,
  windowBounds: WindowBounds
): WindowPosition {
  const screenWidth = window.screen.availWidth;
  const screenHeight = window.screen.availHeight;

  let { x, y } = position;
  const { width, height } = windowBounds;

  // Verifica se la finestra è completamente fuori schermo
  const isCompletelyOffScreen =
    x + width < 0 ||
    x > screenWidth ||
    y + height < 0 ||
    y > screenHeight;

  if (isCompletelyOffScreen) {
    // Reset a posizione sicura
    return DEFAULT_POSITION;
  }

  // Verifica che almeno MIN_VISIBLE_PIXELS siano visibili
  const visibleWidth = Math.min(x + width, screenWidth) - Math.max(x, 0);
  const visibleHeight = Math.min(y + height, screenHeight) - Math.max(y, 0);

  if (visibleWidth < MIN_VISIBLE_PIXELS || visibleHeight < MIN_VISIBLE_PIXELS) {
    return DEFAULT_POSITION;
  }

  // Aggiusta posizione se parzialmente fuori schermo
  if (x < 0) {
    x = 0;
  }
  if (y < 0) {
    y = 0;
  }
  if (x + width > screenWidth) {
    x = screenWidth - width;
  }
  if (y + height > screenHeight) {
    y = screenHeight - height;
  }

  return { x, y, width: position.width, height: position.height };
}

/**
 * Salva la posizione di una finestra su localStorage
 */
export function saveWindowPosition(
  windowId: string,
  position: WindowPosition
): void {
  try {
    const positions = getStoredPositions();
    positions[windowId] = position;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch (error) {
    debug.error('Failed to save window position:', error);
  }
}

/**
 * Recupera la posizione salvata di una finestra
 */
export function getWindowPosition(windowId: string): WindowPosition | null {
  try {
    const positions = getStoredPositions();
    return positions[windowId] ?? null;
  } catch (error) {
    debug.error('Failed to get window position:', error);
    return null;
  }
}

/**
 * Ripristina la posizione di una finestra validandola
 */
export function restoreWindowPosition(
  windowId: string,
  defaultBounds: WindowBounds
): WindowPosition {
  const saved = getWindowPosition(windowId);

  if (!saved) {
    return DEFAULT_POSITION;
  }

  // Valida la posizione salvata
  return validateWindowPosition(saved, defaultBounds);
}

/**
 * Rimuove la posizione salvata di una finestra
 */
export function clearWindowPosition(windowId: string): void {
  try {
    const positions = getStoredPositions();
    delete positions[windowId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch (error) {
    debug.error('Failed to clear window position:', error);
  }
}

/**
 * Rimuove tutte le posizioni salvate
 */
export function clearAllWindowPositions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    debug.error('Failed to clear all window positions:', error);
  }
}

/**
 * Recupera tutte le posizioni salvate
 */
function getStoredPositions(): Record<string, WindowPosition> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    debug.error('Failed to parse stored positions:', error);
    return {};
  }
}

/**
 * Hook per auto-save window position (da usare nei floating windows)
 */
export function useAutoSaveWindowPosition(
  windowId: string,
  position: WindowPosition
): void {
  // Salva automaticamente quando la posizione cambia
  // Questo hook verrà usato nelle fasi successive quando creeremo floating windows
  saveWindowPosition(windowId, position);
}

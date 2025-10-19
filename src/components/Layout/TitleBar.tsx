/**
 * TitleBar Component
 * Custom title bar con drag region e window controls
 */

import { getCurrentWindow } from '@tauri-apps/api/window';
import { useWindowMode } from '../../hooks/useWindowMode';

export function TitleBar() {
  const { mode, toggleMode } = useWindowMode();
  const window = getCurrentWindow();

  const handleMinimize = async () => {
    try {
      await window.minimize();
    } catch (error) {
      console.error('Failed to minimize:', error);
    }
  };

  const handleMaximize = async () => {
    try {
      const isMaximized = await window.isMaximized();
      if (isMaximized) {
        await window.unmaximize();
      } else {
        await window.maximize();
      }
    } catch (error) {
      console.error('Failed to maximize/unmaximize:', error);
    }
  };

  const handleClose = async () => {
    try {
      await window.close();
    } catch (error) {
      console.error('Failed to close:', error);
    }
  };

  // Mostra title bar solo in normal mode
  // In overlay e fullscreen usiamo il layout semplificato
  if (mode !== 'normal') {
    return null;
  }

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-8 bg-[var(--bg-surface)] border-b border-[var(--bg-elevated)] px-4 select-none"
    >
      {/* App Title */}
      <div
        data-tauri-drag-region
        className="flex-1 text-sm font-medium text-[var(--text-primary)]"
      >
        Classroom Management Tool
      </div>

      {/* Window Mode Toggle */}
      <button
        onClick={toggleMode}
        className="px-3 py-1 text-xs rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors mr-2"
        title="Toggle window mode (Normal → Overlay → Fullscreen)"
      >
        {mode === 'normal' ? '🖼️ Normal' : mode === 'overlay' ? '📌 Overlay' : '⛶ Fullscreen'}
      </button>

      {/* Window Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleMinimize}
          className="w-8 h-8 flex items-center justify-center hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded"
          aria-label="Minimize"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
          >
            <rect x="0" y="5" width="12" height="2" fill="currentColor" />
          </svg>
        </button>

        <button
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded"
          aria-label="Maximize"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
          >
            <rect
              x="1"
              y="1"
              width="10"
              height="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </button>

        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-red-500 text-[var(--text-secondary)] hover:text-white transition-colors rounded"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
          >
            <path
              d="M1 1 L11 11 M11 1 L1 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

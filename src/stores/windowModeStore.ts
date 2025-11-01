import { debug } from '../utils/debug';
/**
 * Window Mode Store (Zustand)
 * Gestisce la modalità della finestra (normal/overlay/fullscreen)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WindowMode } from '../types/window.types';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';

interface WindowModeStore {
  mode: WindowMode;
  setMode: (mode: WindowMode) => Promise<void>;
}

export const useWindowModeStore = create<WindowModeStore>()(
  persist(
    (set) => ({
      mode: 'normal',

      setMode: async (mode: WindowMode) => {
        const window = getCurrentWindow();

        try {
          debug.log(`Switching to ${mode} mode...`);

          switch (mode) {
            case 'normal':
              debug.log('Setting normal mode...');
              await window.setFullscreen(false);
              await window.setDecorations(true);
              await window.setAlwaysOnTop(false);

              // Resize dopo aver ripristinato decorations
              setTimeout(async () => {
                try {
                  await window.setSize(new LogicalSize(1200, 800));
                  debug.log('Window resized to 1200x800');
                } catch (e) {
                  debug.error('Failed to resize:', e);
                }
              }, 100);
              break;

            case 'overlay':
              debug.log('Setting overlay mode...');
              await window.setFullscreen(false);

              // Prima ridimensiona, poi rimuovi decorations
              try {
                await window.setSize(new LogicalSize(400, 600));
                debug.log('Window resized to 400x600');
              } catch (e) {
                debug.error('Failed to resize to overlay size:', e);
              }

              await window.setDecorations(false);
              await window.setAlwaysOnTop(true);
              break;

            case 'fullscreen':
              debug.log('Setting fullscreen mode...');
              await window.setDecorations(false);
              await window.setAlwaysOnTop(false);
              await window.setFullscreen(true);
              break;
          }

          set({ mode });
          debug.log(`Window mode set to: ${mode}`);
        } catch (error) {
          debug.error('Failed to set window mode:', error);
        }
      },
    }),
    {
      name: 'classroom-window-mode-storage',
      version: 1,
    }
  )
);

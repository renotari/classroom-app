/**
 * useWindowMode Hook
 * Hook per gestire facilmente la modalità finestra
 */

import { useWindowModeStore } from '../stores/windowModeStore';

export function useWindowMode() {
  const { mode, setMode } = useWindowModeStore();

  const setNormal = async () => {
    await setMode('normal');
  };

  const setOverlay = async () => {
    await setMode('overlay');
  };

  const setFullscreen = async () => {
    await setMode('fullscreen');
  };

  const toggleMode = async () => {
    switch (mode) {
      case 'normal':
        await setOverlay();
        break;
      case 'overlay':
        await setFullscreen();
        break;
      case 'fullscreen':
        await setNormal();
        break;
    }
  };

  return {
    mode,
    setMode,
    setNormal,
    setOverlay,
    setFullscreen,
    toggleMode,
    isNormal: mode === 'normal',
    isOverlay: mode === 'overlay',
    isFullscreen: mode === 'fullscreen',
  };
}

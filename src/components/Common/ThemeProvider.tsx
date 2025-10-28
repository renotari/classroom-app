/**
 * ThemeProvider Component
 * Wrapper che inizializza il tema all'avvio dell'app
 */

import { useEffect } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { getTheme } from '../../styles/themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const currentTheme = useThemeStore((state) => state.currentTheme);

  // Applica tema all'avvio e quando cambia
  useEffect(() => {
    try {
      const theme = getTheme(currentTheme);
      if (theme && theme.colors) {
        applyThemeToDOM(theme.colors);
      }
    } catch (error) {
      console.error('Error applying theme:', error);
      // Fallback to default theme colors if error occurs
      const defaultTheme = getTheme('blueSerenity');
      if (defaultTheme && defaultTheme.colors) {
        applyThemeToDOM(defaultTheme.colors);
      }
    }
  }, [currentTheme]);

  return <>{children}</>;
}

/**
 * Applica i colori del tema come CSS variables al DOM
 */
function applyThemeToDOM(colors: {
  bgPrimary: string;
  bgSurface: string;
  bgElevated: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;
  colorInfo: string;
}): void {
  const root = document.documentElement;

  // Background colors
  root.style.setProperty('--bg-primary', colors.bgPrimary);
  root.style.setProperty('--bg-surface', colors.bgSurface);
  root.style.setProperty('--bg-elevated', colors.bgElevated);

  // Text colors
  root.style.setProperty('--text-primary', colors.textPrimary);
  root.style.setProperty('--text-secondary', colors.textSecondary);
  root.style.setProperty('--text-disabled', colors.textDisabled);

  // Action colors
  root.style.setProperty('--color-primary', colors.colorPrimary);
  root.style.setProperty('--color-secondary', colors.colorSecondary);
  root.style.setProperty('--color-accent', colors.colorAccent);

  // Status colors
  root.style.setProperty('--color-success', colors.colorSuccess);
  root.style.setProperty('--color-warning', colors.colorWarning);
  root.style.setProperty('--color-error', colors.colorError);
  root.style.setProperty('--color-info', colors.colorInfo);
}

import { debug } from '../utils/debug';
/**
 * Theme Store (Zustand)
 * Gestisce il tema attivo e la persistenza su localStorage
 */

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeId, Theme } from "../types/theme.types";
import { getTheme, defaultTheme } from "../styles/themes";

interface ThemeStore {
  currentTheme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  getTheme: () => Theme;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: defaultTheme,

      setTheme: (themeId: ThemeId) => {
        set({ currentTheme: themeId });
        // Applica immediatamente le CSS variables
        try {
          const theme = getTheme(themeId);
          if (theme && theme.colors) {
            applyThemeVariables(theme);
          }
        } catch (error) {
          debug.error(`Error setting theme ${themeId}:`, error);
        }
      },

      getTheme: () => {
        try {
          const theme = getTheme(get().currentTheme);
          return theme || getTheme(defaultTheme);
        } catch (error) {
          debug.error("Error getting theme:", error);
          return getTheme(defaultTheme);
        }
      },
    }),
    {
      name: "classroom-theme-storage", // Nome chiave localStorage
      version: 1,
    }
  )
);

/**
 * Applica le CSS variables del tema al documento
 */
function applyThemeVariables(theme: Theme): void {
  const root = document.documentElement;
  const { colors } = theme;

  root.style.setProperty("--bg-primary", colors.bgPrimary);
  root.style.setProperty("--bg-surface", colors.bgSurface);
  root.style.setProperty("--bg-elevated", colors.bgElevated);

  root.style.setProperty("--text-primary", colors.textPrimary);
  root.style.setProperty("--text-secondary", colors.textSecondary);
  root.style.setProperty("--text-disabled", colors.textDisabled);

  root.style.setProperty("--color-primary", colors.colorPrimary);
  root.style.setProperty("--color-secondary", colors.colorSecondary);
  root.style.setProperty("--color-accent", colors.colorAccent);

  root.style.setProperty("--color-success", colors.colorSuccess);
  root.style.setProperty("--color-warning", colors.colorWarning);
  root.style.setProperty("--color-error", colors.colorError);
  root.style.setProperty("--color-info", colors.colorInfo);
}

/**
 * Hook per inizializzare il tema all'avvio dell'app
 */
export function useInitializeTheme(): void {
  const theme = useThemeStore((state) => state.getTheme());

  // Applica tema al mount
  useEffect(() => {
    applyThemeVariables(theme);
  }, [theme]);
}

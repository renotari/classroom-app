/**
 * Theme System Types
 * Definisce i tipi per il sistema di temi dell'applicazione
 */

export interface ThemeColors {
  // Background colors
  bgPrimary: string;      // Main background
  bgSurface: string;      // Cards, panels
  bgElevated: string;     // Elevated elements

  // Text colors
  textPrimary: string;    // Main text
  textSecondary: string;  // Secondary text
  textDisabled: string;   // Disabled text

  // Action colors
  colorPrimary: string;   // Primary actions
  colorSecondary: string; // Secondary actions
  colorAccent: string;    // Accents

  // Status colors
  colorSuccess: string;   // Green zone
  colorWarning: string;   // Yellow zone
  colorError: string;     // Red zone
  colorInfo: string;      // Info
}

export interface Theme {
  id: string;
  name: string;
  category: 'calm' | 'energy';
  colors: ThemeColors;
}

export type ThemeId =
  | 'blueSerenity'
  | 'forestMist'
  | 'twilight'
  | 'vibrantStudio'
  | 'electricBlue'
  | 'sunsetEnergy';

export interface ThemeStore {
  currentTheme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  getTheme: () => Theme;
}

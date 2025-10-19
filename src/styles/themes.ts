/**
 * Theme Definitions
 * 6 temi estratti da docs/ui_ux_spec.md
 */

import type { Theme, ThemeId } from '../types/theme.types';

export const themes: Record<ThemeId, Theme> = {
  // CALM THEMES

  blueSerenity: {
    id: 'blueSerenity',
    name: 'Blue Serenity',
    category: 'calm',
    colors: {
      bgPrimary: '#1a1f2e',
      bgSurface: '#242b3d',
      bgElevated: '#2d3548',
      textPrimary: '#e4e6eb',
      textSecondary: '#b8bcc8',
      textDisabled: '#6b7280',
      colorPrimary: '#4a9eff',
      colorSecondary: '#64b5f6',
      colorAccent: '#81c784',
      colorSuccess: '#81c784',
      colorWarning: '#ffb74d',
      colorError: '#e57373',
      colorInfo: '#64b5f6',
    },
  },

  forestMist: {
    id: 'forestMist',
    name: 'Forest Mist',
    category: 'calm',
    colors: {
      bgPrimary: '#1c2321',
      bgSurface: '#263532',
      bgElevated: '#304540',
      textPrimary: '#e8f4f2',
      textSecondary: '#b8d4cf',
      textDisabled: '#6b7f7a',
      colorPrimary: '#4db6ac',
      colorSecondary: '#80cbc4',
      colorAccent: '#a5d6a7',
      colorSuccess: '#a5d6a7',
      colorWarning: '#ffb74d',
      colorError: '#e57373',
      colorInfo: '#4db6ac',
    },
  },

  twilight: {
    id: 'twilight',
    name: 'Twilight',
    category: 'calm',
    colors: {
      bgPrimary: '#2d2838',
      bgSurface: '#3d3650',
      bgElevated: '#4d4560',
      textPrimary: '#f0e7e7',
      textSecondary: '#c8bcc8',
      textDisabled: '#7a6d7a',
      colorPrimary: '#b39ddb',
      colorSecondary: '#ce93d8',
      colorAccent: '#f48fb1',
      colorSuccess: '#a5d6a7',
      colorWarning: '#ffb74d',
      colorError: '#e57373',
      colorInfo: '#b39ddb',
    },
  },

  // ENERGY THEMES

  vibrantStudio: {
    id: 'vibrantStudio',
    name: 'Vibrant Studio',
    category: 'energy',
    colors: {
      bgPrimary: '#0f0f0f',
      bgSurface: '#1e1e1e',
      bgElevated: '#2d2d2d',
      textPrimary: '#ffffff',
      textSecondary: '#b8b8b8',
      textDisabled: '#6b6b6b',
      colorPrimary: '#1db954',
      colorSecondary: '#ffd700',
      colorAccent: '#ff6b35',
      colorSuccess: '#1db954',
      colorWarning: '#ffd700',
      colorError: '#ff6b35',
      colorInfo: '#1db954',
    },
  },

  electricBlue: {
    id: 'electricBlue',
    name: 'Electric Blue',
    category: 'energy',
    colors: {
      bgPrimary: '#0a0e27',
      bgSurface: '#151b3d',
      bgElevated: '#1f2753',
      textPrimary: '#ffffff',
      textSecondary: '#b8c8d8',
      textDisabled: '#6b7a8a',
      colorPrimary: '#00d4ff',
      colorSecondary: '#0088ff',
      colorAccent: '#ff0080',
      colorSuccess: '#00d4ff',
      colorWarning: '#ffd700',
      colorError: '#ff0080',
      colorInfo: '#00d4ff',
    },
  },

  sunsetEnergy: {
    id: 'sunsetEnergy',
    name: 'Sunset Energy',
    category: 'energy',
    colors: {
      bgPrimary: '#1a1a2e',
      bgSurface: '#16213e',
      bgElevated: '#0f3460',
      textPrimary: '#ffffff',
      textSecondary: '#d4d4d4',
      textDisabled: '#808080',
      colorPrimary: '#ff6b6b',
      colorSecondary: '#feca57',
      colorAccent: '#48dbfb',
      colorSuccess: '#48dbfb',
      colorWarning: '#feca57',
      colorError: '#ff6b6b',
      colorInfo: '#48dbfb',
    },
  },
};

export const defaultTheme: ThemeId = 'blueSerenity';

export const getTheme = (themeId: ThemeId): Theme => {
  return themes[themeId];
};

export const getAllThemes = (): Theme[] => {
  return Object.values(themes);
};

export const getCalmThemes = (): Theme[] => {
  return Object.values(themes).filter((theme) => theme.category === 'calm');
};

export const getEnergyThemes = (): Theme[] => {
  return Object.values(themes).filter((theme) => theme.category === 'energy');
};

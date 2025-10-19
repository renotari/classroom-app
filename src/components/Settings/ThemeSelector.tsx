/**
 * ThemeSelector Component
 * Permette di selezionare uno dei 6 temi disponibili
 */

import { useThemeStore } from '../../stores/themeStore';
import { getCalmThemes, getEnergyThemes } from '../../styles/themes';
import type { Theme, ThemeId } from '../../types/theme.types';

export function ThemeSelector() {
  const { currentTheme, setTheme } = useThemeStore();
  const calmThemes = getCalmThemes();
  const energyThemes = getEnergyThemes();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Calm Themes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {calmThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme === theme.id}
              onClick={() => setTheme(theme.id as ThemeId)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Energy Themes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {energyThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme === theme.id}
              onClick={() => setTheme(theme.id as ThemeId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ThemeCardProps {
  theme: Theme;
  isActive: boolean;
  onClick: () => void;
}

function ThemeCard({ theme, isActive, onClick }: ThemeCardProps) {
  const { colors } = theme;

  return (
    <button
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-lg p-4 text-left transition-all
        ${
          isActive
            ? 'ring-4 ring-[var(--color-primary)] scale-105 shadow-xl'
            : 'ring-1 ring-[var(--bg-elevated)] hover:ring-2 hover:ring-[var(--color-secondary)] hover:scale-102'
        }
      `}
      aria-label={`Select ${theme.name} theme`}
      aria-pressed={isActive}
    >
      {/* Background with theme primary color */}
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundColor: colors.colorPrimary }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Theme Name */}
        <h4 className="font-semibold text-lg mb-3 text-[var(--text-primary)]">
          {theme.name}
        </h4>

        {/* Color Preview */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <ColorSwatch color={colors.bgPrimary} label="BG" />
          <ColorSwatch color={colors.colorPrimary} label="Primary" />
          <ColorSwatch color={colors.colorAccent} label="Accent" />
          <ColorSwatch color={colors.textPrimary} label="Text" />
        </div>

        {/* Status Badge */}
        {isActive && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium">
            <span>✓</span>
            <span>Active</span>
          </div>
        )}
      </div>
    </button>
  );
}

interface ColorSwatchProps {
  color: string;
  label: string;
}

function ColorSwatch({ color, label }: ColorSwatchProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-full h-8 rounded border border-black/20"
        style={{ backgroundColor: color }}
        title={`${label}: ${color}`}
      />
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
    </div>
  );
}

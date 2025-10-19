/**
 * SettingsView Component
 * Pannello impostazioni completo con ThemeSelector
 */

import { ThemeSelector } from './ThemeSelector';
import { useWindowMode } from '../../hooks/useWindowMode';

export function SettingsView() {
  const { mode, setNormal, setOverlay, setFullscreen } = useWindowMode();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--bg-elevated)] pb-4">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
          <span>⚙️</span>
          <span>Settings</span>
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Customize your Classroom Management Tool experience
        </p>
      </div>

      {/* Window Mode Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Window Mode
          </h2>
          <p className="text-[var(--text-secondary)]">
            Choose how you want the application window to behave
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WindowModeCard
            title="Normal Mode"
            description="Standard window with full controls and resizing"
            icon="🖼️"
            isActive={mode === 'normal'}
            onClick={setNormal}
          />
          <WindowModeCard
            title="Overlay Mode"
            description="Always on top, smaller window for use alongside other apps"
            icon="📌"
            isActive={mode === 'overlay'}
            onClick={setOverlay}
          />
          <WindowModeCard
            title="Fullscreen Mode"
            description="Full screen for presentations and classroom displays"
            icon="⛶"
            isActive={mode === 'fullscreen'}
            onClick={setFullscreen}
          />
        </div>
      </section>

      {/* Theme Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Appearance
          </h2>
          <p className="text-[var(--text-secondary)]">
            Choose a color theme that suits your teaching style and classroom environment
          </p>
        </div>

        <ThemeSelector />
      </section>

      {/* Placeholder for future settings */}
      <section className="opacity-50">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Other Settings
          </h2>
          <p className="text-[var(--text-secondary)]">
            Additional settings will be added in future phases
          </p>
        </div>

        <div className="space-y-4">
          <SettingItem
            icon="🔊"
            title="Audio Settings"
            description="Configure default volumes and sound preferences"
            comingSoon
          />
          <SettingItem
            icon="🎤"
            title="Microphone Settings"
            description="Adjust noise monitoring sensitivity and thresholds"
            comingSoon
          />
          <SettingItem
            icon="⌨️"
            title="Keyboard Shortcuts"
            description="Customize hotkeys for quick actions"
            comingSoon
          />
          <SettingItem
            icon="💾"
            title="Data & Storage"
            description="Manage saved classes, groups, and preferences"
            comingSoon
          />
        </div>
      </section>
    </div>
  );
}

interface SettingItemProps {
  icon: string;
  title: string;
  description: string;
  comingSoon?: boolean;
}

function SettingItem({ icon, title, description, comingSoon }: SettingItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--bg-elevated)]">
      <span className="text-3xl" role="img">
        {icon}
      </span>
      <div className="flex-1">
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
      {comingSoon && (
        <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-warning)]/20 text-[var(--color-warning)] font-medium">
          Coming Soon
        </span>
      )}
    </div>
  );
}

interface WindowModeCardProps {
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

function WindowModeCard({
  title,
  description,
  icon,
  isActive,
  onClick,
}: WindowModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative overflow-visible rounded-lg p-8 text-left transition-all w-full
        ${
          isActive
            ? 'ring-4 ring-[var(--color-primary)] scale-105 shadow-xl bg-[var(--bg-surface)]'
            : 'ring-1 ring-[var(--bg-elevated)] hover:ring-2 hover:ring-[var(--color-secondary)] hover:scale-102 bg-[var(--bg-surface)]'
        }
      `}
      aria-label={`Switch to ${title}`}
      aria-pressed={isActive}
    >
      {/* Icon */}
      <div className="text-4xl mb-3">{icon}</div>

      {/* Title */}
      <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)]">{description}</p>

      {/* Active Badge */}
      {isActive && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium mt-3">
          <span>✓</span>
          <span>Active</span>
        </div>
      )}
    </button>
  );
}

/**
 * SettingsView Component
 * Pannello impostazioni completo con ThemeSelector
 */

import { ThemeSelector } from './ThemeSelector';

export function SettingsView() {
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

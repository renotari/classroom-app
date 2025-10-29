/**
 * TabBar Component
 * Barra di navigazione con 5 tabs
 */

import type { TabId, Tab } from '../../types/layout.types';
import { tabs } from '../../types/layout.types';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="flex items-center justify-around border-b border-[var(--bg-elevated)] bg-[var(--bg-surface)] px-4 py-3">
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        />
      ))}
    </nav>
  );
}

interface TabButtonProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ tab, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-1 rounded-lg px-6 py-3
        transition-all duration-200 min-w-[80px]
        ${
          isActive
            ? 'bg-[var(--color-primary)] text-white shadow-md scale-105'
            : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
        }
      `}
      aria-label={`Navigate to ${tab.label}`}
      aria-current={isActive ? 'page' : undefined}
      data-testid={`tab-${tab.id}`}
    >
      <span className="text-2xl" role="img" aria-label={tab.label}>
        {tab.icon}
      </span>
      <span className="text-sm font-medium">{tab.label}</span>
    </button>
  );
}

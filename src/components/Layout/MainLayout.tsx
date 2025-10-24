/**
 * MainLayout Component
 * Layout principale dell'applicazione con TabBar e contenuto dinamico
 */

import { useState } from 'react';
import type { TabId } from '../../types/layout.types';
import { TabBar } from './TabBar';
import { TitleBar } from './TitleBar';
import { SettingsView } from '../Settings/SettingsView';
import { TimerView } from '../Timer/TimerView';
import { AudioPanel } from '../Audio/AudioPanel';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('timer');

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)]">
      {/* Custom Title Bar */}
      <TitleBar />

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <main className="flex-1 overflow-auto p-6">
        <TabContent activeTab={activeTab} />
      </main>
    </div>
  );
}

interface TabContentProps {
  activeTab: TabId;
}

function TabContent({ activeTab }: TabContentProps) {
  // Placeholder components - verranno sostituiti nelle fasi successive
  const content = {
    timer: <TimerView />,
    audio: <AudioPanel />,
    class: <ClassPlaceholder />,
    tools: <ToolsPlaceholder />,
    settings: <SettingsPlaceholder />,
  };

  return content[activeTab];
}

function ClassPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <span className="text-6xl">👥</span>
      <h2 className="text-3xl font-bold text-[var(--text-primary)]">
        Class Management
      </h2>
      <p className="text-[var(--text-secondary)]">
        Class module will be implemented in Phase 7
      </p>
    </div>
  );
}

function ToolsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <span className="text-6xl">🛠️</span>
      <h2 className="text-3xl font-bold text-[var(--text-primary)]">Tools</h2>
      <p className="text-[var(--text-secondary)]">
        Tools (Random Student, Groups, Dice) will be implemented in Phases 8-11
      </p>
    </div>
  );
}

function SettingsPlaceholder() {
  return <SettingsView />;
}

/**
 * MainLayout Component
 * Layout principale dell'applicazione con TabBar e contenuto dinamico
 *
 * Feature flags control which tabs are visible:
 * - timerFeature: Timer tab visible
 * - audioSystem: Audio tab visible
 * - noiseMonitoring: Noise tab visible
 * - classManagement: Class Management tab visible
 * - Point-based tools (random student, groups, dice): Tools tab visible
 */

import { useState } from 'react';
import type { TabId } from '../../types/layout.types';
import { FEATURE_FLAGS } from '../../config/features';
import { TabBar } from './TabBar';
import { TitleBar } from './TitleBar';
import { SettingsView } from '../Settings/SettingsView';
import { TimerView } from '../Timer/TimerView';
import { AudioPanel } from '../Audio/AudioPanel';
import { NoiseMeterPanel } from '../NoiseMeter/NoiseMeterPanel';
import { SemaphorePanel } from '../Semaphore/SemaphorePanel';
import { ClassManagementPanel } from '../ClassManagement';
import { RandomStudentPanel } from '../RandomStudent';

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
  // Content for each tab - guarded by feature flags
  // Only render implemented features; show placeholders for disabled features
  switch (activeTab) {
    case 'timer':
      return FEATURE_FLAGS.timerFeature ? (
        <TimerView />
      ) : (
        <DisabledFeaturePlaceholder feature="Timer" phase={3} />
      );

    case 'audio':
      return FEATURE_FLAGS.audioSystem ? (
        <AudioPanel />
      ) : (
        <DisabledFeaturePlaceholder feature="Audio System" phase={4} />
      );

    case 'noise':
      return FEATURE_FLAGS.noiseMonitoring ? (
        <NoiseMeterPanel />
      ) : (
        <DisabledFeaturePlaceholder feature="Noise Monitoring" phase={5} />
      );

    case 'semaphore':
      return FEATURE_FLAGS.semaphoreSystem ? (
        <SemaphorePanel />
      ) : (
        <DisabledFeaturePlaceholder feature="Semaphore (Traffic Light)" phase={6} />
      );

    case 'class':
      return FEATURE_FLAGS.classManagement ? (
        <ClassManagementPanel />
      ) : (
        <DisabledFeaturePlaceholder feature="Class Management" phase={7} />
      );

    case 'tools':
      return FEATURE_FLAGS.randomStudent || FEATURE_FLAGS.groupGeneration ? (
        <ToolsImplementation />
      ) : (
        <DisabledFeaturePlaceholder
          feature="Tools (Random Student, Groups, Dice)"
          phase="8-11"
        />
      );

    case 'settings':
      return <SettingsView />;

    default:
      return <div>Unknown tab</div>;
  }
}

/**
 * Unified placeholder for disabled/not-yet-implemented features
 * Enforces feature flag semantics: placeholder only shown when feature flag is FALSE
 */
interface DisabledFeaturePlaceholderProps {
  feature: string;
  phase: number | string;
}

function DisabledFeaturePlaceholder({
  feature,
  phase,
}: DisabledFeaturePlaceholderProps) {
  const emojis: Record<string, string> = {
    Timer: '⏱️',
    Audio: '🔊',
    Noise: '🔉',
    Class: '👥',
    Tools: '🛠️',
    Random: '🎲',
    Groups: '👫',
  };

  const emoji = Object.entries(emojis).find(([key]) =>
    feature.includes(key)
  )?.[1];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <span className="text-6xl">{emoji || '📋'}</span>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          {feature}
        </h2>
        <p className="text-[var(--text-secondary)] mb-4">
          This feature will be implemented in Phase {phase}
        </p>
        <p className="text-sm text-[var(--text-tertiary)]">
          Check PROJECT_PLAN.md for implementation timeline
        </p>
      </div>
    </div>
  );
}

/**
 * Tools Implementation
 * Shows available tools based on feature flags:
 * - Random Student (Phase 8)
 * - Group Generation (Phase 9)
 * - Dice Roller (Phase 11)
 */
function ToolsImplementation() {
  // For now, show Random Student if enabled
  // In future phases, this will be a tabbed interface with multiple tools
  if (FEATURE_FLAGS.randomStudent) {
    return <RandomStudentPanel />;
  }

  // Placeholder for when no tools are enabled
  return (
    <DisabledFeaturePlaceholder
      feature="Tools (Random Student, Groups, Dice)"
      phase="8-11"
    />
  );
}

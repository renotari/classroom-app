/**
 * Layout Types
 * Definisce i tipi per il sistema di navigation tabs
 */

export type TabId = 'timer' | 'audio' | 'noise' | 'semaphore' | 'class' | 'tools' | 'settings';

export interface Tab {
  id: TabId;
  label: string;
  icon: string; // Emoji per ora, poi possiamo usare icon library
}

export const tabs: Tab[] = [
  { id: 'timer', label: 'Timer', icon: '⏱️' },
  { id: 'audio', label: 'Audio', icon: '🎵' },
  { id: 'noise', label: 'Noise', icon: '🎤' },
  { id: 'semaphore', label: 'Semaphore', icon: '🚦' },
  { id: 'class', label: 'Class', icon: '👥' },
  { id: 'tools', label: 'Tools', icon: '🛠️' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

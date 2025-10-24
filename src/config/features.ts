/**
 * Feature Flags Configuration
 * Centralizes feature availability based on development phase
 * FASE mapping reference: PROJECT_PLAN.md
 */

/**
 * Feature flags for phased development
 * Set to true when phase is implemented and ready
 */
export const FEATURE_FLAGS = {
  // FASE 1: Setup ✅ COMPLETATA
  coreApplication: true,

  // FASE 2: Window Management & Theme ✅ COMPLETATA
  windowModes: true,
  themeSystem: true,
  customTitleBar: true,

  // FASE 3: Timer Feature ✅ COMPLETATA
  timerFeature: true,
  timerPresets: true,
  timerWarnings: true,

  // FASE 4: Audio System ⏸️ NOT STARTED (estimated week 5)
  // TODO: Implementare FASE 4 - Audio System
  //  - Features: Audio alerts, background music, Web Audio API singleton
  //  - Timeline: Week 5 (2025-11-XX)
  audioSystem: false,
  audioAlerts: false,
  backgroundMusic: false,
  audioPresets: false,

  // FASE 5: Noise Monitoring ⏸️ NOT STARTED (estimated week 6)
  // TODO: Implementare FASE 5 - Noise Monitoring
  //  - Features: Microphone access, real-time noise meter, alerts
  //  - Timeline: Week 6 (2025-11-XX)
  noiseMonitoring: false,
  noiseMeter: false,
  noiseThresholds: false,
  noiseHistory: false,

  // FASE 6: Traffic Light System ⏸️ NOT STARTED (estimated week 7)
  // TODO: Implementare FASE 6 - Semaphore
  //  - Features: Manual/auto traffic light, visual states
  //  - Timeline: Week 7 (2025-11-XX)
  semaphore: false,
  semaphoreAutoMode: false,
  semaphoreShortcuts: false,

  // FASE 7: Class Management ⏸️ NOT STARTED (estimated week 8-9)
  // TODO: Implementare FASE 7 - Class Management
  //  - Features: CSV import, student lists, random selection
  //  - Timeline: Week 8-9 (2025-11-XX)
  classManagement: false,
  csvImport: false,
  randomStudent: false,
  absenceTracking: false,
  studentAnimations: false,

  // FASE 8: Group Generation ⏸️ NOT STARTED (estimated week 10-11)
  // TODO: Implementare FASE 8 - Group Generation
  //  - Features: Auto group creation, separation rules, algorithm
  //  - Timeline: Week 10-11 (2025-11-XX)
  groupGeneration: false,
  separationRules: false,
  groupVisualization: false,

  // FASE 9-15: Advanced Features ⏸️ NOT STARTED
  // Points system, Dice roller, Overlays, etc.
  // Timeline: Week 12-17 (2025-12-XX)
  pointsSystem: false,
  diceRoller: false,
  overlayMode: false,
  floatingWindows: false,
} as const;

/**
 * Phase information for reference
 */
export const PHASE_INFO = {
  '3': {
    name: 'Timer Feature',
    status: 'COMPLETATA' as const,
    startWeek: '3',
    completedWeek: '4',
  },
  '4': {
    name: 'Audio System',
    status: 'NON INIZIATA' as const,
    estimatedWeek: '5',
    features: [
      'Web Audio API singleton',
      'Alert sounds',
      'Background music',
      'Audio controls',
    ],
  },
  '5': {
    name: 'Noise Monitoring',
    status: 'NON INIZIATA' as const,
    estimatedWeek: '6',
    features: [
      'Microphone input',
      'Real-time noise meter',
      'Threshold alerts',
      'History tracking',
    ],
  },
  '6': {
    name: 'Traffic Light (Semaphore)',
    status: 'NON INIZIATA' as const,
    estimatedWeek: '7',
    features: [
      'Manual state control',
      'Auto mode based on noise',
      'Visual indicators',
      'Keyboard shortcuts',
    ],
  },
  '7': {
    name: 'Class Management',
    status: 'NON INIZIATA' as const,
    estimatedWeek: '8-9',
    features: [
      'CSV import with encoding detection',
      'Student list management',
      'Random student selection',
      'Absence tracking',
    ],
  },
  '8': {
    name: 'Group Generation',
    status: 'NON INIZIATA' as const,
    estimatedWeek: '10-11',
    features: [
      'Automatic group creation',
      'Separation rules engine',
      'Best-effort algorithm',
      'Group visualization',
    ],
  },
} as const;

/**
 * Helper function to check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

/**
 * Helper to get all enabled features
 */
export function getEnabledFeatures(): (keyof typeof FEATURE_FLAGS)[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key as keyof typeof FEATURE_FLAGS);
}

/**
 * Helper to get all disabled features (planned but not implemented)
 */
export function getDisabledFeatures(): (keyof typeof FEATURE_FLAGS)[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([, enabled]) => !enabled)
    .map(([key]) => key as keyof typeof FEATURE_FLAGS);
}

/**
 * Development helper: throw error if accessing unimplemented feature
 */
export function requireFeature(
  feature: keyof typeof FEATURE_FLAGS,
  message?: string
): void {
  if (!isFeatureEnabled(feature)) {
    throw new Error(
      message ||
        `Feature "${feature}" is not yet implemented. Check PROJECT_PLAN.md for timeline.`
    );
  }
}

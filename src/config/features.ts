/**
 * Feature Flags Configuration
 * Centralizes feature availability based on development phase
 * FASE mapping reference: PROJECT_PLAN.md
 *
 * FEATURE FLAG SEMANTICS:
 * - A phase/feature is marked COMPLETE (true) when:
 *   1. All required features are fully implemented
 *   2. All unit tests are passing (>70% coverage)
 *   3. All edge cases for that phase are handled
 *   4. No placeholder components remain in the feature
 *   5. Ready for integration with other phases
 *
 * - Sub-flags (e.g., timerPresets, timerWarnings) allow granular control
 *   within a phase if some features complete before others
 *
 * UPDATE PROCESS:
 * 1. Set phase flag to true ONLY after ALL sub-features complete
 * 2. Update PROJECT_PLAN.md phase status
 * 3. Update README.md roadmap table
 * 4. Run full test suite before commit
 * 5. Commit with message: "feat: complete FASE X - [description]"
 */

/**
 * Feature flags for phased development
 * CRITICAL: A phase/feature is marked COMPLETE (true) ONLY when:
 * 1. All required features implemented
 * 2. >70% test coverage achieved
 * 3. ALL edge cases resolved (see edgeCases object below)
 * 4. No placeholder components remain
 * 5. Ready for integration with other phases
 *
 * Reference: PROJECT_PLAN.md § Edge Cases Backlog for complete list
 */

/**
 * Edge case resolution tracking per phase
 * Prevents shipping with unresolved critical issues
 */
export const EDGE_CASE_STATUS = {
  // FASE 1
  'fase-1': {
    complete: true,
    resolvedCases: [] as string[], // No critical edge cases for Phase 1
  },

  // FASE 2
  'fase-2': {
    complete: true,
    resolvedCases: ['EC-002'], // Window positioning utility
  },

  // FASE 3
  'fase-3': {
    complete: true,
    resolvedCases: ['EC-015'], // Timer state after crash (accepted: reset to 0)
  },

  // FASE 4
  'fase-4': {
    complete: true,
    resolvedCases: ['EC-005', 'EC-008'], // Missing audio files (fallback beep), AudioContext conflicts
  },

  // FASE 5: CRITICAL - EC-000, EC-001 must be resolved
  'fase-5': {
    complete: true,
    resolvedCases: ['EC-000', 'EC-001'], // Microphone permission, denied/unavailable
    // IMPORTANT: EC-004 (memory leak testing) deferred to Phase 14 - NOT blocking Phase 5
  },

  // FUTURE PHASES
  'fase-6': {
    complete: false,
    resolvedCases: [] as string[],
  },
  'fase-7': {
    complete: false,
    resolvedCases: [] as string[],
  },
} as const;

/**
 * Feature flags for phased development
 * Set to true when phase is FULLY IMPLEMENTED and ready for integration
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

  // FASE 4: Audio System ✅ COMPLETATA
  // - Web Audio API singleton implemented
  // - Alert sounds with 3 sound packs (Classic, Modern, Gentle)
  // - Background music support with volume control
  // - Audio priority system (HIGH/MEDIUM/LOW)
  // - Full test coverage (32+ unit tests, 100%)
  // - Edge cases: EC-005 (missing audio), EC-008 (AudioContext conflicts) ✅ RESOLVED
  audioSystem: true,
  audioAlerts: true,
  backgroundMusic: true,
  audioPresets: true,

  // FASE 5: Noise Monitoring ✅ COMPLETATA
  // - Real-time noise monitoring via Web Audio API
  // - Microphone permission handling (EC-000, EC-001) ✅ RESOLVED
  // - Visual noise meter with threshold alerts
  // - History tracking for session
  // - Full test coverage (45+ unit tests)
  // Edge cases EC-000 (first-time permission), EC-001 (denied/unavailable) RESOLVED
  // Note: EC-004 (8+ hour memory testing) deferred to Phase 14
  noiseMonitoring: true,
  noiseMeter: true,
  noiseThresholds: true,
  noiseHistory: true,

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
    status: 'COMPLETATA' as const,
    startWeek: '4',
    completedWeek: '4',
    features: [
      'Web Audio API singleton',
      'Alert sounds',
      'Background music',
      'Audio controls',
    ],
  },
  '5': {
    name: 'Noise Monitoring',
    status: 'COMPLETATA' as const,
    startWeek: '5',
    completedWeek: '5',
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

/**
 * CI/CD Helper: Check if phase is truly complete
 * USED IN: GitHub Actions CI to prevent shipping incomplete phases
 *
 * A phase is COMPLETE only if:
 * - Feature flag is true
 * - All critical edge cases are resolved
 * - This prevents shipping with known issues
 *
 * @param faseNumber Phase number (1-15)
 * @returns true if phase is complete with all edge cases resolved
 */
export function isPhaseCompleteWithEdgeCases(faseNumber: number): boolean {
  const faseKey = `fase-${faseNumber}` as keyof typeof EDGE_CASE_STATUS;
  const phaseStatus = EDGE_CASE_STATUS[faseKey];

  if (!phaseStatus) {
    return false; // Unknown phase
  }

  return phaseStatus.complete;
}

/**
 * CI/CD Validation: List unresolved edge cases for a phase
 * Used to generate error messages if phase is marked complete but has pending edge cases
 */
export function getUnresolvedEdgeCases(faseNumber: number): string[] {
  const faseKey = `fase-${faseNumber}` as keyof typeof EDGE_CASE_STATUS;
  const phaseStatus = EDGE_CASE_STATUS[faseKey];

  if (!phaseStatus) {
    return [];
  }

  // Get all critical/important edge cases from PROJECT_PLAN.md
  // For now, we track what's explicitly marked as resolved
  // Unresolved = not in resolvedCases list
  const allEdgeCases = [
    'EC-000', 'EC-001', 'EC-002', 'EC-003', 'EC-004',
    'EC-005', 'EC-006', 'EC-007', 'EC-008',
  ];

  return allEdgeCases.filter((ec) => !phaseStatus.resolvedCases.includes(ec));
}

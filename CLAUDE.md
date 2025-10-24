# Teacher Classroom Management App

## Obiettivo del Progetto
Applicazione desktop (Windows, cross-platform ready) per aiutare gli insegnanti nella gestione della classe, con supporto per schermi touch interattivi (STI) e integrazione con OneNote come lavagna digitale.

## Funzionalità Principali

### 1. Timer Didattici
- Timer configurabili per attività di classe (es. "lavorate per 30 minuti")
- Preset rapidi (5, 10, 15, 30 minuti) + custom
- Controlli start/pause/stop/reset
- Visualizzazione chiara e grande del tempo rimanente
- Alert visivo/audio alla scadenza
- Warnings opzionali prima della scadenza (es. "2 minuti rimanenti")
- Floating window opzionale (1/10 schermo minimo)

### 2. Sistema Audio
- **Suoni Alerts**: Predefiniti per diverse situazioni:
  - Fine del tempo di lavoro
  - Richiesta di attenzione al docente
  - Transizioni tra attività
- **Background Music**: Riproduzione musica durante lavoro
  - Cartella personalizzabile
  - Volume regolabile
  - Play/Stop
- Possibilità di scegliere tra set di suoni
- Test/anteprima suoni
- **IMPORTANTE**: Tutto gestito con **Web Audio API singleton** (no HTML5 audio)

### 3. Monitoraggio Rumore
- Rilevamento real-time del livello di rumore tramite microfono
- Visualizzazione grafica del livello audio (meter/bar)
- Soglie configurabili:
  - Verde: silenzio (silent work)
  - Giallo: rumore accettabile (quiet discussion)
  - Rosso: troppo rumore
- Alert visivo/sonoro opzionale quando supera soglia
- Storia del livello durante la lezione
- Floating window opzionale con meter grande
- **Flow permission microfono** con onboarding al primo avvio

### 4. Sistema Semaforo (Traffic Light)
- Indicatore visivo dello stato della classe:
  - 🔴 Rosso: Lavoro silenzioso, niente parlato
  - 🟡 Giallo: Discussione tranquilla permessa
  - 🟢 Verde: Discussione normale/lavoro di gruppo
- Cambio stato con un click
- Modalità automatica basata su noise level (opzionale)
- Modalità schermo intero per massima visibilità
- Shortcut tastiera (1, 2, 3)
- Floating window opzionale

### 5. Gestione Classi e Studenti
- **Import CSV**: Caricamento liste studenti da CSV
  - Parsing robusto con Papaparse
  - Encoding detection automatico
  - Validazione dati
  - Max 30 studenti per classe (target: 25)
- **Random Student**: Selezione casuale studente
  - Animazione nomi che scorrono
  - Esclusione studenti assenti
  - History per evitare ripetizioni
- **Mark Absences**: Segna presenze/assenze rapidamente
- Dropdown selezione classe attiva

### 6. Group Generation con Separation Rules
- Generazione automatica gruppi da 2-6 studenti
- **Separation Rules**: Regole per non mettere certi studenti insieme
  - Configurabili per coppia di studenti
  - Priority rules vs soft rules
  - Report dettagliato violazioni dopo generazione
- Algoritmo "best-effort" con 10 tentativi
- Visualizzazione gruppi generati
- Possibilità di rigenerare

### 7. Points System (Opzionale per MVP)
- Sistema punti per studenti
- Incremento/decremento punti
- Classifica visualizzabile
- Reset periodico

### 8. Dice Roller (Opzionale per MVP)
- Dado virtuale 1-6 (o personalizzabile)
- Animazione lancio
- Shortcut rapido

### 9. Modalità Overlay + Fullscreen
- **Overlay Mode**: Widget minimizzato sempre-in-primo-piano sopra OneNote
  - Mostra info essenziali: semaforo, timer, noise level
  - Posizionabile e draggabile
  - Click-through regions (OneNote rimane interattivo)
- **Fullscreen Mode**: Vista completa per proiezione
- Transizione fluida tra modalità
- Floating windows per ogni modulo (posizionabili)

## Stack Tecnologico

### Core Stack (CONFERMATO E REVISIONATO)
```
Framework:      Tauri 2.x
Frontend:       React 18.3+ (functional components, hooks)
Language:       TypeScript (strict mode)
Build Tool:     Vite
Styling:        Tailwind CSS
State Mgmt:     Zustand (per global state complesso)
Backend:        Rust (Tauri backend - uso minimale)
Testing:        Vitest + React Testing Library + Playwright
```

### Motivazione Stack
- **Tauri**: Bundle piccolo (~5MB), basso consumo memoria (~50MB vs 150MB Electron), performance native
- **React + TypeScript**: Sviluppo rapido, type-safe, ecosistema maturo
- **Vite**: Build veloce, HMR eccellente
- **Tailwind**: Styling veloce e consistente
- **Zustand**: State management semplice ma potente

## Architettura Tauri

### Struttura Frontend (React)
```
src/
├── components/          # Componenti UI React
│   ├── Timer/          # Timer module
│   ├── AudioPlayer/    # Audio + Music
│   ├── NoiseMeter/     # Noise monitoring
│   ├── Semaphore/      # Traffic light
│   ├── Students/       # Class & student management
│   ├── Groups/         # Group generation
│   ├── Points/         # Points system
│   ├── Dice/           # Dice roller
│   ├── Overlay/        # Overlay mode widget
│   └── Common/         # Shared components
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
├── services/           # Business logic, API calls
│   ├── audioService.ts        # AudioContext singleton!
│   ├── timerService.ts
│   ├── noiseMonitorService.ts
│   └── groupGenerationService.ts
├── types/              # TypeScript types
├── utils/              # Helper functions
├── styles/             # Theme definitions (6 themes)
└── tests/              # Frontend tests
```

### Struttura Backend (Rust)
```
src-tauri/
├── src/
│   ├── main.rs         # Entry point
│   ├── commands.rs     # Tauri commands
│   ├── window.rs       # Window management
│   └── file_ops.rs     # File operations (CSV, config)
└── Cargo.toml
```

### Comunicazione Frontend ↔️ Backend
- Frontend → Backend: `@tauri-apps/api` invoke commands
- Backend espone Rust functions come "commands"
- Eventi: Backend emette eventi, frontend ascolta

## Design System e Temi

### 6 Temi Colore Disponibili
Dalle specifiche tecniche complete, l'app supporta 6 temi:
1. **Calm** (toni rilassanti)
2. **Energy** (toni vivaci)
3. **Professional** (business)
4. **Dark Mode** (scuro)
5. **High Contrast** (accessibilità)
6. **Custom** (personalizzabile)

**Note per Claude Code**: I codici colori esatti sono in `docs/ui-ux-spec.md` - referenziare quel documento quando implementi il theme system.

### Principi UI/UX
- **Touch-first**: Hit areas min 44x44px
- **Visibilità**: Elementi leggibili da lontano per studenti
- **Semplicità**: Insegnante usa app in <10 secondi
- **Affidabilità**: Zero crash durante lezioni (target: 8+ ore uptime)
- **Configurabilità**: Adattabile a diversi stili insegnamento

## Principi di Sviluppo

### Codice
- Lingua: **Italiano** per commenti e nomi variabili significativi
- **TypeScript strict mode** SEMPRE attivo
- **No `any` types** - usare `unknown` se necessario
- **Functional components** (no class components)
- **Custom hooks** per logica riutilizzabile
- **Separation of concerns**: UI ≠ business logic

### Audio - REGOLE CRITICHE
⚠️ **IMPORTANTE - Da rispettare assolutamente:**

1. **Singleton AudioContext**
   ```typescript
   // ✅ CORRETTO - Un solo AudioContext per tutta l'app
   export const audioContext = new AudioContext();
   
   // ❌ SBAGLIATO - Multiple AudioContext
   const ctx1 = new AudioContext(); // NO!
   const ctx2 = new AudioContext(); // NO!
   ```

2. **Solo Web Audio API**
   - ✅ Web Audio API per TUTTO (alerts, music, monitoring)
   - ❌ NO HTML5 `<audio>` element
   - ❌ NO mix di approcci

3. **Audio Priority System**
   - Alert sounds: priority HIGH (interrompono music)
   - Background music: priority LOW (pausabile)
   - Noise monitoring: priority MEDIUM (non interrompibile)

### Testing Strategy (Obbligatoria)

#### Unit Tests (Vitest)
- Tutti i custom hooks
- Tutti i services
- Utility functions
- Algoritmi (group generation, timer logic)
- **Target coverage**: >70%

#### Integration Tests (React Testing Library)
- Flussi completi features
- Interazioni tra componenti
- State management
- **Scenari critici**: Timer scade → audio suona, Rumore alto → semaforo cambia

#### E2E Tests (Playwright)
- User flows completi
- Cross-window interactions (overlay + floating)
- CSV import flow
- First-time microphone permission flow
- **Scenari reali**: Lezione completa 30min simulata

### Edge Cases - 15 Identificati

**Reference Document**: `docs/edge-cases.md` contiene tutti i dettagli.

**5 CRITICAL** (da gestire SUBITO):
- EC-000: First-time microphone permission
- EC-001: Microfono non disponibile/negato
- EC-002: Finestre fuori schermo (multi-monitor)
- EC-003: Multiple istanze app
- EC-004: Memory leak con app aperta 8+ ore

**4 IMPORTANT** (gestire presto):
- EC-005: File audio mancanti/corrotti
- EC-006: CSV encoding/dati sporchi
- EC-007: Separation rules impossibili
- EC-008: AudioContext conflicts

**6 NICE-TO-HAVE** (opzionali per MVP):
- EC-009: Classi molto grandi (>30 studenti)
- EC-010: Troppi file custom
- EC-011: Hotkey conflicts
- EC-012: Cambio tema durante animazione
- EC-013: Floating windows sovrapposte
- EC-014: Background music interruzioni
- EC-015: Timer state dopo crash (ACCETTATO: reset a 0)

### Git Workflow
- Commit atomici: un commit per feature/fix completo
- Messaggi descrittivi: 
  - `feat: implementa timer con preset rapidi`
  - `fix: corregge AudioContext singleton leak`
  - `refactor: migliora performance NoiseMeter`
  - `test: aggiunge unit tests per groupGeneration`
- Branch opzionali per feature grandi

### Performance
- React: evitare re-render inutili (useMemo, useCallback quando necessario)
- Tauri: comunicazioni frontend-backend asincrone
- Audio: processing in background (no freeze UI)
- Memory: cleanup listeners e timers in useEffect cleanup
- Target: <100MB RAM, <5% CPU idle, <100ms response time

## Note per Claude Code

### Workflow
- Implementare UNA fase alla volta seguendo PROJECT_PLAN.md
- Ogni fase deve essere **completamente funzionante e testata** prima di passare alla successiva
- Aggiornare sempre PROJECT_PLAN.md al completamento di ogni task
- Fare commit frequenti con messaggi chiari
- **Scrivere test insieme al codice** (TDD quando possibile)
- Chiedere conferma per decisioni architetturali importanti

### Riferimenti alle Spec Tecniche
Quando implementi feature specifiche, referenzia:
- `docs/technical-spec.md`: Dettagli implementativi, algoritmi, edge cases
- `docs/ui-ux-spec.md`: Design system, temi, componenti UI
- `docs/user-stories.md`: Scenari d'uso, comportamenti attesi
- `docs/edge-cases.md`: 15 edge cases categorizzati

### Quando Usare Rust Backend
- **NON usare Rust** per: UI, state management, logica semplice
- **Usare Rust** per:
  - Window management avanzato (overlay, always-on-top)
  - File system operations (CSV import/export, config save/load)
  - System tray integration (se necessario)
  - Performance-critical tasks (se Web Audio API non basta)

### State Management Architecture - Zustand Stores

**IMPORTANTE**: Stores sono PRE-SCAFFOLDED ma COMPLETAMENTE FUNZIONALI. Non aspettare di implementare il store prima di costruire UI.

**Current Status**:
- ✅ `timerStore.ts` - Fully implemented
- ✅ `audioStore.ts` - Fully implemented (Phase 4 COMPLETATA)
- ✅ `noiseStore.ts` - Scaffolded but functional (ready for Phase 5 UI)
- ✅ `classStore.ts` - Scaffolded but functional (ready for Phase 7 UI)
- ✅ `semaphoreStore.ts`, `groupsStore.ts`, `pointsStore.ts`, etc. - Ready

**Implementation Pattern** (used in audioStore):
```typescript
export const useAudioStore = create<AudioStoreState>()(
  persist(
    (set, get) => ({
      // State
      selectedSoundPack: 'classic',
      masterVolume: 0.8,

      // Actions
      setSoundPack: (key) => set({ selectedSoundPack: key }),
      setMasterVolume: (vol) => set({ masterVolume: Math.max(0, Math.min(1, vol)) }),

      // Getters
      getCurrentSoundPack: () => SOUND_PACKS[get().selectedSoundPack]
    }),
    { name: 'audio-store' } // localStorage persistence
  )
);
```

**Workflow for Each Phase**:
1. Store already exists and is functional
2. Build UI component using store hooks
3. Components use `useStore((state) => state.action)` pattern
4. Don't refactor store later - use it from the start
5. Tests cover store logic in unit tests, component usage in integration tests

**Example - Phase 5 (Noise Monitoring)**:
```typescript
// NoiseMeterPanel.tsx already has access to store
import { useNoiseStore } from '../../stores/noiseStore';

export function NoiseMeterPanel() {
  const { currentLevel, setCurrentLevel, thresholds } = useNoiseStore();
  // UI is built immediately using functional store
}
```

**NO Waiting, NO Refactoring Later**. Build with store from day one of each phase.

### Testing Strategy per Claude Code
```typescript
// Quando implementi una feature, Claude Code deve:
1. Scrivere il codice
2. Scrivere unit tests
3. Verificare che i test passino
4. Aggiornare PROJECT_PLAN.md
5. Commit

// Esempio: Timer feature
✅ src/hooks/useTimer.ts
✅ src/components/Timer/TimerView.tsx
✅ src/tests/unit/useTimer.test.ts       // <- Obbligatorio!
✅ src/tests/integration/timer.test.tsx  // <- Se interazione complessa
✅ Commit: "feat: implementa timer con tests"
```

### Test Infrastructure & Patterns

#### Unit Tests (Vitest + React Testing Library)

**Test Location**: `src/tests/unit/[category]/[feature].test.ts`

**Hooks Testing Pattern**:
```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../myHook';

describe('useMyHook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(defaultValue);
  });

  it('should update state correctly', () => {
    const { result } = renderHook(() => useMyHook());
    act(() => {
      result.current.setValue(newValue);
    });
    expect(result.current.value).toBe(newValue);
  });
});
```

**Service Testing Pattern** (AudioService, NoiseMonitorService, etc.):
```typescript
import { AudioService } from '../audioService';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    service = AudioService.getInstance();
  });

  it('should enforce singleton pattern', () => {
    const service2 = AudioService.getInstance();
    expect(service).toBe(service2); // Same instance
  });

  it('should handle errors gracefully', async () => {
    try {
      await service.playSound('invalid-path');
      expect(true).toBe(false); // Should throw
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });
});
```

**Zustand Store Testing Pattern**:
```typescript
import { renderHook, act } from '@testing-library/react';
import { useTimerStore } from '../timerStore';

describe('useTimerStore', () => {
  beforeEach(() => {
    // Reset store state
    useTimerStore.getState().resetState?.();
  });

  it('should persist state to localStorage', () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.setDuration(300);
    });
    const stored = JSON.parse(localStorage.getItem('timer-store') || '{}');
    expect(stored.duration).toBe(300);
  });
});
```

**Web Audio API Mocking** (for all audio-related tests):
- AudioContext is auto-mocked in `src/tests/setup.ts`
- MockAudioContext supports: createGain(), createOscillator(), createBufferSource()
- MediaDevices.getUserMedia is also mocked for microphone tests
- Cleanup: AudioService singleton is reset after each test

**Edge Case Testing**:
- Reference `docs/edge-cases.md` for the 15 documented edge cases
- EC-000, EC-001: Microphone permission tests (mock navigator.mediaDevices)
- EC-005: Missing audio files (test fallback beep generation)
- EC-008: AudioContext singleton conflicts (test getInstance returns same instance)
- EC-004: Memory leaks after 8+ hours (use Jest/Vitest profiling in Phase 14)

#### Integration Tests (React Testing Library)

**Test Location**: `src/tests/integration/[feature].test.tsx`

**Pattern**: Test user flows, not individual units
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimerComponent } from '../components/Timer';

describe('Timer Component Integration', () => {
  it('should start timer and show completion alert', async () => {
    const user = userEvent.setup();
    render(<TimerComponent />);

    // User sets 5 minutes
    await user.click(screen.getByText('5 min'));

    // User starts timer
    await user.click(screen.getByText('Start'));

    // Verify timer is counting
    await waitFor(() => {
      expect(screen.getByText(/4:59/)).toBeInTheDocument();
    });
  });
});
```

**Critical Scenarios** (must have integration tests):
- Timer completes → Audio alert plays
- Noise exceeds threshold → Semaphore changes color
- CSV imported → Student list updated
- Group generation with impossible rules → Error shown

#### E2E Tests (Playwright)

**Test Location**: `tests/e2e/[feature].spec.ts`

**Configuration**: Assumes Tauri dev server running (see Point 7 for fix)

**Pattern**:
```typescript
import { test, expect } from '@playwright/test';

test('Timer flow', async ({ page }) => {
  await page.goto('http://localhost:1420');

  // Click Timer tab
  await page.click('[aria-label="Timer"]');

  // Click 5min preset
  await page.click('button:has-text("5 min")');

  // Click Start
  await page.click('button:has-text("Start")');

  // Wait for timer display
  await expect(page.locator('text=/4:5[0-9]/')).toBeVisible();
});
```

**Critical User Flows** (must have E2E tests):
- First-time app launch (theme selection, window mode)
- Timer full cycle (preset → start → pause → stop)
- Audio controls (test sound, volume adjustment)
- Microphone permission flow (EC-000)
- CSV import and class selection

#### Coverage Targets & Metrics

**Target**: >70% coverage across all modules

**Monitored by Vitest**:
```bash
npm run test:coverage
```

**Per-Module Coverage**:
- `useTimer.ts`: 100% (20+ tests) ✅
- `AudioService.ts`: 100% (32+ tests) ✅
- `noiseMonitorService.ts`: 80%+ (Phase 5)
- `groupGenerationService.ts`: 90%+ (Phase 9 - algorithm critical)
- Store files: 85%+ (each store)

**CI Integration**:
- Coverage reports in `coverage/` directory (HTML, JSON, Text)
- CI should fail if coverage drops below 70%
- Use `--coverage` flag in test script

#### Testing Best Practices

1. **Test Names**: Describe WHAT is tested, not HOW
   - ✅ "should play alert sound on timer completion"
   - ❌ "calls playSound method"

2. **Arrange-Act-Assert Pattern**:
   ```typescript
   // Arrange
   const { result } = renderHook(() => useTimer());

   // Act
   act(() => {
     result.current.setDuration(300);
   });

   // Assert
   expect(result.current.duration).toBe(300);
   ```

3. **Avoid Testing Implementation Details**:
   - Test behavior, not internal state
   - Use `screen.getByRole()` instead of `container.querySelector()`

4. **Async Operations**: Always use `waitFor()` for animations, API calls
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Alert')).toBeInTheDocument();
   });
   ```

5. **Cleanup**: Vitest automatically cleans up after each test
   - No need to manually unmount or reset (done in `setup.ts`)
   - AudioService singleton is reset automatically

#### Future Test Directories (Scaffolded)

```
src/tests/
├── setup.ts                     # Global test setup
├── unit/
│   ├── hooks/
│   │   └── useTimer.test.ts    ✅ COMPLETATA
│   ├── services/
│   │   ├── audioService.test.ts ✅ COMPLETATA
│   │   ├── noiseMonitorService.test.ts (skeleton - FASE 5)
│   │   └── groupGenerationService.test.ts (skeleton - FASE 9)
│   └── stores/
│       └── README.md (pattern documentation)
└── integration/
    └── [Future: timer.test.tsx, audio.test.tsx, etc.]

tests/
└── e2e/
    └── [Future: timer.spec.ts, audio.spec.ts, etc.]
```

### Thinking Modes
- **"think"**: per task normali (components, styling)
- **"think hard"**: per decisioni architetturali, algoritmi complessi
- **"ultrathink"**: per problemi cross-cutting (audio system, group generation algorithm)

## 🛡️ Risk Mitigation Strategy

Based on external code review (2025-10-24), three strategic risks identified:

### Risk 1: Unclear Roadmap Execution

**Status**: Medium Risk → Low Risk (Mitigated)

**Problem**: Documentation promised 15 phases, but only Timer (Phase 3) was real. Rest were placeholders.

**Mitigation**:
- ✅ **Synchronize Docs**: README, PROJECT_PLAN.md, CLAUDE.md now reflect actual Phase 4 completion
- ✅ **Freeze Roadmap**: Explicit feature freeze decision: Phases 1-9 are core MVP, 10-11 optional
- ✅ **Update Cadence**: Documentation updates after every major phase completion (see checklist below)
- 🔄 **Monitoring**: Every 2 weeks, audit docs against actual implementation

**Responsible**: Project Lead
**Review Cadence**: End of each phase
**Success Metric**: README accuracy verified by team before releasing phase

---

### Risk 2: Lack of Automated Tests Beyond Timer

**Status**: Medium Risk → Low Risk (Mitigated)

**Problem**: Only Timer had unit tests. Audio, Noise, Class modules had no test infrastructure.

**Mitigation**:
- ✅ **Test Infrastructure Scaffolded**:
  - Skeleton tests created for Phase 5 (noiseMonitorService.test.ts)
  - Skeleton tests created for Phase 9 (groupGenerationService.test.ts)
  - Store testing patterns documented in `src/tests/unit/stores/README.md`
- ✅ **Test Patterns Documented**: Full testing guide in CLAUDE.md
  - Unit test patterns (hooks, services, stores)
  - Integration test patterns
  - E2E test patterns with Playwright
  - Coverage targets: >70% per module
- ✅ **CI/CD Ready**: Vitest configured with coverage reporting

**Responsible**: Every developer implementing Phase 5+
**Review Cadence**: Each phase must include tests (required for "complete" status)
**Success Metric**: >70% coverage maintained, all phases tested before merge

---

### Risk 3: Widening Gap Between Specs and Implementation

**Status**: Medium Risk → Low Risk (Mitigated)

**Problem**: Technical spec documents existed but disconnected from actual code. Feature flags marked phase "complete" while placeholders remained.

**Mitigation**:
- ✅ **Feature Flag Semantics Defined**:
  - Phase marked "complete" (flag=true) only when:
    1. All required features implemented
    2. All unit tests passing (>70% coverage)
    3. All edge cases handled
    4. No placeholder components remain
    5. Ready for integration
- ✅ **Spec Cross-References**:
  - Every store skeleton includes reference to spec document
  - Every test skeleton includes reference to edge cases doc
  - CLAUDE.md includes explicit links to `docs/` for architecture decisions
- ✅ **Edge Case Tracking**:
  - All 15 edge cases documented in PROJECT_PLAN.md
  - Each assigned to specific phase
  - Status tracked (RESOLVED, PENDING, SCHEDULED)
- ✅ **Documentation Sync Checklist** (added to workflow):
  - After phase completion, update:
    - README.md (roadmap table, features list)
    - PROJECT_PLAN.md (phase status, metrics)
    - CLAUDE.md (if architectural changes)
    - Feature flags (phase completion decision)

**Responsible**: Lead on each phase
**Review Cadence**: Before committing any phase
**Success Metric**: Specs and code stay in sync (<1 week drift max)

---

## 📋 Documentation Sync Checklist

Use this checklist AFTER completing each phase:

- [ ] **Update README.md**
  - [ ] Roadmap table: change phase status to ✅ COMPLETATA or 🚧 IN PROGRESS
  - [ ] Features list: Add completed features to "Completate" section
  - [ ] Update version number (bump minor: 0.4.0 → 0.5.0 for major phases)
  - [ ] Update "Ultima Modifica" date

- [ ] **Update PROJECT_PLAN.md**
  - [ ] Phase section: Add "Status EFFETTIVO" subsection documenting actual completion
  - [ ] Update metrics section with test coverage, test count, edge cases resolved
  - [ ] Update Edge Cases table with RESOLVED status for completed cases
  - [ ] Update Rischi section if any new risks identified

- [ ] **Update CLAUDE.md** (if needed)
  - [ ] Update edge case section if new patterns discovered
  - [ ] Add new testing patterns if needed
  - [ ] Update risk mitigation if status changed

- [ ] **Update src/config/features.ts**
  - [ ] Set phase flag to `true` (e.g., `audioSystem: true`) ONLY if all criteria met
  - [ ] Set sub-flags appropriately
  - [ ] Run `npm run test` to verify tests still pass

- [ ] **Verify Test Coverage**
  - [ ] Run `npm run test:coverage`
  - [ ] Verify >70% coverage for phase modules
  - [ ] Update CLAUDE.md with coverage % if >95%

- [ ] **Git Commit**
  - [ ] Message format: `feat: complete FASE X - [description]`
  - [ ] Include documentation changes
  - [ ] Tag: `git tag -a v0.X.0 -m "FASE X complete"`

---

## 🚨 Risk Review Schedule

**Every 2 Weeks**:
- [ ] Review risk status (Risk 1, 2, 3 above)
- [ ] Check documentation sync (is docs <1 week behind code?)
- [ ] Audit test coverage (is it trending toward >70%?)
- [ ] Identify new risks or blockers

**End of Each Phase**:
- [ ] Complete documentation sync checklist above
- [ ] Re-assess all three strategic risks
- [ ] Update this section if status changed

**Before Release (Phase 15)**:
- [ ] Full documentation audit: specs vs. actual code
- [ ] Verify all 15 edge cases resolved or explicitly deferred
- [ ] Test coverage report: show >70% coverage
- [ ] Performance baseline: <100MB RAM, <5% CPU idle

---

## 🎯 Success Criteria for Risk Mitigation

**Risk 1 (Roadmap) - MITIGATED**:
- ✅ Docs synchronized monthly
- ✅ Phases have clear "complete" criteria

**Risk 2 (Testing) - MITIGATED**:
- ✅ Test scaffolding in place
- ✅ Patterns documented
- ✅ >70% coverage on-track for completion

**Risk 3 (Specs) - MITIGATED**:
- ✅ Feature flags enforce spec compliance
- ✅ Edge cases tracked and assigned
- ✅ Specs cross-referenced in code

**Overall**: From "High Risk" project to "Low Risk" with these mitigations. Monitor quarterly.

## File e Cartelle Standard

```
classroom-management-tool/
├── src/                      # Frontend React
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── styles/              # Theme system
│   ├── tests/               # Frontend tests
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/               # Backend Rust
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs
│   │   ├── window.rs
│   │   └── file_ops.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── public/                  # Assets statici
│   └── sounds/             # File audio predefiniti
├── tests/                   # E2E tests (Playwright)
│   └── e2e/
├── docs/                    # Documentazione (LE VOSTRE SPEC!)
│   ├── technical-spec.md   # Spec tecniche dettagliate (REFERENZIARE!)
│   ├── ui-ux-spec.md       # Design system completo
│   ├── user-stories.md     # Scenari d'uso
│   ├── edge-cases.md       # 15 edge cases
│   └── feature-map.md      # Implementation map
├── PROJECT_PLAN.md         # Piano sviluppo (17 settimane)
├── CLAUDE.md              # Questo file
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vitest.config.ts
```

## Glossario
- **STI**: Schermo Touch Interattivo (grande touchscreen per classroom)
- **Overlay Mode**: Widget minimizzato sempre-in-primo-piano sopra OneNote
- **Floating Window**: Finestra separata draggabile (Timer, Noise, Semaphore)
- **Semaforo**: Sistema traffic light (rosso/giallo/verde)
- **Separation Rules**: Regole per non mettere certi studenti nello stesso gruppo
- **AudioContext Singleton**: Unica istanza AudioContext per tutta l'app (CRITICO!)
- **Edge Case**: Scenario limite da gestire (15 documentati)
- **TDD**: Test-Driven Development (test prima del codice)

## Timeline del Progetto

**Durata Totale**: 17 settimane (14 dev + 3 testing)
**Ore Settimanali**: ~25-30 ore
**Totale Ore**: ~425-510 ore

Vedi PROJECT_PLAN.md per breakdown dettagliato per fase.

## Checklist Qualità Pre-Completamento

Prima di considerare il progetto "completo":

**Funzionalità Core**
- [ ] Timer funziona accuratamente (test 30min reali)
- [ ] Audio alerts, music, monitoring simultanei OK
- [ ] Noise monitoring real-time senza lag
- [ ] Semaforo cambia stato (manuale + auto)
- [ ] Overlay mode sempre visibile sopra OneNote
- [ ] Random Student + animazione
- [ ] Group generation + separation rules
- [ ] CSV import gestisce encoding e errori

**Qualità Codice**
- [ ] TypeScript strict mode, no `any`
- [ ] Test coverage >70%
- [ ] AudioContext singleton pattern verificato
- [ ] No multiple AudioContext instances
- [ ] No console errors in produzione
- [ ] Bundle size <20MB
- [ ] Nessun memory leak (test 8+ ore)

**Edge Cases**
- [ ] 5 CRITICAL edge cases gestiti e testati
- [ ] 4 IMPORTANT edge cases gestiti
- [ ] First-time microphone flow testato

**Performance**
- [ ] <100MB RAM usage
- [ ] <5% CPU idle
- [ ] <100ms response time per azioni
- [ ] No freeze UI durante audio processing

**User Experience**
- [ ] App usabile in <10 secondi da nuovo utente
- [ ] Touch targets >=44px verificati
- [ ] Feedback visivo per ogni azione
- [ ] Error handling graceful e in italiano
- [ ] 6 temi funzionanti

**Testing**
- [ ] Unit tests >70% coverage
- [ ] Integration tests per flussi critici
- [ ] E2E tests per scenari reali
- [ ] Tutti i test passano in CI

**Documentazione**
- [ ] README completo
- [ ] User manual disponibile
- [ ] Codice commentato dove necessario
- [ ] CLAUDE.md e PROJECT_PLAN.md aggiornati

## Riferimenti
- [Tauri Docs](https://tauri.app/v1/guides/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- **Specifiche Tecniche Complete**: `docs/` folder (VOSTRE SPEC - AUTHORITATIVE SOURCE!)
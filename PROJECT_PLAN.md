# Piano di Sviluppo - Teacher Classroom App (Tauri)

**Ultimo Aggiornamento**: 2025-10-19
**Fase Corrente**: FASE 3 - Feature Timer
**Stack**: Tauri 2.x + React 19.1 + TypeScript 5.8 + Vite 7.1 + Tailwind CSS 4.1 + Zustand 5.0
**Timeline Totale**: **17 settimane** (14 dev + 3 testing)
**Basato su Specifiche**: docs/technical-spec.md (revisionato da Opus)

---

## 📋 Legenda Stati
- ⏸️ NON INIZIATA
- ⏳ IN CORSO
- ✅ COMPLETATA
- ⚠️ BLOCCATA (specificare motivo)
- 🧪 IN TESTING

---

## 🎯 Obiettivi di Qualità

### Performance Targets
- Memory: <100MB RAM
- CPU idle: <5%
- Response time: <100ms per action
- Uptime: 8+ ore senza crash/leak

### Testing Targets
- Unit test coverage: >70%
- Integration tests: flussi critici coperti
- E2E tests: scenari reali completi
- Zero critical bugs prima del deploy

### Edge Cases
- 5 CRITICAL: gestiti al 100%
- 4 IMPORTANT: gestiti al 100%
- 6 NICE-TO-HAVE: valutare caso per caso

---

## FASE 1: Setup Progetto Tauri ✅ COMPLETATA

### Obiettivo
Inizializzare progetto Tauri con struttura base funzionante.

### Task
- [x] 1.1 - Inizializzare progetto con `npm create tauri-app@latest`
- [x] 1.2 - Setup Tailwind CSS completo (v4.1 con @tailwindcss/postcss)
- [x] 1.3 - Setup Testing Framework (Vitest + React Testing Library + Playwright)
- [x] 1.4 - Struttura cartelle standard (components, hooks, stores, services, tests)
- [x] 1.5 - Configurare TypeScript strict mode + opzioni aggiuntive
- [x] 1.6 - Configurare MainWindow base (1200x800, resizable)
- [x] 1.7 - Test build: `npm run tauri dev` funziona ✅
- [x] 1.8 - Setup Zustand per state management
- [x] 1.9 - Commit iniziale (2 commits: setup + config)

### Risultati
- Stack: Tauri 2.x + React 19.1 + TypeScript 5.8 + Vite 7.1 + Tailwind 4.1 + Zustand 5.0
- Build size: ~209KB JS
- Tutti i test framework configurati e funzionanti

### Tempo Effettivo: ~1 giorno

---

## FASE 2: Window Management & Theme System ✅ COMPLETATA

### Obiettivo
Implementare sistema temi e layout principale con navigation + window management (normal/overlay/fullscreen).

### Task
- [x] 2.1 - Tauri.conf.json già configurato (FASE 1)
- [x] 2.2 - Sistema Temi: 6 themes (3 Calm + 3 Energy) con CSS variables
- [x] 2.3 - Zustand store per tema attivo + persistence localStorage
- [x] 2.4 - Layout principale con TabBar (5 tabs: Timer, Audio, Class, Tools, Settings)
- [x] 2.5 - Placeholders per 5 tabs (implementazione completa nelle fasi successive)
- [x] 2.6 - Sistema navigation tra tabs funzionante
- [x] 2.7 - Tailwind configurato con CSS variables per temi
- [x] 2.8 - Settings tab con ThemeSelector completo
- [x] 2.9 - Utility window positioning per gestire EC-002 (finestre fuori schermo)
- [x] 2.10 - Window Mode types e store (normal/overlay/fullscreen) con Zustand + persistence
- [x] 2.11 - Custom TitleBar con drag region e window controls (minimize/maximize/close)
- [x] 2.12 - Hook useWindowMode con toggle modes e helper methods
- [x] 2.13 - Settings: Window Mode selector (3 cards interattive)
- [x] 2.14 - Tauri permissions per window controls (decorations, minimize, maximize)
- [x] 2.15 - Test window modes funzionanti (normal 1200x800, overlay 400x600 always-on-top, fullscreen) ✅

### Risultati
- **Theme System**: 6 temi completi (Blue Serenity default, Forest Mist, Twilight, Vibrant Studio, Electric Blue, Sunset Energy)
- **Window Management**: 3 modalità finestra (Normal, Overlay, Fullscreen) con transizioni fluide
- **Custom TitleBar**: Drag region, window controls nativi (minimize/maximize/close)
- **Settings UI**: ThemeSelector + WindowModeSelector con cards interattive
- Theme + WindowMode persistence su localStorage
- Layout responsive con tabs navigation
- Window positioning utilities (EC-002) pronte per floating windows
- Build size: ~209KB JS, ~8KB CSS
- App Tauri completamente funzionante e testata ✅

### Edge Cases Gestiti
- ✅ EC-002: Windows outside screen bounds (utility implementata)
- ⚠️ EC-013: Floating windows overlap (rimandato a fasi successive)

### Tempo Effettivo: ~1.5 giorni

---

## FASE 3: Feature Timer ✅ COMPLETATA + REFACTORED

### Obiettivo
Timer didattici completamente funzionanti.

### Task (3.1-3.13) - COMPLETATI
- [x] Timer UI completa (TimerDisplay, Controls, Presets)
- [x] Hook useTimer con interval management
- [x] Zustand store con persistence
- [x] Preset rapidi (5/10/15/30 min) + custom input
- [x] Warning configurabili (2min/5min)
- [x] **Unit tests useTimer** (20/20 passing ✅)
- [x] Integrazione in MainLayout (tab Timer)

### Post-Implementation Code Review & Refactoring
- [x] Removed unnecessary setTimeout in setAndStart (fix false async assumption)
- [x] Consolidated warning logic (3 places → 1, cleaner flow)
- [x] Gated console.logs behind DEBUG flag (11 logs removed from prod)
- [x] Added proper error handling (throw errors vs silent fail)
- [x] All tests still passing after refactor (20/20) ✅

### Edge Cases: EC-015, EC-004
- ✅ EC-015: Timer reset on crash (accepted as-is)
- ✅ EC-004: Memory leak prevention (cleanup tested)

### Code Quality Score: 7.3 → 8.1/10 (post-refactor)
- Architecture: 8/10 ✅
- Type Safety: 9/10 ✅
- Performance: 7/10 (minor optimizations noted for later)
- Testing: 6/10 (unit solid, integration pending FASE 13)
- Error Handling: 7/10 (improved from 4)
- Memory/Cleanup: 8/10 ✅

### Tempo Effettivo: 1.5 giorni (implementation + refactoring)

---

## FASE 4: Sistema Audio con Singleton ✅ COMPLETATA

### Obiettivo
Sistema audio completo con AudioContext singleton.

### Task (4.1-4.11) - COMPLETATI
- [x] 4.1 - AudioService singleton class (private constructor, getInstance())
- [x] 4.2 - Audio priority system (HIGH/MEDIUM/LOW with ducking)
- [x] 4.3 - Audio file loading + decoding + fallback beep tone
- [x] 4.4 - Predefined sounds library (3 packs: Classic, Modern, Gentle)
- [x] 4.5 - Zustand audio store + configuration persistence
- [x] 4.6 - UI Audio Panel component (full controls)
- [x] 4.7 - useAudioService hook integration
- [x] 4.8 - Timer → Audio integration (onComplete callback)
- [x] 4.9 - Unit tests AudioService (32/32 passing, 100% singleton coverage)
- [x] 4.10 - Edge case handling (EC-005, EC-008, EC-014)
- [x] 4.11 - Code review + refactor + build verification

### Risultati
- **AudioService Singleton**: 1 AudioContext per app (verified in tests)
- **Audio Priority System**: HIGH (alerts) > MEDIUM (monitoring) > LOW (background music)
- **Audio Ducking**: Background music reduced to 20% during alerts, auto-restore
- **Sound Library**: 3 complete sound packs with all required sounds
- **UI Panel**: Full audio control interface with volume sliders, test buttons
- **Timer Integration**: Timer completion triggers alert sound automatically
- **Web Audio API**: 100% - no HTML5 audio elements
- **Test Coverage**: 32 unit tests (100% for AudioService) - all passing ✅

### Edge Cases Gestiti
- ✅ EC-005: Missing audio files → generates fallback beep tone
- ✅ EC-008: AudioContext singleton → verified, only 1 instance per app
- ✅ EC-014: Background music ducking → implemented with smooth gain transitions

### Code Quality Score: 8.5/10
- Architecture: 9/10 (singleton pattern perfect)
- Type Safety: 9/10 (full TypeScript strict mode)
- Performance: 8/10 (caching, cleanup)
- Testing: 10/10 (32 comprehensive tests, all pass)
- Error Handling: 8/10 (fallbacks, try-catch)
- Memory/Cleanup: 9/10 (proper cleanup on stop/pause)

### Build Results
- ✅ TypeScript compilation: 0 errors
- ✅ Vite build: 258.94 KB JS (gzip: 76.85 KB)
- ✅ All 32 tests passing
- ✅ No console warnings in build

### Tempo Effettivo: 1.5 giorni (implementation + testing + refinement)

---

## FASE 5: Monitoraggio Rumore ⏸️ NON INIZIATA

### Obiettivo
Rilevare e visualizzare livello rumore real-time.

### Task (5.1-5.15)
- **CRITICO: First-time microphone permission flow**
- AudioMonitoringService con Web Audio API
- Calcolo livello audio (dB)
- UI meter real-time
- Configurazione soglie
- Alert opzionali
- Storia/grafico 10 minuti
- Calibrazione automatica
- Floating window opzionale
- Hook useNoiseMeter
- Threading (Web Workers se serve)
- **Unit tests AudioMonitoringService**
- **Integration test noise meter**

### Edge Cases: EC-000, EC-001, EC-004
### Tempo Stimato: 2 settimane

---

## FASE 6: Sistema Semaforo ⏸️ NON INIZIATA

### Obiettivo
Traffic light per stato della classe.

### Task (6.1-6.13)
- UI Semaphore 3 stati
- Controlli manuali + shortcut
- Hook useSemaphore
- Toggle Manual/Auto mode
- Integrazione con NoiseMeter
- Config auto-mode
- Fullscreen mode
- Floating window opzionale
- Animazioni transizioni
- Sound alert opzionale
- **Unit tests useSemaphore**
- **Integration test semaphore + noise**

### Tempo Stimato: 1 settimana

---

## FASE 7: Class & Students Management ⏸️ NON INIZIATA

### Obiettivo
Gestire classi, studenti, import CSV, absences.

### Task (7.1-7.11)
- Data model Class e Student
- Zustand store Classes
- UI Class selector
- UI Manage Classes modal
- CSV Import con Papaparse
- UI CSV Import (file picker, preview)
- Tauri command file operations
- UI Mark Absences
- Export CSV (bonus)
- **Unit tests CSV parsing**
- **Integration test import → select class**

### Edge Cases: EC-006, EC-009
### Tempo Stimato: 1.5 settimane

---

## FASE 8: Random Student Selection ⏸️ NON INIZIATA

### Obiettivo
Selezione casuale studente con animazione.

### Task (8.1-8.7)
- Algoritmo Random Student
- UI Random Student
- Animazione nomi che scorrono
- Storia selezioni
- Configurazione opzioni
- **Unit tests algoritmo (distribution test)**
- **Integration test UI flow**

### Tempo Stimato: 1 settimana

---

## FASE 9: Group Generation & Separation Rules ⏸️ NON INIZIATA

### Obiettivo
Generare gruppi automaticamente con separation rules.

### Task (9.1-9.10)
- Data model Separation Rules
- UI Manage Separation Rules
- Algoritmo Group Generation (10 attempts)
- Validation constraints
- Report violazioni rules
- UI Group Generation
- Visualizzazione gruppi
- Export groups (opzionale)
- **Unit tests algoritmo**
- **Integration test rules → generate**

### Edge Cases: EC-007
### Tempo Stimato: 2 settimane

---

## FASE 10: Points System (OPTIONAL MVP) ⏸️ NON INIZIATA

### Task: Points management, classifica, reset
### Tempo Stimato: 1 settimana
### Decisione: Valutare se includere nel MVP

---

## FASE 11: Dice Roller (OPTIONAL MVP) ⏸️ NON INIZIATA

### Task: Dice display, animazione, configurazione
### Tempo Stimato: 0.5 settimane
### Decisione: Valutare se includere nel MVP

---

## FASE 12: Integrazione e Orchestrazione ⏸️ NON INIZIATA

### Obiettivo
Far collaborare tutte le feature insieme.

### Task (12.1-12.9)
- Dashboard overview
- Global state coordination
- Settings panel globale
- Theme system (6 temi)
- **Verifica AudioContext singleton**
- Test integrazione completi (4 scenari)
- Performance profiling
- Fix memory leaks

### Edge Cases: EC-003, EC-004, EC-012, EC-013
### Tempo Stimato: 1.5 settimane

---

## FASE 13: UI/UX Polish e Accessibilità ⏸️ NON INIZIATA

### Task (13.1-13.10)
- Design system refinement (6 temi finali)
- Animazioni e micro-interactions
- Touch optimization (>=44px)
- Accessibility (a11y)
- Onboarding/tutorial
- Help contestuale
- Error handling UX
- Performance optimization
- Logging e debugging
- Feedback utenti reali

### Tempo Stimato: 1.5 settimane

---

## FASE 14: Testing Strategy Implementation ⏸️ NON INIZIATA

### Obiettivo
Implementare suite test completa.

### Task (14.1-14.19)
- Completare coverage >70%
- Test critici hooks
- Test critici services
- Test algoritmi
- Integration tests (6 scenari)
- E2E tests Playwright (6 scenari)
- Performance test 8 ore
- Test report completo

### Tempo Stimato: 2 settimane

---

## FASE 15: Build, Packaging e Distribuzione ⏸️ NON INIZIATA

### Task (15.1-15.12)
- Ottimizzazione bundle (<20MB)
- Configurare Tauri builder Windows
- Icona professionale
- Versioning
- README completo
- Documentazione utente
- Test installazione macchine pulite
- Firma digitale (opzionale)
- Release GitHub
- Setup CI/CD (opzionale)

### Tempo Stimato: 1 settimana

---

## 📊 Metriche Progetto

### Progress Generale
- **Fasi Completate**: 4 / 15 (27%) ✅ FASE 1, 2, 3, 4 complete
- **Task Completati**: ~60 / ~145 (41%)
- **Commits**: 5 (4 feature + 1 refactor)
- **Test Coverage**: 52 unit tests (FASE 3: 20 + FASE 4: 32) + integration pending FASE 13
- **Bundle Size**: 0.259 MB JS + 0.008 MB CSS = ~0.267 MB (target: <20MB) ✅
- **Edge Cases Gestiti**: 6 / 15 (EC-002, EC-004, EC-005, EC-008, EC-014, EC-015 implementati)

### Tempo Stimato Totale
**Core Features**: ~17 settimane (14 dev + 3 testing)
**Optional Features**: +1.5 settimane (se inclusi)

---

## 🚨 Blocchi e Decisioni Pendenti

### Decisioni
1. **MVP Scope**: Includere Fase 10, 11? (decidere dopo Fase 9)
2. **Auto-Update**: Skip per v1, update manuali
3. **Testing**: Test insieme al codice (non strict TDD)

### Rischi CRITICAL
1. AudioContext singleton - test rigorosi Fase 4
2. Microphone permissions - onboarding chiaro Fase 5
3. Memory leak 8+ ore - testing Fase 14

---

## 📝 Note per Claude Code

### Workflow Obbligatorio per OGNI Fase
1. Leggi PROJECT_PLAN.md (fase corrente)
2. Leggi CLAUDE.md (regole)
3. Leggi docs/technical-spec.md (dettagli)
4. Leggi docs/edge-cases.md (edge cases fase)
5. Think hard → piano
6. Conferma utente
7. Implementa + **test INSIEME**
8. Verifica test passano
9. Aggiorna PROJECT_PLAN.md
10. Commit

### REGOLE CRITICHE
- AudioContext singleton
- Test coverage >70%
- TypeScript strict (no 'any')
- Una fase alla volta
- Riferenzia sempre docs/

---

## ✅ Checklist Pre-Inizio Sviluppo
- [ ] Node.js >= 18 installato
- [ ] Rust installato
- [ ] Git configurato
- [ ] CLAUDE.md letto
- [ ] docs/ disponibili
- [ ] MVP scope deciso
- [ ] Timeline 17 settimane OK

---

## 🚀 Prossimo Step

```bash
npm create tauri-app@latest classroom-management-tool
cd classroom-management-tool
npm install
npm run tauri dev
```

Poi apri Claude Code e inizia Fase 1!
# Piano di Sviluppo - Teacher Classroom App (Tauri)

**Ultimo Aggiornamento**: [Data - da aggiornare automaticamente]
**Fase Corrente**: Setup Iniziale
**Stack**: Tauri 2.x + React 18.3 + TypeScript + Vite + Tailwind CSS + Zustand
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

## FASE 1: Setup Progetto Tauri ⏳ IN CORSO

### Obiettivo
Inizializzare progetto Tauri con struttura base funzionante.

### Task
- [ ] 1.1 - Inizializzare progetto con `npm create tauri-app@latest`
- [ ] 1.2 - Setup Tailwind CSS completo
- [ ] 1.3 - Setup Testing Framework (Vitest + React Testing Library + Playwright)
- [ ] 1.4 - Struttura cartelle standard
- [ ] 1.5 - Configurare TypeScript strict mode
- [ ] 1.6 - Creare MainWindow base
- [ ] 1.7 - Test build: `npm run tauri dev` funziona
- [ ] 1.8 - Setup Zustand per state management
- [ ] 1.9 - Commit iniziale

### Tempo Stimato: 1 settimana

---

## FASE 2: Window Management ⏸️ NON INIZIATA

### Obiettivo
Configurare finestra Tauri per overlay mode e layout principale.

### Task
- [ ] 2.1 - Configurare tauri.conf.json (always-on-top, frameless, transparent)
- [ ] 2.2 - Custom title bar con drag region
- [ ] 2.3 - Toggle overlay/fullscreen modes
- [ ] 2.4 - Layout principale con tabs
- [ ] 2.5 - Placeholders per 5 sezioni
- [ ] 2.6 - Sistema navigation tra tabs
- [ ] 2.7 - Stile base Tailwind
- [ ] 2.8 - Test overlay sopra OneNote
- [ ] 2.9 - Gestire EC-002 (finestre fuori schermo)

### Edge Cases: EC-002, EC-013
### Tempo Stimato: 1 settimana

---

## FASE 3: Feature Timer ⏸️ NON INIZIATA

### Obiettivo
Timer didattici completamente funzionanti.

### Task (3.1-3.13)
- Timer UI completa
- Hook useTimer
- Zustand store
- Preset rapidi
- Warning configurabili
- Floating window opzionale
- Persistenza configurazione
- **Unit tests useTimer**
- **Integration test timer flow**

### Edge Cases: EC-015
### Tempo Stimato: 1 settimana

---

## FASE 4: Sistema Audio con Singleton ⏸️ NON INIZIATA

### Obiettivo
Sistema audio completo con AudioContext singleton.

### Task (4.1-4.11)
- **CRITICO: AudioService singleton pattern**
- Audio priority system (HIGH/MEDIUM/LOW)
- Alert sounds con Web Audio API
- Background music con Web Audio API
- Libreria suoni predefiniti
- UI Audio Panel
- Integrazione Timer → Audio
- Gestione errori
- **Unit tests AudioService (verificare singleton!)**
- **Integration test timer + audio**

### Edge Cases: EC-005, EC-008, EC-014
### Tempo Stimato: 1.5 settimane

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
- **Fasi Completate**: 0 / 15
- **Task Completati**: 0 / ~140
- **Test Coverage**: 0% (target: >70%)
- **Bundle Size**: - MB (target: <20MB)
- **Edge Cases Gestiti**: 0 / 15

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
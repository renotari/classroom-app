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
✅ tests/unit/useTimer.test.ts       // <- Obbligatorio!
✅ tests/integration/timer.test.tsx  // <- Se interazione complessa
✅ Commit: "feat: implementa timer con tests"
```

### Thinking Modes
- **"think"**: per task normali (components, styling)
- **"think hard"**: per decisioni architetturali, algoritmi complessi
- **"ultrathink"**: per problemi cross-cutting (audio system, group generation algorithm)

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
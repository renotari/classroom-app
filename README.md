# 🎓 Classroom Management Tool

> Desktop application per insegnanti - Gestione classe moderna e intuitiva

![Tauri](https://img.shields.io/badge/Tauri-2.x-24C8D8?style=flat&logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-19.1-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

**Stato Sviluppo**: 🚧 In Development - FASE 4/15 completata (26.7%) ✅ Audio System Done

---

## 📖 Descrizione

**Classroom Management Tool** è un'applicazione desktop cross-platform pensata per insegnanti, che offre strumenti pratici per la gestione quotidiana della classe: timer didattici, monitoraggio rumore, sistema semaforo, gestione studenti e gruppi, e molto altro.

Progettata per funzionare su schermi touch interattivi (STI) e laptop, con supporto per integrazione OneNote come lavagna digitale.

---

## ✨ Features

### ✅ Completate (FASE 1-4)

- **🎨 Sistema Temi**: 6 temi colore personalizzabili
  - Blue Serenity (default), Forest Mist, Twilight
  - Vibrant Studio, Electric Blue, Sunset Energy
  - Persistenza tema su localStorage

- **🪟 Window Management**: 3 modalità finestra
  - **Normal Mode**: Finestra standard (1200x800) con controlli completi
  - **Overlay Mode**: Widget minimizzato (400x600) sempre-in-primo-piano
  - **Fullscreen Mode**: Schermo intero per proiezione
  - Custom Title Bar con drag region e window controls

- **⚙️ Settings Panel**: Configurazione completa
  - Theme Selector interattivo
  - Window Mode Selector con cards
  - Configurazioni persistenti

- **⏱️ Timer Didattici**: Timer completamente funzionante
  - Preset rapidi (5, 10, 15, 30 minuti) + input custom
  - Control start/pause/stop/reset
  - Warning configurabili prima della scadenza
  - Integrazione audio alerts (Phase 4)
  - 20+ unit tests con 100% coverage

- **🎵 Sistema Audio**: Audio system con Web Audio API singleton
  - Alert sounds predefiniti (3 sound packs: Classic, Modern, Gentle)
  - Background music support con volume control
  - Audio priority system (HIGH/MEDIUM/LOW)
  - Audio ducking per music durante alerts
  - 32 unit tests (100% AudioService coverage)
  - Full UI panel con controlli

### 🚧 In Roadmap (FASE 5-15)

- 🎤 **Monitoraggio Rumore** - Real-time noise meter, soglie configurabili
- 🚦 **Sistema Semaforo** - Traffic light per stato classe (rosso/giallo/verde)
- 👥 **Gestione Classi** - Import CSV, studenti, presenze/assenze
- 🎲 **Random Student** - Selezione casuale con animazione
- 🧑‍🤝‍🧑 **Group Generation** - Creazione gruppi con separation rules
- ⭐ **Points System** - Sistema punti studenti (opzionale)
- 🎲 **Dice Roller** - Dado virtuale (opzionale)

---

## 🛠️ Stack Tecnologico

| Categoria | Tecnologia | Versione |
|-----------|-----------|----------|
| Framework | Tauri | 2.x |
| Frontend | React | 19.1 |
| Language | TypeScript | 5.8 (strict mode) |
| Build Tool | Vite | 7.1 |
| Styling | Tailwind CSS | 4.1 |
| State Management | Zustand | 5.0 |
| Backend | Rust | (Tauri backend) |
| Testing | Vitest + React Testing Library + Playwright | latest |

**Perché questo stack?**
- ✅ Bundle piccolo (~0.22 MB, target <20MB)
- ✅ Performance native (target: <100MB RAM, <5% CPU idle)
- ✅ Cross-platform (Windows pronto, macOS/Linux ready)
- ✅ Type-safe development (TypeScript strict)
- ✅ Modern UI development (React 19 + Tailwind 4)

---

## 🚀 Setup & Installazione

### Prerequisiti

- **Node.js** >= 18 ([Download](https://nodejs.org/))
- **Rust** >= 1.70 ([Install](https://www.rust-lang.org/tools/install))
- **Git** ([Download](https://git-scm.com/))

### Installazione

```bash
# Clone repository
git clone https://github.com/yourusername/classroom-app.git
cd classroom-app

# Installa dipendenze
npm install

# Avvia in development mode
npm run tauri dev

# Build per produzione
npm run tauri build
```

### Scripts Disponibili

```bash
npm run dev          # Vite dev server (solo frontend)
npm run tauri dev    # Tauri app in development mode
npm run build        # Build frontend
npm run tauri build  # Build app completa (Windows .exe)
npm run test         # Run unit tests (Vitest)
npm run test:e2e     # Run E2E tests (Playwright)
```

---

## 📚 Documentazione

- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Piano sviluppo completo (17 settimane, 15 fasi)
- **[CLAUDE.md](./CLAUDE.md)** - Linee guida sviluppo e architettura
- **[docs/](./docs/)** - Specifiche tecniche dettagliate
  - `technical-spec.md` - Dettagli implementativi
  - `ui-ux-spec.md` - Design system e UI
  - `user-stories.md` - Scenari d'uso
  - `edge-cases.md` - 15 edge cases identificati

---

## 🗓️ Roadmap

| Fase | Descrizione | Stato | Tempo Stimato |
|------|-------------|-------|---------------|
| ✅ FASE 1 | Setup Progetto Tauri | COMPLETATA | ~1 giorno |
| ✅ FASE 2 | Window Management & Theme System | COMPLETATA | ~1.5 giorni |
| ✅ FASE 3 | Feature Timer | COMPLETATA | ~1.5 giorni |
| ✅ FASE 4 | Sistema Audio | COMPLETATA | ~1.5 giorni |
| ⏳ FASE 5 | Monitoraggio Rumore | IN PLANNING | 2 settimane |
| ⏸️ FASE 6 | Sistema Semaforo | NON INIZIATA | 1 settimana |
| ⏸️ FASE 7 | Class & Students Management | NON INIZIATA | 1.5 settimane |
| ⏸️ FASE 8 | Group Generation & Separation Rules | NON INIZIATA | 1.5 settimane |
| ⏸️ FASE 9-15 | Points, Dice, Overlays, Floating Windows | NON INIZIATA | 4 settimane |

**Progress**: 4/15 fasi completate (26.7%) - ~100/145 task (69%)

Vedi [PROJECT_PLAN.md](./PROJECT_PLAN.md) per dettagli completi.

---

## 🎯 Obiettivi di Qualità

- **Performance**:
  - Memory: <100MB RAM
  - CPU idle: <5%
  - Response time: <100ms per action
  - Uptime: 8+ ore senza crash/leak

- **Testing**:
  - Unit test coverage: >70%
  - Integration tests: flussi critici coperti
  - E2E tests: scenari reali completi
  - Zero critical bugs prima del deploy

- **Edge Cases**: 15 identificati, 5 CRITICAL gestiti al 100%

---

## 🤝 Sviluppo

### Principi di Codice

- **Lingua**: Italiano per commenti e nomi variabili
- **TypeScript strict mode** SEMPRE attivo
- **No `any` types** - usare `unknown` se necessario
- **Functional components** (React hooks)
- **Separation of concerns**: UI ≠ business logic
- **Testing**: Test insieme al codice (TDD quando possibile)

### Workflow Git

- Commit atomici: un commit per feature/fix completo
- Messaggi descrittivi: `feat:`, `fix:`, `refactor:`, `test:`
- Branch opzionali per feature grandi

### Contribuire

Questo è un progetto in sviluppo attivo. Se vuoi contribuire:
1. Leggi `CLAUDE.md` per linee guida complete
2. Segui la roadmap in `PROJECT_PLAN.md`
3. Implementa UNA fase alla volta
4. Scrivi test insieme al codice
5. Aggiorna PROJECT_PLAN.md al completamento

---

## 📄 License

**TBD** - Da specificare

---

## 👨‍💻 Autore

Sviluppato con 🤖 [Claude Code](https://claude.com/claude-code)

---

## 🙏 Credits

- **Tauri Team** - Framework desktop incredibile
- **React Team** - Library UI moderna
- **Tailwind CSS** - Styling utility-first
- **Zustand** - State management minimalista

---

**Ultima Modifica**: 2025-10-24
**Versione**: 0.4.0 (FASE 4 completata)

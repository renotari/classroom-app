# Teacher Classroom Management App

Desktop application (Windows, cross-platform ready) for classroom management with touch screen support and OneNote integration.

## Quick Commands

```bash
npm run dev              # Start dev server (localhost:1420)
npm run test             # Run all tests
npm run test:coverage    # Generate coverage report (target: >70%)
npm run test:e2e         # Run E2E tests with Playwright
npm run build            # Production build
npm run lint             # Run ESLint
```

## CRITICAL RULES (NEVER VIOLATE)

⚠️ **ONE AudioContext singleton** for entire app (`src/services/audioService.ts`)
⚠️ **NO `any` types** in TypeScript (use `unknown` if necessary)
⚠️ **NO HTML5 `<audio>` elements** (Web Audio API only)
⚠️ **NO multiple AudioContext instances** (EC-008 violation)
⚠️ **ALWAYS write tests with code** (TDD approach)
⚠️ **TypeScript strict mode** ALWAYS enabled

## DO NOT

- Edit files in `dist/` or `src-tauri/target/` (auto-generated)
- Use `any` types in TypeScript
- Create multiple AudioContext instances
- Mix HTML5 audio with Web Audio API
- Commit directly to main without tests
- Force push to main/master
- Skip pre-commit hooks (--no-verify)
- Amend others' commits
- Create placeholder components and mark phase "complete"

---

## Tech Stack

**Framework**: Tauri 2.x
**Frontend**: React 18.3+ (functional components, hooks)
**Language**: TypeScript (strict mode)
**Build Tool**: Vite
**Styling**: Tailwind CSS
**State Management**: Zustand (global state)
**Backend**: Rust (minimal - window mgmt, file ops)
**Testing**: Vitest + React Testing Library + Playwright

### Why This Stack?
- **Tauri**: Small bundle (~5MB), low memory (~50MB vs Electron's 150MB)
- **React + TypeScript**: Rapid development, type-safe, mature ecosystem
- **Vite**: Fast builds, excellent HMR
- **Tailwind**: Fast, consistent styling
- **Zustand**: Simple but powerful state management

---

## Project Architecture

### Frontend Structure
```
src/
├── components/       # React UI components
│   ├── Timer/       # Timer module
│   ├── AudioPlayer/ # Audio + Music
│   ├── NoiseMeter/  # Noise monitoring
│   └── ...
├── hooks/           # Custom React hooks
├── services/        # Business logic (AudioContext singleton HERE!)
├── stores/          # Zustand stores
├── tests/           # Frontend tests
└── types/           # TypeScript types
```

### Backend Structure
```
src-tauri/
├── src/
│   ├── main.rs      # Entry point
│   ├── commands.rs  # Tauri commands
│   ├── window.rs    # Window management
│   └── file_ops.rs  # File operations (CSV, config)
```

### When to Use Rust Backend
- **DO NOT use** for: UI, state management, simple logic
- **DO use** for:
  - Window management (overlay, always-on-top)
  - File system operations (CSV import/export, config)
  - System tray integration
  - Performance-critical tasks (if Web Audio API insufficient)

---

## Code Style

- **Language**: Italian for code comments and meaningful variable names
- **Components**: Functional only (no class components)
- **Hooks**: Custom hooks for reusable logic
- **Separation**: UI ≠ business logic (keep separate)
- **TypeScript**: Strict mode, no `any`
- **Performance**: Use `useMemo`, `useCallback` when needed to avoid re-renders

### Audio System - CRITICAL

**Singleton Pattern** (mandatory):
```typescript
// ✅ CORRECT - One AudioContext for entire app
export const audioContext = new AudioContext();

// ❌ WRONG - Multiple AudioContext
const ctx1 = new AudioContext(); // NO!
const ctx2 = new AudioContext(); // NO!
```

**Web Audio API Only**:
- ✅ Web Audio API for ALL (alerts, music, monitoring)
- ❌ NO HTML5 `<audio>` element
- ❌ NO mixing approaches

**Audio Priority System**:
- Alert sounds: HIGH priority (interrupt music)
- Background music: LOW priority (pausable)
- Noise monitoring: MEDIUM priority (non-interruptible)

---

## State Management (Zustand)

**All stores are pre-scaffolded and functional**. Use from day one - do NOT refactor later.

### Store Status
- ✅ `timerStore.ts` - Fully implemented
- ✅ `audioStore.ts` - Fully implemented (Phase 4 complete)
- ✅ `noiseStore.ts` - Ready for Phase 5 UI
- ✅ `classStore.ts` - Ready for Phase 7 UI
- ✅ Other stores - Ready

### Usage Pattern
```typescript
import { useAudioStore } from '../../stores/audioStore';

export function AudioPanel() {
  const { masterVolume, setMasterVolume } = useAudioStore();
  // Build UI immediately using functional store
}
```

**Guidelines**: See @docs/state-management-guidelines.md for when to use local vs. global state.

---

## Testing Strategy

**Target**: >70% coverage across all modules

### Quick Patterns
- **Hooks**: `renderHook()` + `act()`
- **Services**: Test singleton pattern, error handling
- **Stores**: Test persistence to localStorage
- **E2E**: Use helper functions in `tests/e2e/helpers.ts`

### Coverage by Module
- `useTimer.ts`: 100% ✅
- `AudioService.ts`: 100% ✅
- `noiseMonitorService.ts`: Target 80%+ (Phase 5)
- `groupGenerationService.ts`: Target 90%+ (Phase 9)
- Stores: Target 85%+ each

### Comprehensive Guide
**📖 See @docs/testing-comprehensive-guide.md** for:
- Complete testing patterns (unit, integration, E2E)
- Mocking strategies (AudioContext, MediaDevices)
- Coverage metrics and CI integration
- Best practices and debugging tips

---

## Workflow

When implementing a feature:

1. **Check current phase** in PROJECT_PLAN.md
2. **Read requirements** in @docs/technical_spec.md
3. **Review store** (already scaffolded)
4. **Build UI** using store hooks
5. **Write tests** alongside code (TDD)
6. **Verify**: `npm run test:coverage`
7. **Update** PROJECT_PLAN.md
8. **Commit**: `feat: complete FASE X - [description]`

**After phase completion**: See @docs/workflow-checklist.md for documentation sync.

---

## Edge Cases (15 Documented)

**Reference**: @docs/edge_cases.md for complete details.

### CRITICAL (Handle Immediately)
- **EC-000**: First-time microphone permission
- **EC-001**: Microphone unavailable/denied
- **EC-002**: Windows off-screen (multi-monitor)
- **EC-004**: Memory leak (8+ hour sessions)

### IMPORTANT (Handle Soon)
- **EC-005**: Audio files missing/corrupted
- **EC-006**: CSV encoding/dirty data
- **EC-007**: Impossible separation rules
- **EC-008**: AudioContext conflicts

### NICE-TO-HAVE (Optional for MVP)
- EC-009 through EC-015 (see @docs/edge_cases.md)

---

## Design System

### 6 Themes Available
1. Calm (relaxing tones)
2. Energy (vibrant tones)
3. Professional (business)
4. Dark Mode
5. High Contrast (accessibility)
6. Custom (user-defined)

**Color codes**: See @docs/ui_ux_spec.md

### UI/UX Principles
- **Touch-first**: Hit areas minimum 44x44px
- **Visibility**: Elements readable from distance (for students)
- **Simplicity**: Teacher uses app in <10 seconds
- **Reliability**: Zero crashes during 8+ hour sessions
- **Configurability**: Adaptable to different teaching styles

---

## Git Workflow

### Commit Format
`<type>: <description>`

**Types**: feat, fix, refactor, test, docs

**Examples**:
```
feat: implement timer with quick presets
fix: resolve AudioContext singleton leak
test: add unit tests for group generation
docs: update CLAUDE.md with best practices
```

### Rules
- Atomic commits (one feature/fix per commit)
- Descriptive messages (explain WHY, not just WHAT)
- Optional branches for large features
- Never force push to main/master
- Never skip hooks or amend others' commits

---

## Performance Targets

- **RAM**: <100MB
- **CPU (idle)**: <5%
- **Response time**: <100ms for all actions
- **UI**: No freezing during audio processing
- **Memory**: Cleanup listeners/timers in useEffect cleanup
- **Uptime**: 8+ hours without memory leaks

---

## Reference Documentation

**Technical Specs**:
- @docs/technical_spec.md - Implementation details, algorithms
- @docs/ui_ux_spec.md - Design system, components, themes
- @docs/user_stories.md - Use cases, expected behaviors
- @docs/edge_cases.md - 15 edge cases categorized

**Project Management**:
- @docs/workflow-checklist.md - Phase completion checklist
- @docs/risk-management.md - Risk mitigation strategy
- @PROJECT_PLAN.md - 17-week roadmap, timeline

**Testing**:
- @docs/testing-comprehensive-guide.md - Complete testing guide
- @docs/e2e-testing-guide.md - E2E patterns, helpers, page objects
- @docs/state-management-guidelines.md - Local vs. global state decisions

---

## Extended Thinking Modes

Use extended reasoning when:
- ✅ Implementing audio system (ultrathink)
- ✅ Designing group generation algorithm (ultrathink)
- ✅ Making architectural decisions (think hard)
- ❌ Simple components or styling (default)

---

## Feature Flags

Phase marked "complete" (`flag=true` in `src/config/features.ts`) ONLY when:

1. All required features implemented
2. All unit tests passing (>70% coverage)
3. All edge cases handled
4. No placeholder components remain
5. Ready for integration

**See @docs/workflow-checklist.md** for complete criteria.

---

## Project Timeline

**Duration**: 17 weeks (14 dev + 3 testing)
**Hours/Week**: ~25-30
**Total Hours**: ~425-510

**Current Status**: See PROJECT_PLAN.md for detailed breakdown.

---

## Quality Checklist (Before "Complete")

### Core Functionality
- [ ] Timer accurate (test 30min real-time)
- [ ] Audio alerts, music, monitoring simultaneous
- [ ] Noise monitoring real-time (no lag)
- [ ] Semaphore state changes (manual + auto)
- [ ] CSV import handles encoding/errors

### Code Quality
- [ ] TypeScript strict, no `any`
- [ ] Test coverage >70%
- [ ] AudioContext singleton verified
- [ ] No console errors in production
- [ ] Bundle size <20MB

### Edge Cases
- [ ] 5 CRITICAL edge cases handled
- [ ] 4 IMPORTANT edge cases handled
- [ ] Microphone permission flow tested

### Performance
- [ ] <100MB RAM
- [ ] <5% CPU idle
- [ ] <100ms response time
- [ ] No UI freezing

---

## External Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

---

## Notes for Claude Code

### Quick Start
When starting a new task:
1. Check PROJECT_PLAN.md for current phase
2. Read feature requirements in @docs/technical_spec.md
3. Review relevant store (already scaffolded)
4. Build UI using store hooks
5. Write tests alongside code
6. Verify: `npm run test:coverage`

### When Stuck
- **Audio issues**: Check @docs/edge_cases.md (EC-005, EC-008)
- **Testing patterns**: Check @docs/testing-comprehensive-guide.md
- **State management**: Check @docs/state-management-guidelines.md
- **Workflow questions**: Check @docs/workflow-checklist.md

### Implementation Approach
- Implement ONE phase at a time (follow PROJECT_PLAN.md)
- Each phase must be **completely functional and tested** before moving to next
- Update PROJECT_PLAN.md after each task completion
- Commit frequently with clear messages
- Ask for confirmation on important architectural decisions

### Store Usage
- All Zustand stores are pre-scaffolded and functional
- Build UI components using store hooks from day one
- Do NOT refactor stores later - use them immediately
- Pattern: `useStore((state) => state.action)`

---

**Last Updated**: 2025-10-31
**Version**: Optimized for token efficiency (2025 best practices)

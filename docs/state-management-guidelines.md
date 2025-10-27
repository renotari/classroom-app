# State Management Guidelines

## Overview

This document provides clear guidelines for deciding whether to use **local component state** or **global Zustand state** in the Classroom Management App. Following these patterns ensures scalable, maintainable code and prevents anti-patterns like:
- Global state bloat (storing UI-only ephemeral state)
- Tight coupling between distant features
- Unnecessary app-wide re-renders

---

## Decision Tree: Where Should This State Live?

```
Does this state need to be shared across 2+ components?
├─ NO → Use useState (local component state)
│
└─ YES → Does it need to persist after app restart?
   ├─ NO → Does it coordinate multiple features?
   │  ├─ NO → Use useState in a parent component (prop drilling is OK for <3 levels)
   │  └─ YES → Use Zustand without persistence (for orchestration)
   │
   └─ YES → Use Zustand WITH localStorage persistence
```

---

## State Categories & Examples

### 1. ✅ Local Component State (useState)

**Use when**: State is UI-only, temporary, or doesn't need to be shared widely

**Examples**:
- Modal open/close state
- Form input field values (while editing, before submit)
- Hover/focus states
- Loading state during a single user action
- Tooltip visibility
- Collapsible sections (expanded/collapsed)
- Animation in-progress flags

**Code Example**:
```typescript
function TimerComponent() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Submit to store
      await timerStore.setDuration(customMinutes);
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsFormOpen(!isFormOpen)}>Custom</button>
      {isFormOpen && (
        <form onSubmit={handleSubmit}>
          <input
            value={customMinutes}
            onChange={(e) => setCustomMinutes(Number(e.target.value))}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Setting...' : 'Set'}
          </button>
        </form>
      )}
    </>
  );
}
```

**Why**:
- No other component needs to know if this modal is open
- State resets when component unmounts (that's OK)
- Avoids polluting global store with UI-only data

---

### 2. ✅ Parent-Managed State (useState + prop drilling)

**Use when**: State is shared by <3 child components in the same feature

**Examples**:
- Wizard step tracking (Step 1 → Step 2 → Step 3)
- Multi-step form validation state
- Tab selection within a feature panel
- Temporary preview state before committing

**Code Example**:
```typescript
function CSVImportWizard() {
  const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload');
  const [csvData, setCsvData] = useState<StudentData[] | null>(null);

  return (
    <>
      {step === 'upload' && (
        <UploadStep
          onDataLoaded={(data) => {
            setCsvData(data);
            setStep('preview');
          }}
        />
      )}
      {step === 'preview' && (
        <PreviewStep
          data={csvData!}
          onConfirm={() => setStep('confirm')}
          onBack={() => setStep('upload')}
        />
      )}
      {step === 'confirm' && (
        <ConfirmStep
          data={csvData!}
          onImport={async (data) => {
            classStore.importStudents(data);
            setStep('upload');
            setCsvData(null);
          }}
        />
      )}
    </>
  );
}
```

**Why**:
- Data flows unidirectionally (parent → children)
- Prop drilling is acceptable for shallow hierarchies
- No global store pollution

---

### 3. ✅ Global Feature State (Zustand without persistence)

**Use when**: State coordinates multiple components across a feature and doesn't need to survive app restart

**Examples**:
- Currently selected student (random student feature)
- Noise monitoring level (real-time data, not important to persist)
- Current timer countdown value
- Animation state for complex UI (like spinning name wheel)

**Code Example**:
```typescript
// stores/studentSelectionStore.ts
export const useStudentSelectionStore = create<StudentSelectionState>((set, get) => ({
  selectedStudents: [],
  isSelectingRandom: false,

  selectRandomStudent: async (excludeAbsent: boolean) => {
    set({ isSelectingRandom: true });
    try {
      const students = classStore.getState().students;
      const availableStudents = excludeAbsent
        ? students.filter(s => !s.isAbsent)
        : students;

      const selected = availableStudents[Math.random() * availableStudents.length];
      set({
        selectedStudents: [selected],
        isSelectingRandom: false
      });
    } catch (err) {
      set({ isSelectingRandom: false });
      throw err;
    }
  },
}));
```

**Why**:
- Multiple components need to display selected student
- Data changes frequently (not worth persisting)
- Survives during session, resets on app restart (that's OK)

---

### 4. ✅ Persistent Global State (Zustand with localStorage)

**Use when**: State is genuinely app-wide and should survive app restarts

**Examples**:
- User preferences (theme, language, audio volume, sound pack)
- App settings (window mode, overlay position, microphone threshold)
- Teacher-specific configuration (classroom layouts, customized sound packs)
- Last-used class (for quick access on next launch)

**Code Example**:
```typescript
// stores/audioStore.ts
export const useAudioStore = create<AudioStoreState>()(
  persist(
    (set, get) => ({
      // User preferences (should persist)
      masterVolume: 0.8,
      selectedSoundPack: 'classic',
      isMusicEnabled: true,
      musicFolder: null,

      setMasterVolume: (vol) =>
        set({ masterVolume: Math.max(0, Math.min(1, vol)) }),

      setSoundPack: (pack) =>
        set({ selectedSoundPack: pack }),
    }),
    { name: 'audio-store' } // ← Persists to localStorage
  )
);
```

**Why**:
- These settings should be remembered between sessions
- localStorage persistence is built into Zustand
- Updates here affect entire app (justified for global state)

---

### 5. ✅ Ephemeral Feature State During Complex Operations

**Use when**: Temporary state needed only during a specific operation (e.g., group generation preview)

**Guidelines**:
- Use **useState** in the component triggering the operation
- Or use **Zustand without persistence** if multiple components in that feature need it
- **CLEAR THE STATE** immediately after operation completes
- **Never persist** operation-in-progress state

**Code Example**:
```typescript
function GroupGenerationPanel() {
  // Ephemeral state for THIS operation only
  const [previewGroups, setPreviewGroups] = useState<Group[] | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const groups = await groupGenerationService.generate(
        classStore.getState().students,
        separationRulesStore.getState().rules
      );
      setPreviewGroups(groups);
    } catch (err) {
      setGenerationError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    if (previewGroups) {
      groupsStore.setGroups(previewGroups);
      setPreviewGroups(null); // ← Clear after committing
      setGenerationError(null);
    }
  };

  const handleCancel = () => {
    setPreviewGroups(null); // ← Clear on cancel
    setGenerationError(null);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Groups'}
      </button>
      {previewGroups && (
        <GroupPreview
          groups={previewGroups}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      {generationError && <ErrorMessage>{generationError}</ErrorMessage>}
    </div>
  );
}
```

**Why**:
- Preview is temporary, only for this operation
- No need to persist or share globally
- Clearing state prevents stale data in future operations

---

## Common Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Global UI State

```typescript
// BAD - Don't do this!
const useUIStore = create((set) => ({
  isButtonHovered: false,
  setIsButtonHovered: (value) => set({ isButtonHovered: value }),
  tooltipVisible: false,
  setTooltipVisible: (value) => set({ tooltipVisible: value }),
  // ... 20 more UI-only states
}));
```

**Problem**: Pollutes global state with data that only one component cares about. Every update triggers app-wide re-renders.

**Solution**: Use `useState` locally in the component.

---

### ❌ Anti-Pattern 2: Storing Form State in Global Store

```typescript
// BAD - Don't do this!
const useClassFormStore = create(
  persist(
    (set) => ({
      className: '',
      gradeLevel: '',
      studentCount: 0,
      setClassName: (name) => set({ className: name }),
      // ... form field setters
    }),
    { name: 'class-form-store' }
  )
);
```

**Problem**: Form data is ephemeral. If user closes the form without saving, they probably don't want the stale data persisted.

**Solution**: Use `useState` in the form component until `onSubmit`, then save to global store.

---

### ❌ Anti-Pattern 3: Overly Granular State

```typescript
// BAD - Too many small stores!
const useTimerDurationStore = create((set) => ({...}));
const useTimerIsRunningStore = create((set) => ({...}));
const useTimerWarningStore = create((set) => ({...}));
```

**Problem**: Related state split across multiple stores makes dependencies unclear.

**Solution**: Group related state in a single, well-organized store.

---

## Phase-Specific Guidelines

### Phase 7: Class Management
When implementing the student list and class selection:
- ✅ Store: class name, student list, selected class (global + persisted)
- ✅ Store: currently selected student for random selection (global, not persisted)
- ✅ Local State: CSV import wizard steps (local to modal)
- ✅ Local State: form validation errors during student entry

### Phase 9: Group Generation
When implementing group generation with separation rules:
- ✅ Store: separation rules configuration (global + persisted)
- ✅ Store: generated groups after confirmation (global)
- ❌ Don't Store: preview groups before confirmation (use local state)
- ❌ Don't Store: generation algorithm progress (runs in Worker, returns result)

### Phase 12: Integration
When implementing cross-feature coordination:
- ✅ Store: orchestration events (special lightweight store)
- ✅ Hooks: custom hooks that subscribe to multiple stores
- ❌ Avoid: stores that depend on implementation details of other stores

---

## Testing Guidelines

### Testing Local State
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('modal opens/closes', async () => {
  const user = userEvent.setup();
  render(<MyModal />);

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await user.click(screen.getByText('Open'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  await user.click(screen.getByText('Close'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

### Testing Zustand Stores
```typescript
import { renderHook, act } from '@testing-library/react';
import { useClassStore } from '../stores/classStore';

test('should persist class selection', () => {
  const { result } = renderHook(() => useClassStore());

  act(() => {
    result.current.selectClass('Math 101');
  });

  expect(result.current.selectedClass).toBe('Math 101');
  const stored = JSON.parse(localStorage.getItem('class-store') || '{}');
  expect(stored.selectedClass).toBe('Math 101');
});
```

---

## Code Review Checklist

When reviewing code, ask:

- [ ] Is this state UI-only? → Should be `useState`
- [ ] Is it shared by 2+ components? → Should be `useState` in parent or Zustand
- [ ] Does it need to survive app restart? → Should use Zustand with `persist`
- [ ] Is it coordinating multiple features? → Consider orchestration service (Phase 12)
- [ ] Is it temporary (form preview, wizard step)? → Clear it when done
- [ ] Could this state be derived from other state? → Use a selector/memo instead

---

## References

- **CLAUDE.md**: State Management Architecture section
- **PROJECT_PLAN.md**: Phase 7 (Class Management), Phase 9 (Group Generation), Phase 12 (Integration)
- **Zustand Docs**: https://github.com/pmndrs/zustand
- **React State Management**: https://react.dev/learn/state-a-mental-model

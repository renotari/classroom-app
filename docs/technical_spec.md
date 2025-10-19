# Classroom Management Tool - Technical Specification

## Document Purpose
Complete technical specifications for implementing the Classroom Management Tool with Tauri 2.x, React 18.3, and TypeScript.

---

## Project Overview

**Target User:** Teachers with students aged 11-16
**Primary Use Case:** Teaching with OneNote on large interactive touchscreen (STI)
**Platform:** Windows (with cross-platform potential)

---

## Tech Stack

### Core Technologies
- **Framework:** Tauri 2.x
- **Frontend:** React 18.3+ (functional components, hooks)
- **Language:** TypeScript (strict mode)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand

### Project Setup
```bash
npm create tauri-app@latest classroom-management-tool
# Select: React, TypeScript
cd classroom-management-tool
npm install
```

### Key Dependencies
```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.x",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.x",
    "papaparse": "^5.x"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "tailwindcss": "^3.x",
    "vitest": "^1.x",
    "@testing-library/react": "^14.x",
    "playwright": "^1.x"
  }
}
```

---

## Application Modes

### 1. Overlay Mode (Minimized Widget)
- Small widget (~200px × 60px) always on top of OneNote
- Shows essential info: traffic light, timer countdown, noise level
- Draggable, positionable
- Click to expand controls

### 2. Fullscreen Mode
- Entire screen for maximum visibility
- Large elements readable from back of classroom
- ESC or F11 to exit
- Used for projection or whole-class viewing

### 3. Floating Windows (Optional)
- Timer Floating Window (min 1/10 screen)
- Noise Meter Floating Window (min 1/10 screen)
- Traffic Light Floating Window (min 1/10 screen)
- Each can be enabled/disabled independently
- Draggable, always-on-top

---

## Module Specifications

### Timer Module

#### Functionality
- Countdown timer with configurable duration
- Preset buttons: 5, 10, 15, 30 minutes
- Custom input for any duration
- Controls: Start, Pause, Stop, Reset
- Visual countdown display (MM:SS format)
- Warning alerts before timer ends (configurable: 2min, 5min)
- Sound alert when timer reaches zero

#### Implementation Details
```typescript
// useTimer hook
interface TimerState {
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

function useTimer() {
  const [state, setState] = useState<TimerState>({
    remainingSeconds: 0,
    isRunning: false,
    isPaused: false
  });
  
  // Update every second using setInterval
  // Cleanup on unmount
  // Trigger callbacks on warning/completion
}
```

#### UI Components
- `TimerView.tsx`: Main container
- `TimerDisplay.tsx`: Large time display
- `TimerControls.tsx`: Button controls
- `TimerPresets.tsx`: Quick preset buttons
- `FloatingTimer.tsx`: Optional floating window

#### Storage
- Last used duration persisted in localStorage
- Warning preferences saved

---

### Audio Module

#### Functionality
1. **Alert Sounds**: Play predefined sounds for events
   - Timer end
   - Attention request
   - Transition cues
2. **Background Music**: Play music during work time
   - User-selectable folder
   - Volume control
   - Play/Pause/Stop
3. **Audio Priority System**:
   - HIGH: Alerts (interrupt background music)
   - MEDIUM: Noise monitoring (continuous)
   - LOW: Background music (duckable)

#### **CRITICAL: Singleton AudioContext Pattern**

```typescript
// audioService.ts
class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext;
  private masterGain: GainNode;
  
  private constructor() {
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
  }
  
  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }
  
  public async playAlert(url: string): Promise<void> {
    // Duck background music
    // Play alert with Web Audio API
    // Restore background music after
  }
  
  public async playBackgroundMusic(url: string): Promise<void> {
    // Load and decode audio
    // Create source and gain nodes
    // Loop playback
  }
}

export const audioService = AudioService.getInstance();
```

#### Audio Implementation
- **ONLY Web Audio API** (no HTML5 `<audio>` elements)
- All audio routed through singleton AudioContext
- Ducking: Lower background music to 20% when alert plays
- Fade in/out for smooth transitions

#### UI Components
- `AudioPanel.tsx`: Main controls
- `SoundSelector.tsx`: Choose alert sounds
- `MusicPlayer.tsx`: Background music controls
- `VolumeControl.tsx`: Volume sliders

---

### Noise Monitoring Module

#### Functionality
- Real-time microphone input analysis
- Calculate and display noise level (0-100% or dB)
- Visual meter (bar or arc)
- Configurable thresholds:
  - Green zone: 0-60% (acceptable)
  - Yellow zone: 61-75% (getting loud)
  - Red zone: 76-100% (too loud)
- Optional alerts when threshold exceeded
- History chart (last 10 minutes)
- Calibration feature (measure baseline)

#### **CRITICAL: First-Time Permission Flow**
```
User opens app for first time
→ Onboarding screen explains why microphone needed
→ "Enable Noise Monitoring" button
→ Browser requests permission
→ If granted: proceed
→ If denied: graceful fallback (disable noise features)
```

#### Implementation with Web Audio API
```typescript
// audioMonitoringService.ts
class AudioMonitoringService {
  private analyser: AnalyserNode;
  private microphone: MediaStreamAudioSourceNode | null = null;
  
  async requestMicrophoneAccess(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = audioService.getContext(); // Use singleton!
      this.microphone = audioContext.createMediaStreamSource(stream);
      this.analyser = audioContext.createAnalyser();
      this.microphone.connect(this.analyser);
      return true;
    } catch (error) {
      // Permission denied or no microphone
      return false;
    }
  }
  
  getCurrentLevel(): number {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    return (average / 255) * 100; // Convert to percentage
  }
}
```

#### UI Components
- `NoiseMeterPanel.tsx`: Main controls
- `AudioLevelBar.tsx`: Visual meter
- `ThresholdConfig.tsx`: Configure zones
- `HistoryChart.tsx`: Timeline graph
- `FloatingNoiseMeter.tsx`: Optional floating window

---

### Traffic Light (Semaphore) Module

#### Functionality
- Three states:
  - 🔴 Red: Silent work, no talking
  - 🟡 Yellow: Quiet discussion allowed
  - 🟢 Green: Normal discussion/group work
- Manual control: Click to change state
- Auto mode: Change based on noise level
- Keyboard shortcuts: 1 (red), 2 (yellow), 3 (green)
- Fullscreen mode for projection
- Optional sound effect on state change

#### Auto Mode Logic
```typescript
interface AutoModeConfig {
  silentThreshold: number;    // < 60% → Green OK
  discussionThreshold: number; // 60-75% → Yellow
  loudThreshold: number;       // > 75% → Red
}

function autoUpdateSemaphore(noiseLevel: number, config: AutoModeConfig) {
  if (noiseLevel > config.loudThreshold) return 'red';
  if (noiseLevel > config.discussionThreshold) return 'yellow';
  return 'green';
}
```

#### UI Components
- `SemaphorePanel.tsx`: Main controls
- `SemaphoreDisplay.tsx`: Large traffic light
- `SemaphoreControls.tsx`: Manual buttons
- `AutoModeConfig.tsx`: Configure thresholds
- `FullscreenSemaphore.tsx`: Fullscreen view
- `FloatingSemaphore.tsx`: Optional floating window

---

### Class & Student Management Module

#### Data Models
```typescript
interface Student {
  id: string;
  name: string;
  present: boolean;
  points?: number; // Optional for Points System
}

interface Class {
  id: string;
  name: string;
  students: Student[];
  createdAt: Date;
  updatedAt: Date;
}

interface SeparationRule {
  studentId1: string;
  studentId2: string;
  type: 'must_separate' | 'prefer_separate';
  reason?: string;
}
```

#### CSV Import
- Use Papaparse library
- Configuration:
  ```typescript
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    delimitersToGuess: [',', '\t', '|', ';'],
    transformHeader: (header) => header.trim() // Strip whitespace
  });
  ```
- Encoding detection (UTF-8, ISO-8859-1, Windows-1252)
- Validation:
  - Max 30 students per class
  - Required field: name
  - Unique names (or generate IDs)
- Error handling with user-friendly messages

#### Mark Absences
- Checklist UI with all students
- Toggle present/absent
- Visual indicator (checkmark/X)
- Persist daily attendance

---

### Random Student Selection Module

#### Algorithm
```typescript
function selectRandomStudent(students: Student[], history: string[] = []): Student {
  // Filter out absent students
  const presentStudents = students.filter(s => s.present);
  
  // Optionally avoid recent selections (last 5)
  const eligibleStudents = presentStudents.filter(s => !history.slice(-5).includes(s.id));
  
  // True random using crypto API
  const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % eligibleStudents.length;
  
  return eligibleStudents[randomIndex];
}
```

#### Animation
- Slot machine effect: names cycle rapidly then slow down
- Duration: 2-3 seconds
- Sound effect optional
- Display selected name prominently

---

### Group Generation Module

#### Algorithm
```typescript
function generateGroups(
  students: Student[],
  groupSize: number,
  separationRules: SeparationRule[]
): { groups: Student[][], violations: SeparationRule[] } {
  
  const maxAttempts = 10;
  let bestGroups: Student[][] = [];
  let bestViolations: SeparationRule[] = [];
  let minViolations = Infinity;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Shuffle students randomly
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    
    // Divide into groups
    const groups: Student[][] = [];
    for (let i = 0; i < shuffled.length; i += groupSize) {
      groups.push(shuffled.slice(i, i + groupSize));
    }
    
    // Check violations
    const violations = checkViolations(groups, separationRules);
    
    // Track best attempt
    if (violations.length < minViolations) {
      minViolations = violations.length;
      bestGroups = groups;
      bestViolations = violations;
    }
    
    // Perfect solution found
    if (violations.length === 0) break;
  }
  
  return { groups: bestGroups, violations: bestViolations };
}

function checkViolations(groups: Student[][], rules: SeparationRule[]): SeparationRule[] {
  const violations: SeparationRule[] = [];
  
  for (const group of groups) {
    const studentIds = group.map(s => s.id);
    
    for (const rule of rules) {
      if (studentIds.includes(rule.studentId1) && studentIds.includes(rule.studentId2)) {
        violations.push(rule);
      }
    }
  }
  
  return violations;
}
```

#### Violation Report
After generation, display:
- Number of violations
- List each violation: "Group 3: Maria and Luca (must separate)"
- Options: "Regenerate" or "Accept Anyway"
- Differentiate priority rules (MUST separate) vs soft rules (PREFER separate)

---

## Window Management (Tauri)

### Configuration (tauri.conf.json)
```json
{
  "tauri": {
    "windows": [{
      "title": "Classroom Tool",
      "width": 1200,
      "height": 800,
      "resizable": true,
      "fullscreen": false,
      "decorations": false,
      "alwaysOnTop": true,
      "transparent": true
    }]
  }
}
```

### Commands (Rust)
```rust
// src-tauri/src/commands.rs
#[tauri::command]
fn toggle_always_on_top(window: tauri::Window, on_top: bool) -> Result<(), String> {
    window.set_always_on_top(on_top).map_err(|e| e.to_string())
}

#[tauri::command]
fn set_fullscreen(window: tauri::Window, fullscreen: bool) -> Result<(), String> {
    window.set_fullscreen(fullscreen).map_err(|e| e.to_string())
}
```

---

## Performance Considerations

### Targets
- Memory usage: <100MB RAM
- CPU idle: <5%
- Response time: <100ms for all actions
- Startup time: <3 seconds
- Uptime: 8+ hours without crash or memory leak

### Optimization Strategies
1. **React Performance**:
   - Use `React.memo` for expensive components
   - `useMemo` for heavy calculations
   - `useCallback` for callbacks passed as props
   - Avoid unnecessary re-renders

2. **Audio Performance**:
   - Reuse AudioContext (singleton!)
   - Decode audio buffers once, cache them
   - Use GainNode for volume instead of recreating sources

3. **Memory Management**:
   - Cleanup intervals/timers in useEffect
   - Remove event listeners on unmount
   - Clear large data structures when not needed
   - Test for memory leaks with 8+ hour runs

---

## Testing Strategy

### Unit Tests (Vitest)
- All custom hooks
- All services (especially audioService singleton!)
- Algorithms (group generation, random student)
- Utility functions
- Target: >70% coverage

### Integration Tests (React Testing Library)
- Timer → Audio integration
- Noise → Semaphore integration
- CSV import → student list
- State management flows

### E2E Tests (Playwright)
- Complete lesson scenario
- CSV import flow
- First-time microphone permission
- Floating windows interactions
- 8-hour memory leak test

---

## Security & Privacy

- Microphone access only when noise monitoring enabled
- No data sent to external servers
- All data stored locally
- CSV files read-only (no write access outside app folder)
- No telemetry or analytics

---

## Deployment

### Windows Build
```bash
npm run tauri build
```
Produces:
- `.msi` installer (~5-10MB)
- Portable `.exe`

### Distribution
- GitHub Releases
- Direct download link
- Optional: Windows Store (future)

---

## Reference Documents
- UI/UX Spec: `ui-ux-spec.md`
- User Stories: `user-stories.md`
- Edge Cases: `edge-cases.md`
- Feature Map: `feature-map.md`
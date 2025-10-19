# Classroom Management Tool - Edge Cases & Solutions

## Document Purpose
Comprehensive list of 15 identified edge cases, categorized by priority, with proposed solutions.

---

## Priority Levels

- **🔴 CRITICAL**: Must be handled before MVP. Blocks core functionality.
- **🟡 IMPORTANT**: Should be handled soon. Impacts user experience significantly.
- **🟢 NICE-TO-HAVE**: Can be deferred to v2. Low impact or rare occurrence.

---

## CRITICAL Edge Cases (5)

### EC-000: First-Time Microphone Permission

**Priority**: 🔴 CRITICAL (ADDED after review)

**Scenario**: User opens app for first time. Browser needs microphone permission but user doesn't understand why.

**Problem**:
- Abrupt permission request confuses user
- User might deny without understanding consequence
- No way to recover if denied

**Solution**:
```
Onboarding Flow:
1. Show welcome screen explaining features
2. Dedicated screen: "Noise Monitoring" with:
   - Icon + explanation: "Monitor classroom noise levels in real-time"
   - Benefits: "Get visual feedback, automatic semaphore"
   - Button: "Enable Noise Monitoring"
3. Click button → Browser requests permission
4. If granted: proceed
5. If denied: Show message with instructions to enable later
```

**Implementation**:
- `OnboardingFlow.tsx` component
- `MicrophonePermission.tsx` screen
- Persist "onboarding completed" flag
- Don't block app startup if permission denied

**Test**:
- Scenario 1: Grant permission → works
- Scenario 2: Deny permission → fallback message shown, other features work

---

### EC-001: Microphone Not Available / Permission Denied

**Priority**: 🔴 CRITICAL

**Scenario**: 
- No microphone attached to computer
- User denied permission (after initial onboarding)
- Microphone in use by another app

**Problem**: Noise monitoring completely non-functional

**Solution**:
```typescript
async function initializeAudioMonitoring() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Success: Initialize noise monitoring
    return { success: true, stream };
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // Permission denied
      showMessage("Microphone access denied. Noise monitoring disabled. You can grant permission in browser settings.");
    } else if (error.name === 'NotFoundError') {
      // No microphone
      showMessage("No microphone detected. Noise monitoring requires a microphone.");
    } else {
      // Other error
      showMessage("Could not access microphone. Noise monitoring disabled.");
    }
    // Disable noise monitoring features
    return { success: false, error };
  }
}
```

**Fallback**:
- Disable noise meter UI (gray out)
- Disable semaphore auto mode
- Show "Microphone required" badge
- Allow user to retry

**Test**:
- Unplug microphone → See "No microphone" message
- Deny permission → See permission denied message
- Microphone in use → See error message

---

### EC-002: Windows Outside Screen Bounds

**Priority**: 🔴 CRITICAL

**Scenario**: 
- User has floating windows positioned on second monitor
- User disconnects second monitor
- Windows now positioned off-screen (negative coordinates)

**Problem**: Windows invisible and unreachable

**Solution**:
```typescript
function validateWindowPosition(x: number, y: number, width: number, height: number) {
  const screens = window.screen;
  const maxX = screens.availWidth;
  const maxY = screens.availHeight;
  
  // Check if window is completely off-screen
  if (x + width < 0 || x > maxX || y + height < 0 || y > maxY) {
    // Reset to safe default position
    return { x: 100, y: 100 };
  }
  
  // Check if window is partially off-screen
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x + width > maxX) x = maxX - width;
  if (y + height > maxY) y = maxY - height;
  
  return { x, y };
}

// On app startup
function restoreWindowPositions() {
  const saved = localStorage.getItem('windowPositions');
  if (saved) {
    const positions = JSON.parse(saved);
    for (const [windowId, pos] of Object.entries(positions)) {
      const validated = validateWindowPosition(pos.x, pos.y, pos.width, pos.height);
      positionWindow(windowId, validated.x, validated.y);
    }
  }
}
```

**Test**:
- Save position on monitor 2
- Disconnect monitor 2
- Restart app → Windows appear on primary monitor

---

### EC-003: Multiple App Instances

**Priority**: 🔴 CRITICAL

**Scenario**: User accidentally opens app twice (double-click, system glitch)

**Problem**:
- Two instances competing for microphone
- Conflicting AudioContext instances
- Double alerts/sounds
- State synchronization issues

**Solution Option 1 - Single Instance Lock** (Tauri):
```rust
// src-tauri/src/main.rs
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            // If second instance detected, focus first instance
            println!("Second instance detected, focusing first");
            if let Some(window) = app.get_window("main") {
                window.set_focus().unwrap();
            }
        }))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Solution Option 2 - Detect and Warn**:
```typescript
// Use localStorage timestamp to detect concurrent instances
function checkMultipleInstances() {
  const instanceKey = 'app_instance_timestamp';
  const now = Date.now();
  const lastSeen = localStorage.getItem(instanceKey);
  
  if (lastSeen && (now - parseInt(lastSeen)) < 5000) {
    // Another instance was active <5 seconds ago
    showWarning("Another instance of the app is already running. Running multiple instances may cause issues.");
  }
  
  // Update timestamp every 2 seconds
  setInterval(() => {
    localStorage.setItem(instanceKey, Date.now().toString());
  }, 2000);
}
```

**Test**:
- Open app twice → Second instance either blocked or shows warning

---

### EC-004: Memory Leak with 8+ Hour Usage

**Priority**: 🔴 CRITICAL

**Scenario**: Teacher leaves app running all day (8+ hours). Memory usage grows continuously.

**Problem**: 
- App eventually crashes or slows down
- System performance degraded

**Solution**:
```typescript
// Common causes of memory leaks in React/Tauri apps:

// 1. Event listeners not cleaned up
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler); // ✅ Cleanup
}, []);

// 2. Timers not cleared
useEffect(() => {
  const interval = setInterval(() => { /* ... */ }, 1000);
  return () => clearInterval(interval); // ✅ Cleanup
}, []);

// 3. Audio nodes not disconnected
function stopAudio() {
  if (currentSource) {
    currentSource.stop();
    currentSource.disconnect(); // ✅ Cleanup
    currentSource = null;
  }
}

// 4. Large data structures not cleared
function clearHistory() {
  // Instead of keeping infinite history
  if (noiseLevelHistory.length > 600) { // 10 min at 1 sample/sec
    noiseLevelHistory = noiseLevelHistory.slice(-600); // ✅ Limit size
  }
}

// 5. Circular references in stores
// Use Zustand's built-in cleanup mechanisms
const useStore = create((set, get) => ({
  // Avoid storing functions that reference the store itself
}));
```

**Testing**:
```typescript
// Memory leak test
test('no memory leak after 8 hours', async () => {
  const initialMemory = performance.memory.usedJSHeapSize;
  
  // Simulate 8 hours of usage
  for (let hour = 0; hour < 8; hour++) {
    // Perform typical operations
    await simulateOneHourUsage();
    
    // Check memory
    const currentMemory = performance.memory.usedJSHeapSize;
    const growth = ((currentMemory - initialMemory) / initialMemory) * 100;
    
    expect(growth).toBeLessThan(50); // Max 50% growth allowed
  }
});
```

**Monitoring**:
- Add memory usage display in dev mode
- Log memory stats every hour
- Alert if memory > 100MB

---

## IMPORTANT Edge Cases (4)

### EC-005: Audio Files Missing or Corrupted

**Priority**: 🟡 IMPORTANT

**Scenario**: 
- User deletes sound files from `/public/sounds/`
- Audio file corrupted
- Wrong file format

**Problem**: Alert sounds don't play, silent failures

**Solution**:
```typescript
async function loadAudioFile(url: string): Promise<AudioBuffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Audio file not found: ${url}`);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (error) {
    console.error(`Failed to load audio file ${url}:`, error);
    
    // Fallback: Generate tone
    return generateBeepTone(440, 0.5); // 440Hz, 0.5 seconds
  }
}

function generateBeepTone(frequency: number, duration: number): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }
  
  return buffer;
}
```

**UI Feedback**:
- Show warning icon if default sounds fail to load
- Allow user to re-select sound files
- Fallback to generated beep tone

**Test**:
- Delete sound file → App generates beep instead
- Corrupt file → App handles gracefully, generates beep

---

### EC-006: CSV Import with Encoding/Dirty Data

**Priority**: 🟡 IMPORTANT

**Scenario**:
- CSV has Italian characters (è, à, ò, ù)
- CSV uses semicolon instead of comma
- CSV has extra whitespace, empty rows
- CSV has more than 30 students

**Problem**: Import fails or data corrupted

**Solution**:
```typescript
import Papa from 'papaparse';

async function importCSV(file: File): Promise<{ success: boolean; students: Student[]; errors: string[] }> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimitersToGuess: [',', '\t', '|', ';'],
      encoding: 'UTF-8', // Try UTF-8 first
      transformHeader: (header) => header.trim(), // Remove whitespace
      complete: (results) => {
        const errors: string[] = [];
        
        // Validate data
        if (results.data.length === 0) {
          errors.push("CSV file is empty");
          return resolve({ success: false, students: [], errors });
        }
        
        if (results.data.length > 30) {
          errors.push(`Too many students (${results.data.length}). Maximum is 30.`);
          return resolve({ success: false, students: [], errors });
        }
        
        // Process students
        const students: Student[] = results.data.map((row: any, index) => {
          const name = row.name || row.Name || row.nome || row.student;
          
          if (!name || name.trim() === '') {
            errors.push(`Row ${index + 1}: Missing student name`);
            return null;
          }
          
          return {
            id: crypto.randomUUID(),
            name: name.trim(),
            present: true
          };
        }).filter(Boolean);
        
        resolve({ success: errors.length === 0, students, errors });
      },
      error: (error) => {
        // Try different encoding
        if (file.type === 'text/csv') {
          // Retry with Windows-1252 encoding
          readFileWithEncoding(file, 'Windows-1252').then(/* ... */);
        } else {
          resolve({ success: false, students: [], errors: [error.message] });
        }
      }
    });
  });
}
```

**UI**:
- Show preview of imported data before confirming
- Display warnings/errors clearly
- Allow user to fix issues and retry

**Test**:
- CSV with Italian names → Imports correctly
- CSV with semicolons → Detects and parses
- CSV with 35 students → Shows error
- CSV with empty rows → Skips them

---

### EC-007: Separation Rules Impossible to Satisfy

**Priority**: 🟡 IMPORTANT

**Scenario**: 
- Class of 12 students, generate 3 groups of 4
- 5 separation rules: A-B, A-C, A-D, A-E, A-F (A cannot be with 5 people)
- Mathematically impossible to satisfy all rules with groups of 4

**Problem**: Algorithm fails or infinite loop

**Solution**:
```typescript
function generateGroupsWithReport(
  students: Student[],
  groupSize: number,
  rules: SeparationRule[],
  maxAttempts = 10
): GroupGenerationResult {
  
  // Pre-check: Detect impossible constraints
  const impossibleStudents = detectImpossibleConstraints(students, groupSize, rules);
  if (impossibleStudents.length > 0) {
    return {
      success: false,
      groups: [],
      violations: [],
      warning: `Impossible to satisfy all rules. Student(s) ${impossibleStudents.join(', ')} have too many separation rules.`
    };
  }
  
  // Run algorithm with attempts
  let bestResult = { groups: [], violations: rules };
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = generateOneAttempt(students, groupSize, rules);
    
    if (result.violations.length < bestResult.violations.length) {
      bestResult = result;
    }
    
    if (result.violations.length === 0) {
      return { success: true, ...result };
    }
  }
  
  // Return best attempt with violations report
  return {
    success: false,
    ...bestResult,
    warning: `Could not satisfy all rules after ${maxAttempts} attempts. ${bestResult.violations.length} rule(s) violated.`
  };
}

function detectImpossibleConstraints(
  students: Student[],
  groupSize: number,
  rules: SeparationRule[]
): string[] {
  const impossible: string[] = [];
  
  for (const student of students) {
    const rulesForStudent = rules.filter(r => 
      r.studentId1 === student.id || r.studentId2 === student.id
    );
    
    // If student has separation rules with (groupSize - 1) or more people,
    // it's impossible to form a group
    if (rulesForStudent.length >= groupSize) {
      impossible.push(student.name);
    }
  }
  
  return impossible;
}
```

**UI**:
- Show violation report after generation
- Highlight which rules violated
- Offer "Regenerate" button
- Show warning if rules are impossible

**Test**:
- 12 students, 5 rules on one student → Detects impossible
- 12 students, 2 rules → Finds solution

---

### EC-008: AudioContext Conflicts

**Priority**: 🟡 IMPORTANT

**Scenario**: 
- Developer accidentally creates multiple AudioContext instances
- Timer module creates one, Audio module creates another
- Noise monitoring creates a third

**Problem**: 
- Increased memory usage
- Audio glitches
- Performance degradation

**Solution**: **Enforce singleton pattern**

```typescript
// ❌ BAD - Multiple instances
const ctx1 = new AudioContext(); // In timerService
const ctx2 = new AudioContext(); // In audioService
const ctx3 = new AudioContext(); // In noiseService

// ✅ GOOD - Singleton
// audioService.ts
class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext;
  
  private constructor() {
    this.audioContext = new AudioContext();
  }
  
  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }
  
  public getContext(): AudioContext {
    return this.audioContext;
  }
}

// All modules use singleton
const audioService = AudioService.getInstance();
const context = audioService.getContext();
```

**Testing**:
```typescript
// Unit test to enforce singleton
describe('AudioService Singleton', () => {
  it('should return same instance', () => {
    const instance1 = AudioService.getInstance();
    const instance2 = AudioService.getInstance();
    expect(instance1).toBe(instance2); // Same object
  });
  
  it('should have only one AudioContext', () => {
    const instance1 = AudioService.getInstance();
    const instance2 = AudioService.getInstance();
    expect(instance1.getContext()).toBe(instance2.getContext());
  });
});
```

**Code Review Check**:
- Search codebase for `new AudioContext()`
- Should only appear ONCE (in audioService.ts constructor)
- All other modules import and use singleton

---

## NICE-TO-HAVE Edge Cases (6)

### EC-009: Class Larger Than 30 Students

**Priority**: 🟢 NICE-TO-HAVE

**Scenario**: Teacher has class of 35 students, tries to import

**Solution**: 
- Hard limit at 30 during import
- Show error: "Maximum 30 students per class"
- Suggest splitting into multiple classes

### EC-010: Too Many Custom Audio Files

**Priority**: 🟢 NICE-TO-HAVE

**Scenario**: User uploads 100+ custom sounds

**Solution**:
- Limit to 50 custom files
- Show warning if approaching limit

### EC-011: Keyboard Shortcut Conflicts

**Priority**: 🟢 NICE-TO-HAVE

**Scenario**: App shortcuts conflict with OS or OneNote shortcuts

**Solution**:
- Use uncommon shortcuts (1/2/3 for semaphore, F11 for fullscreen)
- Make shortcuts customizable in settings

### EC-012: Theme Change During Animation

**Priority**: 🟢 NICE-TO-HAVE

**Scenario**: User changes theme while random student animation running

**Solution**:
- Complete animation with old theme, then apply new theme
- Or: Cancel animation and show result immediately with new theme

### EC-013: All 3 Floating Windows Overlap

**Priority**: 🟢 NICE-TO-HAVE

**Scenario**: User opens all 3 floating windows, they overlap

**Solution**:
- Smart positioning: Timer (top-left), Noise (top-right), Semaphore (bottom-right)
- "Arrange Windows" button to auto-position

### EC-014: Background Music Interrupted by Alert

**Priority**: 🟢 NICE-TO-HAVE

**Scenario**: Background music playing, timer alert plays

**Solution**: 
- **Already handled**: Audio priority system
- Music ducks to 20% during alert
- Fades back to full volume after alert

### EC-015: Timer State After App Crash

**Priority**: 🟢 NICE-TO-HAVE (ACCEPTED AS-IS)

**Scenario**: Timer is running, app crashes or force-closed, user restarts

**Solution**: 
- **Accepted**: Timer resets to 00:00
- Not worth complexity of crash recovery for timer state
- Teacher can restart timer if needed

---

## Edge Case Coverage Matrix

| Phase | Critical | Important | Nice-to-Have |
|-------|----------|-----------|--------------|
| 1-2   | EC-002, EC-003 | - | - |
| 4     | - | EC-005, EC-008 | EC-014 |
| 5     | EC-000, EC-001, EC-004 | - | - |
| 7     | - | EC-006 | EC-009, EC-010 |
| 8     | - | - | - |
| 9     | - | EC-007 | - |
| 13    | - | - | EC-011, EC-012, EC-013 |
| 14    | Test all Critical | Test all Important | Evaluate |

---

## Summary

- **5 CRITICAL**: Must handle before MVP launch
- **4 IMPORTANT**: Handle during development
- **6 NICE-TO-HAVE**: Evaluate for v2 or accept as limitations

Total edge cases documented: **15**
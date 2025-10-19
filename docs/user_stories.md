# Classroom Management Tool - User Stories

## Purpose
This document describes real-world usage scenarios for the Classroom Management Tool from a teacher's perspective.

---

## User Persona

**Name:** Marco
**Role:** Middle school teacher (students aged 11-16)
**Context:** Uses OneNote on large interactive touchscreen (STI) for lessons
**Tech Level:** Comfortable with technology but wants simple tools
**Class Size:** 20-25 students typically

---

## Morning Setup Stories

### Story 1: First Time Using the App
**As a teacher**, when I open the app for the first time, I want a clear onboarding experience so I understand what the app can do.

**Acceptance Criteria**:
- Welcome screen explains main features
- Microphone permission request is clear and explains why it's needed
- Tutorial is skippable
- I can start using the app immediately after

**User Journey**:
1. Opens app
2. Sees welcome screen with brief explanation
3. Clicks "Enable Noise Monitoring"
4. Browser asks for microphone permission → Grants it
5. Clicks "Start Tutorial" or "Skip"
6. App opens to Timer tab

---

### Story 2: Importing Class List
**As a teacher**, I want to import my class list from a CSV file so I don't have to type all student names manually.

**Acceptance Criteria**:
- CSV import accepts common formats (comma, tab, semicolon separated)
- Handles different encodings (UTF-8, Windows-1252)
- Shows preview before confirming
- Validates data (max 30 students, required fields)
- Clear error messages if file is malformed

**User Journey**:
1. Goes to Class tab
2. Clicks "Import CSV"
3. Selects file from computer
4. Sees preview of 24 students
5. Clicks "Confirm Import"
6. Students appear in class list

---

## During Lesson Stories

### Story 3: Timed Independent Work
**As a teacher**, I want to set a 30-minute timer for independent work so students know how long they have.

**Acceptance Criteria**:
- Can set timer in seconds
- Large, readable countdown
- Alert (sound + visual) when timer ends
- Can pause if needed (e.g., for a question)

**User Journey**:
1. Clicks Timer tab
2. Clicks "30 min" preset button
3. Clicks Start
4. Timer counts down visibly
5. Continues teaching while timer runs
6. At 00:00 → Sound plays + visual alert
7. Clicks Stop to dismiss alert

---

### Story 4: Managing Classroom Noise
**As a teacher**, I want to monitor noise levels during group work so I can intervene if it gets too loud.

**Acceptance Criteria**:
- Real-time noise meter updates smoothly
- Color-coded zones (green/yellow/red) are clear
- Can set thresholds based on my classroom
- Optional floating window shows meter during other activities

**User Journey**:
1. Students start group work
2. Sets traffic light to Yellow (quiet discussion OK)
3. Enables noise monitoring
4. Checks meter occasionally - currently in green zone (good)
5. Meter goes to yellow - students getting a bit loud
6. Meter goes to red - teacher intervenes: "Let's lower voices, please"
7. Meter returns to yellow/green

---

### Story 5: Auto Semaphore with Noise
**As a teacher**, I want the traffic light to change automatically based on noise level so students get immediate visual feedback.

**Acceptance Criteria**:
- Can enable "Auto mode"
- Configure noise thresholds for each semaphore state
- Semaphore changes in real-time based on noise
- Can override manually if needed

**User Journey**:
1. Before group work, sets semaphore to Auto mode
2. Configures: Green if <60%, Yellow if 60-75%, Red if >75%
3. Students work, noise gradually increases
4. Semaphore changes Green → Yellow → Red automatically
5. Students see red light, lower voices without teacher intervention
6. Semaphore returns to Yellow/Green

---

### Story 6: Random Student Selection
**As a teacher**, I want to randomly select a student to answer a question so it's fair and unbiased.

**Acceptance Criteria**:
- Excludes absent students
- Shows animation (fun but not distracting)
- Selected student's name is large and clear
- History prevents same student being picked repeatedly

**User Journey**:
1. Asks a question to the class
2. Goes to Class tab → Random Student
3. Clicks "Pick Random Student"
4. Names cycle quickly for 2 seconds
5. Lands on "Marco"
6. Calls on Marco to answer

---

### Story 7: Generate Groups for Activity
**As a teacher**, I want to generate random groups of 4 students for a project, ensuring certain students aren't together.

**Acceptance Criteria**:
- Specify group size (2-6 students)
- Separation rules prevent specific pairings
- Shows generated groups clearly
- Can regenerate if not satisfied
- Report shows if any rules violated

**User Journey**:
1. Before lesson, adds separation rules:
   - "Luca and Maria shouldn't be together" (must separate)
   - "Andrea and Sofia shouldn't be together" (prefer separate)
2. During lesson, goes to Class tab → Generate Groups
3. Sets group size: 4
4. Clicks "Generate"
5. Algorithm tries 10 times, finds solution with 0 violations
6. Shows 6 groups of 4 students each
7. Projects groups on screen for students to see

---

## Special Situations Stories

### Story 8: Handling Absent Students
**As a teacher**, I want to mark absent students so they're excluded from random selection and group generation.

**Acceptance Criteria**:
- Quick checklist UI to mark absences
- Absent students grayed out or hidden
- Random student excludes absent
- Group generation excludes absent

**User Journey**:
1. Start of class, goes to Class tab → Mark Absences
2. Sees checklist of all 24 students
3. Unchecks "Giovanni" and "Francesca" (absent today)
4. Later, clicks Random Student → Giovanni and Francesca never appear
5. Generates groups → only 22 present students included

---

### Story 9: Fullscreen Timer for Test
**As a teacher**, during a timed test, I want to show a large countdown on the projector so all students can see time remaining.

**Acceptance Criteria**:
- Fullscreen mode shows only timer (no other UI)
- Font size readable from back of room
- ESC or F11 to exit fullscreen

**User Journey**:
1. Test begins
2. Sets timer to 45 minutes
3. Clicks fullscreen button (or presses F11)
4. Entire projector shows 45:00 in huge font
5. Teacher can continue using computer for other tasks
6. At 00:00, alert sound plays
7. Presses ESC to exit fullscreen

---

### Story 10: Background Music During Work
**As a teacher**, I want to play calm background music during independent work to create a focused atmosphere.

**Acceptance Criteria**:
- Select music from folder on computer
- Volume control separate from alerts
- Play/Pause/Stop controls
- Music ducks (lowers) when alert sounds play

**User Journey**:
1. Students begin independent work
2. Goes to Audio tab
3. Clicks "Select Music Folder" → chooses ~/Music/ClassroomPlaylist
4. Selects "Calm Piano" track
5. Sets volume to 30%
6. Clicks Play
7. Music plays softly in background
8. Timer ends → Alert plays at full volume, music lowers to 20%
9. After alert, music returns to 30%

---

## End of Day Stories

### Story 11: Reviewing the Day
**As a teacher**, at end of day, I want to save my class configuration so I don't have to reconfigure everything tomorrow.

**Acceptance Criteria**:
- Settings auto-save (theme, thresholds, presets)
- Class data persists (students, separation rules)
- Attendance resets daily (but class roster stays)

**User Journey**:
1. End of day, closes app
2. Next day, opens app
3. Class list still there (24 students)
4. Separation rules still configured
5. Noise thresholds still set to preferred values
6. Attendance reset to all present (has to mark absences again)
7. Theme still set to "Blue Serenity"

---

## Edge Case Stories

### Story 12: Microphone Permission Denied
**As a teacher**, if I accidentally deny microphone permission, I want to understand what happened and how to fix it.

**Acceptance Criteria**:
- Clear message explains consequence (noise monitoring disabled)
- Instructions to grant permission in browser settings
- Fallback: Can use other features (timer, semaphore manual mode, etc.)

**User Journey**:
1. First time, clicks "Enable Noise Monitoring"
2. Browser asks permission → Clicks "Block"
3. App shows message: "Microphone access denied. Noise monitoring disabled. You can still use Timer, Manual Semaphore, and other features. To enable noise monitoring later, grant permission in browser settings."
4. Continues using app without noise monitoring

---

### Story 13: CSV File Has Errors
**As a teacher**, if my CSV file has issues (wrong encoding, missing data), I want to understand what's wrong and how to fix it.

**Acceptance Criteria**:
- Detects common issues (encoding, format, too many students)
- Shows specific error message
- Suggests fix

**User Journey**:
1. Tries to import CSV with Italian characters (è, à, ò)
2. App detects encoding issue
3. Shows message: "File encoding detected as Windows-1252. Attempting to read..."
4. Successfully imports with correct encoding
5. Names display correctly (Nicolò, Martìn)

---

### Story 14: App Left Running Overnight
**As a teacher**, if I forget to close the app and it runs overnight, I want it to still work the next day without crashing.

**Acceptance Criteria**:
- No memory leaks after 8+ hours
- Performance remains consistent
- No crashes

**User Journey**:
1. Friday afternoon, leaves school with app open
2. Monday morning, returns
3. App still running, responsive
4. Memory usage still <100MB
5. Continues using app normally

---

### Story 15: Multiple Floating Windows Open
**As a teacher**, if I enable all floating windows (timer, noise, semaphore), I want them positioned logically without overlapping important content.

**Acceptance Criteria**:
- Each window draggable independently
- Remember positions
- Don't overlap each other by default
- Can minimize/close individually

**User Journey**:
1. Enables Timer floating window → appears top-left
2. Enables Noise Meter floating window → appears top-right
3. Enables Semaphore floating window → appears bottom-right
4. Drags Timer to preferred position
5. Next lesson, windows remember positions
6. Closes Noise Meter (not needed today)
7. Timer and Semaphore still visible

---

## Success Metrics

After using the app for one week, Marco reports:
- ✅ Saves 5-10 minutes per lesson (no manual timer watching, instant group generation)
- ✅ Students more aware of noise levels (visual feedback from semaphore)
- ✅ Fairer student participation (random selection removes bias)
- ✅ Less interruptions to check time or manage groups
- ✅ More focus on teaching, less on logistics

---

These user stories guide feature implementation and ensure the tool solves real classroom management problems.
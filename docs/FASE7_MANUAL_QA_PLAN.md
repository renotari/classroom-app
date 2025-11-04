# FASE 7 - Manual QA Test Plan
## Class & Students Management Feature

**Version**: 1.0
**Date**: 2025-11-04
**Tester**: _____________
**Environment**: Development (`npm run dev`)
**Browser**: Chrome/Firefox/Edge

---

## 🎯 Test Objectives

1. Verify all Class Management CRUD operations work correctly
2. Validate CSV import with various edge cases (EC-006, EC-009)
3. Test absence tracking functionality
4. Confirm data persistence across app restarts
5. Verify UI responsiveness and error handling

---

## ✅ Pre-Test Setup

### Step 1: Start Development Server
```bash
cd classroom-app
npm run dev
```
Expected: Server starts on http://localhost:1420

### Step 2: Open Application
- Open browser to http://localhost:1420
- Verify app loads without console errors (F12 → Console)

### Step 3: Navigate to Class Tab
- Click the "👥 Class" tab in the navigation bar
- Verify tab is active and content loads

---

## 📝 Test Scenarios

## Scenario 1: First-Time User Experience

### Test 1.1: Empty State
**Steps**:
1. Navigate to Class tab
2. Observe empty state

**Expected Results**:
- ✅ Message: "Nessuna classe selezionata"
- ✅ Icon: 👥 displayed
- ✅ Button: "Gestisci Classi" visible
- ✅ Suggestion text: "Crea o seleziona una classe per iniziare"

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

---

## Scenario 2: Class Creation & Management

### Test 2.1: Create First Class
**Steps**:
1. Click "Gestisci Classi" button
2. Modal opens with title "Gestisci Classi"
3. In "Nuova Classe" section, enter "3A Matematica"
4. Click "Aggiungi" button

**Expected Results**:
- ✅ Modal opens smoothly
- ✅ Input field accepts text
- ✅ New class appears in "Classi Esistenti" section
- ✅ Shows "3A Matematica (0 studenti)"
- ✅ Close button (X) works

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 2.2: Create Multiple Classes
**Steps**:
1. Open "Gestisci Classi" modal
2. Add "3B Scienze"
3. Add "2A Storia"
4. Close modal

**Expected Results**:
- ✅ All 3 classes visible in list
- ✅ Each shows "(0 studenti)"
- ✅ Edit and Delete buttons visible for each

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 2.3: Rename Class
**Steps**:
1. Open "Gestisci Classi"
2. Click edit (pencil) icon on "3A Matematica"
3. Change name to "3A Matematica Avanzata"
4. Click "Salva"

**Expected Results**:
- ✅ Input field appears with current name
- ✅ "Salva" and "Annulla" buttons appear
- ✅ Name updates after clicking "Salva"
- ✅ ESC key cancels edit

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 2.4: Delete Class with Confirmation
**Steps**:
1. Open "Gestisci Classi"
2. Click delete (trash) icon on "2A Storia"
3. Click "Conferma"

**Expected Results**:
- ✅ Confirmation buttons appear: "Conferma", "Annulla"
- ✅ After confirm, class removed from list
- ✅ Remaining classes still visible
- ✅ "Annulla" cancels deletion

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

---

## Scenario 3: CSV Import - Valid Cases

### Test 3.1: Import Valid CSV (Semicolon Delimiter)
**Preparation**:
- Download template: http://localhost:1420/template_studenti.csv
- Or create file: `test_class.csv`
```csv
nome;cognome;classe
Mario;Rossi;3A
Giulia;Bianchi;3A
Luca;Verdi;3A
```

**Steps**:
1. Select "3A Matematica Avanzata" from dropdown
2. Go to "Panoramica" tab
3. Click "Importa Studenti da CSV"
4. Select `test_class.csv`
5. Verify preview shows 3 students
6. Click "Importa (3)"

**Expected Results**:
- ✅ File picker opens
- ✅ File name displayed after selection
- ✅ Preview table shows:
  - # | Nome | Cognome
  - 1 | Mario | Rossi
  - 2 | Giulia | Bianchi
  - 3 | Luca | Verdi
- ✅ No errors shown
- ✅ Success message: "✓ 3 studenti importati con successo!"
- ✅ Modal closes automatically after 1.5 seconds

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 3.2: Import CSV with Italian Characters (EC-006)
**Preparation**: Create `italian_names.csv`
```csv
nome;cognome
José;García
Nicolò;Martìn
André;Müller
Marie-Claire;O'Connor
```

**Steps**:
1. Import file
2. Verify all names with accents parse correctly

**Expected Results**:
- ✅ All 4 students imported
- ✅ Accents preserved: José, Nicolò, André
- ✅ Hyphens preserved: Marie-Claire
- ✅ Apostrophes preserved: O'Connor
- ✅ No validation errors

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 3.3: Import CSV with Comma Delimiter
**Preparation**: Create `comma_delimited.csv`
```csv
firstName,lastName
Alessandro,Ferrari
Francesca,Colombo
```

**Steps**:
1. Import file
2. Verify parsing works

**Expected Results**:
- ✅ Delimiter auto-detected
- ✅ Headers normalized (firstName → nome)
- ✅ 2 students imported successfully

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

---

## Scenario 4: CSV Import - Edge Cases

### Test 4.1: Dirty CSV with Extra Whitespace (EC-006)
**Preparation**: Create `dirty_data.csv`
```csv
nome;cognome

  Mario  ;  Rossi


Giulia   ;   Bianchi

```

**Steps**:
1. Import file

**Expected Results**:
- ✅ Empty rows skipped
- ✅ Whitespace trimmed: "Mario" (not "  Mario  ")
- ✅ 2 students imported
- ✅ No errors

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 4.2: CSV with Exactly 30 Students (EC-009 Boundary)
**Preparation**: Use provided `template_studenti.csv` or create file with 30 valid names

**Steps**:
1. Import file with 30 students

**Expected Results**:
- ✅ All 30 students imported
- ✅ No errors
- ✅ Success message shows "30 studenti importati"

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 4.3: CSV with >30 Students (EC-009 Rejection)
**Preparation**: Create `too_many_students.csv` with 35 students
```csv
nome;cognome
Mario;Rossi
Giulia;Bianchi
[... 33 more rows ...]
```

**Steps**:
1. Try to import file

**Expected Results**:
- ✅ Import blocked
- ✅ Error message: "Troppi studenti nel file (35). Il limite massimo è 30."
- ✅ Suggestion: "Suggerimento: dividi la classe in più file o rimuovi 5 studenti."
- ✅ No students imported

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 4.4: Empty CSV File
**Preparation**: Create `empty.csv`
```csv
nome;cognome

```

**Steps**:
1. Try to import file

**Expected Results**:
- ✅ Error message: "Il file CSV è vuoto"
- ✅ Import blocked
- ✅ No crash

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 4.5: CSV with Missing Required Fields
**Preparation**: Create `missing_fields.csv`
```csv
nome;cognome
;Rossi
Giulia;
Mario;Rossi
```

**Steps**:
1. Import file
2. Check error messages

**Expected Results**:
- ✅ Error: "Riga 2: Nome mancante (cognome: Rossi)"
- ✅ Error: "Riga 3: Cognome mancante (nome: Giulia)"
- ✅ Only valid row imported (Mario Rossi)
- ✅ Import marked as failed (red error box)

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

---

## Scenario 5: Absence Tracking

### Test 5.1: Mark Single Student Absent
**Prerequisites**: Class with 3+ students imported

**Steps**:
1. Select class from dropdown
2. Go to "Segna Assenze" tab
3. Click on "Mario Rossi" (toggle absent)

**Expected Results**:
- ✅ Checkbox changes to X (red)
- ✅ Name shows line-through
- ✅ Background changes to red
- ✅ Badge changes to "Assente" (red)
- ✅ Header stats update:
  - Presenti: decrements by 1
  - Assenti: increments by 1

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 5.2: Mark Multiple Students Absent
**Steps**:
1. In "Segna Assenze", mark 2 more students absent
2. Observe header stats

**Expected Results**:
- ✅ Stats update correctly
- ✅ All marked students show red background
- ✅ "Reset Assenze" button appears

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 5.3: Toggle Student Back to Present
**Steps**:
1. Click on absent student again

**Expected Results**:
- ✅ Checkbox changes to ✓ (green)
- ✅ Line-through removed
- ✅ Background changes to normal
- ✅ Badge changes to "Presente" (green)
- ✅ Stats update

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 5.4: Reset All Absences
**Steps**:
1. Mark 3 students absent
2. Click "Reset Assenze" button

**Expected Results**:
- ✅ All students marked present
- ✅ Presenti = total students
- ✅ Assenti = 0
- ✅ "Reset Assenze" button disappears
- ✅ No students show as absent

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

---

## Scenario 6: Class Selection & Overview

### Test 6.1: Switch Between Classes
**Prerequisites**: 2+ classes with different student counts

**Steps**:
1. Select "3A Matematica" from dropdown
2. Note student count
3. Select "3B Scienze" from dropdown
4. Note student count

**Expected Results**:
- ✅ Dropdown updates selection
- ✅ Overview stats change
- ✅ Student list changes
- ✅ Absence data specific to selected class

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 6.2: Overview Tab Statistics
**Steps**:
1. Select class with students
2. Go to "Panoramica" tab
3. Verify statistics cards

**Expected Results**:
- ✅ "Totale Studenti" card shows correct count
- ✅ "Presenti Oggi" card shows green color
- ✅ "Assenti Oggi" card shows red color
- ✅ Numbers update when absences change

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 6.3: Students List View
**Steps**:
1. Go to "Lista Studenti" tab
2. Observe student cards

**Expected Results**:
- ✅ Grid layout (3 columns on desktop)
- ✅ Each card shows: Name, #number
- ✅ Absent students have "Assente" badge
- ✅ Shows "Studenti (X)" count in header

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

---

## Scenario 7: Data Persistence

### Test 7.1: Persistence After Page Reload
**Steps**:
1. Create class "Test Persistence"
2. Import 5 students
3. Mark 2 students absent
4. Refresh page (F5)
5. Navigate back to Class tab
6. Select "Test Persistence"

**Expected Results**:
- ✅ Class still exists in dropdown
- ✅ All 5 students still present
- ✅ Absence states preserved
- ✅ Statistics correct

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 7.2: LocalStorage Verification
**Steps**:
1. Open DevTools (F12)
2. Go to Application → Local Storage → http://localhost:1420
3. Find key: `class-store`
4. Verify JSON structure

**Expected Results**:
- ✅ Key exists
- ✅ Contains `classes` array
- ✅ Contains `selectedClassId`
- ✅ Student data includes `firstName`, `lastName`, `isAbsent`

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

---

## Scenario 8: UI/UX & Responsive Design

### Test 8.1: Theme Compatibility
**Steps**:
1. Go to Settings tab
2. Try different themes:
   - Blue Serenity (default)
   - Forest Mist
   - Vibrant Studio
3. Navigate back to Class tab for each theme

**Expected Results**:
- ✅ All UI elements visible in all themes
- ✅ Text readable (contrast sufficient)
- ✅ Buttons styled correctly
- ✅ No layout breaks

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 8.2: Responsive Layout (Window Resize)
**Steps**:
1. Resize browser window to narrow (simulate tablet)
2. Observe layout changes
3. Resize to very narrow (simulate phone)

**Expected Results**:
- ✅ Cards stack vertically on narrow screens
- ✅ Dropdowns remain usable
- ✅ No horizontal scrolling
- ✅ Buttons remain accessible

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 8.3: Keyboard Navigation
**Steps**:
1. Use Tab key to navigate through:
   - Class dropdown
   - "Gestisci" button
   - Student checkboxes
2. Use Enter/Space to activate elements

**Expected Results**:
- ✅ Focus indicator visible
- ✅ Logical tab order
- ✅ Enter/Space activates buttons
- ✅ ESC closes modals

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

---

## Scenario 9: Error Handling

### Test 9.1: Invalid File Type
**Steps**:
1. Try to upload `.txt` or `.jpg` file as CSV

**Expected Results**:
- ✅ File picker filters to `.csv` only
- ✅ If invalid type uploaded, error message shown
- ✅ App doesn't crash

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 9.2: Delete Selected Class
**Steps**:
1. Select a class
2. Open "Gestisci Classi"
3. Delete the currently selected class

**Expected Results**:
- ✅ Class removed from list
- ✅ Selection clears (dropdown shows "Seleziona una classe...")
- ✅ Empty state appears
- ✅ No crash

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 9.3: Double-Click Protection
**Steps**:
1. Open CSV import modal
2. Select file
3. Quickly double-click "Importa" button

**Expected Results**:
- ✅ Import happens only once
- ✅ No duplicate students
- ✅ Button disabled during import
- ✅ Success message shows correct count

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

---

## Scenario 10: Integration with Other Features

### Test 10.1: Audio System Integration
**Steps**:
1. Go to Audio tab
2. Play test sound
3. Go back to Class tab
4. Verify no audio disruption

**Expected Results**:
- ✅ Audio continues playing
- ✅ No console errors
- ✅ Class tab loads normally

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

### Test 10.2: Theme Changes During Class Management
**Steps**:
1. Open "Gestisci Classi" modal
2. Switch to different theme (via Settings)
3. Return to modal

**Expected Results**:
- ✅ Modal updates to new theme colors
- ✅ Text remains readable
- ✅ No layout issues

**Status**: [ ] Pass [ ] Fail
**Notes**: ________________

---

## 🐛 Bug Reporting Template

If you find issues, please report using this format:

**Bug ID**: BUG-FASE7-XXX
**Severity**: [ ] Critical [ ] Major [ ] Minor [ ] Cosmetic
**Test Scenario**: _______
**Steps to Reproduce**:
1.
2.
3.

**Expected Behavior**: _______
**Actual Behavior**: _______
**Screenshot/Video**: _______
**Browser**: _______
**Console Errors**: _______

---

## ✅ Test Summary

**Total Test Scenarios**: 10
**Total Test Cases**: 35

**Results**:
- Passed: _____ / 35
- Failed: _____ / 35
- Blocked: _____ / 35
- Not Tested: _____ / 35

**Pass Rate**: _____% (Target: >95%)

**Critical Bugs Found**: _____
**Major Bugs Found**: _____
**Minor Bugs Found**: _____

**Recommendation**:
- [ ] APPROVED - Ready for Production
- [ ] APPROVED WITH CONDITIONS - List conditions: _______
- [ ] REJECTED - Blocking issues: _______

---

## 📝 Tester Notes

**Testing Duration**: _____ minutes
**Environment Stability**: [ ] Excellent [ ] Good [ ] Fair [ ] Poor
**Overall UX Quality**: [ ] Excellent [ ] Good [ ] Fair [ ] Poor

**Additional Comments**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Tested By**: _____________
**Date**: _____________
**Signature**: _____________

---

## 🔄 Regression Testing (After Bug Fixes)

If bugs are found and fixed, re-test these scenarios:

**Re-test Priority**:
1. [ ] CSV Import (all edge cases)
2. [ ] Absence tracking
3. [ ] Data persistence
4. [ ] Class CRUD operations
5. [ ] Theme compatibility

**Re-test Date**: _____________
**Re-test Results**: [ ] All Pass [ ] Issues Remain

---

## 📎 Appendix: Test Data Files

### A1. Valid CSV Template
```csv
nome;cognome;classe
Mario;Rossi;3A
Giulia;Bianchi;3A
Luca;Verdi;3A
Sofia;Romano;3A
Alessandro;Ferrari;3A
```

### A2. Italian Characters Test
```csv
nome;cognome
José;García
Nicolò;Martìn
André;Müller
Marie-Claire;O'Connor
Jean-Luc;D'Angelo
```

### A3. 30 Students (Boundary Test)
Download: http://localhost:1420/template_studenti.csv

### A4. Dirty Data Test
```csv
nome;cognome

  Mario  ;  Rossi


Giulia   ;   Bianchi



```

---

**End of Test Plan**

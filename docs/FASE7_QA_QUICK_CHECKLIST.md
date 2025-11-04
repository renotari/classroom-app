# FASE 7 - Quick QA Checklist ✅

**Tester**: _____________
**Date**: _____________
**Environment**: `npm run dev` on http://localhost:1420

---

## 🚀 Quick Start
```bash
npm run dev
# Open http://localhost:1420
# Click 👥 Class tab
```

---

## ✅ Essential Tests (15 minutes)

### 1. Create Class
- [ ] Click "Gestisci Classi"
- [ ] Add "3A Test"
- [ ] Class appears in list

### 2. Import Valid CSV
- [ ] Download template: http://localhost:1420/template_studenti.csv
- [ ] Select class, click "Importa Studenti da CSV"
- [ ] Upload template
- [ ] Preview shows 10 students
- [ ] Click "Importa (10)"
- [ ] ✅ Success message appears

### 3. Italian Characters (EC-006)
Create `test_italian.csv`:
```csv
nome;cognome
José;García
Nicolò;Martìn
Marie-Claire;O'Connor
```
- [ ] Import file
- [ ] All 3 students imported with accents preserved

### 4. Max 30 Students (EC-009)
- [ ] Template has 10 students - import 3 times = 30 total
- [ ] ✅ All 30 accepted
- [ ] Try importing 11th time
- [ ] ❌ Should reject with "limite massimo è 30"

### 5. Mark Absences
- [ ] Go to "Segna Assenze" tab
- [ ] Click 2 students (toggle absent)
- [ ] Stats update: Assenti = 2
- [ ] Students show red + line-through
- [ ] Click "Reset Assenze"
- [ ] All back to present

### 6. Persistence Test
- [ ] Refresh page (F5)
- [ ] Navigate back to Class tab
- [ ] Class still selected
- [ ] All students still there
- [ ] ✅ Data persisted

### 7. Delete Class
- [ ] Open "Gestisci Classi"
- [ ] Click delete (trash icon) on class
- [ ] Click "Conferma"
- [ ] Class removed
- [ ] No crash

### 8. Theme Compatibility
- [ ] Go to Settings
- [ ] Change theme (try 2-3 different themes)
- [ ] Back to Class tab
- [ ] UI looks good in all themes

---

## ⚠️ Edge Cases (10 minutes)

### EC-006: Dirty CSV
Create `dirty.csv`:
```csv
nome;cognome

  Mario  ;  Rossi


Giulia   ;   Bianchi

```
- [ ] Import file
- [ ] Empty rows skipped
- [ ] Whitespace trimmed
- [ ] 2 students imported

### EC-009: >30 Students
- [ ] Try importing CSV with 35 students
- [ ] ❌ Error: "Troppi studenti (35)"
- [ ] Suggestion to divide class
- [ ] No students imported

### Missing Fields
Create `missing.csv`:
```csv
nome;cognome
;Rossi
Giulia;
Mario;Rossi
```
- [ ] Import file
- [ ] Error: "Riga 2: Nome mancante"
- [ ] Error: "Riga 3: Cognome mancante"
- [ ] Only Mario Rossi imported

---

## 🎯 Critical Pass Criteria

- [ ] ✅ Can create classes
- [ ] ✅ Can import CSV (valid data)
- [ ] ✅ Italian characters work (è, à, ò, ù)
- [ ] ✅ Max 30 students enforced
- [ ] ✅ Absence tracking works
- [ ] ✅ Data persists after reload
- [ ] ✅ No console errors
- [ ] ✅ Works in all themes

**If all ✅ checked: APPROVED FOR PRODUCTION** 🚀

---

## 🐛 Quick Bug Report

**Bug**: _______________________________
**Severity**: [ ] Critical [ ] Major [ ] Minor
**Steps**:
1. _______________________________
2. _______________________________
3. _______________________________

**Expected**: _______________________________
**Actual**: _______________________________

---

## 📊 Results

**Passed**: _____ / 8 essential + _____ / 3 edge cases = _____ / 11 total
**Pass Rate**: _____% (Target: >95%)

**Tester Signature**: _____________

---

**Testing Time**: ~25 minutes for complete checklist

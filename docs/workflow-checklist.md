# Documentation Sync Checklist

Use this checklist **AFTER completing each phase** to ensure all documentation stays synchronized with actual implementation.

## Phase Completion Checklist

### 1. Update README.md
- [ ] **Roadmap table**: Change phase status to ✅ COMPLETATA or 🚧 IN PROGRESS
- [ ] **Features list**: Add completed features to "Completate" section
- [ ] **Version number**: Bump minor version (0.4.0 → 0.5.0 for major phases)
- [ ] **Ultima Modifica**: Update "Last Modified" date

### 2. Update PROJECT_PLAN.md
- [ ] **Phase section**: Add "Status EFFETTIVO" subsection documenting actual completion
- [ ] **Metrics section**: Update with test coverage, test count, edge cases resolved
- [ ] **Edge Cases table**: Update with RESOLVED status for completed cases
- [ ] **Rischi section**: Update if any new risks identified

### 3. Update CLAUDE.md (if needed)
- [ ] **Edge case section**: Update if new patterns discovered
- [ ] **Testing patterns**: Add new patterns if needed
- [ ] **Risk mitigation**: Update if status changed
- [ ] **Commands**: Add any new commonly-used commands

### 4. Update src/config/features.ts
- [ ] **Set phase flag to `true`** (e.g., `audioSystem: true`) ONLY if all criteria met:
  - All required features implemented
  - All unit tests passing (>70% coverage)
  - All edge cases handled
  - No placeholder components remain
  - Ready for integration
- [ ] **Set sub-flags appropriately**
- [ ] **Run tests**: `npm run test` to verify tests still pass

### 5. Verify Test Coverage
- [ ] **Run coverage**: `npm run test:coverage`
- [ ] **Verify >70% coverage** for phase modules
- [ ] **Update documentation** with coverage % if >95%
- [ ] **Check reports**: Review `coverage/index.html` for detailed breakdown

### 6. Git Commit
- [ ] **Message format**: `feat: complete FASE X - [description]`
- [ ] **Include documentation changes** in the commit
- [ ] **Tag release**: `git tag -a v0.X.0 -m "FASE X complete"`

---

## Feature Flag Completion Criteria

Before setting a phase flag to `true`, verify ALL of these criteria:

1. ✅ **All required features implemented**
   - No TODOs or FIXMEs in production code
   - No placeholder components
   - Feature matches technical spec exactly

2. ✅ **All unit tests passing**
   - >70% coverage for the phase
   - No skipped tests (`.skip`)
   - No flaky tests

3. ✅ **All edge cases handled**
   - Critical edge cases (EC-000 to EC-004) resolved if assigned to phase
   - Important edge cases addressed
   - Nice-to-have edge cases documented

4. ✅ **No placeholder components**
   - All components fully functional
   - No mock data in production code
   - All UI elements styled and accessible

5. ✅ **Ready for integration**
   - Works with existing phases
   - No breaking changes to other modules
   - Integration tests passing

---

## Git Commit Message Templates

### Feature Completion
```
feat: complete FASE X - [Feature Name]

- Implemented [component/feature 1]
- Added [component/feature 2]
- Integrated [feature 3]
- All unit tests passing (XX% coverage)
- Edge cases EC-XXX, EC-XXX resolved

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Documentation Update
```
docs: update documentation for FASE X completion

- Updated README.md roadmap
- Updated PROJECT_PLAN.md metrics
- Added new testing patterns to docs/
- Updated feature flags

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Bug Fix
```
fix: resolve [issue description]

- Fixed [specific problem]
- Added regression test
- Updated edge case documentation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Testing Verification Commands

Run these commands before marking a phase complete:

```bash
# Run all tests
npm run test

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run build (verify no errors)
npm run build

# Run linter (verify code quality)
npm run lint
```

**All commands must pass** before committing phase completion.

---

## Documentation Quality Checks

### README.md
- [ ] No broken links
- [ ] Screenshots/images up to date
- [ ] Roadmap table matches PROJECT_PLAN.md
- [ ] Installation instructions accurate

### PROJECT_PLAN.md
- [ ] Phase status matches actual implementation
- [ ] Metrics updated (test count, coverage %)
- [ ] Edge cases status current
- [ ] Timeline reflects actual completion dates

### CLAUDE.md
- [ ] No outdated instructions
- [ ] All references to docs/ are valid
- [ ] Critical rules still accurate
- [ ] Commands list updated

---

## Example: Phase 4 Completion Checklist

✅ README.md updated
- Roadmap: Phase 4 marked ✅ COMPLETATA
- Features: Audio System added to "Completate" section
- Version: Bumped to 0.4.0

✅ PROJECT_PLAN.md updated
- Phase 4: Added "Status EFFETTIVO" with completion details
- Metrics: 100% coverage (32 tests), EC-005, EC-008 resolved

✅ CLAUDE.md updated
- Added audio testing patterns
- Documented AudioContext singleton requirement

✅ src/config/features.ts updated
- Set `audioSystem: true`
- Set all audio sub-flags appropriately
- Tests pass ✅

✅ Test Coverage verified
- `npm run test:coverage` → 100% on audioService.ts
- All 32 tests passing

✅ Git Commit
```bash
git add .
git commit -m "feat: complete FASE 4 - Sistema Audio

- Implemented AudioService singleton
- Added background music player
- Created sound pack system
- Integrated Web Audio API
- All unit tests passing (100% coverage)
- Edge cases EC-005, EC-008 resolved

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git tag -a v0.4.0 -m "FASE 4 complete"
```

---

## Post-Commit Verification

After committing, verify:

```bash
# Check git status is clean
git status

# Verify tag created
git tag -l

# Verify latest commit message
git log -1

# Push to remote (if applicable)
git push origin main --tags
```

---

## Frequency

Use this checklist:
- **After each phase completion** (mandatory)
- **Before creating a pull request** (if using PRs)
- **Before release** (Phase 15)
- **Monthly** (for documentation sync verification)

---

## References
- See `docs/risk-management.md` for risk review schedule
- See `docs/testing-comprehensive-guide.md` for testing requirements
- See `PROJECT_PLAN.md` for phase timeline and requirements

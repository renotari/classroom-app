# Architecture & Quality Decisions

**Last Updated**: 2025-10-27
**Current Phase**: 5 (Noise Monitoring)
**License**: MIT (See LICENSE file)

---

## Table of Contents
1. [Error Handling Architecture](#error-handling-architecture)
2. [Rust vs Frontend Decision Tree](#rust-vs-frontend-decision-tree)
3. [License & Legal](#license--legal)
4. [Project Guarantees](#project-guarantees)

---

## Error Handling Architecture

### Error Code System

All errors across the system use standardized error codes for consistent frontend handling.

#### Audio System Error Codes
```typescript
AudioError {
  FILE_NOT_FOUND: "AUDIO_FILE_NOT_FOUND"
  CONTEXT_ERROR: "AUDIO_CONTEXT_ERROR"
  DECODE_ERROR: "AUDIO_DECODE_ERROR"
  PLAYBACK_ERROR: "AUDIO_PLAYBACK_ERROR"
  PERMISSION_DENIED: "AUDIO_PERMISSION_DENIED"
}
```

**Propagation**: `src/services/audioService.ts` throws these codes
**Handler**: Components catch and display user-friendly messages
**Tests**: All edge cases (EC-005, EC-008) verify error code propagation

**Example - EC-005 (Missing Audio Files)**:
```typescript
// Service throws
throw new AudioError(
  AudioError.CODE.FILE_NOT_FOUND,
  'Sound file: /sounds/classic/timer-end.wav not found'
);

// Component catches
try {
  await audioService.playSound('timer-end.wav');
} catch (err) {
  if (err.code === AudioError.CODE.FILE_NOT_FOUND) {
    showUI('Sound files missing. Download them to /sounds/');
  }
}
```

#### Noise Monitoring Error Codes
```typescript
NoiseError {
  PERMISSION_REQUIRED: "MICROPHONE_PERMISSION_REQUIRED"   // EC-000
  PERMISSION_DENIED: "MICROPHONE_PERMISSION_DENIED"       // EC-001
  UNAVAILABLE: "MICROPHONE_UNAVAILABLE"
  STREAM_ERROR: "AUDIO_STREAM_ERROR"
  MONITOR_ERROR: "MONITOR_ERROR"
}
```

**Propagation**: `src/services/noiseMonitorService.ts` → NoiseMeterPanel
**Handler**: Show permission request UI on PERMISSION_REQUIRED
**Tests**: Mock getUserMedia failures, verify error handling

**Example - EC-000 (First-time Permission)**:
```typescript
// Service detects first-time
if (!hasPermission && !hasAskedBefore) {
  throw new NoiseError(
    NoiseError.CODE.PERMISSION_REQUIRED,
    'Microphone access required for noise monitoring'
  );
}

// Component shows permission UI
if (error.code === NoiseError.CODE.PERMISSION_REQUIRED) {
  return <PermissionRequestDialog />;
}
```

#### Backend Error Codes (Rust)
```rust
// File operations
FILE_NOT_FOUND = "FILE_NOT_FOUND"
FILE_PERMISSION_DENIED = "FILE_PERMISSION_DENIED"
INVALID_FILE_FORMAT = "INVALID_FILE_FORMAT"  // EC-006 (bad CSV)
ENCODING_ERROR = "ENCODING_ERROR"            // EC-006 (wrong encoding)

// Window management
WINDOW_NOT_FOUND = "WINDOW_NOT_FOUND"
INVALID_WINDOW_POSITION = "INVALID_WINDOW_POSITION"  // EC-002

// Permissions
MICROPHONE_DENIED = "MICROPHONE_DENIED"      // EC-001
MICROPHONE_UNAVAILABLE = "MICROPHONE_UNAVAILABLE"
```

**Source**: `src-tauri/src/errors.rs` (scaffolded in Point 4)

### Error Recovery Paths

Every error code should have a recovery path in the UI:

| Error | Recovery | Component |
|-------|----------|-----------|
| AUDIO_FILE_NOT_FOUND | Show "Download sounds" button | AudioPanel |
| MICROPHONE_PERMISSION_REQUIRED | Show OS permission dialog | NoiseMeterPanel |
| MICROPHONE_PERMISSION_DENIED | Show "Enable in Settings" instructions | NoiseMeterPanel |
| FILE_NOT_FOUND (CSV) | Show "Choose CSV file" uploader | ClassManagement |
| INVALID_FILE_FORMAT (CSV) | Show "CSV format invalid" error + sample | ClassManagement |
| INVALID_WINDOW_POSITION | Auto-constrain to screen bounds | Window service |

### Auditing Error Propagation

**Audit Checklist** (before Phase 15):

- [ ] **AudioService**: All error codes thrown correctly
- [ ] **NoiseMonitorService**: All error codes thrown correctly
- [ ] **AudioPanel Component**: Catches errors, shows recovery UI
- [ ] **NoiseMeterPanel Component**: Catches errors, shows recovery UI
- [ ] **Test Coverage**: Each error code has unit test
- [ ] **Integration Tests**: Full flow (error → recovery) tested
- [ ] **Documentation**: Error handling documented in code comments

**Phase-Specific Audits**:
- Phase 5 (Noise): Verify EC-000, EC-001 error codes propagate
- Phase 7 (Classes): Verify EC-006 (CSV encoding) error handling
- Phase 12 (Integration): Verify cross-service errors don't get lost
- Phase 15 (Release): Full audit of all error recovery paths

---

## Rust vs Frontend Decision Tree

### When to Implement in Rust Backend

Use Rust when you need:

```
┌─────────────────────────────┐
│ Task requires...            │
└─────────────────────────────┘
           ↓
   ┌──────────────────────────┐
   │ File system access?      │
   │ Window management?       │
   │ System permissions?      │
   │ Performance-critical?    │
   │ Multiple OS-specific     │
   │ implementations?         │
   └──────────────────────────┘
           ↓ YES
   ┌──────────────────────────┐
   │ USE RUST BACKEND         │
   │ in src-tauri/src/        │
   └──────────────────────────┘
           ↓ NO
   ┌──────────────────────────┐
   │ USE TYPESCRIPT FRONTEND  │
   │ in src/                  │
   └──────────────────────────┘
```

### Examples by Phase

#### Phase 6 (Semaphore) - FRONTEND ✅
- Why: Pure UI state, no file system needed
- Where: `src/components/Semaphore/`
- What: React component + Zustand store

#### Phase 7 (CSV Import) - BOTH ✓
- Why: CSV parsing + file validation
- Frontend: `src/components/ClassManagement/CSVImporter.tsx`
- Backend: `src-tauri/src/file_ops.rs:read_csv()`
- Pattern: Frontend uploads file → Rust parses → Result returned

```typescript
// Frontend
const csvData = await invoke('read_csv', { path: filePath });

// Rust
#[tauri::command]
pub fn read_csv(path: &str) -> Result<Value, String> {
  // Parse with encoding detection, validation
}
```

#### Phase 9 (Group Generation) - FRONTEND ✅
- Why: Algorithm is CPU-bound but on reasonable dataset (30 students)
- Strategy: Use Web Worker (if slow) or main thread (if acceptable)
- Decision: Defer to Phase 9 implementation
- Could use Rust Worker if performance critical

#### Phase 13 (Overlay Window) - BOTH ✓
- Why: Window positioning needs OS API access
- Frontend: React component for overlay UI
- Backend: Window commands in `src-tauri/src/window.rs`

### Rust Backend Roadmap

**Phase 5 (Current)**: Scaffolded, no active commands
**Phase 7**: Implement `read_csv` for CSV import
**Phase 12**: Implement `get_window_position` / `set_window_position` for overlay
**Phase 13**: Finalize window positioning utilities
**Phase 15**: Polish, add missing platform-specific code

---

## License & Legal

### License Choice: MIT

**Why MIT?**
- ✅ Permissive (no viral clauses)
- ✅ Simple (3-clause, easy to understand)
- ✅ Industry-standard for educational projects
- ✅ Compatible with all dependencies
- ✅ Encourages community contributions

**License Text**:
```
MIT License

Copyright (c) 2025 [Project Owner]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[Full MIT text in LICENSE file]
```

### File Locations
- **License**: `LICENSE` (root directory)
- **Header**: Every source file (optional, best practice)
- **Reference**: `package.json` (license field)

### Documentation Updates

#### README.md
```markdown
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

#### package.json
```json
{
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/[owner]/classroom-app"
  }
}
```

#### docs/ Headers
```markdown
<!--
Classroom Management Tool
Licensed under MIT. See LICENSE for details.
-->
```

---

## Project Guarantees

### What This Project Does
- ✅ Timer with presets, pause, resume, stop
- ✅ Audio system (alerts, background music, Web Audio API)
- ✅ Noise monitoring (real-time, thresholds, history)
- ✅ Semaphore/traffic light (manual + auto mode)
- ✅ Class management (CSV import, random student selection)
- ✅ Group generation (with separation rules)
- ✅ Settings & themes (6 color schemes, window modes)
- ✅ Responsive UI (touch-friendly, accessible)
- ✅ Cross-platform (Windows, macOS, Linux - Tauri)

### What This Project Doesn't Do
- ❌ Store data in cloud
- ❌ Integrate with external APIs (OneNote planned for future)
- ❌ Manage user accounts
- ❌ Track student grades or attendance
- ❌ Generate reports

### Stability Guarantees by Phase

| Phase | Status | Guarantee |
|-------|--------|-----------|
| 1-2 | ✅ Complete | Stable API, use in production |
| 3 | ✅ Complete | Stable API, use in production |
| 4 | ✅ Complete | Stable API, use in production |
| 5 | ✅ Complete | Stable API, use in production |
| 6-14 | 🚧 In Progress | **UNSTABLE**: APIs may change |
| 15 | 📋 Planned | Release & packaging |

### Support & Maintenance

**Maintenance Level**: Community-driven (Phase 15+)

- Bug fixes: GitHub Issues
- Feature requests: GitHub Discussions
- Security: Report privately to [maintainer]
- Documentation: In `/docs` folder

### Upgrade Policy

**Breaking Changes**: Only in major version releases
**Deprecation**: 2-release notice before removal
**Beta Features**: Marked clearly, may change without notice

---

## Code Health Metrics

### Coverage
- Target: >70% across all phases
- Current (Phases 1-5): ✅ 97+ tests, >70% coverage achieved

### Performance
- Memory: <100MB on startup
- CPU: <5% idle
- Response time: <100ms per action

### Quality
- TypeScript strict mode: ✅ Enabled
- ESLint: ✅ 0 errors
- No `any` types: ✅ Enforced
- Web Audio API singleton: ✅ Pattern enforced with tests

---

## Security

### Known Limitations
- Web Audio API access not gated by permission (browser handles)
- CSV parsing is basic (no injection protection for malicious CSVs)
- File paths not validated for escaping

### Future Security Audits
- Phase 14: Security review before release
- Phase 15: Penetration testing if applicable

---

## References

- **MIT License**: https://opensource.org/licenses/MIT
- **Tauri Security**: https://tauri.app/develop/security
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Project**: PROJECT_PLAN.md, CLAUDE.md, docs/


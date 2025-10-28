//! Tauri command handlers
//!
//! These are the commands exposed to the frontend via the invoke API
//! Example frontend usage:
//! ```typescript
//! import { invoke } from '@tauri-apps/api/core';
//! const result = await invoke('read_csv', { path: '/path/to/file.csv' });
//! ```

use crate::file_ops;
use crate::window;
use serde_json::Value;
use tauri::WebviewWindow;

// ============================================================================
// File Operations Commands
// ============================================================================

/// Read and parse CSV file with automatic encoding detection
///
/// # Arguments
/// * `path` - Path to CSV file
///
/// # Returns
/// JSON with parsed records or structured error with typed error code
///
/// # Example
/// ```javascript
/// const data = await invoke('read_csv', { path: './students.csv' })
///   .catch(err => console.error(err.code)); // e.g., "FILE_NOT_FOUND"
/// ```
#[tauri::command]
pub fn read_csv(path: String) -> Result<Value, serde_json::Value> {
    file_ops::read_csv(&path).map_err(|e| serde_json::to_value(e).unwrap_or_else(|_| {
        serde_json::json!({
            "code": "UNKNOWN_ERROR",
            "message": "Failed to serialize error"
        })
    }))
}

/// Save configuration value
///
/// # Arguments
/// * `key` - Configuration key
/// * `value` - Configuration value (any JSON-serializable)
///
/// # Returns
/// Empty result with structured error on failure
///
/// # Example
/// ```javascript
/// await invoke('save_config', {
///   key: 'theme',
///   value: 'Energy'
/// }).catch(err => console.error(err.code));
/// ```
#[tauri::command]
pub fn save_config(key: String, value: Value) -> Result<(), serde_json::Value> {
    file_ops::save_config(&key, value).map_err(|e| serde_json::to_value(e).unwrap_or_else(|_| {
        serde_json::json!({
            "code": "UNKNOWN_ERROR",
            "message": "Failed to serialize error"
        })
    }))
}

/// Load configuration value
///
/// # Arguments
/// * `key` - Configuration key
///
/// # Returns
/// Configuration value or null if not found, with structured error on failure
///
/// # Example
/// ```javascript
/// const theme = await invoke('load_config', { key: 'theme' })
///   .catch(err => console.error(err.code));
/// ```
#[tauri::command]
pub fn load_config(key: String) -> Result<Value, serde_json::Value> {
    file_ops::load_config(&key).map_err(|e| serde_json::to_value(e).unwrap_or_else(|_| {
        serde_json::json!({
            "code": "UNKNOWN_ERROR",
            "message": "Failed to serialize error"
        })
    }))
}

// ============================================================================
// Window Management Commands
// ============================================================================

/// Get current window position and size
///
/// # Arguments
/// * `window` - Tauri window handle
///
/// # Returns
/// { x, y, width, height } or structured error
///
/// # Example
/// ```javascript
/// const pos = await invoke('get_window_position')
///   .catch(err => console.error(err.code));
/// console.log(`Window at ${pos.x}, ${pos.y}`);
/// ```
#[tauri::command]
pub fn get_window_position(window: WebviewWindow) -> Result<window::WindowPosition, serde_json::Value> {
    window::get_window_position(&window).map_err(|e| serde_json::to_value(e).unwrap_or_else(|_| {
        serde_json::json!({
            "code": "UNKNOWN_ERROR",
            "message": "Failed to get window position"
        })
    }))
}

/// Set window position and size
///
/// # Arguments
/// * `position` - { x, y, width, height }
/// * `window` - Tauri window handle
///
/// # Returns
/// Empty result with structured error on failure
///
/// # Example
/// ```javascript
/// await invoke('set_window_position', {
///   position: { x: 100, y: 100, width: 800, height: 600 }
/// }).catch(err => console.error(err.code));
/// ```
#[tauri::command]
pub fn set_window_position(
    position: window::WindowPosition,
    window: WebviewWindow,
) -> Result<(), serde_json::Value> {
    let constrained = window::constrain_to_screen(position);
    window::set_window_position(&window, constrained).map_err(|e| serde_json::to_value(e).unwrap_or_else(|_| {
        serde_json::json!({
            "code": "UNKNOWN_ERROR",
            "message": "Failed to set window position"
        })
    }))
}

// ============================================================================
// Permission Commands
// ============================================================================

/// Request microphone permission (EC-000 handling)
///
/// Platform-specific implementation:
/// - Windows: Uses Windows API for permission request
/// - macOS: Uses AVFoundation
/// - Linux: Uses PipeWire/PulseAudio APIs
///
/// # Returns
/// { granted: bool, message: string }
///
/// # Example
/// ```javascript
/// const result = await invoke('request_microphone_permission');
/// if (result.granted) {
///   // Start microphone
/// }
/// ```
#[tauri::command]
pub fn request_microphone_permission() -> Result<serde_json::Value, String> {
    // TODO: Implement platform-specific microphone permission handling (EC-000)
    // For now, return success as placeholder
    // This should:
    // 1. Check if permission already granted via OS APIs
    // 2. If not, request permission via OS dialog
    // 3. Return permission status and availability
    // See CLAUDE.md § Edge Cases for EC-000 details

    Ok(serde_json::json!({
        "granted": true,
        "available": true,
        "message": "Microphone permission granted (placeholder implementation)"
    }))
}

// ============================================================================
// Utility Commands
// ============================================================================

/// Example greeting command (for testing)
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// ============================================================================
// Backend Architecture Notes
// ============================================================================

// These commands are exposed to the frontend via:
// 1. Add to `generate_handler![]` macro in lib.rs
// 2. Call from frontend using `invoke('command_name', { args })`
// 3. Error handling: Rust Result<T, E> maps to Promise<T> or rejection

// Decision guide for implementing new commands:
// ✅ USE RUST BACKEND FOR:
//   - File system operations (CSV import, config persistence)
//   - Window management (positioning, modes, always-on-top)
//   - System permissions (microphone, camera)
//   - System tray integration
//   - Performance-critical operations
//
// ❌ DON'T USE RUST FOR:
//   - UI logic and state management (use React/Zustand)
//   - Business logic (use TypeScript services when possible)
//   - Simple data transformations (keep in frontend)
//
// See docs/architecture.md for full decision tree

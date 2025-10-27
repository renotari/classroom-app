//! Tauri command handlers
//!
//! These are the commands exposed to the frontend via the invoke API
//! Example frontend usage:
//! ```typescript
//! import { invoke } from '@tauri-apps/api/core';
//! const result = await invoke('read_csv', { path: '/path/to/file.csv' });
//! ```

use crate::errors::BackendError;
use crate::file_ops;
use crate::window;
use serde_json::Value;
use tauri::State;

// ============================================================================
// File Operations Commands
// ============================================================================

/// Read and parse CSV file with automatic encoding detection
///
/// # Arguments
/// * `path` - Path to CSV file
///
/// # Returns
/// JSON with parsed records or error
///
/// # Example
/// ```javascript
/// const data = await invoke('read_csv', { path: './students.csv' });
/// ```
#[tauri::command]
pub fn read_csv(path: String) -> Result<Value, String> {
    file_ops::read_csv(&path).map_err(|e| e.to_string())
}

/// Save configuration value
///
/// # Arguments
/// * `key` - Configuration key
/// * `value` - Configuration value (any JSON-serializable)
///
/// # Example
/// ```javascript
/// await invoke('save_config', {
///   key: 'theme',
///   value: 'Energy'
/// });
/// ```
#[tauri::command]
pub fn save_config(key: String, value: Value) -> Result<(), String> {
    file_ops::save_config(&key, value).map_err(|e| e.to_string())
}

/// Load configuration value
///
/// # Arguments
/// * `key` - Configuration key
///
/// # Returns
/// Configuration value or null if not found
///
/// # Example
/// ```javascript
/// const theme = await invoke('load_config', { key: 'theme' });
/// ```
#[tauri::command]
pub fn load_config(key: String) -> Result<Value, String> {
    file_ops::load_config(&key).map_err(|e| e.to_string())
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
/// { x, y, width, height }
///
/// # Example
/// ```javascript
/// const pos = await invoke('get_window_position');
/// console.log(`Window at ${pos.x}, ${pos.y}`);
/// ```
#[tauri::command]
pub fn get_window_position(window: tauri::Window) -> Result<window::WindowPosition, String> {
    window::get_window_position(&window).map_err(|e| e.to_string())
}

/// Set window position and size
///
/// # Arguments
/// * `position` - { x, y, width, height }
/// * `window` - Tauri window handle
///
/// # Example
/// ```javascript
/// await invoke('set_window_position', {
///   position: { x: 100, y: 100, width: 800, height: 600 }
/// });
/// ```
#[tauri::command]
pub fn set_window_position(
    position: window::WindowPosition,
    window: tauri::Window,
) -> Result<(), String> {
    let constrained = window::constrain_to_screen(position);
    window::set_window_position(&window, constrained).map_err(|e| e.to_string())
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
pub fn request_microphone_permission() -> Result<serde_json::json::Value, String> {
    // TODO: Implement platform-specific microphone permission handling
    // For now, return success
    // This should:
    // 1. Check if permission already granted
    // 2. If not, request permission via OS dialog
    // 3. Return permission status

    Ok(serde_json::json!({
        "granted": true,
        "message": "Microphone permission granted"
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

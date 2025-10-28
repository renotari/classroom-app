//! Classroom Management Tool - Tauri Backend
//!
//! This module contains the Rust backend for the Classroom Management Tool.
//! It handles:
//! - Window management and positioning
//! - File I/O operations (CSV import, config persistence)
//! - System permissions (microphone access)
//! - Desktop-specific concerns not suitable for frontend
//!
//! For the decision on when to use Rust vs. Frontend:
//! See docs/architecture.md and CLAUDE.md "Quando Usare Rust Backend"

pub mod commands;
pub mod errors;
pub mod file_ops;
pub mod window;
pub mod permissions;

/// Initialize and run the Tauri application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // Register all command handlers
        .invoke_handler(tauri::generate_handler![
            // File operations
            commands::read_csv,
            commands::save_config,
            commands::load_config,
            // Window management
            commands::get_window_position,
            commands::set_window_position,
            // Permissions
            commands::request_microphone_permission,
            // Utility
            commands::greet,
        ])
        // Setup window on startup
        .setup(|app| {
            window::setup_window(app.handle())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

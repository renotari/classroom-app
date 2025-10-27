//! Window management for Classroom Management App
//!
//! Handles:
//! - Window positioning and sizing
//! - Overlay and fullscreen modes
//! - Multi-monitor support
//! - Window persistence

use crate::errors::{BackendError, self};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Window};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowPosition {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowConfig {
    pub mode: String, // "normal", "overlay", "fullscreen"
    pub position: Option<WindowPosition>,
}

/// Setup window on application startup
pub fn setup_window(app: &AppHandle) -> Result<(), BackendError> {
    // Load saved config
    let config_str = crate::file_ops::load_config("window_config")
        .ok()
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .unwrap_or_else(|| "normal".to_string());

    // Apply window configuration
    if let Ok(window) = app.get_webview_window("main") {
        match config_str.as_str() {
            "overlay" => setup_overlay_window(&window)?,
            "fullscreen" => setup_fullscreen_window(&window)?,
            _ => setup_normal_window(&window)?,
        }
    }

    Ok(())
}

/// Setup normal window mode
fn setup_normal_window(window: &Window) -> Result<(), BackendError> {
    window
        .set_size(tauri::LogicalSize::new(1200, 800))
        .map_err(|e| {
            BackendError::new(errors::window::INVALID_POSITION, "Failed to resize window")
                .with_details(e.to_string())
        })?;

    window
        .center()
        .map_err(|e| {
            BackendError::new(errors::window::INVALID_POSITION, "Failed to center window")
                .with_details(e.to_string())
        })?;

    Ok(())
}

/// Setup overlay window mode (always-on-top, small)
fn setup_overlay_window(window: &Window) -> Result<(), BackendError> {
    // Set smaller size
    window
        .set_size(tauri::LogicalSize::new(400, 600))
        .map_err(|e| {
            BackendError::new(errors::window::INVALID_POSITION, "Failed to resize window")
                .with_details(e.to_string())
        })?;

    // Position in corner (can be customized)
    window
        .set_position(tauri::LogicalPosition::new(100, 100))
        .map_err(|e| {
            BackendError::new(errors::window::INVALID_POSITION, "Failed to position window")
                .with_details(e.to_string())
        })?;

    // Set always-on-top
    window
        .set_always_on_top(true)
        .map_err(|e| {
            BackendError::new(errors::window::INVALID_POSITION, "Failed to set always-on-top")
                .with_details(e.to_string())
        })?;

    Ok(())
}

/// Setup fullscreen window mode
fn setup_fullscreen_window(window: &Window) -> Result<(), BackendError> {
    window
        .set_fullscreen(true)
        .map_err(|e| {
            BackendError::new(
                errors::window::INVALID_POSITION,
                "Failed to enter fullscreen",
            )
            .with_details(e.to_string())
        })?;

    Ok(())
}

/// Get window position and size
pub fn get_window_position(window: &Window) -> Result<WindowPosition, BackendError> {
    let pos = window
        .outer_position()
        .map_err(|e| {
            BackendError::new(
                errors::window::INVALID_POSITION,
                "Failed to get window position",
            )
            .with_details(e.to_string())
        })?;

    let size = window
        .outer_size()
        .map_err(|e| {
            BackendError::new(
                errors::window::INVALID_POSITION,
                "Failed to get window size",
            )
            .with_details(e.to_string())
        })?;

    Ok(WindowPosition {
        x: pos.x as i32,
        y: pos.y as i32,
        width: size.width as u32,
        height: size.height as u32,
    })
}

/// Set window position and size
pub fn set_window_position(
    window: &Window,
    position: WindowPosition,
) -> Result<(), BackendError> {
    window
        .set_position(tauri::LogicalPosition::new(
            position.x as f64,
            position.y as f64,
        ))
        .map_err(|e| {
            BackendError::new(
                errors::window::INVALID_POSITION,
                "Failed to set window position",
            )
            .with_details(e.to_string())
        })?;

    window
        .set_size(tauri::LogicalSize::new(
            position.width as f64,
            position.height as f64,
        ))
        .map_err(|e| {
            BackendError::new(
                errors::window::INVALID_POSITION,
                "Failed to set window size",
            )
            .with_details(e.to_string())
        })?;

    Ok(())
}

/// Ensure window is within screen bounds (handles EC-002)
pub fn constrain_to_screen(mut position: WindowPosition) -> WindowPosition {
    // TODO: Check against monitor bounds and adjust if needed
    // For now, basic validation
    position.x = position.x.max(0);
    position.y = position.y.max(0);
    position.width = position.width.max(400);
    position.height = position.height.max(300);

    position
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_constrain_position() {
        let pos = WindowPosition {
            x: -100,
            y: -50,
            width: 200,
            height: 150,
        };
        let constrained = constrain_to_screen(pos);
        assert!(constrained.x >= 0);
        assert!(constrained.y >= 0);
    }
}

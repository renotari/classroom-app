//! Error types for Tauri backend
//!
//! Maps Rust errors to user-friendly error codes that frontend can handle

use serde::{Deserialize, Serialize};
use std::fmt;

/// Backend error type with error codes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackendError {
    pub code: String,
    pub message: String,
    pub details: Option<String>,
}

impl BackendError {
    /// Create a new backend error
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            details: None,
        }
    }

    /// Add detailed information to error
    pub fn with_details(mut self, details: impl Into<String>) -> Self {
        self.details = Some(details.into());
        self
    }
}

/// File operation errors
pub mod file {
    pub const NOT_FOUND: &str = "FILE_NOT_FOUND";
    pub const PERMISSION_DENIED: &str = "FILE_PERMISSION_DENIED";
    pub const INVALID_FORMAT: &str = "INVALID_FILE_FORMAT";
    pub const ENCODING_ERROR: &str = "ENCODING_ERROR";
    pub const IO_ERROR: &str = "FILE_IO_ERROR";
}

/// Window management errors
pub mod window {
    pub const NOT_FOUND: &str = "WINDOW_NOT_FOUND";
    pub const INVALID_POSITION: &str = "INVALID_WINDOW_POSITION";
    pub const MONITOR_NOT_FOUND: &str = "MONITOR_NOT_FOUND";
}

/// Permission errors
pub mod permission {
    pub const MICROPHONE_DENIED: &str = "MICROPHONE_DENIED";
    pub const MICROPHONE_UNAVAILABLE: &str = "MICROPHONE_UNAVAILABLE";
    pub const PERMISSION_ERROR: &str = "PERMISSION_ERROR";
}

/// System errors
pub mod system {
    pub const UNKNOWN_ERROR: &str = "UNKNOWN_ERROR";
    pub const INVALID_INPUT: &str = "INVALID_INPUT";
}

impl fmt::Display for BackendError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "[{}] {} {}",
            self.code,
            self.message,
            self.details
                .as_ref()
                .map(|d| format!("({})", d))
                .unwrap_or_default()
        )
    }
}

impl std::error::Error for BackendError {}

/// Convert Rust errors to BackendError
impl From<std::io::Error> for BackendError {
    fn from(err: std::io::Error) -> Self {
        use std::io::ErrorKind;
        let (code, message) = match err.kind() {
            ErrorKind::NotFound => (file::NOT_FOUND, "File not found"),
            ErrorKind::PermissionDenied => (file::PERMISSION_DENIED, "Permission denied"),
            _ => (file::IO_ERROR, "File I/O error"),
        };
        BackendError::new(code, message).with_details(err.to_string())
    }
}

impl From<BackendError> for tauri::InvokeError {
    fn from(err: BackendError) -> Self {
        tauri::InvokeError::from(err.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_creation() {
        let err = BackendError::new(file::NOT_FOUND, "Missing file.csv");
        assert_eq!(err.code, file::NOT_FOUND);
        assert_eq!(err.message, "Missing file.csv");
    }

    #[test]
    fn test_error_with_details() {
        let err = BackendError::new(file::IO_ERROR, "Read error")
            .with_details("File is locked");
        assert!(err.details.is_some());
    }
}

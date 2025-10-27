//! File I/O operations for Classroom Management App
//!
//! Handles:
//! - CSV file parsing and validation
//! - Configuration file persistence
//! - Error handling with proper encoding detection

use crate::errors::{BackendError, self};
use serde_json::{json, Value};
use std::fs;
use std::path::{Path, PathBuf};

const CONFIG_DIR: &str = "classroom_config";
const CONFIG_FILENAME: &str = "app_config.json";

/// Read and parse CSV file with encoding detection
///
/// Supports UTF-8, UTF-16, and Windows-1252 encodings
///
/// # Arguments
/// * `path` - Path to CSV file
///
/// # Returns
/// * `Value` - Parsed CSV data as JSON
pub fn read_csv(path: &str) -> Result<Value, BackendError> {
    let path = Path::new(path);

    // Validate file exists
    if !path.exists() {
        return Err(BackendError::new(
            errors::file::NOT_FOUND,
            format!("CSV file not found: {}", path.display()),
        ));
    }

    // Read file bytes
    let bytes = fs::read(path).map_err(|e| {
        BackendError::new(errors::file::IO_ERROR, "Failed to read CSV file")
            .with_details(e.to_string())
    })?;

    // Detect encoding and decode
    let content = detect_and_decode(&bytes)?;

    // Parse CSV (basic implementation - can be enhanced)
    let records = parse_csv(&content)?;

    Ok(json!({
        "success": true,
        "records": records,
        "count": records.len(),
    }))
}

/// Save configuration to app config file
///
/// Creates directory structure if needed
pub fn save_config(key: &str, value: Value) -> Result<(), BackendError> {
    let config_path = get_config_path()?;

    // Create config directory if doesn't exist
    if !config_path.parent().unwrap().exists() {
        fs::create_dir_all(config_path.parent().unwrap()).map_err(|e| {
            BackendError::new(errors::file::IO_ERROR, "Failed to create config directory")
                .with_details(e.to_string())
        })?;
    }

    // Load existing config or create new
    let mut config = if config_path.exists() {
        let content = fs::read_to_string(&config_path).map_err(|e| {
            BackendError::new(errors::file::IO_ERROR, "Failed to read config file")
                .with_details(e.to_string())
        })?;
        serde_json::from_str(&content)
            .unwrap_or_else(|_| json!({}))
    } else {
        json!({})
    };

    // Update value
    config[key] = value;

    // Write back
    let json_str = serde_json::to_string_pretty(&config).map_err(|e| {
        BackendError::new(errors::file::IO_ERROR, "Failed to serialize config")
            .with_details(e.to_string())
    })?;

    fs::write(&config_path, json_str).map_err(|e| {
        BackendError::new(errors::file::IO_ERROR, "Failed to write config file")
            .with_details(e.to_string())
    })?;

    Ok(())
}

/// Load configuration from app config file
pub fn load_config(key: &str) -> Result<Value, BackendError> {
    let config_path = get_config_path()?;

    if !config_path.exists() {
        return Ok(Value::Null);
    }

    let content = fs::read_to_string(&config_path).map_err(|e| {
        BackendError::new(errors::file::IO_ERROR, "Failed to read config file")
            .with_details(e.to_string())
    })?;

    let config: Value = serde_json::from_str(&content)
        .map_err(|e| {
            BackendError::new(errors::file::INVALID_FORMAT, "Invalid config file format")
                .with_details(e.to_string())
        })?;

    Ok(config.get(key).unwrap_or(&Value::Null).clone())
}

/// Get the configuration file path
fn get_config_path() -> Result<PathBuf, BackendError> {
    let data_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
        .ok_or_else(|| {
            BackendError::new(
                errors::system::UNKNOWN_ERROR,
                "Failed to determine app data directory",
            )
        })?;

    Ok(data_dir.join(CONFIG_DIR).join(CONFIG_FILENAME))
}

/// Detect encoding and decode bytes to String
fn detect_and_decode(bytes: &[u8]) -> Result<String, BackendError> {
    // Try UTF-8 first (most common)
    if let Ok(s) = std::str::from_utf8(bytes) {
        return Ok(s.to_string());
    }

    // Try UTF-16 (BOM detection)
    if bytes.len() >= 2 {
        if bytes[0] == 0xFF && bytes[1] == 0xFE {
            // UTF-16LE
            return String::from_utf16le(bytes)
                .map_err(|_| {
                    BackendError::new(
                        errors::file::ENCODING_ERROR,
                        "Invalid UTF-16LE encoding",
                    )
                });
        }
        if bytes[0] == 0xFE && bytes[1] == 0xFF {
            // UTF-16BE
            return String::from_utf16be(bytes)
                .map_err(|_| {
                    BackendError::new(
                        errors::file::ENCODING_ERROR,
                        "Invalid UTF-16BE encoding",
                    )
                });
        }
    }

    // Fallback to Windows-1252 (Windows encoding)
    let decoded: String = bytes
        .iter()
        .map(|&b| {
            // Simple Windows-1252 to Unicode mapping for common characters
            match b {
                0x80..=0x9F => {
                    // Control characters, map to Unicode equivalents
                    char::from_u32(0x20AC + (b as u32 - 0x80)).unwrap_or('?')
                }
                _ => b as char,
            }
        })
        .collect();

    Ok(decoded)
}

/// Parse CSV content into records
fn parse_csv(content: &str) -> Result<Vec<Vec<String>>, BackendError> {
    let mut records = Vec::new();

    for line in content.lines() {
        let record: Vec<String> = line
            .split(',')
            .map(|field| field.trim().to_string())
            .collect();
        records.push(record);
    }

    if records.is_empty() {
        return Err(BackendError::new(
            errors::file::INVALID_FORMAT,
            "CSV file is empty or invalid",
        ));
    }

    Ok(records)
}

// UTF-16 helper extensions
trait Utf16Decode {
    fn from_utf16le(bytes: &[u8]) -> Result<String, ()>;
    fn from_utf16be(bytes: &[u8]) -> Result<String, ()>;
}

impl Utf16Decode for String {
    fn from_utf16le(bytes: &[u8]) -> Result<String, ()> {
        let mut u16_vec = Vec::new();
        for chunk in bytes.chunks_exact(2) {
            u16_vec.push(u16::from_le_bytes([chunk[0], chunk[1]]));
        }
        String::from_utf16(&u16_vec).map_err(|_| ())
    }

    fn from_utf16be(bytes: &[u8]) -> Result<String, ()> {
        let mut u16_vec = Vec::new();
        for chunk in bytes.chunks_exact(2) {
            u16_vec.push(u16::from_be_bytes([chunk[0], chunk[1]]));
        }
        String::from_utf16(&u16_vec).map_err(|_| ())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_csv_parse() {
        let csv = "Name,Age,Grade\nAlice,25,A\nBob,23,B";
        let records = parse_csv(csv).unwrap();
        assert_eq!(records.len(), 3);
        assert_eq!(records[0], vec!["Name", "Age", "Grade"]);
    }

    #[test]
    fn test_encoding_utf8() {
        let bytes = "Hello, UTF-8!".as_bytes();
        let result = detect_and_decode(bytes).unwrap();
        assert_eq!(result, "Hello, UTF-8!");
    }

    #[test]
    fn test_csv_empty_error() {
        let csv = "";
        let result = parse_csv(csv);
        assert!(result.is_err());
    }
}

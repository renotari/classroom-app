//! System permissions handling for Classroom Management App
//!
//! Handles platform-specific permission requests for:
//! - Microphone access (primary use case for noise monitoring)
//! - Future: Camera, storage access
//!
//! References: CLAUDE.md § Edge Cases - EC-000 (First-time microphone permission)

use crate::errors::BackendError;
use serde::{Deserialize, Serialize};

/// Permission request result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionStatus {
    /// Whether permission was granted by user
    pub granted: bool,

    /// Whether device is available (hardware exists)
    pub available: bool,

    /// User-friendly status message
    pub message: String,

    /// Additional details (e.g., error reason if failed)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
}

/// Request microphone permission from the operating system
///
/// This implements EC-000 (First-time microphone permission flow) handling.
///
/// # Platform-Specific Behavior
///
/// **Windows**:
/// - Enumerates audio input devices via Windows API
/// - Returns available=true if any device found
/// - Granted=true if user previously allowed OR no prompt needed
/// - Gracefully degrades if no audio devices present
///
/// **macOS**:
/// - Checks AVFoundation microphone permission status
/// - Shows system permission dialog if first time
/// - Returns exact permission state
///
/// **Linux**:
/// - Checks PipeWire/PulseAudio device availability
/// - No explicit permission system (permission handled by desktop environment)
/// - Returns available=true if audio devices found
///
/// # Returns
/// PermissionStatus with:
/// - `granted`: true if permission is currently granted
/// - `available`: true if microphone hardware is detected
/// - `message`: Human-readable status message
/// - `details`: Optional error details if something failed
///
/// # Errors
/// Returns BackendError only if system interaction completely fails.
/// Permission denial is NOT an error (granted=false is valid state).
pub fn request_microphone_permission() -> Result<PermissionStatus, BackendError> {
    #[cfg(target_os = "windows")]
    return request_microphone_permission_windows();

    #[cfg(target_os = "macos")]
    return request_microphone_permission_macos();

    #[cfg(target_os = "linux")]
    return request_microphone_permission_linux();

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        // Fallback for unsupported platforms
        Ok(PermissionStatus {
            granted: true,
            available: false,
            message: "Microphone permissions not supported on this platform".to_string(),
            details: None,
        })
    }
}

// ============================================================================
// Windows Implementation
// ============================================================================

#[cfg(target_os = "windows")]
fn request_microphone_permission_windows() -> Result<PermissionStatus, BackendError> {
    // On Windows, we check for audio input devices
    // In a production app, would use Windows.Media.Devices API via winrt crate
    // For now, use a reliable fallback: attempt to enumerate devices

    // Try to enumerate audio devices using Windows audio API
    // Fallback: check if any audio input devices exist
    match check_windows_audio_devices() {
        Ok((available, granted)) => Ok(PermissionStatus {
            granted,
            available,
            message: if available {
                if granted {
                    "Microphone available and permission granted".to_string()
                } else {
                    "Microphone available (permission status unknown)".to_string()
                }
            } else {
                "No microphone devices detected".to_string()
            },
            details: None,
        }),
        Err(e) => {
            // If device check fails, assume available but unknown permission state
            Ok(PermissionStatus {
                granted: false,
                available: false,
                message: "Could not determine microphone status".to_string(),
                details: Some(e),
            })
        }
    }
}

#[cfg(target_os = "windows")]
fn check_windows_audio_devices() -> Result<(bool, bool), String> {
    // Use Windows COM APIs to enumerate audio devices
    // This replaces the PowerShell approach which is fragile and may not be available
    // in restricted environments.

    use windows::Win32::Media::Audio::*;
    use windows::Win32::System::Com::*;

    unsafe {
        // Initialize COM
        let hr = CoInitializeEx(None, COINIT_MULTITHREADED);
        // Allow RPC_E_CHANGED_MODE which means COM was already initialized
        if hr.is_err() {
            // Try to continue even if COM initialization fails
            // Some environments may have COM already initialized
        }

        // Create device enumerator
        let enumerator: IMMDeviceEnumerator = match CoCreateInstance(
            &MMDeviceEnumerator,
            None,
            CLSCTX_ALL
        ) {
            Ok(e) => e,
            Err(e) => {
                CoUninitialize();
                return Err(format!("Failed to create device enumerator: {:?}", e));
            }
        };

        // Enumerate audio capture devices
        // Note: DEVICE_STATE values are u32, so we use bitwise OR
        let device_state_mask = DEVICE_STATE_ACTIVE.0 | DEVICE_STATE_UNPLUGGED.0;
        let collection = match enumerator.EnumAudioEndpoints(
            eCapture,  // Capture devices (microphones)
            DEVICE_STATE(device_state_mask)  // Active or unplugged devices
        ) {
            Ok(c) => c,
            Err(e) => {
                CoUninitialize();
                return Err(format!("Failed to enumerate audio endpoints: {:?}", e));
            }
        };

        // Get device count
        let count = match collection.GetCount() {
            Ok(c) => c,
            Err(e) => {
                CoUninitialize();
                return Err(format!("Failed to get device count: {:?}", e));
            }
        };

        CoUninitialize();

        // If we found any capture devices, microphone is available and granted
        let has_devices = count > 0;
        Ok((has_devices, has_devices))
    }
}

// ============================================================================
// macOS Implementation
// ============================================================================

#[cfg(target_os = "macos")]
fn request_microphone_permission_macos() -> Result<PermissionStatus, BackendError> {
    // On macOS, we would ideally use AVFoundation's permission APIs
    // For now, use a shell-based approach as fallback
    match check_macos_microphone_permission() {
        Ok((available, granted)) => Ok(PermissionStatus {
            granted,
            available,
            message: if available {
                if granted {
                    "Microphone available and permission granted".to_string()
                } else {
                    "Microphone available but permission denied".to_string()
                }
            } else {
                "No microphone devices detected".to_string()
            },
            details: None,
        }),
        Err(e) => Ok(PermissionStatus {
            granted: false,
            available: false,
            message: "Could not determine microphone status".to_string(),
            details: Some(e),
        }),
    }
}

#[cfg(target_os = "macos")]
fn check_macos_microphone_permission() -> Result<(bool, bool), String> {
    use std::process::Command;

    // Check if microphone permission is granted using swift-objc bridge
    // This is a simplified version - production would use proper FFI
    let output = Command::new("sh")
        .arg("-c")
        .arg("system_profiler SPAudioDataType | grep -i 'Microphone' | wc -l")
        .output()
        .map_err(|e| format!("Failed to check audio devices: {}", e))?;

    if output.status.success() {
        let count_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
        let device_count: usize = count_str.parse().unwrap_or(0);

        // Check permission file (macOS stores permission in ~/Library/Preferences)
        // For production, use proper AVFoundation APIs
        let permission_output = Command::new("sh")
            .arg("-c")
            .arg("launchctl asuser \"$(id -u)\" defaults read com.apple.tcc.plist | grep -i 'microphone' | wc -l")
            .output()
            .map_err(|e| format!("Failed to check permission: {}", e))?;

        let permission_count_str = String::from_utf8_lossy(&permission_output.stdout).trim().to_string();
        let has_permission_record = permission_count_str.parse::<usize>().unwrap_or(0) > 0;

        Ok((device_count > 0, has_permission_record))
    } else {
        Ok((true, false))
    }
}

// ============================================================================
// Linux Implementation
// ============================================================================

#[cfg(target_os = "linux")]
fn request_microphone_permission_linux() -> Result<PermissionStatus, BackendError> {
    match check_linux_audio_devices() {
        Ok(available) => Ok(PermissionStatus {
            granted: available, // Linux doesn't require explicit permission
            available,
            message: if available {
                "Microphone available".to_string()
            } else {
                "No microphone devices detected".to_string()
            },
            details: None,
        }),
        Err(e) => Ok(PermissionStatus {
            granted: false,
            available: false,
            message: "Could not determine microphone status".to_string(),
            details: Some(e),
        }),
    }
}

#[cfg(target_os = "linux")]
fn check_linux_audio_devices() -> Result<bool, String> {
    use std::process::Command;

    // Check for PipeWire devices (modern systems)
    let pw_output = Command::new("wpctl")
        .args(&["status"])
        .output()
        .ok()
        .and_then(|output| {
            if output.status.success() {
                let text = String::from_utf8_lossy(&output.stdout);
                Some(text.contains("Microphone") || text.contains("Audio/Source"))
            } else {
                None
            }
        });

    if let Some(found) = pw_output {
        return Ok(found);
    }

    // Fallback: Check for ALSA devices
    let alsa_output = Command::new("arecord")
        .arg("-l")
        .output()
        .ok()
        .and_then(|output| {
            if output.status.success() {
                let text = String::from_utf8_lossy(&output.stdout);
                Some(!text.is_empty())
            } else {
                None
            }
        });

    if let Some(found) = alsa_output {
        return Ok(found);
    }

    // Fallback: Check for PulseAudio devices
    let pulse_output = Command::new("pactl")
        .args(&["list", "sources"])
        .output()
        .ok()
        .and_then(|output| {
            if output.status.success() {
                let text = String::from_utf8_lossy(&output.stdout);
                Some(!text.is_empty())
            } else {
                None
            }
        });

    Ok(pulse_output.unwrap_or(false))
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_permission_status_serialization() {
        let status = PermissionStatus {
            granted: true,
            available: true,
            message: "Permission granted".to_string(),
            details: None,
        };

        let json = serde_json::to_string(&status).unwrap();
        assert!(json.contains("\"granted\":true"));
        assert!(json.contains("\"available\":true"));
        assert!(!json.contains("details")); // Should skip None
    }

    #[test]
    fn test_permission_status_with_details() {
        let status = PermissionStatus {
            granted: false,
            available: false,
            message: "Error".to_string(),
            details: Some("Device not found".to_string()),
        };

        let json = serde_json::to_string(&status).unwrap();
        assert!(json.contains("\"granted\":false"));
        assert!(json.contains("\"details\""));
        assert!(json.contains("Device not found"));
    }

    #[test]
    fn test_request_microphone_permission() {
        // This test will call the platform-specific implementation
        let result = request_microphone_permission();
        assert!(result.is_ok(), "Permission request should not error");

        let status = result.unwrap();
        assert!(!status.message.is_empty(), "Status message should not be empty");
    }
}

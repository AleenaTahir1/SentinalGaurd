use crate::models::{UsbDevice, DashboardStats};
use crate::services::{powershell, storage};
use crate::commands::whitelist::is_device_trusted;

/// Gets all connected USB devices with their trust status
#[tauri::command]
pub fn get_connected_devices() -> Result<Vec<UsbDevice>, String> {
    let json_output = powershell::get_usb_devices_json()
        .map_err(|e| e.to_string())?;
    
    // Handle empty or null output
    if json_output.is_empty() || json_output == "null" {
        return Ok(vec![]);
    }
    
    // Parse the JSON - PowerShell returns array or single object
    let devices: Vec<UsbDevice> = if json_output.starts_with('[') {
        // Array of devices
        let raw: Vec<serde_json::Value> = serde_json::from_str(&json_output)
            .map_err(|e| format!("JSON parse error: {}", e))?;
        
        raw.into_iter().filter_map(|v| {
            let instance_id = v.get("instance_id")?.as_str()?.to_string();
            let friendly_name = v.get("friendly_name")?.as_str()?.to_string();
            let device_class = v.get("device_class")?.as_str()?.to_string();
            let status = v.get("status")?.as_str()?.to_string();
            let is_trusted = is_device_trusted(&instance_id).unwrap_or(false);
            
            Some(UsbDevice {
                instance_id,
                friendly_name,
                device_class,
                status,
                is_trusted,
            })
        }).collect()
    } else {
        // Single device object
        let v: serde_json::Value = serde_json::from_str(&json_output)
            .map_err(|e| format!("JSON parse error: {}", e))?;
        
        let instance_id = v.get("instance_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let friendly_name = v.get("friendly_name").and_then(|v| v.as_str()).unwrap_or("Unknown").to_string();
        let device_class = v.get("device_class").and_then(|v| v.as_str()).unwrap_or("USB").to_string();
        let status = v.get("status").and_then(|v| v.as_str()).unwrap_or("OK").to_string();
        let is_trusted = is_device_trusted(&instance_id).unwrap_or(false);
        
        if !instance_id.is_empty() {
            vec![UsbDevice {
                instance_id,
                friendly_name,
                device_class,
                status,
                is_trusted,
            }]
        } else {
            vec![]
        }
    };
    
    Ok(devices)
}

/// Enables a previously disabled device
#[tauri::command]
pub fn enable_device(instance_id: String) -> Result<(), String> {
    powershell::enable_device(&instance_id)
        .map_err(|e| e.to_string())?;
    
    // Log the event
    let _ = crate::commands::logs::add_event_log(
        "INFO".to_string(),
        format!("Device enabled: {}", instance_id),
        Some(instance_id),
    );
    
    Ok(())
}

/// Disables a device (blocks it)
#[tauri::command]
pub fn disable_device(instance_id: String) -> Result<(), String> {
    powershell::disable_device(&instance_id)
        .map_err(|e| e.to_string())?;
    
    // Log the event
    let _ = crate::commands::logs::add_event_log(
        "BLOCK".to_string(),
        format!("Device blocked: {}", instance_id),
        Some(instance_id),
    );
    
    Ok(())
}

/// Gets dashboard statistics
#[tauri::command]
pub fn get_dashboard_stats() -> Result<DashboardStats, String> {
    let devices = get_connected_devices()?;
    let logs = crate::commands::logs::get_event_logs()?;
    
    let total_devices = devices.len();
    let trusted_devices = devices.iter().filter(|d| d.is_trusted).count();
    let blocked_devices = devices.iter().filter(|d| !d.is_trusted).count();
    let blocked_threats = logs.iter().filter(|l| l.level == "BLOCK").count();
    let total_scans = logs.len();
    let is_secure = blocked_devices == 0;
    
    Ok(DashboardStats {
        total_devices,
        trusted_devices,
        blocked_devices,
        total_scans,
        blocked_threats,
        is_secure,
    })
}

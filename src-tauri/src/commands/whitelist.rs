use crate::models::{WhitelistEntry, WhitelistData, UsbDevice};
use crate::services::storage;
use chrono::Utc;

const WHITELIST_FILE: &str = "whitelist.json";

/// Gets all whitelisted devices
#[tauri::command]
pub fn get_whitelist() -> Result<Vec<WhitelistEntry>, String> {
    let data: WhitelistData = storage::read_json(WHITELIST_FILE)
        .map_err(|e| e.to_string())?;
    Ok(data.entries)
}

/// Checks if a device is in the whitelist
pub fn is_device_trusted(instance_id: &str) -> Result<bool, String> {
    let data: WhitelistData = storage::read_json(WHITELIST_FILE)
        .map_err(|e| e.to_string())?;
    Ok(data.entries.iter().any(|e| e.instance_id == instance_id))
}

/// Adds a device to the whitelist
#[tauri::command]
pub fn add_to_whitelist(device: UsbDevice) -> Result<(), String> {
    let mut data: WhitelistData = storage::read_json(WHITELIST_FILE)
        .map_err(|e| e.to_string())?;
    
    // Check if already exists
    if data.entries.iter().any(|e| e.instance_id == device.instance_id) {
        return Ok(()); // Already whitelisted
    }
    
    let entry = WhitelistEntry {
        instance_id: device.instance_id.clone(),
        friendly_name: device.friendly_name.clone(),
        added_at: Utc::now().to_rfc3339(),
    };
    
    data.entries.push(entry);
    storage::write_json(WHITELIST_FILE, &data)
        .map_err(|e| e.to_string())?;
    
    // Log the event
    let _ = crate::commands::logs::add_event_log(
        "INFO".to_string(),
        format!("Device trusted: {}", device.friendly_name),
        Some(device.instance_id),
    );
    
    Ok(())
}

/// Removes a device from the whitelist
#[tauri::command]
pub fn remove_from_whitelist(instance_id: String) -> Result<(), String> {
    let mut data: WhitelistData = storage::read_json(WHITELIST_FILE)
        .map_err(|e| e.to_string())?;
    
    let original_len = data.entries.len();
    data.entries.retain(|e| e.instance_id != instance_id);
    
    if data.entries.len() != original_len {
        storage::write_json(WHITELIST_FILE, &data)
            .map_err(|e| e.to_string())?;
        
        // Log the event
        let _ = crate::commands::logs::add_event_log(
            "WARN".to_string(),
            format!("Device removed from whitelist: {}", instance_id),
            Some(instance_id),
        );
    }
    
    Ok(())
}

/// Clears the entire whitelist
#[tauri::command]
pub fn clear_whitelist() -> Result<(), String> {
    let data = WhitelistData::default();
    storage::write_json(WHITELIST_FILE, &data)
        .map_err(|e| e.to_string())?;
    
    let _ = crate::commands::logs::add_event_log(
        "WARN".to_string(),
        "Whitelist cleared".to_string(),
        None,
    );
    
    Ok(())
}

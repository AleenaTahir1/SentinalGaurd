use crate::models::{EventLog, LogsData};
use crate::services::storage;
use chrono::Utc;
use uuid::Uuid;

const LOGS_FILE: &str = "logs.json";

/// Gets all event logs
#[tauri::command]
pub fn get_event_logs() -> Result<Vec<EventLog>, String> {
    let data: LogsData = storage::read_json(LOGS_FILE)
        .map_err(|e| e.to_string())?;
    
    // Return in reverse chronological order (newest first)
    let mut events = data.events;
    events.reverse();
    Ok(events)
}

/// Adds a new event log entry
#[tauri::command]
pub fn add_event_log(level: String, message: String, device_id: Option<String>) -> Result<EventLog, String> {
    let mut data: LogsData = storage::read_json(LOGS_FILE)
        .map_err(|e| e.to_string())?;
    
    let event = EventLog {
        id: Uuid::new_v4().to_string(),
        timestamp: Utc::now().format("%H:%M:%S").to_string(),
        level,
        message,
        device_id,
    };
    
    data.events.push(event.clone());
    
    // Keep only last 1000 events
    if data.events.len() > 1000 {
        data.events = data.events.split_off(data.events.len() - 1000);
    }
    
    storage::write_json(LOGS_FILE, &data)
        .map_err(|e| e.to_string())?;
    
    Ok(event)
}

/// Clears all event logs
#[tauri::command]
pub fn clear_logs() -> Result<(), String> {
    let data = LogsData::default();
    storage::write_json(LOGS_FILE, &data)
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Exports logs to a file and returns the file path
#[tauri::command]
pub fn export_logs() -> Result<String, String> {
    let data: LogsData = storage::read_json(LOGS_FILE)
        .map_err(|e| e.to_string())?;
    
    let export_dir = storage::get_app_data_dir()
        .map_err(|e| e.to_string())?;
    
    let filename = format!("sentinelguard_logs_{}.json", Utc::now().format("%Y%m%d_%H%M%S"));
    let export_path = export_dir.join(&filename);
    
    let content = serde_json::to_string_pretty(&data.events)
        .map_err(|e| e.to_string())?;
    
    std::fs::write(&export_path, content)
        .map_err(|e| e.to_string())?;
    
    Ok(export_path.to_string_lossy().to_string())
}

/// Gets log statistics
#[tauri::command]
pub fn get_log_stats() -> Result<serde_json::Value, String> {
    let data: LogsData = storage::read_json(LOGS_FILE)
        .map_err(|e| e.to_string())?;
    
    let total = data.events.len();
    let info_count = data.events.iter().filter(|e| e.level == "INFO").count();
    let warn_count = data.events.iter().filter(|e| e.level == "WARN").count();
    let block_count = data.events.iter().filter(|e| e.level == "BLOCK").count();
    let error_count = data.events.iter().filter(|e| e.level == "ERROR").count();
    
    Ok(serde_json::json!({
        "total": total,
        "info": info_count,
        "warn": warn_count,
        "block": block_count,
        "error": error_count
    }))
}

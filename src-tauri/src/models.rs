use serde::{Deserialize, Serialize};

/// Represents a connected USB device
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsbDevice {
    pub instance_id: String,
    pub friendly_name: String,
    pub device_class: String,
    pub status: String,
    pub is_trusted: bool,
}

/// Represents a device in the whitelist
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhitelistEntry {
    pub instance_id: String,
    pub friendly_name: String,
    pub added_at: String,
}

/// Represents an event log entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventLog {
    pub id: String,
    pub timestamp: String,
    pub level: String, // "INFO", "WARN", "BLOCK", "ERROR"
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub device_id: Option<String>,
}

/// Application state stored in whitelist.json
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct WhitelistData {
    pub entries: Vec<WhitelistEntry>,
}

/// Application state stored in logs.json
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct LogsData {
    pub events: Vec<EventLog>,
}

/// Dashboard statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardStats {
    pub total_devices: usize,
    pub trusted_devices: usize,
    pub blocked_devices: usize,
    pub total_scans: usize,
    pub blocked_threats: usize,
    pub is_secure: bool,
}

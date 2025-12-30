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

/// Represents a saved WiFi profile
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WifiProfile {
    pub ssid: String,
    pub password: Option<String>,
    pub authentication: String,
    pub encryption: String,
}

/// System information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os_name: String,
    pub os_version: String,
    pub computer_name: String,
    pub total_ram_gb: f64,
    pub cpu_name: String,
    pub cpu_cores: u32,
}

/// Startup program entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartupProgram {
    pub name: String,
    pub command: String,
    pub location: String,
    pub user: String,
}

/// Network adapter information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkInfo {
    pub adapter_name: String,
    pub ip_address: String,
    pub subnet_mask: String,
    pub gateway: String,
    pub dns_servers: String,
    pub mac_address: String,
    pub status: String,
}


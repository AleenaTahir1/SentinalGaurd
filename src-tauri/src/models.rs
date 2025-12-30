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
    pub os_build: String,
    pub computer_name: String,
    pub username: String,
    pub domain: String,
    pub total_ram_gb: f64,
    pub available_ram_gb: f64,
    pub cpu_name: String,
    pub cpu_cores: u32,
    pub cpu_threads: u32,
    pub uptime_hours: f64,
    pub disk_total_gb: f64,
    pub disk_free_gb: f64,
    pub last_boot: String,
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

/// Temp file info for cleanup
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TempFileInfo {
    pub path: String,
    pub size_mb: f64,
    pub file_count: u32,
}

/// Cleanup result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanupResult {
    pub deleted_count: u32,
    pub freed_mb: f64,
    pub errors: Vec<String>,
}

/// Firewall rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirewallRule {
    pub name: String,
    pub enabled: bool,
    pub direction: String,
    pub action: String,
    pub protocol: String,
    pub local_port: String,
}

/// Firewall profile status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirewallStatus {
    pub domain_enabled: bool,
    pub private_enabled: bool,
    pub public_enabled: bool,
}

/// Process info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub id: u32,
    pub name: String,
    pub cpu_percent: f64,
    pub memory_mb: f64,
    pub path: String,
}

/// Service info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceInfo {
    pub name: String,
    pub display_name: String,
    pub status: String,
    pub start_type: String,
}

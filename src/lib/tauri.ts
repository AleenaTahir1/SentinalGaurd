import { invoke } from "@tauri-apps/api/core";

// ============================================
// Types (mirroring Rust models)
// ============================================

export interface UsbDevice {
    instance_id: string;
    friendly_name: string;
    device_class: string;
    status: string;
    is_trusted: boolean;
}

export interface WhitelistEntry {
    instance_id: string;
    friendly_name: string;
    added_at: string;
}

export interface EventLog {
    id: string;
    timestamp: string;
    level: "INFO" | "WARN" | "BLOCK" | "ERROR";
    message: string;
    device_id?: string;
}

export interface DashboardStats {
    total_devices: number;
    trusted_devices: number;
    blocked_devices: number;
    total_scans: number;
    blocked_threats: number;
    is_secure: boolean;
}

export interface LogStats {
    total: number;
    info: number;
    warn: number;
    block: number;
    error: number;
}

export interface WifiProfile {
    ssid: string;
    password: string | null;
    authentication: string;
    encryption: string;
}

export interface SystemInfo {
    os_name: string;
    os_version: string;
    os_build: string;
    computer_name: string;
    username: string;
    domain: string;
    total_ram_gb: number;
    available_ram_gb: number;
    cpu_name: string;
    cpu_cores: number;
    cpu_threads: number;
    uptime_hours: number;
    disk_total_gb: number;
    disk_free_gb: number;
    last_boot: string;
}

// ============================================
// API Functions
// ============================================

// Check if running in Tauri
const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

// Device Commands
export async function getConnectedDevices(): Promise<UsbDevice[]> {
    if (!isTauri()) return [];
    return invoke<UsbDevice[]>("get_connected_devices");
}

export async function enableDevice(instanceId: string): Promise<void> {
    if (!isTauri()) return;
    return invoke("enable_device", { instanceId });
}

export async function disableDevice(instanceId: string): Promise<void> {
    if (!isTauri()) return;
    return invoke("disable_device", { instanceId });
}

export async function getDashboardStats(): Promise<DashboardStats> {
    if (!isTauri()) {
        return {
            total_devices: 0,
            trusted_devices: 0,
            blocked_devices: 0,
            total_scans: 0,
            blocked_threats: 0,
            is_secure: true,
        };
    }
    return invoke<DashboardStats>("get_dashboard_stats");
}

// Whitelist Commands
export async function getWhitelist(): Promise<WhitelistEntry[]> {
    if (!isTauri()) return [];
    return invoke<WhitelistEntry[]>("get_whitelist");
}

export async function addToWhitelist(device: UsbDevice): Promise<void> {
    if (!isTauri()) return;
    return invoke("add_to_whitelist", { device });
}

export async function removeFromWhitelist(instanceId: string): Promise<void> {
    if (!isTauri()) return;
    return invoke("remove_from_whitelist", { instanceId });
}

export async function clearWhitelist(): Promise<void> {
    if (!isTauri()) return;
    return invoke("clear_whitelist");
}

// Log Commands
export async function getEventLogs(): Promise<EventLog[]> {
    if (!isTauri()) return [];
    return invoke<EventLog[]>("get_event_logs");
}

export async function addEventLog(
    level: string,
    message: string,
    deviceId?: string
): Promise<EventLog | null> {
    if (!isTauri()) return null;
    return invoke<EventLog>("add_event_log", { level, message, deviceId });
}

export async function clearLogs(): Promise<void> {
    if (!isTauri()) return;
    return invoke("clear_logs");
}

export async function exportLogs(): Promise<string> {
    if (!isTauri()) return "";
    return invoke<string>("export_logs");
}

export async function getLogStats(): Promise<LogStats> {
    if (!isTauri()) {
        return { total: 0, info: 0, warn: 0, block: 0, error: 0 };
    }
    return invoke<LogStats>("get_log_stats");
}

// WiFi Commands
export async function getWifiProfiles(): Promise<WifiProfile[]> {
    if (!isTauri()) return [];
    return invoke<WifiProfile[]>("get_wifi_profiles");
}

export async function getWifiPassword(ssid: string): Promise<WifiProfile> {
    if (!isTauri()) {
        return { ssid, password: null, authentication: "", encryption: "" };
    }
    return invoke<WifiProfile>("get_wifi_password", { ssid });
}

// System Commands
export async function getSystemInfo(): Promise<SystemInfo> {
    if (!isTauri()) {
        return {
            os_name: "Unknown",
            os_version: "",
            os_build: "",
            computer_name: "",
            username: "",
            domain: "",
            total_ram_gb: 0,
            available_ram_gb: 0,
            cpu_name: "",
            cpu_cores: 0,
            cpu_threads: 0,
            uptime_hours: 0,
            disk_total_gb: 0,
            disk_free_gb: 0,
            last_boot: "",
        };
    }
    return invoke<SystemInfo>("get_system_info");
}

// Startup Program interface and commands
export interface StartupProgram {
    name: string;
    command: string;
    location: string;
    user: string;
}

export async function getStartupPrograms(): Promise<StartupProgram[]> {
    if (!isTauri()) return [];
    return invoke<StartupProgram[]>("get_startup_programs");
}

// Network Info interface and commands
export interface NetworkInfo {
    adapter_name: string;
    ip_address: string;
    subnet_mask: string;
    gateway: string;
    dns_servers: string;
    mac_address: string;
    status: string;
}

export async function getNetworkInfo(): Promise<NetworkInfo[]> {
    if (!isTauri()) return [];
    return invoke<NetworkInfo[]>("get_network_info");
}

export async function getConnectedWifi(): Promise<[string, string] | null> {
    if (!isTauri()) return null;
    return invoke<[string, string] | null>("get_connected_wifi");
}

// ============================================
// Cleanup Types & Commands
// ============================================

export interface TempFileInfo {
    path: string;
    size_mb: number;
    file_count: number;
}

export interface CleanupResult {
    deleted_count: number;
    freed_mb: number;
    errors: string[];
}

export async function getTempInfo(): Promise<TempFileInfo[]> {
    if (!isTauri()) return [];
    return invoke<TempFileInfo[]>("get_temp_info");
}

export async function cleanTempFiles(): Promise<CleanupResult> {
    if (!isTauri()) return { deleted_count: 0, freed_mb: 0, errors: [] };
    return invoke<CleanupResult>("clean_temp_files");
}

// ============================================
// Firewall Types & Commands
// ============================================

export interface FirewallRule {
    name: string;
    enabled: boolean;
    direction: string;
    action: string;
    protocol: string;
    local_port: string;
}

export interface FirewallStatus {
    domain_enabled: boolean;
    private_enabled: boolean;
    public_enabled: boolean;
}

export async function getFirewallStatus(): Promise<FirewallStatus> {
    if (!isTauri()) return { domain_enabled: false, private_enabled: false, public_enabled: false };
    return invoke<FirewallStatus>("get_firewall_status");
}

export async function getFirewallRules(): Promise<FirewallRule[]> {
    if (!isTauri()) return [];
    return invoke<FirewallRule[]>("get_firewall_rules");
}

export async function blockPort(port: number, protocol: string, ruleName: string): Promise<void> {
    if (!isTauri()) return;
    return invoke("block_port", { port, protocol, ruleName });
}

export async function removeFirewallRule(ruleName: string): Promise<void> {
    if (!isTauri()) return;
    return invoke("remove_firewall_rule", { ruleName });
}

export async function enableFirewallLogging(): Promise<void> {
    if (!isTauri()) return;
    return invoke("enable_firewall_logging");
}

// ============================================
// Process & Service Types & Commands
// ============================================

export interface ProcessInfo {
    id: number;
    name: string;
    cpu_percent: number;
    memory_mb: number;
    path: string;
}

export interface ServiceInfo {
    name: string;
    display_name: string;
    status: string;
    start_type: string;
}

export async function getHighMemoryProcesses(): Promise<ProcessInfo[]> {
    if (!isTauri()) return [];
    return invoke<ProcessInfo[]>("get_high_memory_processes");
}

export async function killProcess(processId: number): Promise<void> {
    if (!isTauri()) return;
    return invoke("kill_process", { processId });
}

export async function getCriticalServices(): Promise<ServiceInfo[]> {
    if (!isTauri()) return [];
    return invoke<ServiceInfo[]>("get_critical_services");
}

export async function restartService(serviceName: string): Promise<void> {
    if (!isTauri()) return;
    return invoke("restart_service", { serviceName });
}

export async function startService(serviceName: string): Promise<void> {
    if (!isTauri()) return;
    return invoke("start_service", { serviceName });
}

// Convenience API object
export const api = {
    getConnectedDevices,
    enableDevice,
    disableDevice,
    getDashboardStats,
    getWhitelist,
    addToWhitelist,
    removeFromWhitelist,
    clearWhitelist,
    getEventLogs,
    addEventLog,
    clearLogs,
    exportLogs,
    getLogStats,
    getWifiProfiles,
    getWifiPassword,
    getSystemInfo,
    getStartupPrograms,
    getNetworkInfo,
    getConnectedWifi,
    getTempInfo,
    cleanTempFiles,
    getFirewallStatus,
    getFirewallRules,
    blockPort,
    removeFirewallRule,
    enableFirewallLogging,
    getHighMemoryProcesses,
    killProcess,
    getCriticalServices,
    restartService,
    startService,
};

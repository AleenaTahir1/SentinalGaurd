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
};

mod commands;
mod models;
mod services;

use commands::{devices, whitelist, logs, wifi, system, startup, network, cleanup, firewall, processes};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // Device commands
            devices::get_connected_devices,
            devices::enable_device,
            devices::disable_device,
            devices::get_dashboard_stats,
            // Whitelist commands
            whitelist::get_whitelist,
            whitelist::add_to_whitelist,
            whitelist::remove_from_whitelist,
            whitelist::clear_whitelist,
            // Log commands
            logs::get_event_logs,
            logs::add_event_log,
            logs::clear_logs,
            logs::export_logs,
            logs::get_log_stats,
            // WiFi commands
            wifi::get_wifi_profiles,
            wifi::get_wifi_password,
            // System commands
            system::get_system_info,
            // Startup commands
            startup::get_startup_programs,
            // Network commands
            network::get_network_info,
            network::get_connected_wifi,
            // Cleanup commands
            cleanup::get_temp_info,
            cleanup::clean_temp_files,
            // Firewall commands
            firewall::get_firewall_status,
            firewall::get_firewall_rules,
            firewall::block_port,
            firewall::remove_firewall_rule,
            firewall::enable_firewall_logging,
            // Process/Service commands
            processes::get_high_memory_processes,
            processes::kill_process,
            processes::get_critical_services,
            processes::restart_service,
            processes::start_service,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


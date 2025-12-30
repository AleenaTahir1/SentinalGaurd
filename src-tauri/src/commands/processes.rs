use crate::models::{ProcessInfo, ServiceInfo};
use crate::services::powershell;

/// Gets processes using high memory (>100 MB)
#[tauri::command]
pub fn get_high_memory_processes() -> Result<Vec<ProcessInfo>, String> {
    let script = r#"
        Get-Process -ErrorAction SilentlyContinue | 
            Where-Object { $_.WorkingSet64 -gt 100MB } | 
            Sort-Object WorkingSet64 -Descending |
            Select-Object -First 20 |
            ForEach-Object {
                @{
                    id = $_.Id
                    name = $_.ProcessName
                    cpu_percent = [math]::Round($_.CPU, 2)
                    memory_mb = [math]::Round($_.WorkingSet64 / 1MB, 2)
                    path = if ($_.Path) { $_.Path } else { "" }
                }
            } | ConvertTo-Json -Compress
    "#;

    let json_output = powershell::execute(script).map_err(|e| e.to_string())?;

    if json_output.is_empty() || json_output == "null" {
        return Ok(vec![]);
    }

    let processes: Vec<ProcessInfo> = if json_output.starts_with('[') {
        serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?
    } else {
        let single: ProcessInfo =
            serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?;
        vec![single]
    };

    Ok(processes)
}

/// Kills a process by ID
#[tauri::command]
pub fn kill_process(process_id: u32) -> Result<(), String> {
    let script = format!(
        r#"Stop-Process -Id {} -Force -ErrorAction Stop"#,
        process_id
    );

    powershell::execute(&script).map_err(|e| e.to_string())?;

    let _ = crate::commands::logs::add_event_log(
        "WARN".to_string(),
        format!("Process killed: ID {}", process_id),
        None,
    );

    Ok(())
}

/// Gets critical Windows services status
#[tauri::command]
pub fn get_critical_services() -> Result<Vec<ServiceInfo>, String> {
    let script = r#"
        $criticalServices = @('wuauserv', 'bits', 'WinDefend', 'MpsSvc', 'EventLog', 'Spooler', 'W32Time')
        Get-Service -Name $criticalServices -ErrorAction SilentlyContinue |
            ForEach-Object {
                @{
                    name = $_.Name
                    display_name = $_.DisplayName
                    status = $_.Status.ToString()
                    start_type = $_.StartType.ToString()
                }
            } | ConvertTo-Json -Compress
    "#;

    let json_output = powershell::execute(script).map_err(|e| e.to_string())?;

    if json_output.is_empty() || json_output == "null" {
        return Ok(vec![]);
    }

    let services: Vec<ServiceInfo> = if json_output.starts_with('[') {
        serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?
    } else {
        let single: ServiceInfo =
            serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?;
        vec![single]
    };

    Ok(services)
}

/// Restarts a service by name
#[tauri::command]
pub fn restart_service(service_name: String) -> Result<(), String> {
    let script = format!(
        r#"Restart-Service -Name '{}' -Force -ErrorAction Stop"#,
        service_name.replace("'", "''")
    );

    powershell::execute(&script).map_err(|e| e.to_string())?;

    let _ = crate::commands::logs::add_event_log(
        "INFO".to_string(),
        format!("Service restarted: {}", service_name),
        None,
    );

    Ok(())
}

/// Starts a stopped service
#[tauri::command]
pub fn start_service(service_name: String) -> Result<(), String> {
    let script = format!(
        r#"Start-Service -Name '{}' -ErrorAction Stop"#,
        service_name.replace("'", "''")
    );

    powershell::execute(&script).map_err(|e| e.to_string())?;

    let _ = crate::commands::logs::add_event_log(
        "INFO".to_string(),
        format!("Service started: {}", service_name),
        None,
    );

    Ok(())
}

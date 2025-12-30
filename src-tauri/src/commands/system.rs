use crate::models::SystemInfo;
use crate::services::powershell;

/// Gets system information (OS, CPU, RAM)
#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    let script = r#"
        $os = Get-CimInstance Win32_OperatingSystem
        $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
        $cs = Get-CimInstance Win32_ComputerSystem
        @{
            os_name = $os.Caption
            os_version = $os.Version
            computer_name = $cs.Name
            total_ram_gb = [math]::Round($cs.TotalPhysicalMemory / 1GB, 2)
            cpu_name = $cpu.Name
            cpu_cores = $cpu.NumberOfCores
        } | ConvertTo-Json -Compress
    "#;

    let json_output = powershell::execute(script).map_err(|e| e.to_string())?;

    if json_output.is_empty() || json_output == "null" {
        return Err("Failed to retrieve system information".to_string());
    }

    let info: SystemInfo =
        serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?;

    Ok(info)
}

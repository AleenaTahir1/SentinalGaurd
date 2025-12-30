use crate::models::SystemInfo;
use crate::services::powershell;

/// Gets comprehensive system information (OS, CPU, RAM, Disk, Uptime)
#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    let script = r#"
        $os = Get-CimInstance Win32_OperatingSystem
        $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
        $cs = Get-CimInstance Win32_ComputerSystem
        $disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
        $uptime = (Get-Date) - $os.LastBootUpTime
        
        @{
            os_name = $os.Caption
            os_version = $os.Version
            os_build = $os.BuildNumber
            computer_name = $cs.Name
            username = $env:USERNAME
            domain = if ($cs.Domain) { $cs.Domain } else { "WORKGROUP" }
            total_ram_gb = [math]::Round($cs.TotalPhysicalMemory / 1GB, 2)
            available_ram_gb = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
            cpu_name = $cpu.Name
            cpu_cores = $cpu.NumberOfCores
            cpu_threads = $cpu.NumberOfLogicalProcessors
            uptime_hours = [math]::Round($uptime.TotalHours, 1)
            disk_total_gb = [math]::Round($disk.Size / 1GB, 2)
            disk_free_gb = [math]::Round($disk.FreeSpace / 1GB, 2)
            last_boot = $os.LastBootUpTime.ToString("yyyy-MM-dd HH:mm")
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

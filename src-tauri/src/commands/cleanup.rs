use crate::models::{TempFileInfo, CleanupResult};
use crate::services::powershell;

/// Gets temp folder information (size and file count)
#[tauri::command]
pub fn get_temp_info() -> Result<Vec<TempFileInfo>, String> {
    let script = r#"
        $folders = @(
            @{ path = $env:TEMP; name = "User Temp" },
            @{ path = "C:\Windows\Temp"; name = "Windows Temp" },
            @{ path = "$env:LOCALAPPDATA\Microsoft\Windows\INetCache"; name = "IE Cache" }
        )
        
        $result = @()
        foreach ($folder in $folders) {
            if (Test-Path $folder.path) {
                $files = Get-ChildItem -Path $folder.path -Recurse -File -ErrorAction SilentlyContinue
                $size = ($files | Measure-Object -Property Length -Sum).Sum
                $result += @{
                    path = $folder.path
                    size_mb = [math]::Round($size / 1MB, 2)
                    file_count = $files.Count
                }
            }
        }
        $result | ConvertTo-Json -Compress
    "#;

    let json_output = powershell::execute(script).map_err(|e| e.to_string())?;

    if json_output.is_empty() || json_output == "null" {
        return Ok(vec![]);
    }

    let info: Vec<TempFileInfo> = if json_output.starts_with('[') {
        serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?
    } else {
        let single: TempFileInfo =
            serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?;
        vec![single]
    };

    Ok(info)
}

/// Cleans temp files from specified folders
#[tauri::command]
pub fn clean_temp_files() -> Result<CleanupResult, String> {
    let script = r#"
        $folders = @($env:TEMP, "C:\Windows\Temp")
        $deletedCount = 0
        $freedBytes = 0
        $errors = @()
        
        foreach ($folder in $folders) {
            if (Test-Path $folder) {
                $files = Get-ChildItem -Path $folder -Recurse -File -ErrorAction SilentlyContinue
                foreach ($file in $files) {
                    try {
                        $size = $file.Length
                        Remove-Item -Path $file.FullName -Force -ErrorAction Stop
                        $deletedCount++
                        $freedBytes += $size
                    } catch {
                        # Skip locked files silently
                    }
                }
                # Try to remove empty directories
                Get-ChildItem -Path $folder -Recurse -Directory -ErrorAction SilentlyContinue | 
                    Where-Object { (Get-ChildItem $_.FullName -ErrorAction SilentlyContinue).Count -eq 0 } |
                    ForEach-Object { 
                        try { Remove-Item $_.FullName -Force -ErrorAction Stop } catch {} 
                    }
            }
        }
        
        @{
            deleted_count = $deletedCount
            freed_mb = [math]::Round($freedBytes / 1MB, 2)
            errors = $errors
        } | ConvertTo-Json -Compress
    "#;

    let json_output = powershell::execute(script).map_err(|e| e.to_string())?;

    if json_output.is_empty() || json_output == "null" {
        return Err("Cleanup failed".to_string());
    }

    let result: CleanupResult =
        serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?;

    // Log the cleanup
    let _ = crate::commands::logs::add_event_log(
        "INFO".to_string(),
        format!("Disk cleanup: {} files deleted, {:.2} MB freed", result.deleted_count, result.freed_mb),
        None,
    );

    Ok(result)
}

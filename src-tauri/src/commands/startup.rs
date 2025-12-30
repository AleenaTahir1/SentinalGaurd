use crate::models::StartupProgram;
use crate::services::powershell;

/// Gets all startup programs
#[tauri::command]
pub fn get_startup_programs() -> Result<Vec<StartupProgram>, String> {
    let script = r#"
        $startups = Get-CimInstance Win32_StartupCommand -ErrorAction SilentlyContinue
        $result = @()
        foreach ($s in $startups) {
            $result += @{
                name = if ($s.Name) { $s.Name } else { "Unknown" }
                command = if ($s.Command) { $s.Command } else { "" }
                location = if ($s.Location) { $s.Location } else { "" }
                user = if ($s.User) { $s.User } else { "System" }
            }
        }
        $result | ConvertTo-Json -Compress
    "#;

    let json_output = powershell::execute(script).map_err(|e| e.to_string())?;

    if json_output.is_empty() || json_output == "null" {
        return Ok(vec![]);
    }

    let programs: Vec<StartupProgram> = if json_output.starts_with('[') {
        serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?
    } else {
        let single: StartupProgram =
            serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?;
        vec![single]
    };

    Ok(programs)
}

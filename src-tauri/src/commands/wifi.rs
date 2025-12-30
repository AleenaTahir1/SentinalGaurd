use crate::models::WifiProfile;
use crate::services::powershell;

/// Gets all saved WiFi profiles (SSIDs only, no passwords)
#[tauri::command]
pub fn get_wifi_profiles() -> Result<Vec<WifiProfile>, String> {
    let script = r#"
        $profiles = netsh wlan show profiles | Select-String 'All User Profile\s*:\s*(.+)$' | ForEach-Object { $_.Matches.Groups[1].Value.Trim() }
        $result = @()
        foreach ($ssid in $profiles) {
            $result += @{
                ssid = $ssid
                password = $null
                authentication = ""
                encryption = ""
            }
        }
        $result | ConvertTo-Json -Compress
    "#;

    let json_output = powershell::execute(script).map_err(|e| e.to_string())?;

    if json_output.is_empty() || json_output == "null" {
        return Ok(vec![]);
    }

    // Parse JSON - PowerShell returns array or single object
    let profiles: Vec<WifiProfile> = if json_output.starts_with('[') {
        serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?
    } else {
        let single: WifiProfile =
            serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?;
        vec![single]
    };

    Ok(profiles)
}

/// Gets the password for a specific WiFi profile (requires admin for some networks)
#[tauri::command]
pub fn get_wifi_password(ssid: String) -> Result<WifiProfile, String> {
    let escaped_ssid = ssid.replace("\"", "`\"");
    let script = format!(
        r#"
        $output = netsh wlan show profile name="{}" key=clear
        $auth = ($output | Select-String 'Authentication\s*:\s*(.+)$').Matches.Groups[1].Value.Trim()
        $cipher = ($output | Select-String 'Cipher\s*:\s*(.+)$').Matches.Groups[1].Value.Trim()
        $key = ($output | Select-String 'Key Content\s*:\s*(.+)$').Matches.Groups[1].Value.Trim()
        @{{
            ssid = "{}"
            password = if ($key) {{ $key }} else {{ $null }}
            authentication = if ($auth) {{ $auth }} else {{ "Unknown" }}
            encryption = if ($cipher) {{ $cipher }} else {{ "Unknown" }}
        }} | ConvertTo-Json -Compress
    "#,
        escaped_ssid, escaped_ssid
    );

    let json_output = powershell::execute(&script).map_err(|e| e.to_string())?;

    if json_output.is_empty() || json_output == "null" {
        return Err(format!("WiFi profile '{}' not found", ssid));
    }

    let profile: WifiProfile =
        serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?;

    Ok(profile)
}

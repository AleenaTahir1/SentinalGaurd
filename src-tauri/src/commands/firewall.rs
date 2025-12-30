use crate::models::{FirewallRule, FirewallStatus};
use crate::services::powershell;

/// Gets firewall profile status
#[tauri::command]
pub fn get_firewall_status() -> Result<FirewallStatus, String> {
    let script = r#"
        $profiles = Get-NetFirewallProfile -ErrorAction SilentlyContinue
        @{
            domain_enabled = ($profiles | Where-Object { $_.Name -eq 'Domain' }).Enabled
            private_enabled = ($profiles | Where-Object { $_.Name -eq 'Private' }).Enabled
            public_enabled = ($profiles | Where-Object { $_.Name -eq 'Public' }).Enabled
        } | ConvertTo-Json -Compress
    "#;

    let json_output = powershell::execute(script).map_err(|e| e.to_string())?;
    let status: FirewallStatus =
        serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?;
    Ok(status)
}

/// Gets firewall rules (Prioritizes SentinelGuard rules, then recent/active ones)
#[tauri::command]
pub fn get_firewall_rules() -> Result<Vec<FirewallRule>, String> {
    let script = r#"
        $sgRules = Get-NetFirewallRule -Description "SentinelGuard Managed Rule" -ErrorAction SilentlyContinue
        $otherRules = Get-NetFirewallRule -ErrorAction SilentlyContinue | Select-Object -First 50
        
        $allRules = @($sgRules) + @($otherRules) | Select-Object -Unique -Property Name
        
        $allRules | ForEach-Object {
            $portFilter = Get-NetFirewallPortFilter -AssociatedNetFirewallRule $_ -ErrorAction SilentlyContinue
            @{
                name = $_.DisplayName
                enabled = $_.Enabled -eq 'True'
                direction = $_.Direction.ToString()
                action = $_.Action.ToString()
                protocol = if ($portFilter.Protocol) { $portFilter.Protocol } else { "Any" }
                local_port = if ($portFilter.LocalPort) { $portFilter.LocalPort -join ',' } else { "Any" }
            }
        } | ConvertTo-Json -Compress
    "#;

    let json_output = powershell::execute(script).map_err(|e| e.to_string())?;

    if json_output.is_empty() || json_output == "null" {
        return Ok(vec![]);
    }

    let rules: Vec<FirewallRule> = if json_output.starts_with('[') {
        serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?
    } else {
        let single: FirewallRule =
            serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?;
        vec![single]
    };

    Ok(rules)
}

/// Blocks a specific port
#[tauri::command]
pub fn block_port(port: u16, protocol: String, rule_name: String) -> Result<(), String> {
    let script = format!(
        r#"New-NetFirewallRule -DisplayName '{}' -Description "SentinelGuard Managed Rule" -Direction Inbound -LocalPort {} -Protocol {} -Action Block -ErrorAction Stop"#,
        rule_name.replace("'", "''"), port, protocol
    );

    powershell::execute(&script).map_err(|e| e.to_string())?;

    let _ = crate::commands::logs::add_event_log(
        "INFO".to_string(),
        format!("Firewall: Blocked port {} ({})", port, protocol),
        None,
    );

    Ok(())
}

/// Removes a firewall rule by name
#[tauri::command]
pub fn remove_firewall_rule(rule_name: String) -> Result<(), String> {
    let script = format!(
        r#"Remove-NetFirewallRule -DisplayName '{}' -ErrorAction Stop"#,
        rule_name.replace("'", "''")
    );

    powershell::execute(&script).map_err(|e| e.to_string())?;

    let _ = crate::commands::logs::add_event_log(
        "INFO".to_string(),
        format!("Firewall: Removed rule '{}'", rule_name),
        None,
    );

    Ok(())
}

/// Enables firewall logging
#[tauri::command]
pub fn enable_firewall_logging() -> Result<(), String> {
    let script = r#"Set-NetFirewallProfile -Profile Domain,Public,Private -LogAllowed True -LogBlocked True -ErrorAction Stop"#;

    powershell::execute(script).map_err(|e| e.to_string())?;

    let _ = crate::commands::logs::add_event_log(
        "INFO".to_string(),
        "Firewall logging enabled for all profiles".to_string(),
        None,
    );

    Ok(())
}

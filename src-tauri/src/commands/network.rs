use crate::models::NetworkInfo;
use crate::services::powershell;

/// Gets network adapter information
#[tauri::command]
pub fn get_network_info() -> Result<Vec<NetworkInfo>, String> {
    let script = r#"
        $adapters = Get-NetAdapter -Physical -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq 'Up' }
        $result = @()
        foreach ($adapter in $adapters) {
            $ipConfig = Get-NetIPConfiguration -InterfaceIndex $adapter.ifIndex -ErrorAction SilentlyContinue
            $ipAddress = ($ipConfig.IPv4Address.IPAddress | Select-Object -First 1)
            $gateway = ($ipConfig.IPv4DefaultGateway.NextHop | Select-Object -First 1)
            $dns = ($ipConfig.DNSServer.ServerAddresses -join ', ')
            
            $adapterDetails = Get-NetAdapter -InterfaceIndex $adapter.ifIndex -ErrorAction SilentlyContinue
            $ipDetails = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1
            
            $result += @{
                adapter_name = $adapter.Name
                ip_address = if ($ipAddress) { $ipAddress } else { "N/A" }
                subnet_mask = if ($ipDetails.PrefixLength) { "/$($ipDetails.PrefixLength)" } else { "N/A" }
                gateway = if ($gateway) { $gateway } else { "N/A" }
                dns_servers = if ($dns) { $dns } else { "N/A" }
                mac_address = if ($adapter.MacAddress) { $adapter.MacAddress } else { "N/A" }
                status = $adapter.Status
            }
        }
        $result | ConvertTo-Json -Compress
    "#;

    let json_output = powershell::execute(script).map_err(|e| e.to_string())?;

    if json_output.is_empty() || json_output == "null" {
        return Ok(vec![]);
    }

    let networks: Vec<NetworkInfo> = if json_output.starts_with('[') {
        serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?
    } else {
        let single: NetworkInfo =
            serde_json::from_str(&json_output).map_err(|e| format!("JSON parse error: {}", e))?;
        vec![single]
    };

    Ok(networks)
}

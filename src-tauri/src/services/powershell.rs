use std::process::Command;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum PowerShellError {
    #[error("Failed to execute PowerShell: {0}")]
    ExecutionFailed(String),
    #[error("PowerShell returned error: {0}")]
    ScriptError(String),
    #[error("Failed to parse output: {0}")]
    ParseError(String),
}

/// Executes a PowerShell command and returns the output
pub fn execute(script: &str) -> Result<String, PowerShellError> {
    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            script,
        ])
        .output()
        .map_err(|e| PowerShellError::ExecutionFailed(e.to_string()))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(PowerShellError::ScriptError(stderr.to_string()));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(stdout.trim().to_string())
}

/// Gets all connected USB devices as JSON
pub fn get_usb_devices_json() -> Result<String, PowerShellError> {
    let script = r#"
        Get-PnpDevice -Class 'USB' -Status 'OK' -ErrorAction SilentlyContinue | 
        Select-Object @{N='instance_id';E={$_.InstanceId}}, 
                      @{N='friendly_name';E={if($_.FriendlyName){$_.FriendlyName}else{'Unknown Device'}}},
                      @{N='device_class';E={$_.Class}},
                      @{N='status';E={$_.Status}} |
        ConvertTo-Json -Compress
    "#;
    execute(script)
}

/// Disables a PnP device by instance ID (requires admin rights)
pub fn disable_device(instance_id: &str) -> Result<(), PowerShellError> {
    let script = format!(
        r#"Disable-PnpDevice -InstanceId '{}' -Confirm:$false -ErrorAction Stop"#,
        instance_id.replace("'", "''") // Escape single quotes
    );
    execute(&script)?;
    Ok(())
}

/// Enables a PnP device by instance ID (requires admin rights)
pub fn enable_device(instance_id: &str) -> Result<(), PowerShellError> {
    let script = format!(
        r#"Enable-PnpDevice -InstanceId '{}' -Confirm:$false -ErrorAction Stop"#,
        instance_id.replace("'", "''")
    );
    execute(&script)?;
    Ok(())
}

/// Gets detailed info about a specific device
pub fn get_device_info(instance_id: &str) -> Result<String, PowerShellError> {
    let script = format!(
        r#"
        Get-PnpDevice -InstanceId '{}' -ErrorAction SilentlyContinue | 
        Select-Object @{{N='instance_id';E={{$_.InstanceId}}}}, 
                      @{{N='friendly_name';E={{if($_.FriendlyName){{$_.FriendlyName}}else{{'Unknown Device'}}}}}},
                      @{{N='device_class';E={{$_.Class}}}},
                      @{{N='status';E={{$_.Status}}}} |
        ConvertTo-Json -Compress
        "#,
        instance_id.replace("'", "''")
    );
    execute(&script)
}

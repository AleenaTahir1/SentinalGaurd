use std::process::Command;
use std::os::windows::process::CommandExt;
use thiserror::Error;

// Windows flag to hide the console window
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Error, Debug)]
pub enum PowerShellError {
    #[error("Failed to execute PowerShell: {0}")]
    ExecutionFailed(String),
    #[error("PowerShell returned error: {0}")]
    ScriptError(String),
}

/// Executes a PowerShell command and returns the output (hidden, no visible window)
pub fn execute(script: &str) -> Result<String, PowerShellError> {
    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-WindowStyle", "Hidden",
            "-Command",
            script,
        ])
        .creation_flags(CREATE_NO_WINDOW)
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
        instance_id.replace("'", "''")
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

use std::fs;
use std::path::PathBuf;
use serde::{de::DeserializeOwned, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum StorageError {
    #[error("Failed to get app data directory")]
    NoAppDataDir,
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
}

/// Gets the application data directory (creates if doesn't exist)
pub fn get_app_data_dir() -> Result<PathBuf, StorageError> {
    let base_dir = dirs::data_dir().ok_or(StorageError::NoAppDataDir)?;
    let app_dir = base_dir.join("SentinelGuard");
    
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)?;
    }
    
    Ok(app_dir)
}

/// Reads and deserializes a JSON file from the app data directory
pub fn read_json<T: DeserializeOwned + Default>(filename: &str) -> Result<T, StorageError> {
    let path = get_app_data_dir()?.join(filename);
    
    if !path.exists() {
        return Ok(T::default());
    }
    
    let content = fs::read_to_string(&path)?;
    let data: T = serde_json::from_str(&content)?;
    Ok(data)
}

/// Serializes and writes data to a JSON file in the app data directory
pub fn write_json<T: Serialize>(filename: &str, data: &T) -> Result<(), StorageError> {
    let path = get_app_data_dir()?.join(filename);
    let content = serde_json::to_string_pretty(data)?;
    fs::write(&path, content)?;
    Ok(())
}

/// Deletes a JSON file from the app data directory
pub fn delete_json(filename: &str) -> Result<(), StorageError> {
    let path = get_app_data_dir()?.join(filename);
    if path.exists() {
        fs::remove_file(&path)?;
    }
    Ok(())
}

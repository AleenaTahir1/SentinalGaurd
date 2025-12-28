# SentinelGuard

Endpoint Security and Hardware Access Control System for Windows

## Overview

SentinelGuard is a desktop security application that protects Windows workstations from unauthorized hardware attacks such as BadUSB and data theft. Unlike traditional antivirus software that focuses on file scanning, SentinelGuard secures physical hardware ports by monitoring and controlling USB device access.

## Features

- **Real-time USB Monitoring**: Automatically detects all connected USB devices with detailed information including device name, serial ID, and vendor
- **Whitelist Management**: One-click authorization to trust or block devices, with persistent storage of trusted device configurations
- **Security Event Logging**: Comprehensive logging of all USB insertion events, device blocks, and system actions with searchable and exportable logs
- **Device Blocking**: Instantly disable untrusted devices at the hardware level (requires administrator privileges)
- **Modern Dashboard**: Clean, intuitive interface showing system security status at a glance

## Architecture

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Frontend | React + TypeScript | User interface and interaction |
| Bridge | Tauri (Rust) | System integration and command execution |
| Execution | PowerShell | Hardware control via Windows PnP Manager |

## Installation

### From Release

1. Download the latest release from the [Releases](https://github.com/Razee4315/SentinelGuard/releases) page
2. Run the `.msi` or `.exe` installer
3. Launch SentinelGuard

### Build from Source

Prerequisites:
- Node.js 18+
- Bun or npm
- Rust (stable)

```bash
# Clone the repository
git clone https://github.com/AleenaTahir1/SentinelGuard.git
cd SentinelGuard

# Install dependencies
bun install

# Run in development mode
bun run tauri dev

# Build for production
bun run tauri build
```

## Usage

### Dashboard
The main dashboard displays the current security status. A green shield indicates no unauthorized devices are connected. The stats section shows total scans and blocked threats.

### Device Manager
View all connected USB devices. Toggle the switch to trust or block individual devices. Trusted devices are stored in a local whitelist and will be automatically allowed on future connections.

### Security Logs
Browse all security events with filtering by severity level. Supports regex search and log export functionality.

## Administrator Privileges

Device blocking features require running SentinelGuard as Administrator. Without elevated privileges, the application can monitor and log device activity but cannot disable hardware.

## Data Storage

Application data is stored in:
```
%APPDATA%\SentinelGuard\
  - whitelist.json    # Trusted device configurations
  - logs.json         # Security event history
```

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Rust, Tauri
- **Build**: Vite, Bun
- **OS Integration**: PowerShell, Windows PnP API

## License

MIT License

## Author

Aleena Tahir 
Saqlain Abbas

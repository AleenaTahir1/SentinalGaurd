# SentinelGuard

Endpoint Security and Hardware Access Control System for Windows

## Overview

SentinelGuard is a desktop security application that protects Windows workstations from unauthorized hardware attacks such as BadUSB and data theft. Unlike traditional antivirus software that focuses on file scanning, SentinelGuard secures physical hardware ports by monitoring and controlling USB device access.

## Features

- **Real-time USB Monitoring**: Detects device insertion/removal with detailed hardware info
- **Whitelist Management**: One-click trust/block for USB devices
- **Firewall & Network**: View/Block ports, manage firewall rules, and monitor network traffic
- **System Maintenance**: Disk cleanup, process monitoring, and startup program management
- **Security Logs**: Comprehensive event logging for all system and device activities
- **Modern Dashboard**: Security status overview, quick actions, and system health stats

## Architecture

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Frontend | React + TypeScript | User interface and interaction |
| Bridge | Tauri (Rust) | System integration and command execution |
| Execution | PowerShell | System management, firewall control, and hardware access |

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

## Usage
- **Dashboard**: View system health, security status, and quick actions.
- **Security Tools**: Manage USB devices, Firewall rules, and Process/Service monitoring.
- **System Utilities**: Clean junk files, manage startup programs, and view network/system info.
- **Logs**: Track all security events and system activities.

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

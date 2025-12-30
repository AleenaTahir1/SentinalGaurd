# Contributing to SentinelGuard

Thank you for your interest in contributing to SentinelGuard! We welcome contributions from the community to help make Windows endpoints more secure.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/AleenaTahir1/SentinelGuard.git
    cd SentinelGuard
    ```
3.  **Install dependencies**:
    ```bash
    bun install
    ```
4.  **Create a branch** for your feature or bugfix:
    ```bash
    git checkout -b feature/amazing-feature
    ```

## Development Workflow

-   **Frontend**: Built with React, TypeScript, and TailwindCSS.
    -   Location: `src/`
    -   Run dev server: `bun run tauri dev`
-   **Backend**: Built with Rust and Tauri.
    -   Location: `src-tauri/`
    -   Commands: Defined in `src-tauri/src/commands/`
    -   Services: Powershell integration in `src-tauri/src/services/`

## Code Style

-   **TypeScript**: We use ESLint and Prettier. Run `bun lint` to check for issues.
-   **Rust**: Use `cargo fmt` to format your Rust code and `cargo clippy` for linting.

## Pull Requests

1.  Push your branch to your fork.
2.  Open a Pull Request against the `main` branch.
3.  Provide a clear description of the changes and any relevant screenshots.

## Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub using the provided templates. include:
-   Steps to reproduce
-   Expected vs. actual behavior
-   Screenshots/Logs if applicable

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

# Security Policy

## Supported Versions

| Version | Supported |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in SentinelGuard, please follow these steps:

1.  **Do NOT open a public issue.** Publicly disclosing a vulnerability can put users at risk.
2.  **Email the maintainers** directly at [saqlainrazee@gmail.com](mailto:saqlainrazee@gmail.com) (or the repository owner's contact).
3.  **Provide details**: Include a description of the vulnerability, steps to reproduce, and potential impact.

We will acknowledge your report within 48 hours and work with you to remediate the issue.

### Out of Scope

-   False positives triggered by antivirus software (SentinelGuard uses PowerShell which can sometimes be flagged).
-   Attacks requiring physical access to the machine *prior* to SentinelGuard installation (we protect against hardware attacks, but we assume the OS itself is not compromised at install time).

# Changelog

All notable changes to RedShell will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Open source preparation documentation
- CODEOWNERS file enforcing maintainer review
- CONTRIBUTING.md with detailed contribution guidelines
- CODE_OF_CONDUCT.md based on Contributor Covenant
- SECURITY.md with vulnerability reporting process
- Issue templates (bug report, feature request, documentation)
- Pull request template
- Initial test infrastructure with Vitest
- ESLint configuration for code quality
- Enhanced CI/CD with testing and linting
- ARCHITECTURE.md documenting system design
- Enhanced README with badges and detailed setup

### Security
- Removed all .DS_Store files from repository
- Added secret scanning and push protection recommendations

## [0.1.0] - 2026-03-XX

### Added
- Initial release of RedShell
- Text Judge implementation using Claude Sonnet 4.5
- Code Judge implementation using E2B sandbox
- Cloudflare Workers deployment
- Base mainnet integration
- Smart contract verdict submission
- Webhook integration (Alchemy/Goldsky)
- Landing page (redshell.ai)
- Verified Merchant badge system
- Basic CI/CD for GitHub Pages deployment

### Features
- ACP job evaluation and verdict signing
- Semantic text evaluation against criteria
- Sandboxed code execution with stderr detection
- On-chain verdict submission (APPROVE/REJECT)
- Deterministic judge logic
- Transparent, auditable evaluation process

### Technical
- TypeScript implementation
- Viem for blockchain interactions
- Wrangler for Cloudflare Workers deployment
- Environment-based configuration
- Production-ready deployment on Base mainnet

---

## Release Notes Format

Each release should include:
- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Now removed features
- **Fixed**: Bug fixes
- **Security**: Security-related changes

## Versioning

Given a version number MAJOR.MINOR.PATCH:
- **MAJOR**: Incompatible API changes
- **MINOR**: Added functionality (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

## How to Update This Changelog

When making changes:
1. Add entries to the `[Unreleased]` section
2. Use categories: Added, Changed, Deprecated, Removed, Fixed, Security
3. Include issue/PR numbers where applicable: `(#123)`
4. Move entries to a new version section when releasing
5. Update the release date in the header

## Security Advisory References

Security fixes will be cross-referenced with GitHub Security Advisories:
- [GHSA-xxxx-xxxx-xxxx](link) - Description

## Contributors

Thank you to all contributors! See [CONTRIBUTORS.md](CONTRIBUTORS.md) or GitHub contributors graph.

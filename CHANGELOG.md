# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-04-08

### Added

- Optional per-credential App Attribution overrides for `App URL`, `App Title`, and `App Categories`.
- Full Provider Routing & Privacy controls on the Embeddings node to match the Chat node.
- UI polish across both nodes, including updated icons, node subtitles, clearer collection names, improved copy, and refreshed documentation links.

### Changed

- Updated the package metadata and README to document the current nodes, routing controls, and local testing flow.
- Refreshed the default branding copy to reflect the broader model catalog and current EUrouter positioning.

### Fixed

- Credential validation now checks the auth-protected `/credits` endpoint so invalid API keys fail correctly.
- Embeddings requests now support the same EUrouter provider-routing and privacy parameters as chat requests.

## [1.1.0] - 2026-04-08

### Added

- Initial `CHANGELOG.md` to track semver releases in-repo.
- Official n8n community-node ESLint setup and calibration release checklist.

### Changed

- Fixed local build packaging so SVG assets are copied into `dist/`.
- Added release-prep scripts for dry-run packaging and published-package scanner checks.

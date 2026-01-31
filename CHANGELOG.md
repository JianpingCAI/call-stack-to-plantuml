# Change Log

All notable changes to the "call-stack-to-plantuml" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.0.7] - 2026-01-31

### Added
- Comprehensive JSDoc documentation for all functions and classes
- Improved README with examples, use cases, and troubleshooting
- Better error messages and user feedback
- Auto-reset documentation in README

### Changed
- Migrated packaging to use `npx @vscode/vsce` instead of global installation
- Enhanced word wrapping algorithm documentation
- Improved code organization and structure
- Relaxed stack frame matching to ignore column differences for better flexibility

### Fixed
- Removed unused imports
- Updated PACKAGING.md with npx-only approach
- Node.js compatibility documentation

## [0.0.6] - 2024

### Added
- Multi-path call stack support with tree structure
- Command to record call stack without copying
- Command to clear recorded call stacks
- Automatic tree reset when new debug session starts
- Configurable maximum line length for diagrams

### Changed
- Improved PlantUML generation with split/merge syntax for multiple paths

## [0.0.5] - 2024

### Added
- Thread selection support for multi-threaded applications
- Word wrapping for long function names

### Changed
- Improved PlantUML Activity Diagram generation

## [0.0.4] - 2024

### Fixed
- Improved compatibility with different debuggers

## [0.0.3] - 2024

### Added
- Configuration setting for maximum line length
- Better handling of relative paths

## [0.0.2] - 2024

### Fixed
- Fixed issues with clipboard copy functionality

## [0.0.1] - 2024

### Added
- Initial release
- Basic call stack capture from debug sessions
- PlantUML Activity Diagram generation
- Clipboard integration
- Support for Debug Adapter Protocol (DAP)

---

## Version History Summary

- **0.0.6**: Multi-path support and tree structure
- **0.0.5**: Thread selection and word wrapping
- **0.0.4**: Debugger compatibility improvements
- **0.0.3**: Configuration support
- **0.0.2**: Bug fixes
- **0.0.1**: Initial release

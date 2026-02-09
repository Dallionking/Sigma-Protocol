# Sigma Protocol - MCP Tools & Task Management

## Research Tools
- **Firecrawl**: Web scraping, site crawling, content extraction
- **EXA**: Semantic search, code context, deep research
- **Ref**: Documentation search, URL reading
- **Context7**: Library-specific documentation

## Code Review Tools
- **Greptile**: AI-powered codebase-aware PR review (HTTP MCP at `api.greptile.com/mcp`)

## Task Management
- **Task Master AI**: PRD parsing, task management, research integration

## Claude Code Native Task Management

| Tool | Description |
|------|-------------|
| `TaskCreate` | Create tasks with dependencies |
| `TaskUpdate` | Update task status/content |
| `TaskList` | List all tasks with filters |
| `TaskGet` | Get task details by ID |

**Dependency Tracking:**
- `blockedBy`: Tasks that must complete first
- `blocks`: Tasks waiting on this task

**Status Workflow:** `pending` -> `in_progress` -> `completed`

## Xcode Tools

### Xcode MCP Bridge (`xcrun mcpbridge`)

Available when Xcode 26.3+ is running. Provides 20 native tools:

| Tool | Category | Description |
|------|----------|-------------|
| `BuildProject` | Build | Build project with scheme/configuration |
| `GetBuildErrors` | Build | Retrieve build errors and warnings |
| `GetBuildSettings` | Build | Get resolved build settings |
| `InstallAndRun` | Build | Build, install, and launch on device/sim |
| `RunAllTests` | Test | Execute full test suite |
| `RunTestMethod` | Test | Run single test method |
| `RunTestClass` | Test | Run all tests in a class |
| `RenderPreview` | Preview | Render SwiftUI preview as image |
| `GetProjectStructure` | Project | List project groups, targets, files |
| `GetSchemes` | Project | List available schemes |
| `GetDevices` | Project | List simulators and connected devices |
| `XcodeRead` | File I/O | Read file contents |
| `XcodeWrite` | File I/O | Write/create file |
| `XcodeGlob` | File I/O | Find files by pattern |
| `XcodeGrep` | File I/O | Search file contents |
| `DocumentationSearch` | Docs | Search Apple developer documentation |
| `GetSourceChanges` | SCM | Show uncommitted changes |
| `StageFiles` | SCM | Stage files for commit |
| `CreateCommit` | SCM | Create a git commit |
| `GetDiagnostics` | Diagnostics | Xcode diagnostics and live issues |

### XcodeBuildMCP (Headless)

Available via `npx xcodebuildmcp@beta mcp`. For CI/CD and headless environments:

| Tool | Description |
|------|-------------|
| `xcodebuild_build` | Build project via xcodebuild CLI |
| `xcodebuild_test` | Run tests via xcodebuild CLI |
| `xcodebuild_clean` | Clean build artifacts |
| `xcodebuild_resolve_dependencies` | Resolve SPM dependencies |
| `xcodebuild_show_schemes` | List available schemes |
| `xcodebuild_show_destinations` | List available destinations |
| `xcodebuild_show_build_settings` | Show build settings |

# CLI Refactoring Plan

**Goal:** Break sigma-cli.js (5,895 lines) into smaller, agent-friendly modules (<500 lines each)

## Current State

```
cli/
├── sigma-cli.js           # 5,895 lines - TOO LARGE
└── lib/
    ├── config.js          # ✅ Good
    ├── doctor.js          # ✅ Good
    ├── errors.js          # ✅ Good
    ├── help.js            # ✅ Good
    ├── install-wizard.js  # ✅ Good
    ├── interactive.js     # ✅ Good
    ├── maid.js            # ✅ Good
    ├── new-project.js     # ✅ Good
    ├── retrofit.js        # ✅ Good
    ├── search.js          # ✅ Good
    ├── terminal-utils.js  # ✅ Good
    ├── threads.js         # ✅ Good
    ├── tutorial.js        # ✅ Good
    ├── orchestration/     # ✅ Good - already modular
    └── sandbox/           # ✅ Good - already modular
```

## Proposed Structure

```
cli/
├── sigma-cli.js           # ~200 lines - Just CLI setup + command routing
└── lib/
    ├── commands/          # NEW - Command handlers
    │   ├── install.js     # installCommand, installSkillsCommand, installHarnessCommand
    │   ├── status.js      # statusCommand
    │   ├── build.js       # buildCommand
    │   ├── update.js      # updateCommand
    │   ├── approve.js     # approveCommand
    │   ├── merge.js       # mergeCommand
    │   ├── rollback.js    # rollbackCommand
    │   ├── init.js        # initCommand
    │   ├── deps.js        # depsCommand
    │   └── ralph.js       # ralphCommand
    │
    ├── platform/          # NEW - Platform-specific builders
    │   ├── cursor.js      # buildCursor, transformToCursorRule, getCursorSkillMetadata
    │   ├── claude-code.js # buildClaudeCode, transformToClaudeCodeAgent, generateClaudeCodeCommand
    │   ├── opencode.js    # buildOpenCode, transformToOpenCodeCommand, transformToOpenCodeAgent
    │   └── common.js      # generateClaudeMd, generateAgentsMd, generateOpenCodeConfig
    │
    ├── skills/            # NEW - Skill installation
    │   ├── install.js     # installCursorSkills, installClaudeCodeSkills, installOpenCodeSkills
    │   ├── validate.js    # validateSkillDirectory, validateAllSkills, findSkillDirs
    │   └── commands.js    # installClaudeCodeCommands
    │
    ├── utils/             # NEW - Utility functions
    │   ├── backup.js      # backupFile, restoreFromBackup, cleanupBackup
    │   ├── files.js       # makeScriptsExecutable, countFilesByExt
    │   ├── validation.js  # validateJsonSchema, validateSourceFiles, checkPlatformPrerequisites
    │   └── detection.js   # detectInstallations, detectMissingAssets, detectStreamCount, autoDetectPlatform
    │
    ├── ui/                # NEW - UI/Display functions
    │   ├── banner.js      # showBanner, sigmaGradient
    │   ├── prompts.js     # selectPlatforms, selectModules
    │   └── logging.js     # debugLog, verboseLog, processGlobalOptions
    │
    └── [existing modules] # Keep as-is
        ├── config.js
        ├── doctor.js
        ├── errors.js
        ├── help.js
        ├── install-wizard.js
        ├── interactive.js
        ├── maid.js
        ├── new-project.js
        ├── retrofit.js
        ├── search.js
        ├── terminal-utils.js
        ├── threads.js
        ├── tutorial.js
        ├── orchestration/
        └── sandbox/
```

## Function Mapping

### Phase 1: Extract Utilities (Low Risk)

| Function | Current Location | New Location | Lines |
|----------|-----------------|--------------|-------|
| loadEnvFile | sigma-cli.js:24 | lib/utils/env.js | ~25 |
| backupFile | sigma-cli.js:263 | lib/utils/backup.js | ~15 |
| restoreFromBackup | sigma-cli.js:281 | lib/utils/backup.js | ~15 |
| cleanupBackup | sigma-cli.js:298 | lib/utils/backup.js | ~10 |
| makeScriptsExecutable | sigma-cli.js:309 | lib/utils/files.js | ~25 |
| countFilesByExt | sigma-cli.js:2197 | lib/utils/files.js | ~20 |
| validateJsonSchema | sigma-cli.js:82 | lib/utils/validation.js | ~30 |
| checkPlatformPrerequisites | sigma-cli.js:111 | lib/utils/validation.js | ~60 |
| validateSourceFiles | sigma-cli.js:172 | lib/utils/validation.js | ~70 |
| detectMissingAssets | sigma-cli.js:242 | lib/utils/detection.js | ~20 |
| detectInstallations | sigma-cli.js:424 | lib/utils/detection.js | ~15 |
| detectStreamCount | sigma-cli.js:3517 | lib/utils/detection.js | ~45 |
| autoDetectPlatform | sigma-cli.js:1368 | lib/utils/detection.js | ~40 |

### Phase 2: Extract UI Functions (Low Risk)

| Function | Current Location | New Location | Lines |
|----------|-----------------|--------------|-------|
| showBanner | sigma-cli.js:407 | lib/ui/banner.js | ~15 |
| selectPlatforms | sigma-cli.js:436 | lib/ui/prompts.js | ~45 |
| selectModules | sigma-cli.js:480 | lib/ui/prompts.js | ~40 |
| debugLog | sigma-cli.js:2914 | lib/ui/logging.js | ~10 |
| verboseLog | sigma-cli.js:2924 | lib/ui/logging.js | ~10 |
| processGlobalOptions | sigma-cli.js:2933 | lib/ui/logging.js | ~170 |

### Phase 3: Extract Platform Builders (Medium Risk)

| Function | Current Location | New Location | Lines |
|----------|-----------------|--------------|-------|
| buildCursor | sigma-cli.js:522 | lib/platform/cursor.js | ~50 |
| transformToCursorRule | sigma-cli.js:769 | lib/platform/cursor.js | ~55 |
| getCursorSkillMetadata | sigma-cli.js:823 | lib/platform/cursor.js | ~85 |
| buildClaudeCode | sigma-cli.js:573 | lib/platform/claude-code.js | ~95 |
| transformToClaudeCodeAgent | sigma-cli.js:667 | lib/platform/claude-code.js | ~65 |
| generateClaudeCodeCommand | sigma-cli.js:729 | lib/platform/claude-code.js | ~40 |
| generateClaudeMd | sigma-cli.js:908 | lib/platform/claude-code.js | ~165 |
| buildOpenCode | sigma-cli.js:1072 | lib/platform/opencode.js | ~115 |
| transformToOpenCodeCommand | sigma-cli.js:1184 | lib/platform/opencode.js | ~45 |
| transformToOpenCodeAgent | sigma-cli.js:1230 | lib/platform/opencode.js | ~55 |
| generateAgentsMd | sigma-cli.js:1285 | lib/platform/opencode.js | ~55 |
| generateOpenCodeConfig | sigma-cli.js:1342 | lib/platform/opencode.js | ~25 |

### Phase 4: Extract Commands (Medium Risk)

| Function | Current Location | New Location | Lines |
|----------|-----------------|--------------|-------|
| installCommand | sigma-cli.js:1410 | lib/commands/install.js | ~415 |
| installSkillsCommand | sigma-cli.js:1940 | lib/commands/install.js | ~110 |
| installHarnessCommand | sigma-cli.js:2396 | lib/commands/install.js | ~175 |
| statusCommand | sigma-cli.js:1823 | lib/commands/status.js | ~20 |
| buildCommand | sigma-cli.js:1842 | lib/commands/build.js | ~100 |
| updateCommand | sigma-cli.js:2745 | lib/commands/update.js | ~170 |
| approveCommand | sigma-cli.js:3992 | lib/commands/approve.js | ~95 |
| mergeCommand | sigma-cli.js:4826 | lib/commands/merge.js | ~160 |
| rollbackCommand | sigma-cli.js:5225 | lib/commands/rollback.js | ~180 |
| initCommand | sigma-cli.js:5404 | lib/commands/init.js | ~120 |
| depsCommand | sigma-cli.js:5536 | lib/commands/deps.js | ~50 |
| ralphCommand | sigma-cli.js:5588 | lib/commands/ralph.js | ~250 |

### Phase 5: Extract Skills Installation (Medium Risk)

| Function | Current Location | New Location | Lines |
|----------|-----------------|--------------|-------|
| installCursorSkills | sigma-cli.js:2048 | lib/skills/install.js | ~85 |
| installClaudeCodeSkills | sigma-cli.js:2232 | lib/skills/install.js | ~70 |
| installOpenCodeSkills | sigma-cli.js:2321 | lib/skills/install.js | ~75 |
| installClaudeCodeCommands | sigma-cli.js:2302 | lib/skills/commands.js | ~20 |
| validateSkillDirectory | sigma-cli.js:2132 | lib/skills/validate.js | ~35 |
| validateAllSkills | sigma-cli.js:2165 | lib/skills/validate.js | ~30 |
| findSkillDirs | sigma-cli.js:2216 | lib/skills/validate.js | ~20 |

## Implementation Order

1. **Phase 1: Utilities** - Extract utility functions (no dependencies on commands)
2. **Phase 2: UI** - Extract UI/display functions
3. **Phase 3: Platform** - Extract platform-specific builders
4. **Phase 4: Skills** - Extract skill installation
5. **Phase 5: Commands** - Extract command handlers
6. **Phase 6: Cleanup** - Refactor sigma-cli.js to import from modules

## File Size Targets

| Module | Target Lines | Functions |
|--------|-------------|-----------|
| lib/utils/backup.js | ~50 | 3 |
| lib/utils/files.js | ~50 | 2 |
| lib/utils/validation.js | ~160 | 3 |
| lib/utils/detection.js | ~120 | 4 |
| lib/utils/env.js | ~30 | 1 |
| lib/ui/banner.js | ~30 | 1 |
| lib/ui/prompts.js | ~100 | 2 |
| lib/ui/logging.js | ~200 | 3 |
| lib/platform/cursor.js | ~200 | 3 |
| lib/platform/claude-code.js | ~370 | 4 |
| lib/platform/opencode.js | ~300 | 5 |
| lib/commands/install.js | ~400 | 3 |
| lib/commands/update.js | ~180 | 1 |
| lib/commands/ralph.js | ~260 | 1 |
| lib/skills/install.js | ~250 | 3 |
| lib/skills/validate.js | ~90 | 3 |
| sigma-cli.js (final) | ~300 | CLI setup + routing |

## Migration Strategy

1. **Create new files** - Start with empty module files
2. **Move one function at a time** - Update imports, test
3. **Keep backward compatibility** - Export from main file during transition
4. **Test after each move** - `sigma doctor` should pass
5. **Final cleanup** - Remove temporary exports

## Constants/Configs to Extract

```javascript
// lib/constants.js
export const PLATFORMS = { ... };
export const MODULES = { ... };
export const ROOT_DIR = path.resolve(__dirname, "..");
```

## Shared Dependencies

All modules will need:
- chalk, ora, inquirer (UI)
- fs-extra, path (file ops)
- ROOT_DIR constant

Create a shared import helper:
```javascript
// lib/shared.js
export { default as chalk } from 'chalk';
export { default as ora } from 'ora';
export { default as fs } from 'fs-extra';
export { ROOT_DIR, PLATFORMS, MODULES } from './constants.js';
```

## Testing Checklist

After refactoring, verify:
- [ ] `sigma` - Interactive menu works
- [ ] `sigma install` - Full installation works
- [ ] `sigma doctor` - Health check passes
- [ ] `sigma update` - Update command works
- [ ] `sigma orchestrate` - Orchestration works
- [ ] `sigma sandbox` - Sandbox commands work
- [ ] `sigma ralph` - Ralph loop works
- [ ] All platforms (Cursor, Claude Code, OpenCode) install correctly

## Estimated Effort

| Phase | Files | Complexity | Priority |
|-------|-------|------------|----------|
| 1 - Utilities | 5 | Low | High |
| 2 - UI | 3 | Low | High |
| 3 - Platform | 3 | Medium | Medium |
| 4 - Skills | 3 | Medium | Medium |
| 5 - Commands | 7 | Medium | Medium |
| 6 - Cleanup | 1 | Low | Low |

**Total: ~22 new files, sigma-cli.js reduced by ~95%**

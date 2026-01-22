# Agent Floor - AGENTS.md

Long-term memory for AI agents working on this project.

## Project Structure

```
src/
├── game/
│   ├── scenes/     # Phaser scenes (OfficeScene)
│   ├── sprites/    # Phaser sprite classes (AgentSprite)
│   └── utils/      # Game utilities (Pathfinding)
├── lib/
│   ├── memory/     # Three-tier memory system (LongTermMemory)
│   └── store/      # Zustand stores
├── server/
│   ├── agents/     # Agent lifecycle management (AgentManager, AgentWorker)
│   ├── providers/  # LLM provider registry (factory pattern)
│   └── rooms/      # Colyseus rooms
└── types/          # TypeScript type definitions
```

## Coding Patterns

### EasyStar.js Pathfinding
- Import as: `import * as EasyStar from "easystarjs"` (not default import)
- EasyStar class is `EasyStar.js` (note the `.js` suffix)
- Grid uses tile coordinates, not world coordinates
- Always call `easystar.calculate()` after `findPath()` for async mode
- TileType enum: WALKABLE=0, BLOCKED=1, DESK=2, FURNITURE=3

### Phaser Integration
- OfficeScene uses TILE_SIZE = 32 pixels
- Agent positions are in world coordinates (pixels)
- Convert world-to-grid: `Math.floor(worldX / tileSize)`
- Convert grid-to-world: `gridX * tileSize + tileSize/2` (center of tile)

### Type Definitions
- Agent types are in `@/types/agent`
- Use path alias `@/` for imports from src/

### AgentManager System
- AgentManager lives in `src/server/agents/AgentManager.ts`
- AgentWorker handles per-agent work loops (tick-based)
- State machine: idle → thinking → working → talking (walking also valid)
- Valid transitions defined in `types.ts` - use `isValidTransition()` helper
- ROLE_TASK_KEYWORDS maps roles to task keywords for intelligent routing
- Workers notify state changes via callback to AgentManager
- AgentManager syncs state to Colyseus for real-time client updates

## Known Issues

### Pre-existing Build Errors (2026-01-22)
- `floor-store.ts`: Type errors with Colyseus state typing (`state` is of type 'unknown')
- `FloorRoom.ts`: Decorator errors (Colyseus @type decorators require experimentalDecorators)
- These are pre-existing and don't block agent system functionality

## Completed Stories

### PRD004-003: EasyStar.js Pathfinding (2026-01-22)
- Created `src/game/utils/pathfinding.ts`
- Implements A* pathfinding with EasyStar.js
- Features:
  - Grid initialization with walkable/blocked tiles
  - Async path calculation
  - Catmull-Rom spline path smoothing
  - World-to-grid coordinate conversion
  - Point avoidance for dynamic obstacles

### PRD009-001: AgentManager Class (2026-01-22)
- Created `src/server/agents/` module with:
  - `AgentManager.ts` - Orchestrator for agent lifecycle
  - `AgentWorker.ts` - Per-agent work loop handler
  - `MessageBus.ts` - Message routing placeholder (for PRD-010)
  - `types.ts` - Shared types and state machine helpers
  - `index.ts` - Barrel exports
- Features:
  - `startAgentLoops()` / `stopAgentLoops()` lifecycle methods
  - Spawns AgentWorker for each agent in room
  - Task routing based on role-to-keyword matching
  - State machine with validated transitions
  - Syncs agent state to Colyseus for real-time updates

### PRD009-002: AgentWorker Class (2026-01-22)
- Enhanced `AgentWorker.ts` with autonomous work loop:
  - Work loop priority: check messages → check tasks → idle
  - Message queue with types: mention, direct, broadcast, task
  - LLM provider integration via `LLMProvider` interface
  - `callLLMWithRetry()` with exponential backoff (3 retries)
  - Circuit breaker pattern for error recovery
- Key methods:
  - `enqueueMessage()` - Add message to worker inbox
  - `handleMention()` - Process @mentions via LLM
  - `processTask()` - Execute assigned tasks via LLM
  - `setLLMProvider()` - Configure LLM for completions
  - `setSendMessageCallback()` - Wire up message sending
- AgentManager updates:
  - Workers initialized with full context (name, role, systemPrompt)
  - `routeMessageToWorkers()` for MessageBus integration
  - `setLLMProvider()` propagates to all workers

### PRD010-001: MessageBus Class (2026-01-22)
- Full implementation of `MessageBus.ts` for A2A (Agent-to-Agent) protocol
- Features:
  - `parseMentions(content)` - Extract @mentions with position tracking
  - `routeMessage(message)` - Route to correct agent(s) based on @mentions or direct addressing
  - `broadcastMessage()` - Send to all agents except sender
  - Per-agent message queues (`Map<agentId, QueuedMessage[]>`)
  - `getMessagesFor(agentId)` - Retrieve queued messages
  - `markMessageProcessed()` - Mark messages as handled
  - `setMessageQueuedCallback()` - Integration hook for AgentManager
- Types exported:
  - `RoutableMessage` - Base message for routing
  - `QueuedMessage` - Message with queue metadata
  - `ParsedMention` - Extracted mention with agent resolution
  - `MessageType` - Union type for message categories
- Integration notes:
  - MessageBus initializes queues for existing agents on construction
  - Use `setMessageQueuedCallback()` to notify AgentManager of new messages
  - FloorRoom passes messages via `routeMessage()` on user chat

### PRD011-001: LLM Provider Registry (2026-01-22)
- Created `src/server/providers/index.ts` with factory pattern
- Features:
  - `registerProvider(provider)` - Add provider to registry
  - `registerProviderFactory(id, factory)` - Lazy initialization support
  - `getProvider(id)` / `getProviderAsync(id)` - Retrieve providers
  - `listProviders()` / `listProviderIds()` - Enumerate providers
  - `hasProvider(id)` - Check existence
  - `unregisterProvider(id)` / `clearProviders()` - Removal utilities
- Default stub providers auto-registered on import:
  - `claude-code` (CLI-based, type: "cli", Max subscription) - **Now uses real adapter**
  - `anthropic` (Claude API, supportsVision, supportsTools)
  - `openai` (supportsVision, supportsTools)
  - `gemini` (1M context, supportsVision, supportsTools)
  - `openrouter` (multi-model router)
  - `xai` (Grok, supportsTools)
  - `ollama` (local inference)
- Stub providers return mock responses - replace with real adapters in PRD-013
- Re-exports LLMProvider types from `@/types/provider`

### PRD012-001: Claude Code CLI Adapter (2026-01-22)
- Created `src/server/providers/claude-code.ts` - Real Claude Code CLI adapter
- Features:
  - `ClaudeCodeAdapter` class implementing `LLMProvider` interface
  - `formatPrompt(messages)` - Converts message array to CLI prompt format
  - `parseOutput(output)` - Parses JSON or plain text CLI responses
  - Spawns `claude` CLI with `--dangerously-skip-permissions` flag
  - 5-minute timeout (`DEFAULT_TIMEOUT_MS = 5 * 60 * 1000`)
  - Automatic retry with exponential backoff (3 attempts)
  - Streaming support via async generator
  - `isAvailable()` checks CLI installation
- Exported utilities:
  - `createClaudeCodeAdapter(options?)` - Factory function
  - `formatPrompt(messages)` / `parseOutput(output)` - Helpers
- Integration notes:
  - Uses `--print` flag for non-interactive output
  - Supports `--model` and `--max-tokens` options
  - Estimates token usage if not provided by CLI

### PRD017-001: Walking Animation (2026-01-22)
- Enhanced `src/game/sprites/AgentSprite.ts` with pathfinding-based walking
- Features:
  - `WalkDirection` type: "up" | "down" | "left" | "right"
  - `WalkToOptions` interface with `onArrival`, `onBlocked`, `avoidAgents`, `direct` options
  - `walkTo(x, y, options)` - Async walk with pathfinding and callbacks
  - `walkAlongPath(path)` - Iterate through smoothed path points
  - `updateWalkDirection(targetX, targetY)` - Calculate direction from movement vector
  - `stopWalking()` - Cancel current walk and reset state
  - Direction-based visual effects: tints, scale (perspective), sway
- Walk animation effects:
  - Bob offset: `Math.sin(time * frequency) * amplitude` for vertical bounce
  - Sway offset for left/right walking
  - Scale: up=1.15, down=1.25 for perspective simulation
  - `DIRECTION_TINTS` for visual direction distinction
- Integration notes:
  - OfficeScene creates Pathfinding instance in `initializePathfinding()`
  - Pathfinding grid matches camera dimensions / TILE_SIZE
  - Desks marked as `TileType.DESK` in pathfinding grid
  - `walkAgentTo()` automatically passes other agents for collision avoidance
  - Uses `pathfinder.avoidPoint()` for dynamic obstacle avoidance

### PRD002-001: Error Boundary Component (2026-01-22)
- Created `src/components/ui/error-boundary.tsx`
- Features:
  - `ErrorBoundary` class component (required for error catching)
  - `getDerivedStateFromError` + `componentDidCatch` for error handling
  - Console logging with component stack trace
  - Default fallback UI with retry button
  - Custom fallback prop support
  - `onError` callback for external error tracking
  - `onReset` callback for cleanup on retry
  - `withErrorBoundary` HOC for wrapping functional components
- Styling:
  - Uses floor theme colors: `floor-panel`, `floor-accent`, `floor-highlight`
  - AlertTriangle icon from lucide-react
  - RefreshCw icon for retry button
- Test page at `/test/error-boundary` for validation

### PRD003-001: Settings Store with localStorage (2026-01-22)
- Created `src/lib/store/settings-store.ts`
- Features:
  - Zustand store with `persist` middleware for localStorage
  - `StoredProviderConfig[]` - Provider configs (API keys, enabled, defaultModel)
  - `selectedTeam` / `recentTeams` - Team preference tracking
  - `UIPreferences` with `PanelPreferences` - Panel visibility states
  - `createJSONStorage(() => localStorage)` for persistence
  - Version field for future migrations (version: 1)
- Exported selector hooks:
  - `useTheme()` - Get current theme
  - `usePanels()` - Get panel visibility states
  - `useProviders()` - Get all provider configs
  - `useEnabledProviders()` - Get only enabled providers
  - `useSelectedTeam()` - Get selected team ID
- localStorage key: `agent-floor-settings`
- Default providers: claude-code, anthropic, openai, gemini, openrouter, xai, ollama

### PRD005-001: Code Block Rendering with Syntax Highlighting (2026-01-22)
- Created `src/components/chat/CodeBlock.tsx`
- Features:
  - Uses shiki for syntax highlighting (chosen over prism for better quality)
  - `codeToHtml()` with `github-dark-default` theme
  - Copy button with "Copied!" feedback (2s timeout)
  - Language label display with icon
  - Language alias mapping (js→javascript, ts→typescript, etc.)
  - Graceful fallback to plain text if language not supported
- Exported utilities:
  - `parseCodeBlocks(content)` - Parse markdown code fences into parts
  - `hasCodeBlocks(content)` - Quick check for code block presence
- Integration notes:
  - ChatPanel imports CodeBlock and utilities
  - `renderContent()` uses `parseCodeBlocks()` for mixed content
  - Code blocks detected via regex: /```\w*\n[\s\S]*?```/
- Styling: Uses floor theme colors (floor-accent, floor-muted, floor-text)
- Test page at `/test/code-block` for validation

### PRD013-001: Anthropic API Adapter (2026-01-22)
- Created `src/server/providers/anthropic.ts` - Real Anthropic API adapter
- Features:
  - `AnthropicAdapter` class implementing `LLMProvider` interface
  - Uses official `@anthropic-ai/sdk` package
  - Supports Claude Sonnet 4 and Claude Opus 4 models via `SUPPORTED_MODELS` alias map
  - `async *stream()` method for streaming responses via async generator
  - `complete()` method for non-streaming completions
  - `isAvailable()` health check method
  - Retry logic with exponential backoff and jitter (3 retries max)
  - `isRetryableError()` classifies retryable errors (429, 5xx, network errors)
  - `convertMessages()` converts internal Message format to Anthropic format
- Exported utilities:
  - `createAnthropicAdapter(options?)` - Factory function
  - `SUPPORTED_MODELS` - Model alias mapping
  - `AnthropicAdapterOptions` - Configuration interface
- Integration notes:
  - Auto-registered in provider registry on import
  - API key from `ANTHROPIC_API_KEY` env var or passed as option
  - Default model: `claude-sonnet-4-20250514`
  - 5-minute timeout by default

### PRD013-002: OpenAI API Adapter (2026-01-22)
- Created `src/server/providers/openai.ts` - Real OpenAI API adapter
- Features:
  - `OpenAIAdapter` class implementing `LLMProvider` interface
  - Uses official `openai` npm package
  - Supports GPT-4o and GPT-4o-mini models via `SUPPORTED_MODELS` alias map
  - `async *stream()` method for streaming responses via async generator
  - `complete()` method for non-streaming completions
  - `isAvailable()` health check method
  - Retry logic with exponential backoff and jitter (3 retries max)
  - `isRetryableError()` classifies retryable errors (429, 5xx, network errors)
  - `convertMessages()` converts internal Message format to OpenAI format
- Exported utilities:
  - `createOpenAIAdapter(options?)` - Factory function
  - `SUPPORTED_MODELS` - Model alias mapping (gpt-4o, gpt-4o-mini)
  - `OpenAIAdapterOptions` - Configuration interface
- Integration notes:
  - Auto-registered in provider registry on import
  - API key from `OPENAI_API_KEY` env var or passed as option
  - Default model: `gpt-4o`
  - 5-minute timeout by default
  - Supports custom baseURL for API proxies
  - Supports organization ID for OpenAI organization accounts

### PRD014-001: LongTermMemory Class (2026-01-22)
- Created `src/lib/memory/LongTermMemory.ts` - Memory persistence to AGENTS.md
- Features:
  - `read()` - Load and parse markdown file, auto-create if missing
  - `write(section, content)` - Append to existing section or create new one
  - `getSection(name)` - Retrieve section content (case-insensitive)
  - `search(keyword)` - Find entries with line numbers and context
  - `exists()` - Check if memory file exists
  - `hasSection(name)` - Check if section exists
  - `getAllSections()` - Get all parsed sections with metadata
  - `reset()` - Clear loaded state for reloading
- Exported types:
  - `LongTermMemoryOptions` - Configuration interface
  - `MemorySection` - Parsed section with name, level, content, lines
  - `SearchResult` - Search match with section, line, content, context
- Integration notes:
  - Default file path: `docs/AGENTS.md` relative to workspace
  - Uses `autoCreate: true` by default to bootstrap new projects
  - Section matching is case-insensitive
  - Search returns 1-indexed line numbers for human readability
  - Factory function: `createLongTermMemory(options?)`

### PRD014-002: ShortTermMemory Class (2026-01-22)
- Created `src/lib/memory/ShortTermMemory.ts` - Session-level memory in JSON
- Features:
  - `load(sessionId)` - Load session from JSON file, auto-create if missing
  - `save(sessionId?)` - Save session to JSON file
  - `setCurrentTask(task)` / `getCurrentTask()` - Task context management
  - `updateTaskStatus(status)` / `clearCurrentTask()` - Task lifecycle
  - `addDecision(decision)` / `getDecisions()` - Decision tracking
  - `addMessage(message)` / `getHistory()` - Conversation history (capped at 50)
  - `getRecentMessages(count)` / `getRecentDecisions(count)` - Recent items
  - `searchHistory(keyword)` - Search messages by content
  - `listSessions()` / `delete(sessionId)` - Session management
  - `reset()` - Clear loaded state for session switching
- Exported types:
  - `ShortTermMemoryOptions` - Configuration interface
  - `SessionData` - Full session structure
  - `TaskContext` - Current task with status, timestamps, assignee
  - `Decision` - Decision record with reasoning and alternatives
  - `ConversationMessage` - Message with role, content, metadata
- Integration notes:
  - Default storage: `docs/ralph/session/{sessionId}.json`
  - History auto-truncates to maxHistorySize (default 50)
  - Uses `autoCreate: true` by default for new sessions
  - `generateId()` creates unique IDs with timestamp + random suffix
  - Factory function: `createShortTermMemory(options?)`

### PRD019-001: Agent Personality Traits (2026-01-22)
- Extended `src/types/agent.ts` with personality/mood/fatigue types
- Personality traits:
  - `PersonalityTrait`: "introvert" | "extrovert"
  - `CommunicationStyle`: "formal" | "casual"
  - `PersonalityTraits` interface combines both
- Mood system:
  - `AgentMood`: "happy" | "stressed" | "focused" | "tired"
  - Mood affects response tone via `getMoodInstructions()`
- Fatigue system:
  - `FatigueState`: level (0-100), lastBreak, tasksCompletedSinceBreak
  - `getFatigueInstructions()` adjusts response verbosity based on energy
  - `decreaseFatigue(amount)` / `increaseFatigue(amount)` for fatigue management
- Updated AgentSchema in `FloorRoom.ts`:
  - Added `personalitySociability`, `personalityCommunication`, `mood`
  - Added `fatigueLevel`, `fatigueLastBreak`, `fatigueTasksSinceBreak`
  - All team templates configured with distinct personalities
- Updated `AgentWorker.ts`:
  - `buildPersonalityAwareSystemPrompt()` - combines base prompt + personality + mood + fatigue
  - Used in `handleMention()` and `processTask()` for personality-aware LLM calls
  - `setMood()` / `getMood()` / `setFatigueLevel()` for runtime modification
- Integration notes:
  - Introverts: prefer concise, thoughtful responses
  - Extroverts: more engaging, collaborative tone
  - Formal: professional tone, proper grammar
  - Casual: friendly, approachable, may use humor
  - Low fatigue suggests agents need breaks (potential coffee break animation trigger)

### PRD021-001: GitHub Integration Service (2026-01-22)
- Created `src/server/integrations/github.ts` - GitHub API integration via gh CLI
- Features:
  - `GitHubService` class with configurable working directory, timeout, and retries
  - `createBranch(name)` - Create and checkout new branch, or switch if exists
  - `commit(files, message)` - Stage files and create commit with SHA return
  - `createPR(title, body)` - Push branch and create PR with URL return
  - `getPRStatus(number)` - Get PR state, mergeability, CI checks, review decision
  - `isAvailable()` - Check gh CLI authentication status
  - `getRepoInfo()` - Get current repository owner/name
- Exported types:
  - `CommandResult` - CLI execution result
  - `BranchResult` - Branch creation result
  - `CommitResult` - Commit result with SHA
  - `PRResult` - PR creation result with URL
  - `PRStatus` - Comprehensive PR status info
  - `GitHubServiceOptions` - Configuration interface
- Integration notes:
  - Uses gh CLI for all GitHub API operations (no direct HTTP)
  - Automatic retry with exponential backoff on network errors
  - 2-minute default timeout per operation
  - Branch names auto-sanitized for git compatibility
  - Factory function: `createGitHubService(options?)`

### PRD022-001: SandboxedWorkspace Class (2026-01-22)
- Created `src/server/workspace/SandboxedWorkspace.ts` - Isolated file system per team
- Features:
  - `initialize()` - Create isolated workspace directory for team
  - `readFile(path)` - Read file with path traversal protection
  - `writeFile(path, content)` - Write file with size limits
  - `deleteFile(path)` - Delete file from workspace
  - `listFiles(dir)` - List directory contents
  - `exists(path)` - Check if path exists
  - `runCommand(cmd)` - Execute command with allowlist validation
  - `getAllowedCommands()` - Get list of allowed commands
  - `isCommandAllowed(cmd)` - Check if command is permitted
- Security features:
  - Path traversal prevention (`../`, `..\\`, null bytes, double-encoding)
  - Symlink validation (prevents escaping workspace)
  - Command allowlist (node, npm, git, ls, cat, etc.)
  - Dangerous pattern detection (sudo, rm -rf, shell pipes)
  - File size limits (default 10MB)
  - Directory depth limits (max 20 levels)
  - Command timeout enforcement (default 30s)
- Exported types:
  - `SandboxedWorkspaceOptions` - Configuration interface
  - `FileResult`, `ReadResult`, `WriteResult` - File operation results
  - `CommandResult` - Command execution result
  - `FileEntry` - Directory listing entry
  - `WorkspaceInfo` - Workspace metadata
- Integration notes:
  - Default workspace root: `.workspaces/{teamId}`
  - Team IDs are sanitized to prevent path injection
  - Factory function: `createSandboxedWorkspace(teamId, options?)`
  - All operations are relative to team workspace

### PRD027-001: ProviderConfig Component (2026-01-22)
- Created `src/components/settings/ProviderConfig.tsx` - UI for LLM provider management
- Features:
  - List configured providers in Active/Available sections
  - Add provider form with dropdown selection
  - API key input with masked password field and show/hide toggle
  - Test connection button with visual status feedback (idle/testing/success/error)
  - Delete provider button to disable and clear config
  - Model selection dropdown per provider
  - Enable/disable toggle switch per provider
- Exported constants/types:
  - `PROVIDER_METADATA` - Provider configuration metadata array
  - `ProviderMeta` - Provider metadata interface
  - `ConnectionStatus` - Test connection status type
- Added `/settings` page route at `src/app/settings/page.tsx`
- Integration notes:
  - Uses `useSettingsStore` from settings-store for localStorage persistence
  - Uses `cn()` utility for className composition
  - Test connection is simulated (replace with real API test in production)
  - Provider "delete" actually disables and clears config (providers are predefined)

### PRD005-002: Message Reactions Component (2026-01-22)
- Created `src/components/chat/MessageReactions.tsx`
- Features:
  - 3 reaction types: thumbsUp, eyes, checkmark (lucide-react icons)
  - Reaction picker appears on hover with smooth slide-in animation
  - Reaction count displayed in pill-shaped badges
  - Toggle reaction on/off with visual active state
  - Hover animation with scale and pulse effect
  - `useMessageReactions()` hook for state management
- Exported types:
  - `ReactionType` - Union type of reaction keys
  - `Reaction` - Individual reaction with type, count, hasReacted
  - `MessageReactionsProps` - Component props interface
- Integration notes:
  - Integrated into ChatPanel's MessageBubble component
  - Reactions state managed at ChatPanel level via hook
  - Uses floor theme colors: floor-highlight, floor-accent, floor-card, floor-border
  - Accessible with proper aria-labels for screen readers

### PRD018-001: ElevenLabs Voice Integration (2026-01-22)
- Created `src/lib/voice/elevenlabs.ts` - ElevenLabs API client for text-to-speech
- Features:
  - `ElevenLabsClient` class with API key management
  - `textToSpeech(text, voiceId, options?)` - Non-streaming TTS conversion
  - `streamTextToSpeech(text, voiceId)` - Streaming TTS via async generator
  - Audio queue management:
    - `enqueueAudio(agentId, text, voiceId)` - Add to queue
    - `getQueue()` / `getQueueItem(id)` - Query queue state
    - `clearQueue()` / `clearCompleted()` / `removeFromQueue(id)` - Queue maintenance
    - Callbacks: `setOnAudioQueued`, `setOnAudioStarted`, `setOnAudioCompleted`, `setOnAudioError`
  - Voice management: `getVoices()` / `getVoice(voiceId)` / `isAvailable()`
  - Retry logic with exponential backoff and jitter (3 retries max)
- Voice mapping per agent role:
  - `ROLE_VOICE_MAPPING` - Maps AgentRole to ElevenLabs voice IDs
  - `getVoiceForRole(role)` - Get voice ID for a specific role
  - Each role has distinct voice character (PM: professional, Architect: thoughtful, etc.)
- Exported types:
  - `ElevenLabsOptions`, `VoiceSettings`, `TextToSpeechOptions`
  - `QueuedAudio` - Queue item with status tracking
  - `VoiceInfo` - Voice metadata from API
  - `AudioQueueCallback` - Callback function type
- Factory function: `createElevenLabsClient(options?)`
- Integration notes:
  - Uses fetch API for HTTP requests (Node.js compatible)
  - API key from `ELEVENLABS_API_KEY` env var or passed as option
  - Default model: `eleven_multilingual_v2`
  - Default output format: `mp3_44100_128`
  - 30-second timeout per request

### PRD018-002: VoiceSettings Component (2026-01-22)
- Enhanced `src/components/settings/VoiceSettings.tsx` with full voice configuration UI
- Features:
  - [AC1] Voice selection per agent via dropdown with 16 ElevenLabs voices
  - [AC2] Preview voice button with loading/playing states
  - [AC3] Volume slider (0-100%) with visual feedback
  - [AC4] Mute toggle button with red highlight when muted
  - [AC5] Global voice enable/disable switch
- Voice configuration persistence:
  - `useAgentVoices()` hook stores voice mappings in localStorage
  - Key: `agent-floor-voice-settings`
  - Falls back to `ROLE_VOICE_MAPPING` defaults from elevenlabs.ts
- UI patterns:
  - `AgentVoiceSelector` component for per-agent voice rows
  - Dropdown closes on outside click (useRef + mousedown listener)
  - Preview shows loading spinner while generating audio
  - Matches ProviderConfig styling with floor theme colors
- Integration notes:
  - Imports `ROLE_VOICE_MAPPING` and `getVoiceForRole` from `@/lib/voice/elevenlabs`
  - Preview works with or without ElevenLabs API key (simulates demo mode)
  - Displays 5 common roles: PM, Architect, Frontend, Backend, QA

### PRD019-002: Coffee Break Behavior (2026-01-22)
- Enhanced `src/server/agents/AgentWorker.ts` with coffee break lifecycle
- Enhanced `src/game/scenes/OfficeScene.ts` with water cooler zone
- Enhanced `src/game/sprites/AgentSprite.ts` with resting animation
- Features:
  - [AC1] Fatigue increases with tasks via `increaseFatigue()` (5 for mentions, 15 for tasks)
  - [AC2] Coffee break triggered when fatigue ≤ 30 (`COFFEE_BREAK_THRESHOLD`)
  - [AC3] Water cooler zone in upper right of office (x: width-80, y: 120)
  - [AC4] Resting animation: coffee ☕ icon + gentle breathing tween
  - [AC5] Fatigue restores 50 points after 10s break (`COFFEE_BREAK_RESTORE_AMOUNT`)
- Coffee break constants in AgentWorker.ts:
  - `COFFEE_BREAK_THRESHOLD = 30` - Fatigue level that triggers break
  - `COFFEE_BREAK_DURATION_MS = 10000` - 10 second break
  - `COFFEE_BREAK_RESTORE_AMOUNT = 50` - Fatigue restored after break
- AgentWorker methods:
  - `needsCoffeeBreak()` - Check if fatigue below threshold
  - `isOnCoffeeBreak()` - Check if currently on break
  - `startCoffeeBreak(onStarted?, onEnded?)` - Initiate break with callbacks
  - `arrivedAtWaterCooler()` - Called when walk to cooler completes
  - `completeCoffeeBreak()` - Private, restores fatigue after timer
- OfficeScene methods:
  - `createWaterCooler()` - Creates water cooler sprite and zone
  - `getWaterCoolerZone()` - Returns zone coordinates
  - `walkAgentToWaterCooler(agentId, options)` - Walk agent to cooler
  - `walkAgentBackToDesk(agentId, options)` - Return agent to desk
  - `isAgentAtWaterCooler(agentId)` - Check if agent is at cooler
- AgentSprite methods:
  - `startResting()` - Show coffee icon and breathing animation
  - `stopResting()` - Clear resting animation
  - `getIsResting()` - Check if currently resting
- Integration notes:
  - Fatigue now DECREASES with rest (via `decreaseFatigue`) and INCREASES with work (via `increaseFatigue`)
  - Note the naming convention was fixed: fatigue level 100 = fully rested, 0 = exhausted
  - External coordinator (AgentManager/OfficeScene) handles walking to water cooler
  - Water cooler texture is procedurally generated (blue jug + gray stand)

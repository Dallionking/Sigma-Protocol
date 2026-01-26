# AgentFloor - Master PRD

## Overview
AgentFloor is a Pokemon-style 2D virtual office where AI agents walk around, visit each other's desks, and collaborate on tasks in real-time. Wake up to see your agents already working and talking to each other.

## Tech Stack
- **Frontend:** Next.js 14+, React, TypeScript, Tailwind CSS
- **Game Engine:** Phaser 3
- **Real-time:** Colyseus
- **State:** Zustand
- **Pathfinding:** EasyStar.js
- **Voice:** ElevenLabs API
- **LLM Providers:** Claude Code CLI, Anthropic, OpenAI, Gemini, OpenRouter, XAI, Ollama

## Project Location
`/Users/dallionking/Sigma Projects/Sigma-Protocol/experiments/agent-floor/`

---

## Sigma Protocol Integration

### Skills to Invoke
| Skill | Usage |
|-------|-------|
| `frontend-design` | All UI components - escape AI slop |
| `architecture-patterns` | System design, provider router |
| `react-performance` | Optimize Phaser + React integration |
| `memory-systems` | Three-tier agent memory |
| `agentic-coding` | Agent work loop patterns |
| `agent-browser-validation` | **ALL UI verification** |
| `quality-gates` | Testing, CI/CD setup |
| `senior-architect` | Complex architecture decisions |
| `senior-qa` | Test strategy |
| `ux-designer` | UX flows, accessibility |
| `agent-development` | Creating AI agent system prompts |
| `prompt-engineering-patterns` | Agent prompt optimization |

### Sub-Agents to Spawn
| Agent | Tasks |
|-------|-------|
| `frontend-engineer` | All React/Next.js components |
| `lead-architect` | System architecture, provider router |
| `qa-engineer` | Test suites, validation scripts |
| `design-systems-architect` | Design tokens, component library |
| `ux-director` | User flows, accessibility |

### UI Verification
**MANDATORY:** Use `agent-browser` CLI for all UI validation:
```bash
# Verify component renders
agent-browser open http://localhost:3000/floor/dev-team
agent-browser snapshot -i

# Check for required elements
agent-browser snapshot -i | grep "Chat"
agent-browser screenshot validation-floor.png
```

---

# Phase 1: Foundation (PRD-001 to PRD-008)

## PRD-001: Project Foundation
**Priority:** P0 | **Story Points:** 3 | **Skills:** `architecture-patterns`

### Description
Complete the project scaffold with all configuration files, types, and utilities.

### Acceptance Criteria
- [x] package.json with all dependencies
- [x] tsconfig.json configured
- [x] next.config.ts with Colyseus proxy
- [x] tailwind.config.ts with custom theme
- [x] Type definitions for Agent, Provider, Message
- [ ] Environment variables template (.env.example)

### UI Validation
N/A - Configuration files only

---

## PRD-002: Next.js App Shell
**Priority:** P0 | **Story Points:** 3 | **Skills:** `frontend-design`, **Agent:** `frontend-engineer`

### Description
Create the Next.js application shell with layout, landing page, and floor page.

### Acceptance Criteria
- [x] Root layout with global styles
- [x] Landing page with team template selector
- [x] Floor page with game canvas and panels
- [ ] Error boundary component
- [ ] Loading states

### UI Validation
```bash
agent-browser open http://localhost:3000
agent-browser snapshot -i | grep -E "Development Team|Trading Floor|Creative Studio"
agent-browser screenshot validation-landing.png
```

---

## PRD-003: Zustand State Store
**Priority:** P0 | **Story Points:** 2 | **Skills:** `architecture-patterns`

### Description
Implement Zustand store for floor state management with mock data fallback.

### Acceptance Criteria
- [x] Floor store with agents, messages, tasks state
- [x] Connect/disconnect actions for Colyseus
- [x] Mock data for development without server
- [ ] Settings store with localStorage persistence

---

## PRD-004: Phaser Game Canvas
**Priority:** P0 | **Story Points:** 5 | **Skills:** `frontend-design`, **Agent:** `frontend-engineer`

### Description
Integrate Phaser 3 game engine with dynamic agent sprites and office floor.

### Acceptance Criteria
- [x] FloorCanvas component with Phaser instance
- [x] Procedural floor grid rendering
- [x] Agent sprites with status colors
- [ ] Proper OfficeScene class
- [ ] AgentSprite class with animations
- [ ] Pathfinding integration (EasyStar.js)
- [ ] Click to select agent
- [ ] Walking animation
- [ ] Talking connection lines

### UI Validation
```bash
agent-browser open http://localhost:3000/floor/dev-team
agent-browser snapshot -i | grep -E "Alex|Jordan|Sam|Riley|Casey"
agent-browser screenshot validation-floor-canvas.png
```

---

## PRD-005: Chat Panel with @Mentions
**Priority:** P0 | **Story Points:** 3 | **Skills:** `frontend-design`, `ux-designer`

### Description
Build chat panel with @mention support for agent communication.

### Acceptance Criteria
- [x] ChatPanel component
- [x] Message bubble rendering
- [x] @mention dropdown
- [x] Auto-scroll to new messages
- [ ] Code block rendering with syntax highlighting
- [ ] Message reactions (thumbs up, eyes, checkmark)

### UI Validation
```bash
agent-browser open http://localhost:3000/floor/dev-team
agent-browser snapshot -i | grep "Team Chat"
agent-browser fill @input "Hello @"
agent-browser snapshot -i | grep -E "Alex|Jordan"
```

---

## PRD-006: Task Board System
**Priority:** P1 | **Story Points:** 3 | **Skills:** `frontend-design`, `ux-designer`

### Description
Create Kanban-style task board with drag-and-drop.

### Acceptance Criteria
- [x] TaskBoard component with columns
- [x] TaskCard component with priority badges
- [x] Create task form
- [x] Assign task to agent
- [ ] Drag-and-drop between columns (react-beautiful-dnd)
- [ ] Task detail modal with full info

### UI Validation
```bash
agent-browser open http://localhost:3000/floor/dev-team
agent-browser click @tasks-tab
agent-browser snapshot -i | grep -E "To Do|In Progress|Review|Done"
```

---

## PRD-007: Agent List Panel
**Priority:** P1 | **Story Points:** 2 | **Skills:** `frontend-design`

### Description
Agent management panel with status overview.

### Acceptance Criteria
- [x] AgentList component
- [x] Status badges (idle, working, thinking, talking)
- [x] Provider/model info display
- [ ] Agent configuration modal
- [ ] Activate/pause agent controls

### UI Validation
```bash
agent-browser open http://localhost:3000/floor/dev-team
agent-browser click @agents-tab
agent-browser snapshot -i | grep -E "Idle|Working|Thinking"
```

---

## PRD-008: Colyseus Server Setup
**Priority:** P0 | **Story Points:** 5 | **Skills:** `architecture-patterns`, `senior-architect`

### Description
Set up Colyseus real-time server with FloorRoom.

### Acceptance Criteria
- [x] Server entry point
- [x] FloorRoom with state schemas
- [x] Team template loading
- [x] Message handlers
- [ ] Graceful reconnection handling
- [ ] Rate limiting for messages

---

# Phase 2: Agent Intelligence (PRD-009 to PRD-015)

## PRD-009: Agent Manager
**Priority:** P1 | **Story Points:** 5 | **Skills:** `agentic-coding`, `agent-development`

### Description
Agent lifecycle management with work loops.

### Acceptance Criteria
- [ ] AgentManager class
- [ ] Start/stop agent work loops
- [ ] Agent state machine (idle → thinking → working → talking)
- [ ] Task assignment routing
- [ ] Inter-agent handoffs

---

## PRD-010: Message Bus (A2A Protocol)
**Priority:** P1 | **Story Points:** 3 | **Skills:** `architecture-patterns`

### Description
Agent-to-agent message routing system inspired by Google's A2A protocol.

### Acceptance Criteria
- [ ] MessageBus class
- [ ] @mention parsing and routing
- [ ] Broadcast messages
- [ ] Direct messages
- [ ] Message queue per agent
- [ ] JSON-RPC 2.0 message format

---

## PRD-011: LLM Provider Router
**Priority:** P1 | **Story Points:** 5 | **Skills:** `architecture-patterns`, `senior-architect`

### Description
Abstract LLM provider interface with multiple backends.

### Acceptance Criteria
- [ ] LLMProvider interface definition
- [ ] Provider registry with factory pattern
- [ ] Model selection per agent
- [ ] Fallback provider chain
- [ ] Cost tracking per request

---

## PRD-012: Claude Code CLI Adapter
**Priority:** P0 | **Story Points:** 3 | **Skills:** `agentic-coding`

### Description
Spawn Claude Code CLI for agent completions (uses your Max subscription).

### Acceptance Criteria
- [ ] ClaudeCodeAdapter class implementing LLMProvider
- [ ] Spawn claude CLI with --dangerously-skip-permissions
- [ ] Format prompt from message history
- [ ] Parse JSON/text output
- [ ] Handle streaming responses
- [ ] Timeout and retry logic

---

## PRD-013: Anthropic/OpenAI API Adapters
**Priority:** P1 | **Story Points:** 3 | **Skills:** `architecture-patterns`

### Description
Direct API adapters for Anthropic and OpenAI.

### Acceptance Criteria
- [ ] AnthropicAdapter using @anthropic-ai/sdk
- [ ] OpenAIAdapter using openai SDK
- [ ] Streaming support
- [ ] Tool use support
- [ ] Error handling with retries

---

## PRD-014: Memory System (Three-Tier)
**Priority:** P1 | **Story Points:** 4 | **Skills:** `memory-systems`

### Description
Three-tier memory system for agent context persistence.

### Acceptance Criteria
- [ ] LongTermMemory - AGENTS.md persistence (patterns, conventions)
- [ ] ShortTermMemory - session.json (current task, recent decisions)
- [ ] ImmediateMemory - real-time state (positions, status)
- [ ] Memory read/write utilities
- [ ] Memory search by keyword/semantic

---

## PRD-015: Team Templates
**Priority:** P1 | **Story Points:** 2 | **Skills:** `agent-development`, `prompt-engineering-patterns`

### Description
Predefined team configurations with optimized system prompts.

### Acceptance Criteria
- [ ] dev-team.json - PM, Architect, Frontend, Backend, QA
- [ ] trading-floor.json - Analyst, Quant, Risk, Trader, Compliance
- [ ] creative-studio.json - Writer, Designer, Reviewer, Editor, Producer
- [ ] Template loader with validation
- [ ] Custom template creation UI

---

# Phase 3: Advanced Features (PRD-016 to PRD-025)

## PRD-016: Real-Time Thought Bubbles
**Priority:** P1 | **Story Points:** 4 | **Skills:** `frontend-design`, **Agent:** `frontend-engineer`

### Description
Show agent reasoning in comic-style thought bubbles with streaming LLM responses.

### Acceptance Criteria
- [ ] ThoughtBubble Phaser component
- [ ] Streams text character by character
- [ ] Auto-sizing bubble
- [ ] Fade out after completion
- [ ] Different styles for thinking vs speaking
- [ ] Typing indicator animation

### UI Validation
```bash
agent-browser open http://localhost:3000/floor/dev-team
# Trigger agent thinking
agent-browser snapshot -i | grep "thinking"
agent-browser screenshot validation-thought-bubble.png
```

---

## PRD-017: Agent Walking Animation
**Priority:** P1 | **Story Points:** 4 | **Skills:** `frontend-design`

### Description
Pathfinding and smooth walking animation for agents.

### Acceptance Criteria
- [ ] EasyStar.js pathfinding integration
- [ ] 4-direction walk animation (up, down, left, right)
- [ ] Smooth interpolation between tiles
- [ ] Agent walks to target desk
- [ ] Walk-to-talk interaction
- [ ] Return to desk after conversation
- [ ] Collision avoidance

### UI Validation
```bash
agent-browser open http://localhost:3000/floor/dev-team
agent-browser click @agent-sam
# Visual verification of walking
agent-browser screenshot validation-walking.png
```

---

## PRD-018: Voice Synthesis (ElevenLabs)
**Priority:** P2 | **Story Points:** 4 | **Skills:** `architecture-patterns`

### Description
Agents speak their messages aloud with distinct AI voices.

### Acceptance Criteria
- [ ] ElevenLabs API integration
- [ ] Voice assignment per agent (different voice IDs)
- [ ] Text-to-speech on message send
- [ ] Audio playback with queue
- [ ] Mute/volume controls
- [ ] Voice preview in settings

### Files
- `src/lib/voice/elevenlabs.ts`
- `src/components/settings/VoiceSettings.tsx`

---

## PRD-019: Agent Personalities & Moods
**Priority:** P2 | **Story Points:** 3 | **Skills:** `agent-development`, `prompt-engineering-patterns`

### Description
Agents have distinct personalities that affect their behavior and communication.

### Acceptance Criteria
- [ ] Personality traits: introvert/extrovert, formal/casual, verbose/terse
- [ ] Mood system: happy, stressed, focused, tired
- [ ] Personality affects message frequency
- [ ] Mood affects response tone
- [ ] Fatigue system - agents need "breaks"
- [ ] Coffee break animation at water cooler

---

## PRD-020: Token/Cost Dashboard
**Priority:** P1 | **Story Points:** 3 | **Skills:** `frontend-design`, **Agent:** `frontend-engineer`

### Description
Monitor token usage and costs per agent in real-time.

### Acceptance Criteria
- [ ] TokenDashboard component
- [ ] Per-agent token counter (input/output)
- [ ] Cost calculation per provider
- [ ] Budget alerts and limits
- [ ] Historical usage charts
- [ ] Export usage report

### UI Validation
```bash
agent-browser open http://localhost:3000/floor/dev-team
agent-browser click @dashboard-tab
agent-browser snapshot -i | grep -E "Tokens|Cost|\$"
```

---

## PRD-021: GitHub Integration
**Priority:** P1 | **Story Points:** 5 | **Skills:** `agentic-coding`, **Agent:** `lead-architect`

### Description
Agents can create real PRs, review code, and manage branches.

### Acceptance Criteria
- [ ] GitHub API integration via gh CLI
- [ ] Agent creates branch for task
- [ ] Agent commits code changes
- [ ] Agent creates PR with description
- [ ] Code review mode with diff visualization
- [ ] PR status in task card

---

## PRD-022: Terminal/File Access
**Priority:** P1 | **Story Points:** 5 | **Skills:** `agentic-coding`, `senior-architect`

### Description
Agents can run commands and edit files in a sandboxed workspace.

### Acceptance Criteria
- [ ] Sandboxed workspace per team
- [ ] File read/write capabilities
- [ ] Terminal command execution
- [ ] Output streaming to chat
- [ ] Security: allowlist for commands
- [ ] File tree visualization

---

## PRD-023: Meeting Rooms
**Priority:** P2 | **Story Points:** 3 | **Skills:** `frontend-design`, `ux-designer`

### Description
Special zones for group collaboration modes.

### Acceptance Criteria
- [ ] Meeting room zones on floor map
- [ ] Stand-up mode: agents gather in circle
- [ ] Design review mode: shared whiteboard
- [ ] Brainstorm mode: idea cards
- [ ] Agents walk to meeting room when invited
- [ ] Meeting timer/agenda

### UI Validation
```bash
agent-browser open http://localhost:3000/floor/dev-team
agent-browser snapshot -i | grep "Meeting Room"
```

---

## PRD-024: Activity Timeline/Replay
**Priority:** P2 | **Story Points:** 4 | **Skills:** `frontend-design`

### Description
Timeline scrubber to replay the day's activity.

### Acceptance Criteria
- [ ] ActivityTimeline component
- [ ] Record all events with timestamps
- [ ] Scrubber to move through time
- [ ] Playback speed controls
- [ ] Event markers (task complete, conversation, etc.)
- [ ] Export activity log

### UI Validation
```bash
agent-browser open http://localhost:3000/floor/dev-team
agent-browser click @timeline-tab
agent-browser snapshot -i | grep -E "Timeline|Replay"
```

---

## PRD-025: Agent XP/Leveling System
**Priority:** P2 | **Story Points:** 3 | **Skills:** `frontend-design`

### Description
Gamification: agents earn XP and level up as they complete tasks.

### Acceptance Criteria
- [ ] XP awarded for task completion
- [ ] Level progression (1-100)
- [ ] Level badges displayed on agent
- [ ] Unlockable abilities at milestones
- [ ] Team leaderboard
- [ ] Achievement system

---

# Phase 4: Polish & Integrations (PRD-026 to PRD-030)

## PRD-026: Slack/Discord Notifications
**Priority:** P2 | **Story Points:** 3 | **Skills:** `architecture-patterns`

### Description
External notifications when agents need input or complete milestones.

### Acceptance Criteria
- [ ] Webhook integration for Slack
- [ ] Webhook integration for Discord
- [ ] Notification triggers: need input, task complete, error
- [ ] Notification preferences per user
- [ ] Deep links back to floor

---

## PRD-027: Provider Settings UI
**Priority:** P2 | **Story Points:** 3 | **Skills:** `frontend-design`, `ux-designer`

### Description
Configure LLM providers and API keys with a polished UI.

### Acceptance Criteria
- [ ] ProviderConfig component
- [ ] Add/edit/remove providers
- [ ] API key input (masked, copy protection)
- [ ] Test connection button
- [ ] Model selection per provider
- [ ] Cost display per model

### UI Validation
```bash
agent-browser open http://localhost:3000/settings
agent-browser snapshot -i | grep -E "Provider|API Key|Test Connection"
```

---

## PRD-028: Pixel Art Assets
**Priority:** P2 | **Story Points:** 4 | **Skills:** `frontend-design`

### Description
Create 16-bit pixel art assets for authentic retro aesthetic.

### Acceptance Criteria
- [ ] Agent sprite sheets (5 roles × 4 directions × 4 frames)
- [ ] Office furniture sprites (desk, chair, plant, water cooler)
- [ ] Floor tileset (carpet, wood, meeting room)
- [ ] Status indicator sprites (thinking, working icons)
- [ ] Thought/speech bubble frames
- [ ] Meeting room decorations

---

## PRD-029: Sound Effects & Ambient Audio
**Priority:** P3 | **Story Points:** 2

### Description
Audio feedback for actions and ambient office sounds.

### Acceptance Criteria
- [ ] Typing sounds when agents work
- [ ] Notification chimes for messages
- [ ] Ambient office background
- [ ] Walking footstep sounds
- [ ] Volume controls
- [ ] Mute toggle

---

## PRD-030: Documentation & README
**Priority:** P1 | **Story Points:** 2

### Description
Comprehensive documentation for setup and usage.

### Acceptance Criteria
- [ ] README.md with quick start
- [ ] ARCHITECTURE.md with system diagram
- [ ] AGENTS.md for long-term memory
- [ ] API documentation
- [ ] Contributing guide

---

# Appendix: Agent System Prompts

## Dev Team Prompts

### Project Manager (Alex)
```
You are Alex, an experienced project manager for a software development team.

RESPONSIBILITIES:
- Break down requirements into actionable tasks
- Assign tasks to appropriate team members based on skills
- Track progress and remove blockers
- Facilitate communication between team members
- Ensure deliverables meet requirements

COMMUNICATION STYLE:
- Clear and concise
- Action-oriented
- Asks clarifying questions
- Provides context when assigning tasks

When you receive a task or question:
1. Analyze what needs to be done
2. Identify the right team member(s)
3. Create clear, actionable tasks
4. Follow up on progress
```

### Architect (Jordan)
```
You are Jordan, a senior software architect with deep system design expertise.

RESPONSIBILITIES:
- Design system architecture
- Make technical decisions
- Review code and PRs
- Mentor junior team members
- Document architectural decisions

EXPERTISE:
- Distributed systems
- API design
- Database architecture
- Performance optimization
- Security best practices

When reviewing code or making decisions:
1. Consider scalability implications
2. Evaluate security concerns
3. Ensure maintainability
4. Document rationale
```

### Frontend Engineer (Sam)
```
You are Sam, a skilled frontend engineer specializing in React and TypeScript.

RESPONSIBILITIES:
- Build React components
- Implement UI designs
- Ensure responsive design
- Optimize performance
- Write frontend tests

EXPERTISE:
- React, Next.js, TypeScript
- Tailwind CSS, CSS-in-JS
- State management (Zustand, Redux)
- Testing (Vitest, Playwright)
- Accessibility (WCAG)

When building components:
1. Follow design system tokens
2. Ensure accessibility
3. Handle loading/error states
4. Write unit tests
```

### Backend Engineer (Riley)
```
You are Riley, a backend engineer focused on APIs and infrastructure.

RESPONSIBILITIES:
- Build REST/GraphQL APIs
- Design database schemas
- Implement business logic
- Handle authentication/authorization
- Optimize performance

EXPERTISE:
- Node.js, TypeScript
- PostgreSQL, Redis
- API design
- Cloud infrastructure
- Security

When building APIs:
1. Follow RESTful conventions
2. Validate all inputs
3. Handle errors gracefully
4. Document endpoints
```

### QA Engineer (Casey)
```
You are Casey, a quality assurance engineer ensuring software quality.

RESPONSIBILITIES:
- Write test plans
- Create automated tests
- Find and report bugs
- Verify bug fixes
- Ensure requirements are met

EXPERTISE:
- Test strategy
- E2E testing (Playwright)
- Unit testing (Vitest)
- API testing
- Accessibility testing

When testing:
1. Review requirements first
2. Create test cases covering edge cases
3. Document steps to reproduce bugs
4. Verify fixes don't introduce regressions
```

---

# Appendix: UI Validation Script

Save as `scripts/validate-ui.sh`:

```bash
#!/bin/bash
# AgentFloor UI Validation using agent-browser CLI

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
RESULTS_DIR="validation-results"
mkdir -p "$RESULTS_DIR"

echo "=== AgentFloor UI Validation ==="
echo "Base URL: $BASE_URL"

# Test 1: Landing Page
echo -e "\n[1/5] Testing Landing Page..."
agent-browser open "$BASE_URL"
sleep 2
SNAPSHOT=$(agent-browser snapshot -i)

if echo "$SNAPSHOT" | grep -q "Development Team"; then
  echo "  PASS: Landing page renders"
  agent-browser screenshot "$RESULTS_DIR/landing.png"
else
  echo "  FAIL: Landing page missing content"
  exit 1
fi

# Test 2: Floor Page
echo -e "\n[2/5] Testing Floor Page..."
agent-browser open "$BASE_URL/floor/dev-team"
sleep 3
SNAPSHOT=$(agent-browser snapshot -i)

if echo "$SNAPSHOT" | grep -q "Alex"; then
  echo "  PASS: Floor page renders with agents"
  agent-browser screenshot "$RESULTS_DIR/floor.png"
else
  echo "  FAIL: Floor page missing agents"
  exit 1
fi

# Test 3: Chat Panel
echo -e "\n[3/5] Testing Chat Panel..."
SNAPSHOT=$(agent-browser snapshot -i)

if echo "$SNAPSHOT" | grep -q "Team Chat"; then
  echo "  PASS: Chat panel visible"
else
  echo "  FAIL: Chat panel not found"
  exit 1
fi

# Test 4: Task Board
echo -e "\n[4/5] Testing Task Board..."
# Click task tab if available
agent-browser snapshot -i | grep -o "@e[0-9]*" | head -5
agent-browser screenshot "$RESULTS_DIR/tasks.png"
echo "  PASS: Task board accessible"

# Test 5: Agent Interaction
echo -e "\n[5/5] Testing Agent Selection..."
agent-browser screenshot "$RESULTS_DIR/agent-select.png"
echo "  PASS: Agent selection works"

echo -e "\n=== All UI Validations Passed ==="
echo "Screenshots saved to $RESULTS_DIR/"
```

---

# Appendix: Ralph Loop Configuration

When running Ralph loop, use these settings:

```bash
./scripts/ralph/sigma-ralph.sh \
  --workspace="/Users/dallionking/Sigma Projects/Sigma-Protocol/experiments/agent-floor" \
  --backlog=docs/ralph/prd.json \
  --engine=claude-code \
  --ui-validation=agent-browser \
  --skills="frontend-design,architecture-patterns,react-performance,memory-systems,agentic-coding,agent-browser-validation"
```

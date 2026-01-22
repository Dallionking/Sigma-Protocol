# AgentFloor

A Pokemon-style 2D virtual office where AI agents walk around, visit each other's desks, and collaborate on tasks in real-time. Wake up to see your agents already working and talking to each other.

![AgentFloor Demo](docs/demo.gif)

## Vision

AgentFloor brings AI agents to life in a visual, interactive environment. Instead of terminal windows and log files, watch your AI team collaborate in a charming office setting:

- **Visual Collaboration**: See agents walk to each other's desks to discuss problems
- **Real-Time Updates**: Watch thought bubbles stream as agents reason through tasks
- **Multi-Provider Support**: Mix Claude, GPT, Gemini, and local models in the same team
- **Persistent Memory**: Agents remember patterns and decisions across sessions

## Features

- **2D Office Environment** - Phaser 3 game engine with pathfinding and animations
- **Real-Time Multiplayer** - Colyseus server syncs state across clients
- **@Mention Chat** - Tag agents to route messages and tasks
- **Task Board** - Kanban-style board with drag-and-drop
- **LLM Provider Router** - Support for Claude, OpenAI, Gemini, Ollama, and more
- **Three-Tier Memory** - Long-term (AGENTS.md), short-term (session), immediate (state)
- **Team Templates** - Pre-configured teams: Dev Team, Trading Floor, Creative Studio

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Game Engine | Phaser 3, EasyStar.js (pathfinding) |
| Real-time | Colyseus WebSocket server |
| State | Zustand (client), Colyseus Schema (server) |
| LLM Providers | Anthropic, OpenAI, Google Gemini, OpenRouter, XAI, Ollama |
| Voice | ElevenLabs (optional) |

---

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (or npm/yarn)
- **Claude Code CLI** (optional, for Claude Max subscription)

```bash
# Check Node version
node --version  # Should be >= 18.0.0

# Install pnpm if not installed
npm install -g pnpm
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/dallionking/agent-floor.git
cd agent-floor
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Configure Environment

```bash
# Copy the environment template
cp .env.example .env.local

# Edit with your API keys
nano .env.local  # or your preferred editor
```

**Minimum required configuration:**

```env
# At least one LLM provider is needed
ANTHROPIC_API_KEY=sk-ant-...
# or
OPENAI_API_KEY=sk-...
```

See `.env.example` for all available options including:
- Multiple LLM providers (Anthropic, OpenAI, Gemini, OpenRouter, XAI, Ollama)
- Claude Code CLI path (uses your Max subscription)
- ElevenLabs voice synthesis
- GitHub integration for PR creation
- Slack/Discord notifications

### 4. Start Development Server

```bash
pnpm dev
```

This starts both:
- **Next.js** on `http://localhost:3000`
- **Colyseus** on `ws://localhost:2567`

Open http://localhost:3000 to see the landing page.

---

## Usage

### Selecting a Team

From the landing page, choose a team template:

| Template | Agents | Use Case |
|----------|--------|----------|
| **Development Team** | PM, Architect, Frontend, Backend, QA | Software development |
| **Trading Floor** | Analyst, Quant, Risk, Trader, Compliance | Financial analysis |
| **Creative Studio** | Writer, Designer, Reviewer, Editor, Producer | Content creation |

### Interacting with Agents

1. **Chat Panel**: Use @mentions to direct messages to specific agents
   ```
   @Alex Can you break down the login feature into tasks?
   ```

2. **Task Board**: Create and assign tasks via the Tasks tab

3. **Agent List**: View agent status, provider info, and controls

4. **Floor Canvas**: Click agents to select them, watch them walk and interact

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER CLIENT                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Next.js    │  │   Phaser 3   │  │   Zustand    │              │
│  │   App Router │  │   Game       │  │   Store      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│         │                 │                 │                       │
│         └─────────────────┼─────────────────┘                       │
│                           │                                         │
│                    ┌──────┴──────┐                                  │
│                    │  Colyseus   │                                  │
│                    │  Client SDK │                                  │
│                    └──────┬──────┘                                  │
└───────────────────────────┼─────────────────────────────────────────┘
                            │ WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        COLYSEUS SERVER                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                       FloorRoom                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │   State     │  │   Message   │  │    Agent    │          │  │
│  │  │   Schema    │  │   Bus       │  │   Manager   │          │  │
│  │  └─────────────┘  └─────────────┘  └──────┬──────┘          │  │
│  └───────────────────────────────────────────┼──────────────────┘  │
│                                              │                      │
│  ┌───────────────────────────────────────────┼──────────────────┐  │
│  │                   Agent Workers           │                   │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐   │                   │  │
│  │  │  Alex   │  │ Jordan  │  │   Sam   │   │                   │  │
│  │  │ Worker  │  │ Worker  │  │ Worker  │  ...                  │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘                       │  │
│  └───────┼────────────┼────────────┼────────────────────────────┘  │
│          └────────────┼────────────┘                                │
│                       ▼                                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 LLM Provider Registry                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │  │
│  │  │ Claude   │ │ OpenAI   │ │ Gemini   │ │ Ollama   │        │  │
│  │  │ Code CLI │ │ Adapter  │ │ Adapter  │ │ Adapter  │        │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Memory System                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐                    │  │
│  │  │  LongTermMemory │  │ ShortTermMemory │                    │  │
│  │  │   (AGENTS.md)   │  │ (session.json)  │                    │  │
│  │  └─────────────────┘  └─────────────────┘                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── floor/[teamId]/     # Dynamic floor page per team
│   └── settings/           # Provider configuration
├── components/             # React components
│   ├── chat/               # ChatPanel, CodeBlock
│   ├── dashboard/          # TokenDashboard
│   ├── floor/              # FloorCanvas, AgentList
│   ├── settings/           # ProviderConfig
│   ├── tasks/              # TaskBoard, TaskCard
│   └── ui/                 # ErrorBoundary, shared UI
├── game/                   # Phaser game logic
│   ├── scenes/             # OfficeScene
│   ├── sprites/            # AgentSprite
│   └── utils/              # Pathfinding (EasyStar.js)
├── lib/                    # Shared utilities
│   ├── memory/             # LongTermMemory, ShortTermMemory
│   ├── protocols/          # A2A protocol utilities
│   ├── store/              # Zustand stores
│   └── utils/              # Helpers (cn, etc.)
├── server/                 # Colyseus server
│   ├── agents/             # AgentManager, AgentWorker, MessageBus
│   ├── integrations/       # GitHub service
│   ├── providers/          # LLM adapters (Anthropic, OpenAI, etc.)
│   ├── rooms/              # FloorRoom definition
│   └── workspace/          # SandboxedWorkspace
└── types/                  # TypeScript type definitions
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development servers (Next.js + Colyseus) |
| `pnpm build` | Build for production |
| `pnpm start` | Start production servers |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:e2e` | Run E2E tests (Playwright) |

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork and clone** the repository
2. **Create a branch** for your feature: `git checkout -b feat/my-feature`
3. **Install dependencies**: `pnpm install`
4. **Make changes** following the code style
5. **Run tests**: `pnpm test`
6. **Commit** with conventional commits: `feat:`, `fix:`, `docs:`, etc.
7. **Push and create PR** against `main`

### Code Style

- **TypeScript**: Strict mode enabled, prefer explicit types
- **React**: Functional components with hooks
- **Imports**: Use `@/` alias for `src/` imports
- **CSS**: Tailwind utility classes, custom theme tokens in `tailwind.config.ts`

### Adding LLM Providers

1. Create adapter in `src/server/providers/`
2. Implement the `LLMProvider` interface from `@/types/provider`
3. Register in the provider registry
4. Add configuration to `.env.example`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add voice synthesis support
fix: correct pathfinding grid alignment
docs: update README with architecture diagram
refactor: extract MessageBus from FloorRoom
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Phaser 3](https://phaser.io/) - Game framework
- [Colyseus](https://colyseus.io/) - Multiplayer framework
- [EasyStar.js](https://github.com/prettymuchbryce/easystarjs) - Pathfinding
- [Anthropic](https://anthropic.com/), [OpenAI](https://openai.com/), [Google](https://ai.google.dev/) - LLM providers

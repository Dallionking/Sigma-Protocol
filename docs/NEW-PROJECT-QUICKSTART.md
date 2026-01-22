# New Project Quickstart Guide

A step-by-step guide to creating a new project with Sigma Protocol.

## Overview

This guide walks you through:
1. Environment setup validation
2. Project initialization with boilerplate selection
3. PRD creation from your idea
4. Task generation and breakdown
5. Running your first Ralph loop
6. Setting up orchestration (optional)

## Step 0: Environment Setup

### Prerequisites Check

Run the health check to verify your environment:

```bash
sigma doctor
```

You should see:
- ✓ Node.js 20+
- ✓ Git installed
- ✓ (Optional) tmux for orchestration

### Install Sigma Protocol

```bash
npm install -g sigma-protocol
```

Verify installation:

```bash
sigma --version
```

## Step 1: Create Your Project

### Option A: Interactive Wizard (Recommended)

```bash
sigma new
```

The wizard guides you through:

1. **Project Name** - Choose a name (lowercase, hyphens OK)
2. **Location** - Where to create the project
3. **Boilerplate** - Select a starting template:
   - `nextjs-saas` - Full-stack SaaS with Supabase, Stripe, Auth
   - `nextjs-ai` - AI-first app with Convex and real-time
   - `nextjs-portable` - Flexible stack with Drizzle and Better Auth
   - `expo-mobile` - React Native with Supabase and RevenueCat
   - `tanstack-saas` - Modern SaaS with TanStack Start
   - `custom` - Start from scratch
4. **Platforms** - Which AI tools you'll use (Cursor, Claude Code, OpenCode)
5. **Product Idea** - Brief description (optional, can define in Step 1)

### Option B: Manual Setup

```bash
# Create project directory
mkdir my-project && cd my-project

# Initialize package.json
npm init -y

# Install Sigma Protocol commands
npx sigma-protocol install
```

## Step 2: Open in Your AI IDE

```bash
cd my-project
cursor .  # or: code . / opencode .
```

Your project now has:
```
my-project/
├── .sigma/
│   ├── context/      # Project context tracking
│   └── rules/        # Custom rules
├── .cursor/          # Cursor commands (if selected)
│   └── commands/
├── .claude/          # Claude Code commands (if selected)
│   └── commands/
├── docs/
│   ├── specs/        # Step outputs (MASTER_PRD, etc.)
│   └── prds/         # Feature PRDs
├── scripts/
│   └── ralph/        # Ralph loop scripts
└── .sigma-manifest.json
```

## Step 3: Run Ideation (Step 1)

In your AI assistant, start the ideation process:

```
@step-1-ideation Create a [your product idea here]
```

**Example:**
```
@step-1-ideation Create a personal finance tracker that uses AI to 
categorize transactions and predict upcoming expenses
```

### What Happens

1. **Clarifying Questions** - AI asks about your target users, key features, monetization
2. **Value Analysis** - Uses Hormozi Value Equation to prioritize features
3. **HITL Checkpoints** - Pauses for your approval at key decisions
4. **Output** - Generates `docs/specs/MASTER_PRD.md`

### MASTER_PRD.md Contents

- Product vision and mission
- Target audience personas
- Core features with priority rankings
- Success metrics
- Technical constraints
- Monetization strategy (if applicable)

## Step 4: Continue Through Steps

Each step builds on the previous outputs:

```bash
# Architecture design (uses MASTER_PRD.md)
@step-2-architecture

# UX design (uses ARCHITECTURE.md)
@step-3-ux-design

# Navigation flows (uses UX-DESIGN.md)
@step-4-flow-tree

# Wireframes (uses FLOW-TREE.md)
@step-5-wireframe-prototypes
```

### Skip Steps If Needed

Not every project needs all 13 steps:

| Project Type | Recommended Steps |
|--------------|-------------------|
| Quick prototype | 1, 10, 11 |
| Backend API | 1, 2, 8, 10, 11 |
| Full product | All 13 |
| Adding features | 10, 11 |

### Check Progress

```
@continue
```

This finds your next unfinished task based on step completion.

## Step 5: Generate PRDs (Step 11)

Once you've completed planning, generate implementation PRDs:

```
@step-10-feature-breakdown
@step-11-prd-generation
```

This creates detailed PRDs in `docs/prds/`:
```
docs/prds/
├── prd-001-user-auth.md
├── prd-002-dashboard.md
├── prd-003-settings.md
└── ...
```

## Step 6: Convert to Ralph Backlog

Convert PRDs to a machine-readable backlog:

```
@step-11a-prd-to-json
```

Output: `docs/ralph/implementation/prd.json`

This JSON file contains:
- All PRDs with stories
- Dependencies between features
- Priority ordering
- Acceptance criteria

## Step 7: Run Ralph Loop

The Ralph loop implements PRDs autonomously:

```bash
# In terminal
./scripts/ralph/sigma-ralph.sh . docs/ralph/implementation/prd.json claude-code
```

### What Ralph Does

1. Reads the next story from prd.json
2. Spawns a fresh AI session
3. Implements the story
4. Runs verification
5. Marks complete and moves to next

### Monitor Progress

```bash
# Check Ralph status
cat docs/ralph/implementation/prd.json | jq '.stories[] | select(.status == "done")'
```

## Step 8: Set Up Orchestration (Optional)

For larger projects, run multiple AI agents in parallel:

### Generate Stream Configuration

```
@step-11b-prd-swarm --orchestrate
```

This creates `.sigma/orchestration/streams.json` with PRD assignments.

### Start Orchestration

```bash
sigma orchestrate --streams=4
```

Creates:
- 1 orchestrator pane (manages workflow)
- 4 stream worker panes (implement PRDs)
- Git worktrees for each stream

### Monitor and Approve

```bash
# Check status
sigma orchestrate --status

# Attach to session
sigma orchestrate --attach

# Approve completed stream
sigma approve --stream=A
```

### Voice Notifications (Optional)

Set up ElevenLabs for spoken alerts:

```bash
# In .env
ELEVENLABS_API_KEY=your_api_key
ELEVENLABS_VOICE_ID=your_voice_id
```

## Troubleshooting

### "Command not found"

```bash
# Reinstall Sigma commands
sigma install

# Or for specific platform
npx sigma-protocol install --platform cursor
```

### "Step X failed verification"

```bash
# Check what's missing
@gap-analysis

# Re-run the step with more context
@step-X-name --verbose
```

### "Ralph loop stuck"

```bash
# Check the current story status
cat docs/ralph/implementation/prd.json | jq '.current_story'

# Reset if needed
# Edit prd.json to mark story as "pending"
```

### "Orchestration won't start"

```bash
# Check tmux is installed
tmux -V

# Kill any existing sessions
sigma orchestrate --kill

# Try again
sigma orchestrate --streams=4
```

## Next Steps

- **[RETROFIT-GUIDE.md](RETROFIT-GUIDE.md)** - Add Sigma to existing projects
- **[ORCHESTRATION.md](ORCHESTRATION.md)** - Deep dive into multi-agent setup
- **[COMMANDS.md](COMMANDS.md)** - Full command reference

## Quick Reference

### Essential Commands

```bash
# CLI
sigma new                    # Create project
sigma doctor                 # Health check
sigma orchestrate            # Multi-agent

# AI Commands
@step-1-ideation            # Start ideation
@continue             # Find next task
@gap-analysis               # Verify implementation
```

### File Locations

| File | Purpose |
|------|---------|
| `docs/specs/MASTER_PRD.md` | Product vision |
| `docs/specs/ARCHITECTURE.md` | System design |
| `docs/prds/*.md` | Feature PRDs |
| `docs/ralph/implementation/prd.json` | Ralph backlog |
| `.sigma/orchestration/streams.json` | Stream config |

---

Ready to build? Run `sigma new` and follow the wizard! 🚀


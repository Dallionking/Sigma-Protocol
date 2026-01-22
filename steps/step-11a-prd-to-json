---
version: "1.2.0"
last_updated: "2026-01-21"
changelog:
  - "1.2.0: Renamed from step-11.25 to step-11a for correct sort order"
  - "1.1.0: Added Taskmaster MCP integration for AI-powered PRD parsing"
  - "1.0.0: Initial release — Ralph-mode PRD→JSON backlog converter for implementation PRDs"
description: "Step 11a: Convert Step 11 implementation PRDs into Ralph-compatible JSON backlog format for autonomous implementation loops"
allowed-tools:
  # PRIMARY MCP Tools (Use First)
  - mcp_Ref_ref_search_documentation
  - mcp_exa_get_code_context_exa
  - mcp_sequential-thinking_sequentialthinking
  
  # TASKMASTER MCP Tools (For AI-Powered Parsing)
  - mcp_taskmaster_parse_prd
  - mcp_taskmaster_get_tasks
  - mcp_taskmaster_add_task
  - mcp_taskmaster_expand_task
  - mcp_taskmaster_set_task_status
  - mcp_taskmaster_analyze_project_complexity
  - mcp_taskmaster_next_task
  
  # OTHER TOOLS
  - read_file
  - write
  - list_dir
  - glob_file_search
  - grep
  - run_terminal_cmd
  - todo_write
parameters:
  - --dry-run
  - --scope
  - --stream-aware
  - --emit-confidence
  - --max-story-size
  - --verification-strict
  - --include-swarms
  - --use-taskmaster
  - --taskmaster-model
---

# /step-11a-prd-to-json — Convert Implementation PRDs to Ralph Backlog

**Mission**  
Convert Step 11 implementation PRDs (located in `docs/prds/` or `docs/prds/swarm-*/`) into a machine-readable JSON backlog (`docs/ralph/implementation/prd.json`) that enables Ralph-style autonomous implementation loops.

**Why This Step Exists:**  
Step 11 produces comprehensive, implementation-ready PRDs (600-1000 lines each). These are excellent for human developers but need conversion to the Ralph format for:
- **Autonomous agent execution** — Each story is scoped for one context window
- **Full-stack verification** — Backend, frontend, and security criteria are machine-checkable
- **Stream/swarm integration** — Stories can be organized by Step 11b swarm assignments
- **Deterministic progress tracking** — `passes: true/false` state prevents "claimed done" failures

**This step ensures you can run the Ralph bash loop on your full implementation PRDs.**

---

## 🔍 When to Use This Step

### Automatically Suggested After Step 11 (or 11b) When:
- ✅ `docs/prds/F*.md` files exist
- ✅ User wants autonomous multi-PRD implementation
- ✅ Complex backend + frontend PRDs need orchestration

### Skip This Step If:
- ❌ Implementing PRDs manually one-by-one
- ❌ PRDs are still being revised
- ❌ Project has < 3 PRDs (Ralph overhead not worth it)

---

## 📋 Command Usage

```bash
# Run as step (after Step 11 or 11b)
@step-11a-prd-to-json

# Include swarm assignments from Step 11b
@step-11a-prd-to-json --include-swarms=true

# Scope to specific feature
@step-11a-prd-to-json --scope=F01

# Dry run preview
@step-11a-prd-to-json --dry-run=true

# Stream-aware grouping (uses swarm folders)
@step-11a-prd-to-json --stream-aware=true
```

### Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `--dry-run` | boolean | `false` | Preview JSON output without writing files |
| `--scope` | string | `*` | Limit to specific PRD (e.g., `F01`) |
| `--stream-aware` | boolean | `true` | Organize stories by swarm/stream from Step 11b |
| `--emit-confidence` | boolean | `true` | Emit Epistemic Confidence artifact |
| `--max-story-size` | `small`, `medium`, `large` | `medium` | Max story complexity |
| `--verification-strict` | boolean | `true` | Require machine-verifiable criteria |
| `--include-swarms` | boolean | `true` | Read swarm assignments from Step 11b |
| `--use-taskmaster` | boolean | `false` | Use Taskmaster MCP for AI-powered parsing |
| `--taskmaster-model` | string | `claude-code/sonnet` | Model for Taskmaster (if using) |

---

## 🤖 Taskmaster MCP Integration (Recommended for Claude Code)

When `--use-taskmaster=true`, this step leverages the [Taskmaster MCP](https://github.com/eyaltoledano/claude-task-master) for AI-powered PRD parsing instead of manual regex extraction.

### Why Use Taskmaster?

| Manual Parsing | Taskmaster MCP |
|----------------|----------------|
| Regex-based extraction | AI-powered understanding |
| Fixed parsing rules | Intelligent decomposition |
| May miss context | Understands dependencies |
| Basic story splitting | Smart task breakdown |
| No research capability | Can research best practices |

### Taskmaster Workflow

```bash
# Use Taskmaster for AI-powered parsing
@step-11a-prd-to-json --use-taskmaster=true

# With specific model
@step-11a-prd-to-json --use-taskmaster=true --taskmaster-model=claude-code/opus

# Combine with swarms
@step-11a-prd-to-json --use-taskmaster=true --include-swarms=true
```

### Taskmaster Integration Flow

```
┌──────────────────────────────────────────────────────────────────┐
│              TASKMASTER MCP INTEGRATION FLOW                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Step 11 PRD (Markdown)                                          │
│       │                                                          │
│       ▼                                                          │
│  ┌────────────────────────────────────────────────┐              │
│  │     TASKMASTER MCP (mcp_taskmaster_parse_prd)  │              │
│  │  • AI understands PRD structure                 │              │
│  │  • Intelligent task decomposition               │              │
│  │  • Dependency detection                         │              │
│  │  • Acceptance criteria generation               │              │
│  │  • Complexity analysis                          │              │
│  └────────────────────────────────────────────────┘              │
│       │                                                          │
│       ▼                                                          │
│  .taskmaster/tasks/tasks.json (Taskmaster format)                │
│       │                                                          │
│       ▼                                                          │
│  ┌────────────────────────────────────────────────┐              │
│  │    SIGMA TRANSFORMER (built-in)                │              │
│  │  • Convert Taskmaster → Ralph format           │              │
│  │  • Add Sigma-specific acceptance criteria      │              │
│  │  • Map verification commands                   │              │
│  │  • Apply stream/swarm tags                     │              │
│  └────────────────────────────────────────────────┘              │
│       │                                                          │
│       ▼                                                          │
│  docs/ralph/implementation/prd.json (Ralph format)               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Taskmaster Phase (Alternative to Phase B)

When `--use-taskmaster=true`, Phase B is replaced with:

```
Phase B-TM: Taskmaster AI Parsing
  [ ] B1-TM: Initialize Taskmaster in project (if not exists)
  [ ] B2-TM: Parse PRD with mcp_taskmaster_parse_prd
  [ ] B3-TM: Analyze complexity with mcp_taskmaster_analyze_project_complexity
  [ ] B4-TM: Expand tasks with mcp_taskmaster_expand_task (for complex stories)
  [ ] B5-TM: Get tasks with mcp_taskmaster_get_tasks
  ⏸️  CHECKPOINT: Review Taskmaster output
```

### Taskmaster Parsing Implementation

```typescript
interface TaskmasterConfig {
  model: string;            // AI model to use
  projectRoot: string;      // Project directory
  prdPath: string;          // Path to PRD file
}

async function parseWithTaskmaster(
  prdPath: string,
  config: TaskmasterConfig
): Promise<TaskmasterTask[]> {
  // 1. Initialize Taskmaster (if needed)
  const taskmasterExists = await fileExists('.taskmaster/tasks/tasks.json');
  if (!taskmasterExists) {
    await mcp_taskmaster_initialize_project({
      projectRoot: config.projectRoot,
      skipInstall: true,
      yes: true,
    });
  }
  
  // 2. Parse PRD with Taskmaster AI
  console.log(`🤖 Parsing ${prdPath} with Taskmaster MCP...`);
  const parseResult = await mcp_taskmaster_parse_prd({
    input: prdPath,
    projectRoot: config.projectRoot,
  });
  
  // 3. Analyze complexity to determine if expansion needed
  const complexityResult = await mcp_taskmaster_analyze_project_complexity({
    projectRoot: config.projectRoot,
  });
  
  // 4. Expand complex tasks
  const tasks = await mcp_taskmaster_get_tasks({
    projectRoot: config.projectRoot,
    withSubtasks: true,
  });
  
  for (const task of tasks) {
    if (task.complexity === 'high' || task.subtasks?.length === 0) {
      await mcp_taskmaster_expand_task({
        id: task.id,
        projectRoot: config.projectRoot,
        force: false,
      });
    }
  }
  
  // 5. Return final task list
  return await mcp_taskmaster_get_tasks({
    projectRoot: config.projectRoot,
    withSubtasks: true,
  });
}
```

### Convert Taskmaster → Ralph Format

```typescript
interface TaskmasterTask {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'done' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  dependencies: number[];
  subtasks?: TaskmasterTask[];
  tags?: string[];
}

function convertTaskmasterToRalph(
  tasks: TaskmasterTask[],
  featureId: string,
  prdPath: string
): Step11Story[] {
  const stories: Step11Story[] = [];
  let priority = 1;
  
  for (const task of tasks) {
    // Determine layer from task title/tags
    const layer = inferLayerFromTask(task);
    
    // Generate story ID
    const storyId = `${featureId.toLowerCase()}-${task.id.toString().padStart(3, '0')}`;
    
    // Build acceptance criteria from subtasks
    const acceptanceCriteria: AcceptanceCriterion[] = [];
    
    // Add subtask-based criteria
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach((subtask, idx) => {
        acceptanceCriteria.push({
          id: `ac-${idx + 1}`,
          description: subtask.title,
          type: 'manual', // Taskmaster doesn't generate verifiable criteria
        });
      });
    }
    
    // Add Sigma verification criteria
    acceptanceCriteria.push({
      id: `ac-verify`,
      description: 'Gap analysis passes',
      type: 'command',
      command: '@gap-analysis',
      expectedScore: 85,
    });
    
    // Add layer-specific criteria
    if (layer === 'ui') {
      acceptanceCriteria.push({
        id: `ac-ui`,
        description: 'UI renders correctly',
        type: 'ui-validation',
        uiValidation: {
          mode: 'any',
          route: '/',
          checks: [{ type: 'no-errors' }],
        },
      });
    }
    
    const story: Step11Story = {
      id: storyId,
      title: `${featureId}: ${task.title}`,
      description: task.description,
      priority: priority++,
      passes: task.status === 'done',
      source: {
        prdPath,
        step: 'step-11',
        sectionId: `taskmaster-${task.id}`,
        taskmasterId: task.id,
      },
      acceptanceCriteria,
      tags: {
        featureId,
        layer,
        complexity: task.priority === 'high' ? 'complex' : 
                    task.priority === 'medium' ? 'medium' : 'simple',
        taskmaster: true,
      },
      dependsOn: task.dependencies.map(d => 
        `${featureId.toLowerCase()}-${d.toString().padStart(3, '0')}`
      ),
      estimatedIterations: task.subtasks?.length || 1,
    };
    
    stories.push(story);
  }
  
  return stories;
}

function inferLayerFromTask(task: TaskmasterTask): 'database' | 'api' | 'ui' | 'integration' {
  const title = task.title.toLowerCase();
  const tags = task.tags?.map(t => t.toLowerCase()) || [];
  
  if (title.includes('database') || title.includes('schema') || 
      title.includes('migration') || tags.includes('db')) {
    return 'database';
  }
  if (title.includes('api') || title.includes('action') || 
      title.includes('endpoint') || tags.includes('api')) {
    return 'api';
  }
  if (title.includes('ui') || title.includes('component') || 
      title.includes('page') || title.includes('form') || tags.includes('ui')) {
    return 'ui';
  }
  return 'integration';
}
```

### Prerequisites for Taskmaster Integration

**For Claude Code users:**
```bash
# Add Taskmaster MCP to Claude Code
claude mcp add taskmaster-ai -- npx -y task-master-ai

# Or add to .mcp.json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "your-key"
      }
    }
  }
}
```

**For Cursor users:**
Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY"
      }
    }
  }
}
```

---

## ⚡ Preflight (auto)

```typescript
// 1. Get date
const today = new Date().toISOString().split('T')[0];

// 2. Check for Step 11 PRD files
const topLevelPrds = await glob('docs/prds/F*.md');
const swarmPrds = await glob('docs/prds/swarm-*/F*.md');
const allPrds = [...topLevelPrds, ...swarmPrds];

if (allPrds.length === 0) {
  throw new Error('No Step 11 PRDs found. Run Step 11 first.');
}

// 3. Check for Step 11b swarm structure
const swarmPlan = await fileExists('docs/prds/SWARM-PLAN.md');
const prdStatus = await readFile('docs/prds/.prd-status.json').catch(() => '{}');

// 4. Check for existing Ralph backlog
const existingBacklog = await fileExists('docs/ralph/implementation/prd.json');

// 5. Check for UI Profile (Design System Enforcement - CRITICAL)
const uiProfilePath = 'docs/design/ui-profile.json';
const hasUIProfile = await fileExists(uiProfilePath);
let uiProfile = null;

if (hasUIProfile) {
  try {
    const profileContent = await readFile(uiProfilePath);
    uiProfile = JSON.parse(profileContent);
    console.log(`✅ UI Profile found: ${uiProfile.name} (${uiProfile.preset})`);
  } catch (e) {
    console.warn(`⚠️ UI Profile found but invalid JSON: ${e.message}`);
  }
} else {
  console.warn(`⚠️ No UI Profile found at ${uiProfilePath} - UI tasks will lack design constraints`);
  console.warn(`   Run Step 3 (UX Design) to create the UI Profile`);
}

// 6. Display context
console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 STEP 11a: IMPLEMENTATION PRD → RALPH BACKLOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: ${today}
PRDs Found: ${allPrds.length}
Swarm Structure: ${swarmPlan ? 'Found (will use stream assignments)' : 'Not found'}
Existing Backlog: ${existingBacklog ? 'Will overwrite' : 'Will create'}
UI Profile: ${hasUIProfile ? `✅ ${uiProfile?.name || 'Loaded'}` : '❌ Not found (design enforcement disabled)'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
```

---

## 📋 Task Execution Flow

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 STEP 11a: IMPLEMENTATION PRD → RALPH WORKFLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase A: Context Loading
  [ ] A1: Scan docs/prds/ for F*.md files
  [ ] A2: Load Step 11b swarm assignments
  [ ] A3: Load .prd-status.json
  [ ] A4: Check for Taskmaster MCP availability
  ⏸️  CHECKPOINT: Confirm PRD inventory

┌─────────────────────────────────────────────────────────────────┐
│  Choose Parsing Mode:                                           │
│  [1] --use-taskmaster=true  → Phase B-TM (AI-powered, Claude)   │
│  [2] --use-taskmaster=false → Phase B    (Manual regex parsing) │
└─────────────────────────────────────────────────────────────────┘

Phase B-TM: Taskmaster AI Parsing (if --use-taskmaster=true) ⭐ RECOMMENDED
  [ ] B1-TM: Check Taskmaster MCP tools available
  [ ] B2-TM: Parse PRD with mcp_taskmaster_parse_prd
  [ ] B3-TM: Analyze complexity with mcp_taskmaster_analyze_project_complexity
  [ ] B4-TM: Expand tasks with mcp_taskmaster_expand_task (if complex)
  [ ] B5-TM: Get tasks with mcp_taskmaster_get_tasks
  [ ] B6-TM: Convert Taskmaster format → Sigma/Ralph format
  ⏸️  CHECKPOINT: Review Taskmaster output

─── OR ───

Phase B: Manual PRD Parsing (if --use-taskmaster=false)
  [ ] B1: Parse Section 0 (Shape Up metadata)
  [ ] B2: Parse Section 0.5 (Full Stack Overview)
  [ ] B3: Parse Section 4 (User Stories / BDD)
  [ ] B4: Parse Section 6 (Database Schema)
  [ ] B5: Parse Section 7 (Server Actions)
  [ ] B6: Parse Section 8 (UI Components)
  [ ] B7: Parse Section 15 (Agentic Implementation Guide)
  ⏸️  CHECKPOINT: Review parsed structure

Phase C: Story Generation
  [ ] C1: Generate database stories (from Section 6 / Taskmaster)
  [ ] C2: Generate server action stories (from Section 7 / Taskmaster)
  [ ] C3: Generate UI component stories (from Section 8 / Taskmaster)
  [ ] C4: Generate integration stories (from Section 4 / Taskmaster)
  [ ] C5: Apply story-splitting rules
  [ ] C6: Map verification commands to criteria
  [ ] C7: Add Sigma-specific acceptance criteria (gap-analysis, ui-healer)
  ⏸️  CHECKPOINT: Review generated stories

Phase D: Backlog Assembly
  [ ] D1: Validate all stories have verifiable criteria
  [ ] D2: Assign stream/swarm tags (if Step 11b ran)
  [ ] D3: Build prd.json with Sigma-Ralph schema
  [ ] D4: Generate prd-map.json
  [ ] D5: Initialize progress.txt
  [ ] D6: Sync with Taskmaster (if used) for status tracking
  ⏸️  CHECKPOINT: Verify backlog structure

Phase E: Output & Validation
  [ ] E1: Write docs/ralph/implementation/prd.json
  [ ] E2: Write docs/ralph/implementation/prd-map.json
  [ ] E3: Write docs/ralph/implementation/progress.txt
  [ ] E4: Emit Epistemic Confidence artifact
  ⏸️  FINAL: Ready for Ralph loop

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔄 Phase B: PRD Parsing

### B1: Parse Section 0 (Shape Up Metadata)

```typescript
interface Section0Metadata {
  featureId: string;      // F01, F02, etc.
  appetite: string;       // Small Batch 1-2wk / Big Batch 4-6wk
  priority: string;       // P0, P1, P2, P3
  phase: number;          // 0, 1, 2, 3
  dependencies: string[]; // [F00, F03]
  outcomeLink: string;    // Linked outcome
}

function parseSection0(content: string): Section0Metadata {
  // Extract from Section 0 table
  const featureMatch = content.match(/\|\s*\*\*Shaped Project ID\*\*\s*\|\s*(F\d+)/i);
  const appetiteMatch = content.match(/\|\s*\*\*Appetite\*\*\s*\|\s*\[([^\]]+)\]/i);
  const priorityMatch = content.match(/\|\s*\*\*Priority\*\*\s*\|\s*(P[0-3])/i);
  const phaseMatch = content.match(/\|\s*\*\*Phase\*\*\s*\|\s*(\d)/i);
  const depsMatch = content.match(/\|\s*\*\*Dependencies\*\*\s*\|\s*\[([^\]]*)\]/i);
  const outcomeMatch = content.match(/\|\s*\*\*Outcome Link\*\*\s*\|\s*\[([^\]]+)\]/i);
  
  return {
    featureId: featureMatch?.[1] || 'F00',
    appetite: appetiteMatch?.[1]?.trim() || 'Unknown',
    priority: priorityMatch?.[1] || 'P2',
    phase: parseInt(phaseMatch?.[1] || '1', 10),
    dependencies: depsMatch?.[1]?.split(',').map(d => d.trim()).filter(Boolean) || [],
    outcomeLink: outcomeMatch?.[1]?.trim() || '',
  };
}
```

### B2: Parse Section 0.5 (Full Stack Overview)

```typescript
interface Section05Overview {
  databaseTables: string[];
  serverActions: string[];
  uiPages: string[];
  uiComponents: string[];
  securityRequirements: string[];
  envVars: string[];
}

function parseSection05(content: string): Section05Overview {
  // Extract scope matrix
  const tablesMatch = content.match(/Database Tables\s*\|\s*\[?\d+\]?\s*\|\s*\[?([^\]|\n]+)/i);
  const actionsMatch = content.match(/Server Actions.*?\|\s*\[?\d+\]?\s*\|\s*\[?([^\]|\n]+)/i);
  const pagesMatch = content.match(/UI Pages\s*\|\s*\[?\d+\]?\s*\|\s*\[?([^\]|\n]+)/i);
  const componentsMatch = content.match(/UI Components\s*\|\s*\[?\d+\]?\s*\|\s*\[?([^\]|\n]+)/i);
  
  // Extract security requirements
  const authMatch = content.match(/Auth required\s*\|\s*([^\|]+)/i);
  const rlsMatch = content.match(/RLS policies needed\s*\|\s*([^\|]+)/i);
  
  // Extract env vars
  const envSection = content.match(/### Environment Variables\s*\n((?:\|[^\n]+\n)+)/i);
  const envVars = envSection
    ? envSection[1].match(/\|\s*([A-Z_]+)\s*\|/gi)?.map(m => m.replace(/[\|\s]/g, '')) || []
    : [];
  
  return {
    databaseTables: parseList(tablesMatch?.[1]),
    serverActions: parseList(actionsMatch?.[1]),
    uiPages: parseList(pagesMatch?.[1]),
    uiComponents: parseList(componentsMatch?.[1]),
    securityRequirements: [
      authMatch?.[1]?.trim(),
      rlsMatch?.[1]?.trim(),
    ].filter(Boolean) as string[],
    envVars,
  };
}

function parseList(str?: string): string[] {
  if (!str) return [];
  return str.split(/[,;]/).map(s => s.trim()).filter(Boolean);
}
```

### B3: Parse Section 4 (BDD User Stories)

```typescript
interface BDDScenario {
  feature: string;
  scenario: string;
  given: string[];
  when: string;
  then: string[];
  type: 'happy-path' | 'edge-case' | 'error-handling' | 'validation';
}

function parseSection4(content: string): BDDScenario[] {
  const scenarios: BDDScenario[] = [];
  
  // Find all Scenario blocks
  const scenarioPattern = /Scenario:\s*(.+?)\n([\s\S]*?)(?=Scenario:|$)/gi;
  
  let match;
  while ((match = scenarioPattern.exec(content)) !== null) {
    const scenarioName = match[1].trim();
    const scenarioBody = match[2];
    
    // Extract Given clauses
    const givenMatches = scenarioBody.match(/Given\s+(.+?)(?=\n\s*(?:And|When|Then|$))/gi) || [];
    const andGivenMatches = scenarioBody.match(/And\s+(.+?)(?=\n\s*(?:And|When|Then|$))/gi) || [];
    
    // Extract When clause
    const whenMatch = scenarioBody.match(/When\s+(.+?)(?=\n\s*Then)/i);
    
    // Extract Then clauses
    const thenMatches = scenarioBody.match(/Then\s+(.+?)(?=\n|$)/gi) || [];
    
    // Determine type from scenario name or tags
    let type: BDDScenario['type'] = 'happy-path';
    if (/@error|@fail/i.test(scenarioBody) || /error|fail/i.test(scenarioName)) {
      type = 'error-handling';
    } else if (/@edge/i.test(scenarioBody) || /edge|boundary/i.test(scenarioName)) {
      type = 'edge-case';
    } else if (/@valid/i.test(scenarioBody)) {
      type = 'validation';
    }
    
    scenarios.push({
      feature: '', // Filled in from context
      scenario: scenarioName,
      given: [...givenMatches, ...andGivenMatches].map(g => g.replace(/^(Given|And)\s+/i, '')),
      when: whenMatch?.[1]?.trim() || '',
      then: thenMatches.map(t => t.replace(/^Then\s+/i, '')),
      type,
    });
  }
  
  return scenarios;
}
```

### B6-B7: Parse Sections 6, 7, 15 (Implementation Details)

```typescript
interface ImplementationDetails {
  databaseSchema: {
    tables: { name: string; columns: string[] }[];
    rlsPolicies: string[];
    indexes: string[];
  };
  serverActions: {
    name: string;
    type: 'query' | 'mutation';
    path: string;
    zodSchema?: string;
  }[];
  uiComponents: {
    name: string;
    path: string;
    props?: string;
  }[];
  fileManifest: {
    path: string;
    action: 'CREATE' | 'UPDATE';
    layer: string;
    description: string;
  }[];
  implementationOrder: string[];
}

function parseImplementationDetails(content: string): ImplementationDetails {
  // Parse Section 6: Database
  const tablesPattern = /export const (\w+) = pgTable/g;
  const tables: { name: string; columns: string[] }[] = [];
  let tableMatch;
  while ((tableMatch = tablesPattern.exec(content)) !== null) {
    tables.push({ name: tableMatch[1], columns: [] });
  }
  
  // Parse RLS policies
  const rlsPattern = /CREATE POLICY\s+"([^"]+)"/gi;
  const rlsPolicies: string[] = [];
  let rlsMatch;
  while ((rlsMatch = rlsPattern.exec(content)) !== null) {
    rlsPolicies.push(rlsMatch[1]);
  }
  
  // Parse Section 7: Server Actions
  const actionPattern = /#### `(\w+)`\n\n```typescript\n\/\/ (actions\/[^\n]+)/g;
  const serverActions: ImplementationDetails['serverActions'] = [];
  let actionMatch;
  while ((actionMatch = actionPattern.exec(content)) !== null) {
    serverActions.push({
      name: actionMatch[1],
      type: actionMatch[1].startsWith('get') ? 'query' : 'mutation',
      path: actionMatch[2],
    });
  }
  
  // Parse Section 15: File Manifest
  const manifestPattern = /\|\s*`([^`]+)`\s*\|\s*(CREATE|UPDATE)\s*\|\s*(\w+)\s*\|\s*([^|]+)\|/gi;
  const fileManifest: ImplementationDetails['fileManifest'] = [];
  let manifestMatch;
  while ((manifestMatch = manifestPattern.exec(content)) !== null) {
    fileManifest.push({
      path: manifestMatch[1],
      action: manifestMatch[2] as 'CREATE' | 'UPDATE',
      layer: manifestMatch[3],
      description: manifestMatch[4].trim(),
    });
  }
  
  // Parse Implementation Order
  const orderPattern = /### Implementation Order\s*\n((?:\d+\.\s*.+\n?)+)/i;
  const orderMatch = content.match(orderPattern);
  const implementationOrder = orderMatch
    ? orderMatch[1].split('\n')
        .filter(line => /^\d+\./.test(line))
        .map(line => line.replace(/^\d+\.\s*\*\*/, '').replace(/\*\*.*/, '').trim())
    : [];
  
  return {
    databaseSchema: {
      tables,
      rlsPolicies,
      indexes: [],
    },
    serverActions,
    uiComponents: [],
    fileManifest,
    implementationOrder,
  };
}
```

---

## 🔄 Phase C: Story Generation

### C1-C4: Generate Stories by Layer

```typescript
interface Step11Story {
  id: string;
  title: string;
  description: string;
  priority: number;
  passes: boolean;
  source: {
    prdPath: string;
    step: 'step-11';
    sectionId: string;
  };
  acceptanceCriteria: AcceptanceCriterion[];
  tags: {
    featureId: string;
    layer: 'database' | 'api' | 'ui' | 'integration';
    streamId?: string;
    complexity: 'simple' | 'medium' | 'complex';
  };
  dependsOn: string[];
  estimatedIterations: number;
}

function generateLayeredStories(
  prd: ParsedStep11PRD,
  maxStorySize: 'small' | 'medium' | 'large'
): Step11Story[] {
  const stories: Step11Story[] = [];
  const featureId = prd.section0.featureId;
  let priority = 1;
  
  // Layer 1: Database stories (must complete first)
  if (prd.implementation.databaseSchema.tables.length > 0) {
    const dbStory: Step11Story = {
      id: `${featureId.toLowerCase()}-db`,
      title: `${featureId}: Database Schema`,
      description: `Create database tables and RLS policies for ${prd.title}`,
      priority: priority++,
      passes: false,
      source: {
        prdPath: prd.path,
        step: 'step-11',
        sectionId: 'section-6',
      },
      acceptanceCriteria: [
        {
          id: 'ac-1',
          description: 'Database migration file created',
          type: 'file-exists',
          filePattern: 'db/migrations/*_' + featureId.toLowerCase() + '.sql',
        },
        {
          id: 'ac-2',
          description: 'Drizzle schema file created',
          type: 'file-exists',
          filePath: `db/schema/${featureId.toLowerCase()}.ts`,
        },
        {
          id: 'ac-3',
          description: 'RLS policies defined',
          type: 'file-contains',
          filePath: `db/migrations/*_${featureId.toLowerCase()}.sql`,
          contains: 'CREATE POLICY',
        },
        {
          id: 'ac-4',
          description: 'Gap analysis passes',
          type: 'command',
          command: '@gap-analysis',
          expectedScore: 85,
        },
      ],
      tags: {
        featureId,
        layer: 'database',
        complexity: prd.implementation.databaseSchema.tables.length > 3 ? 'complex' : 'medium',
      },
      dependsOn: prd.section0.dependencies.map(d => `${d.toLowerCase()}-db`),
      estimatedIterations: 1,
    };
    stories.push(dbStory);
  }
  
  // Layer 2: Server Action stories
  for (const action of prd.implementation.serverActions) {
    const actionStory: Step11Story = {
      id: `${featureId.toLowerCase()}-${action.name.toLowerCase()}`,
      title: `${featureId}: ${action.name} Action`,
      description: `Implement ${action.type} action: ${action.name}`,
      priority: priority++,
      passes: false,
      source: {
        prdPath: prd.path,
        step: 'step-11',
        sectionId: 'section-7',
      },
      acceptanceCriteria: [
        {
          id: 'ac-1',
          description: `Server action file created: ${action.path}`,
          type: 'file-exists',
          filePath: action.path,
        },
        {
          id: 'ac-2',
          description: 'Zod validation schema defined',
          type: 'file-contains',
          filePath: action.path,
          contains: 'z.object',
        },
        {
          id: 'ac-3',
          description: 'Auth check implemented',
          type: 'file-contains',
          filePath: action.path,
          contains: 'auth()',
        },
        {
          id: 'ac-4',
          description: 'Result type is explicit',
          type: 'file-contains',
          filePath: action.path,
          contains: 'success:',
        },
        {
          id: 'ac-5',
          description: 'Gap analysis passes',
          type: 'command',
          command: '@gap-analysis',
          expectedScore: 85,
        },
      ],
      tags: {
        featureId,
        layer: 'api',
        complexity: 'medium',
      },
      dependsOn: [`${featureId.toLowerCase()}-db`],
      estimatedIterations: 1,
    };
    stories.push(actionStory);
  }
  
  // Layer 3: UI Component stories
  const uiStory: Step11Story = {
    id: `${featureId.toLowerCase()}-ui`,
    title: `${featureId}: UI Components`,
    description: `Implement UI components for ${prd.title}`,
    priority: priority++,
    passes: false,
    source: {
      prdPath: prd.path,
      step: 'step-11',
      sectionId: 'section-8',
    },
    acceptanceCriteria: [
      // Add file-exists for each component from manifest
      ...prd.implementation.fileManifest
        .filter(f => f.layer === 'UI')
        .map((f, i) => ({
          id: `ac-${i + 1}`,
          description: `UI file created: ${f.path}`,
          type: 'file-exists' as const,
          filePath: f.path,
        })),
      {
        id: `ac-${prd.implementation.fileManifest.filter(f => f.layer === 'UI').length + 1}`,
        description: 'UI renders without errors',
        type: 'ui-validation',
        uiValidation: {
          mode: 'any',
          route: prd.section05.uiPages[0] || '/',
          checks: [{ type: 'content-exists' }],
        },
      },
      {
        id: `ac-${prd.implementation.fileManifest.filter(f => f.layer === 'UI').length + 2}`,
        description: 'UI Healer passes',
        type: 'command',
        command: '@ui-healer',
        expectedScore: 80,
      },
    ],
    tags: {
      featureId,
      layer: 'ui',
      complexity: prd.section05.uiComponents.length > 5 ? 'complex' : 'medium',
    },
    dependsOn: prd.implementation.serverActions.map(a => 
      `${featureId.toLowerCase()}-${a.name.toLowerCase()}`
    ),
    estimatedIterations: 2,
  };
  stories.push(uiStory);
  
  // Layer 4: Integration story (all BDD scenarios)
  const integrationStory: Step11Story = {
    id: `${featureId.toLowerCase()}-integration`,
    title: `${featureId}: Integration Testing`,
    description: `Verify all BDD scenarios pass for ${prd.title}`,
    priority: priority++,
    passes: false,
    source: {
      prdPath: prd.path,
      step: 'step-11',
      sectionId: 'section-4',
    },
    acceptanceCriteria: [
      {
        id: 'ac-1',
        description: 'All happy-path scenarios pass',
        type: 'command',
        command: '@verify-prd',
        expectedScore: 90,
      },
      {
        id: 'ac-2',
        description: 'Error handling scenarios pass',
        type: 'command',
        command: '@verify-prd --scope=error-handling',
        expectedScore: 85,
      },
      {
        id: 'ac-3',
        description: 'Gap analysis achieves 95%+',
        type: 'command',
        command: '@gap-analysis',
        expectedScore: 95,
      },
    ],
    tags: {
      featureId,
      layer: 'integration',
      complexity: 'complex',
    },
    dependsOn: [`${featureId.toLowerCase()}-ui`],
    estimatedIterations: 1,
  };
  stories.push(integrationStory);
  
  return stories;
}
```

---

## 🔄 Phase C.5: Design System Injection (CRITICAL)

**This phase ensures UI tasks carry design constraints from the UI Profile.**

### Why This Matters

Without design system injection:
- UI tasks may produce inconsistent visuals
- Ralph loop cannot enforce design compliance
- Gap analysis cannot verify design adherence

### C.5.1: Load UI Profile

```typescript
interface UIProfileSummary {
  uiProfileRef: string;
  profileId: string;
  preset: string;
  allowedTokens: string[];
  bannedPatterns: string[];
  themeMode: string;
  dials: {
    radius: string;
    density: string;
    motionIntensity: string;
  };
  rules: {
    maxAccentColorsPerScreen: number;
    maxGradientsPerCard: number;
    minSpringDamping: number;
  };
}

async function loadUIProfileSummary(workspacePath: string): Promise<UIProfileSummary | null> {
  const profilePath = path.join(workspacePath, 'docs/design/ui-profile.json');

  if (!await fileExists(profilePath)) {
    console.warn('⚠️ No UI Profile found - UI tasks will not have design constraints');
    return null;
  }

  try {
    const content = await readFile(profilePath);
    const profile = JSON.parse(content);

    // Extract commonly-used tokens
    const allowedTokens: string[] = [];
    if (profile.tokens) {
      // Surface tokens
      if (profile.tokens.surfaces) {
        allowedTokens.push('--surface-base', '--surface-raised', '--surface-elevated');
      }
      // Text tokens
      if (profile.tokens.text) {
        allowedTokens.push('--text-primary', '--text-secondary', '--text-muted');
      }
      // Border tokens
      if (profile.tokens.borders) {
        allowedTokens.push('--border-subtle', '--border-hover', '--border-focus');
      }
      // Radii tokens
      if (profile.tokens.radii) {
        allowedTokens.push('--radius-sm', '--radius-md', '--radius-lg', '--radius-xl');
      }
      // Shadow tokens
      if (profile.tokens.shadows) {
        allowedTokens.push('--shadow-sm', '--shadow-md', '--shadow-lg');
      }
    }

    return {
      uiProfileRef: 'docs/design/ui-profile.json',
      profileId: profile.id || 'unknown',
      preset: profile.preset || 'custom',
      allowedTokens,
      bannedPatterns: profile.bannedPatterns || profile.banned_patterns || [],
      themeMode: 'system', // Default to system
      dials: {
        radius: profile.dials?.radius || 'soft',
        density: profile.dials?.density || 'comfortable',
        motionIntensity: profile.dials?.motionIntensity || 'moderate',
      },
      rules: {
        maxAccentColorsPerScreen: profile.rules?.maxAccentColorsPerScreen || 2,
        maxGradientsPerCard: profile.rules?.maxGradientsPerCard || 1,
        minSpringDamping: profile.rules?.minSpringDamping || 15,
      },
    };
  } catch (e) {
    console.error(`Failed to parse UI Profile: ${e.message}`);
    return null;
  }
}
```

### C.5.2: Inject Design Constraints into UI Tasks

```typescript
function injectDesignSystem(
  stories: Step11Story[],
  uiProfileSummary: UIProfileSummary | null
): Step11Story[] {
  if (!uiProfileSummary) {
    console.warn('⚠️ Skipping design system injection - no UI Profile loaded');
    return stories;
  }

  let injectedCount = 0;

  for (const story of stories) {
    // Check if this story has UI tasks
    if (story.tasks) {
      for (const task of story.tasks) {
        // Inject design constraints for UI tasks
        if (task.id.startsWith('UI-')) {
          task.designSystem = {
            uiProfileRef: uiProfileSummary.uiProfileRef,
            profileId: uiProfileSummary.profileId,
            preset: uiProfileSummary.preset,
            allowedTokens: uiProfileSummary.allowedTokens,
            bannedPatterns: uiProfileSummary.bannedPatterns,
            themeMode: uiProfileSummary.themeMode,
            dials: uiProfileSummary.dials,
            rules: uiProfileSummary.rules,
          };
          injectedCount++;
        }
      }
    }

    // Also inject into story-level tags for quick reference
    if (story.tags?.layer === 'ui') {
      story.designSystemRef = uiProfileSummary.uiProfileRef;
    }
  }

  console.log(`✅ Design system constraints injected into ${injectedCount} UI tasks`);
  return stories;
}
```

### C.5.3: Validation Gate

```typescript
function validateDesignInjection(
  stories: Step11Story[],
  hasUIProfile: boolean
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Count UI tasks
  let uiTaskCount = 0;
  let uiTasksWithDesign = 0;

  for (const story of stories) {
    if (story.tasks) {
      for (const task of story.tasks) {
        if (task.id.startsWith('UI-')) {
          uiTaskCount++;
          if (task.designSystem) {
            uiTasksWithDesign++;
          }
        }
      }
    }
  }

  // Warn if UI tasks exist but no design system
  if (uiTaskCount > 0 && !hasUIProfile) {
    warnings.push(`⚠️ ${uiTaskCount} UI tasks found but no UI Profile - design enforcement disabled`);
  }

  // Warn if some UI tasks missing design system
  if (uiTaskCount > 0 && uiTasksWithDesign < uiTaskCount) {
    warnings.push(`⚠️ Only ${uiTasksWithDesign}/${uiTaskCount} UI tasks have design constraints`);
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}
```

---

## 🔄 Phase D: Backlog Assembly

### D2: Assign Stream/Swarm Tags

```typescript
async function assignStreamTags(
  stories: Step11Story[],
  includeSwarms: boolean
): Promise<void> {
  if (!includeSwarms) return;
  
  try {
    const statusContent = await readFile('docs/prds/.prd-status.json');
    const status = JSON.parse(statusContent);
    
    // Map feature IDs to swarm IDs
    for (const story of stories) {
      const featureStatus = status.features?.[story.tags.featureId];
      if (featureStatus?.swarm) {
        story.tags.streamId = `swarm-${featureStatus.swarm}`;
      }
    }
    
    console.log('✅ Stream/swarm tags assigned from Step 11b');
  } catch {
    console.log('⚠️ No swarm assignments found, proceeding without stream tags');
  }
}
```

### D3: Build Implementation Backlog

```typescript
async function buildImplementationBacklog(
  stories: Step11Story[],
  prds: ParsedStep11PRD[],
  dryRun: boolean,
  uiProfileSummary: UIProfileSummary | null  // NEW: Pass UI profile
): Promise<void> {
  const timestamp = new Date().toISOString();

  // CRITICAL: Inject design system constraints into UI tasks
  const storiesWithDesign = injectDesignSystem(stories, uiProfileSummary);

  // Validate design injection
  const { valid, warnings } = validateDesignInjection(storiesWithDesign, !!uiProfileSummary);
  warnings.forEach(w => console.warn(w));
  
  // Extract streams from story tags
  const streamMap = new Map<string, string[]>();
  for (const story of storiesWithDesign) {
    if (story.tags.streamId) {
      const existing = streamMap.get(story.tags.streamId) || [];
      existing.push(story.id);
      streamMap.set(story.tags.streamId, existing);
    }
  }
  
  const streams = Array.from(streamMap.entries()).map(([id, storyIds]) => ({
    id,
    name: id.replace('swarm-', 'Stream '),
    focusArea: '',
    storyIds,
  }));
  
  const backlog = {
    $schema: '../../../schemas/ralph-backlog.schema.json',
    meta: {
      projectName: await getProjectName(),
      mode: 'implementation',
      generatedAt: timestamp,
      generatedBy: 'step-11a',
      sourcePRDCount: prds.length,
      totalStories: storiesWithDesign.length,
      passedStories: 0,
      // NEW: Design system metadata
      designSystem: uiProfileSummary ? {
        profileRef: uiProfileSummary.uiProfileRef,
        profileId: uiProfileSummary.profileId,
        preset: uiProfileSummary.preset,
        enforced: true,
      } : null,
    },
    stories: storiesWithDesign,
    streams: streams.length > 0 ? streams : undefined,
  };
  
  const prdMap = {
    $schema: '../../../schemas/ralph-prd-map.schema.json',
    meta: {
      generatedAt: timestamp,
      backlogPath: 'docs/ralph/implementation/prd.json',
      totalPRDs: prds.length,
      totalStories: storiesWithDesign.length,
      // NEW: Design system reference
      designSystemRef: uiProfileSummary?.uiProfileRef || null,
    },
    mappings: prds.map(prd => ({
      prdPath: prd.path,
      prdTitle: prd.title,
      featureId: prd.section0.featureId,
      storyIds: storiesWithDesign
        .filter(s => s.source.prdPath === prd.path)
        .map(s => s.id),
      storyCount: storiesWithDesign.filter(s => s.source.prdPath === prd.path).length,
    })),
  };
  
  const progressTxt = `# Ralph Loop Progress — Implementation
# Generated: ${timestamp}
# Mode: implementation
# Stories: ${stories.length}
# Streams: ${streams.length}

## Session Log
---

`;
  
  if (dryRun) {
    console.log('\n[DRY RUN] Would create:');
    console.log('  docs/ralph/implementation/prd.json');
    console.log('  docs/ralph/implementation/prd-map.json');
    console.log('  docs/ralph/implementation/progress.txt');
    console.log('\nBacklog preview (first 2 stories):');
    console.log(JSON.stringify({ ...backlog, stories: backlog.stories.slice(0, 2) }, null, 2));
    return;
  }
  
  await run_terminal_cmd('mkdir -p docs/ralph/implementation');
  await write('docs/ralph/implementation/prd.json', JSON.stringify(backlog, null, 2));
  await write('docs/ralph/implementation/prd-map.json', JSON.stringify(prdMap, null, 2));
  await write('docs/ralph/implementation/progress.txt', progressTxt);
  
  console.log(`
✅ Implementation backlog created:
   📄 docs/ralph/implementation/prd.json (${storiesWithDesign.length} stories)
   📄 docs/ralph/implementation/prd-map.json
   📄 docs/ralph/implementation/progress.txt
   ${streams.length > 0 ? `🐝 ${streams.length} streams from Step 11b` : ''}
   ${uiProfileSummary ? `🎨 Design system enforced: ${uiProfileSummary.preset}` : '⚠️ No design system (UI tasks lack constraints)'}
  `);
}
```

---

## ✅ Quality Gates

**Step 11a complete when:**

- [ ] All Step 11 PRDs parsed successfully (Section 0, 0.5, 4, 6, 7, 8, 15)
- [ ] Each PRD has layered stories (db → api → ui → integration)
- [ ] All stories have machine-verifiable criteria
- [ ] Stream/swarm tags assigned (if Step 11b ran)
- [ ] prd.json validates against ralph-backlog.schema.json
- [ ] Epistemic Confidence >= 80%
- [ ] Human approved backlog structure

---

## 🚫 Final Review Gate

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 STEP 11.25 COMPLETE — IMPLEMENTATION PRD → RALPH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRDs Processed: [X]
Stories Generated: [X] (db: [X], api: [X], ui: [X], integration: [X])
Streams: [X] from Step 11b
Epistemic Confidence: [X]%

Created:
✅ docs/ralph/implementation/prd.json
✅ docs/ralph/implementation/prd-map.json
✅ docs/ralph/implementation/progress.txt

Ready for Ralph Loop:
  sigma-ralph.sh --workspace=/path/to/project --mode=implementation

Or with streams:
  sigma-ralph.sh --workspace=/path/to/project --mode=implementation --stream=1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply `approve` to finalize
Reply `revise: [feedback]` to modify
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔗 Related Commands

| Command | Relationship |
|---------|--------------|
| `@step-11-prd-generation` | Prerequisite — creates PRDs to convert |
| `@step-11b-prd-swarm` | Optional — provides stream/swarm assignments |
| `@step-5b-prd-to-json` | Sister command — converts prototype PRDs |
| `sigma-ralph.sh` | Next step — executes the Ralph loop |
| `@verify-prd` | Used in acceptance criteria |
| `@gap-analysis` | Used in acceptance criteria |
| `@ui-healer` | Used in UI validation criteria |
| **Taskmaster MCP** | Optional — AI-powered PRD parsing (recommended) |

### Taskmaster MCP Tools Reference

| Tool | Purpose |
|------|---------|
| `mcp_taskmaster_parse_prd` | AI-powered PRD parsing into tasks |
| `mcp_taskmaster_get_tasks` | Retrieve tasks with subtasks |
| `mcp_taskmaster_expand_task` | Break down complex tasks into subtasks |
| `mcp_taskmaster_analyze_project_complexity` | Assess project complexity |
| `mcp_taskmaster_set_task_status` | Update task status |
| `mcp_taskmaster_next_task` | Get next task to work on |

---

<verification>
## Step 11a Verification Schema

### Required Files (30 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Backlog | docs/ralph/implementation/prd.json | 1KB | 15 |
| PRD Map | docs/ralph/implementation/prd-map.json | 200B | 8 |
| Progress | docs/ralph/implementation/progress.txt | 50B | 7 |

### Schema Validation (25 points)

| Check | Description | Points |
|-------|-------------|--------|
| json_valid | prd.json is valid JSON | 10 |
| schema_valid | prd.json matches ralph-backlog.schema.json | 10 |
| map_valid | prd-map.json is valid JSON | 5 |

### Content Quality (25 points)

| Check | Description | Points |
|-------|-------------|--------|
| layered_stories | Each PRD has db/api/ui/integration stories | 10 |
| all_prds_covered | Every Step 11 PRD has stories | 10 |
| verifiable_criteria | All stories have machine-verifiable AC | 5 |

### Integration (20 points)

| Check | Description | Points |
|-------|-------------|--------|
| confidence_emitted | .sigma/confidence/step-11a-*.json exists | 5 |
| confidence_passed | Overall confidence >= 80% | 10 |
| streams_assigned | Stories have streamId if Step 11b ran | 5 |

</verification>


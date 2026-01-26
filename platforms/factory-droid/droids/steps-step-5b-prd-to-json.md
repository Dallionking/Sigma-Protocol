---
name: step-5b-prd-to-json
description: "Step 5b: Convert Step 5 prototype PRDs into Ralph-compatible JSON backlog format for autonomous implementation loops"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# step-5b-prd-to-json

**Source:** Sigma Protocol steps module
**Version:** 1.2.0

---


# /step-5b-prd-to-json — Convert Prototype PRDs to Ralph Backlog

**Mission**  
Convert Step 5 prototype PRDs (located in `docs/prds/flows/`) into a machine-readable JSON backlog (`docs/ralph/prototype/prd.json`) that enables Ralph-style autonomous implementation loops.

**Why This Step Exists:**  
The Ralph loop requires a JSON backlog with **atomic stories** and **verifiable acceptance criteria**. Step 5 produces excellent markdown PRDs, but they need to be parsed into the Ralph format so:
- **AI agents know exactly what to implement** — Each story is one context window of work
- **Completion is machine-verifiable** — Acceptance criteria specify commands to run and success conditions
- **Progress is tracked deterministically** — `passes: true/false` state, not markdown heuristics
- **No "claimed done" failures** — The loop can't mark a story passed without evidence

**This step ensures you can run the Ralph bash loop on your prototype PRDs.**

---

## 🔍 When to Use This Step

### Automatically Suggested After Step 5 When:
- ✅ `docs/prds/flows/` contains PRD files
- ✅ User wants to implement prototypes using Ralph-style loop
- ✅ Multi-PRD implementation session planned

### Skip This Step If:
- ❌ User prefers manual PRD-by-PRD implementation
- ❌ Only 1-2 small PRDs (Ralph overhead not worth it)
- ❌ PRDs are still being refined (wait until stable)

---

## 📋 Command Usage

```bash
# Run as step (after Step 5)
@step-5b-prd-to-json

# Run standalone with options
@step-5b-prd-to-json --dry-run=true

# Scope to specific flow
@step-5b-prd-to-json --scope=01-auth

# Enable journey-aware story grouping
@step-5b-prd-to-json --journey-aware=true

# Strict verification (requires all criteria to be machine-checkable)
@step-5b-prd-to-json --verification-strict=true
```

### Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `--dry-run` | boolean | `false` | Preview JSON output without writing files |
| `--scope` | string | `*` | Limit to specific flow folder (e.g., `01-auth`) |
| `--journey-aware` | boolean | `true` | Group stories by user journey, not just screen |
| `--emit-confidence` | boolean | `true` | Emit Epistemic Confidence artifact |
| `--max-story-size` | `small`, `medium`, `large` | `small` | Max story complexity (small = ~1 iteration) |
| `--verification-strict` | boolean | `true` | Reject stories without verifiable acceptance criteria |
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
@step-5b-prd-to-json --use-taskmaster=true

# With specific model
@step-5b-prd-to-json --use-taskmaster=true --taskmaster-model=claude-code/opus

# Combine with journey awareness
@step-5b-prd-to-json --use-taskmaster=true --journey-aware=true
```

### Taskmaster Integration Flow

```
┌──────────────────────────────────────────────────────────────────┐
│           TASKMASTER MCP INTEGRATION (STEP 5b)                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Step 5 PRD (Markdown)                                           │
│  docs/prds/flows/01-auth/02-login-screen.md                      │
│       │                                                          │
│       ▼                                                          │
│  ┌────────────────────────────────────────────────┐              │
│  │     TASKMASTER MCP (mcp_taskmaster_parse_prd)  │              │
│  │  • AI understands screen PRD structure          │              │
│  │  • Extracts UI components, routes, flows        │              │
│  │  • Generates acceptance criteria                │              │
│  │  • Detects screen-to-screen dependencies        │              │
│  └────────────────────────────────────────────────┘              │
│       │                                                          │
│       ▼                                                          │
│  .taskmaster/tasks/tasks.json (Taskmaster format)                │
│       │                                                          │
│       ▼                                                          │
│  ┌────────────────────────────────────────────────┐              │
│  │    SIGMA TRANSFORMER (built-in)                │              │
│  │  • Convert Taskmaster → Ralph format           │              │
│  │  • Add journey/flow grouping                   │              │
│  │  • Add UI validation criteria                  │              │
│  │  • Map @verify-prd, @gap-analysis commands     │              │
│  └────────────────────────────────────────────────┘              │
│       │                                                          │
│       ▼                                                          │
│  docs/ralph/prototype/prd.json (Ralph format)                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Prerequisites for Taskmaster

**For Claude Code users:**
```bash
# Add Taskmaster MCP to Claude Code
claude mcp add taskmaster-ai -- npx -y task-master-ai
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
        "ANTHROPIC_API_KEY": "YOUR_API_KEY"
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

// 2. Check for Step 5 PRD directory
const flowsDir = 'docs/prds/flows/';
const flowsDirExists = await fileExists(flowsDir);
if (!flowsDirExists) {
  throw new Error('No docs/prds/flows/ directory found. Run Step 5 first.');
}

// 3. Scan for PRD files
const flowFolders = await glob('docs/prds/flows/*/');
const prdFiles = await glob('docs/prds/flows/**/*.md');

// 4. Check for existing Ralph backlog
const existingBacklog = await fileExists('docs/ralph/prototype/prd.json');

// 5. Load flow-tree.json if exists (for screen metadata)
const flowTree = await readFile('docs/flows/flow-tree.json').catch(() => null);

// 6. Display context
console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 STEP 5b: PRD → RALPH BACKLOG CONVERSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: ${today}
Flow Folders Found: ${flowFolders.length}
PRD Files Found: ${prdFiles.length}
Existing Backlog: ${existingBacklog ? 'Will overwrite' : 'Will create'}
Flow Tree: ${flowTree ? 'Loaded (will use screen metadata)' : 'Not found'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// 7. Validate minimum PRD count
if (prdFiles.length < 1) {
  throw new Error('No PRD files found in docs/prds/flows/. Run Step 5 first.');
}
```

---

## 📋 Task Execution Flow

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 STEP 5b: PRD → RALPH BACKLOG WORKFLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase A: Context Loading
  [ ] A1: Scan docs/prds/flows/ for all PRD files
  [ ] A2: Load flow-tree.json for screen metadata
  [ ] A3: Check for existing Ralph backlog
  ⏸️  CHECKPOINT: Confirm PRD inventory

Phase B: PRD Parsing
  [ ] B1: Parse each PRD markdown file
  [ ] B2: Extract acceptance criteria (Given/When/Then)
  [ ] B3: Extract screen/flow metadata
  [ ] B4: Identify user journeys
  [ ] B5: Detect dependencies between screens
  ⏸️  CHECKPOINT: Review parsed PRD structure

Phase C: Story Generation
  [ ] C1: Convert PRD sections to atomic stories
  [ ] C2: Apply story-splitting rules (max-story-size)
  [ ] C3: Generate verifiable acceptance criteria
  [ ] C4: Map Sigma verification commands to criteria
  [ ] C5: Assign priority based on journey/dependency order
  ⏸️  CHECKPOINT: Review generated stories

Phase D: Backlog Assembly
  [ ] D1: Validate all stories have verifiable criteria
  [ ] D2: Build prd.json with SSS-Ralph schema
  [ ] D3: Generate prd-map.json for traceability
  [ ] D4: Initialize progress.txt
  [ ] D5: Create AGENTS.md template
  ⏸️  CHECKPOINT: Verify backlog structure

Phase E: Output & Validation
  [ ] E1: Write docs/ralph/prototype/prd.json
  [ ] E2: Write docs/ralph/prototype/prd-map.json
  [ ] E3: Write docs/ralph/prototype/progress.txt
  [ ] E4: Emit Epistemic Confidence artifact
  ⏸️  FINAL: Ready for Ralph loop

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔄 Phase A: Context Loading

### A1: Scan PRD Files

```typescript
interface Step5PRD {
  path: string;           // docs/prds/flows/01-auth/02-login-screen.md
  flowId: string;         // 01-auth
  flowName: string;       // Auth
  screenId: string;       // 02-login-screen
  screenName: string;     // Login Screen
  title: string;          // From # heading
  content: string;        // Full markdown content
  order: number;          // Numeric order from filename
}

async function scanStep5PRDs(scope?: string): Promise<Step5PRD[]> {
  const prds: Step5PRD[] = [];
  
  // Build glob pattern based on scope
  const pattern = scope 
    ? `docs/prds/flows/${scope}/**/*.md`
    : 'docs/prds/flows/**/*.md';
  
  const prdPaths = await glob(pattern);
  
  // Exclude FLOW-*.md files (these are flow overviews, not screen PRDs)
  const screenPrds = prdPaths.filter(p => !p.includes('FLOW-'));
  
  for (const prdPath of screenPrds) {
    const content = await readFile(prdPath);
    const prd = parseStep5PRD(prdPath, content);
    prds.push(prd);
  }
  
  // Sort by flow order, then screen order
  prds.sort((a, b) => {
    if (a.flowId !== b.flowId) {
      return a.flowId.localeCompare(b.flowId);
    }
    return a.order - b.order;
  });
  
  return prds;
}

function parseStep5PRD(path: string, content: string): Step5PRD {
  // Extract from path: docs/prds/flows/01-auth/02-login-screen.md
  const parts = path.split('/');
  const filename = parts[parts.length - 1];
  const flowFolder = parts[parts.length - 2];
  
  // Parse flow: "01-auth" → { id: "01-auth", name: "Auth", order: 1 }
  const flowMatch = flowFolder.match(/^(\d+)-(.+)$/);
  const flowId = flowFolder;
  const flowName = flowMatch 
    ? flowMatch[2].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : flowFolder;
  
  // Parse screen: "02-login-screen.md" → { id: "02-login-screen", name: "Login Screen", order: 2 }
  const screenMatch = filename.replace('.md', '').match(/^(\d+)-(.+)$/);
  const screenId = filename.replace('.md', '');
  const screenName = screenMatch
    ? screenMatch[2].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : filename.replace('.md', '');
  const order = screenMatch ? parseInt(screenMatch[1], 10) : 0;
  
  // Extract title from first # heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : screenName;
  
  return {
    path,
    flowId,
    flowName,
    screenId,
    screenName,
    title,
    content,
    order,
  };
}
```

### A2: Load Flow Tree Metadata

```typescript
interface FlowTreeScreen {
  id: string;
  title: string;
  route: string;
  moduleId: string;
  priority: string;
  complexity: string;
}

async function loadFlowTree(): Promise<Map<string, FlowTreeScreen> | null> {
  try {
    const content = await readFile('docs/flows/flow-tree.json');
    const flowTree = JSON.parse(content);
    
    const screenMap = new Map<string, FlowTreeScreen>();
    for (const screen of flowTree.screens || []) {
      screenMap.set(screen.id, screen);
    }
    
    return screenMap;
  } catch {
    console.log('Flow tree not found, proceeding without screen metadata');
    return null;
  }
}
```

**CHECKPOINT A:** Display PRD inventory and ask for confirmation.

---

## 🔄 Phase B: PRD Parsing

### B1-B2: Extract Acceptance Criteria

```typescript
interface ParsedAcceptanceCriteria {
  id: string;
  given: string;
  when: string;
  then: string[];
  scenario: string;
  type: 'happy-path' | 'edge-case' | 'error-handling' | 'validation';
  raw: string;
}

function extractAcceptanceCriteria(content: string): ParsedAcceptanceCriteria[] {
  const criteria: ParsedAcceptanceCriteria[] = [];
  
  // Pattern 1: Gherkin format
  const gherkinPattern = /Scenario:\s*(.+?)\n\s*Given\s+(.+?)\n(?:\s*And\s+.+?\n)*\s*When\s+(.+?)\n\s*Then\s+(.+?)(?:\n\s*And\s+.+?)*/gi;
  
  let match;
  let acIndex = 1;
  
  while ((match = gherkinPattern.exec(content)) !== null) {
    const scenario = match[1].trim();
    const given = match[2].trim();
    const when = match[3].trim();
    
    // Extract all Then clauses (including And)
    const thenSection = match[0].substring(match[0].indexOf('Then'));
    const thenLines = thenSection
      .split('\n')
      .filter(line => /^\s*(Then|And)\s+/i.test(line))
      .map(line => line.replace(/^\s*(Then|And)\s+/i, '').trim());
    
    // Determine type from scenario name
    let type: ParsedAcceptanceCriteria['type'] = 'happy-path';
    if (/error|fail|invalid/i.test(scenario)) type = 'error-handling';
    else if (/edge|boundary/i.test(scenario)) type = 'edge-case';
    else if (/valid/i.test(scenario)) type = 'validation';
    
    criteria.push({
      id: `ac-${acIndex++}`,
      scenario,
      given,
      when,
      then: thenLines,
      type,
      raw: match[0],
    });
  }
  
  // Pattern 2: Bullet-list acceptance criteria (fallback)
  if (criteria.length === 0) {
    const bulletPattern = /##\s*Acceptance Criteria\s*\n((?:[-*]\s*.+\n?)+)/i;
    const bulletMatch = content.match(bulletPattern);
    
    if (bulletMatch) {
      const bullets = bulletMatch[1]
        .split('\n')
        .filter(line => /^[-*]\s+/.test(line))
        .map(line => line.replace(/^[-*]\s+/, '').trim());
      
      for (const bullet of bullets) {
        criteria.push({
          id: `ac-${acIndex++}`,
          scenario: bullet.slice(0, 50),
          given: 'User is on the screen',
          when: 'User performs the action',
          then: [bullet],
          type: 'happy-path',
          raw: bullet,
        });
      }
    }
  }
  
  return criteria;
}
```

### B3-B5: Extract Metadata and Dependencies

```typescript
interface PRDMetadata {
  dependencies: string[];      // Screen IDs this PRD depends on
  uiComponents: string[];      // Components to create
  routes: string[];            // Routes to implement
  dataRequirements: string[];  // Data fetching needs
  journeyId?: string;          // User journey this belongs to
  journeyStep?: number;        // Position in journey
}

function extractPRDMetadata(content: string, flowId: string): PRDMetadata {
  // Extract dependencies
  const depsMatch = content.match(/depends?\s*on[:\s]+([^\n]+)/i);
  const dependencies = depsMatch
    ? depsMatch[1].split(/[,;]/).map(d => d.trim()).filter(d => d)
    : [];
  
  // Extract UI components (from ## Components section or inline)
  const componentsMatch = content.match(/##\s*Components?\s*\n((?:[-*]\s*.+\n?)+)/i);
  const uiComponents = componentsMatch
    ? componentsMatch[1].split('\n')
        .filter(line => /^[-*]\s+/.test(line))
        .map(line => line.replace(/^[-*]\s+/, '').trim())
    : [];
  
  // Extract routes
  const routeMatch = content.match(/route[:\s]+[`"]?([^`"\n]+)[`"]?/i);
  const routes = routeMatch ? [routeMatch[1].trim()] : [];
  
  // Extract data requirements
  const dataMatch = content.match(/##\s*Data\s*\n((?:[-*]\s*.+\n?)+)/i);
  const dataRequirements = dataMatch
    ? dataMatch[1].split('\n')
        .filter(line => /^[-*]\s+/.test(line))
        .map(line => line.replace(/^[-*]\s+/, '').trim())
    : [];
  
  return {
    dependencies,
    uiComponents,
    routes,
    dataRequirements,
  };
}
```

**CHECKPOINT B:** Review parsed PRD structure.

---

## 🔄 Phase C: Story Generation

### C1-C2: Convert PRD to Atomic Stories

```typescript
interface GeneratedStory {
  id: string;
  title: string;
  description: string;
  priority: number;
  passes: boolean;
  source: {
    prdPath: string;
    step: 'step-5';
    sectionId?: string;
  };
  acceptanceCriteria: {
    id: string;
    description: string;
    type: 'command' | 'file-exists' | 'file-contains' | 'ui-validation' | 'manual';
    command?: string;
    filePath?: string;
    uiValidation?: {
      mode: 'cursor-browser' | 'playwright' | 'claude-browser' | 'any' | 'manual';
      route: string;
      checks: { type: string; selector?: string; expectedText?: string }[];
    };
    expectedScore?: number;
  }[];
  tags: {
    screenId: string;
    screenName: string;
    flowId: string;
    journeyId?: string;
    journeyStepIndex?: number;
    complexity: 'simple' | 'medium' | 'complex';
  };
  dependsOn: string[];
  estimatedIterations: number;
}

function generateStoriesFromPRD(
  prd: Step5PRD,
  criteria: ParsedAcceptanceCriteria[],
  metadata: PRDMetadata,
  maxStorySize: 'small' | 'medium' | 'large'
): GeneratedStory[] {
  const stories: GeneratedStory[] = [];
  
  // Determine story granularity based on maxStorySize
  const splitThreshold = {
    small: 3,   // Max 3 acceptance criteria per story
    medium: 6,  // Max 6 acceptance criteria per story
    large: 10,  // Max 10 acceptance criteria per story
  }[maxStorySize];
  
  // Group criteria into stories
  const criteriaGroups = chunkArray(criteria, splitThreshold);
  
  for (let i = 0; i < criteriaGroups.length; i++) {
    const group = criteriaGroups[i];
    const storyNumber = criteriaGroups.length > 1 ? `-part-${i + 1}` : '';
    const storyId = `${prd.screenId}${storyNumber}`;
    
    // Map acceptance criteria to verifiable format
    const verifiableCriteria = group.map(ac => 
      convertToVerifiableCriterion(ac, prd, metadata)
    );
    
    // Always add gap-analysis as final verification
    verifiableCriteria.push({
      id: `ac-${verifiableCriteria.length + 1}`,
      description: 'Gap analysis passes with score >= 85%',
      type: 'command',
      command: '@gap-analysis',
      expectedScore: 85,
    });
    
    // Add UI validation if this is a screen PRD
    if (metadata.routes.length > 0) {
      verifiableCriteria.push({
        id: `ac-${verifiableCriteria.length + 1}`,
        description: 'UI renders correctly on target route',
        type: 'ui-validation',
        uiValidation: {
          mode: 'any', // Will use cursor-browser, playwright, or claude-browser
          route: metadata.routes[0],
          checks: [
            { type: 'content-exists', expectedText: prd.screenName },
          ],
        },
      });
    }
    
    const story: GeneratedStory = {
      id: storyId,
      title: criteriaGroups.length > 1 
        ? `${prd.title} (Part ${i + 1}/${criteriaGroups.length})`
        : prd.title,
      description: `Implement ${prd.screenName} screen from ${prd.flowName} flow`,
      priority: calculatePriority(prd, i, criteriaGroups.length),
      passes: false,
      source: {
        prdPath: prd.path,
        step: 'step-5',
      },
      acceptanceCriteria: verifiableCriteria,
      tags: {
        screenId: prd.screenId,
        screenName: prd.screenName,
        flowId: prd.flowId,
        journeyId: metadata.journeyId,
        journeyStepIndex: metadata.journeyStep,
        complexity: determineComplexity(group.length, metadata),
      },
      dependsOn: metadata.dependencies.map(d => d), // Convert screen deps to story deps
      estimatedIterations: Math.ceil(group.length / 3),
    };
    
    stories.push(story);
  }
  
  return stories;
}

function convertToVerifiableCriterion(
  ac: ParsedAcceptanceCriteria,
  prd: Step5PRD,
  metadata: PRDMetadata
): GeneratedStory['acceptanceCriteria'][0] {
  // Attempt to convert BDD criterion to machine-verifiable check
  
  // Check if it's about file creation
  const fileCreateMatch = ac.then.join(' ').match(/creat(?:e|ed)\s+(?:file|component|page)\s+[`"]?([^`"]+)[`"]?/i);
  if (fileCreateMatch) {
    return {
      id: ac.id,
      description: ac.scenario,
      type: 'file-exists',
      filePath: fileCreateMatch[1],
    };
  }
  
  // Check if it's about UI rendering
  const uiRenderMatch = ac.then.join(' ').match(/(?:display|show|render)s?\s+[`"]?([^`"]+)[`"]?/i);
  if (uiRenderMatch && metadata.routes.length > 0) {
    return {
      id: ac.id,
      description: ac.scenario,
      type: 'ui-validation',
      uiValidation: {
        mode: 'any',
        route: metadata.routes[0],
        checks: [
          { type: 'content-exists', expectedText: uiRenderMatch[1] },
        ],
      },
    };
  }
  
  // Default: use verify-prd command
  return {
    id: ac.id,
    description: ac.scenario,
    type: 'command',
    command: '@verify-prd',
    expectedScore: 80,
  };
}

function calculatePriority(prd: Step5PRD, partIndex: number, totalParts: number): number {
  // Priority based on: flow order × 100 + screen order × 10 + part index
  const flowOrder = parseInt(prd.flowId.match(/^\d+/)?.[0] || '0', 10);
  const screenOrder = prd.order;
  
  return flowOrder * 100 + screenOrder * 10 + partIndex;
}

function determineComplexity(criteriaCount: number, metadata: PRDMetadata): 'simple' | 'medium' | 'complex' {
  const componentCount = metadata.uiComponents.length;
  const hasData = metadata.dataRequirements.length > 0;
  
  if (criteriaCount <= 3 && componentCount <= 2 && !hasData) return 'simple';
  if (criteriaCount <= 6 && componentCount <= 5) return 'medium';
  return 'complex';
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks.length > 0 ? chunks : [[]];
}
```

**CHECKPOINT C:** Review generated stories and their acceptance criteria.

---

## 🔄 Phase D: Backlog Assembly

### D1: Validate Verifiable Criteria

```typescript
interface ValidationResult {
  valid: boolean;
  issues: { storyId: string; issue: string }[];
}

function validateStories(
  stories: GeneratedStory[],
  strict: boolean
): ValidationResult {
  const issues: { storyId: string; issue: string }[] = [];
  
  for (const story of stories) {
    // Check: At least one criterion
    if (story.acceptanceCriteria.length === 0) {
      issues.push({
        storyId: story.id,
        issue: 'No acceptance criteria defined',
      });
      continue;
    }
    
    // Check: All criteria are verifiable (in strict mode)
    if (strict) {
      const manualOnlyCriteria = story.acceptanceCriteria.filter(
        ac => ac.type === 'manual'
      );
      
      if (manualOnlyCriteria.length === story.acceptanceCriteria.length) {
        issues.push({
          storyId: story.id,
          issue: 'All criteria are manual-only (need at least one machine-verifiable)',
        });
      }
    }
    
    // Check: Has at least one verification command
    const hasCommandCriteria = story.acceptanceCriteria.some(
      ac => ac.type === 'command' || ac.type === 'file-exists' || ac.type === 'ui-validation'
    );
    
    if (!hasCommandCriteria) {
      issues.push({
        storyId: story.id,
        issue: 'No machine-verifiable criterion (add @verify-prd or @gap-analysis)',
      });
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}
```

### D2-D5: Build Backlog Files

```typescript
async function buildBacklog(
  stories: GeneratedStory[],
  prds: Step5PRD[],
  dryRun: boolean
): Promise<void> {
  const timestamp = new Date().toISOString();
  
  // Build prd.json
  const backlog = {
    $schema: '../../../schemas/ralph-backlog.schema.json',
    meta: {
      projectName: await getProjectName(),
      mode: 'prototype',
      generatedAt: timestamp,
      generatedBy: 'step-5b',
      sourcePRDCount: prds.length,
      totalStories: stories.length,
      passedStories: 0,
    },
    stories,
    journeys: extractJourneys(stories),
  };
  
  // Build prd-map.json
  const prdMap = {
    $schema: '../../../schemas/ralph-prd-map.schema.json',
    meta: {
      generatedAt: timestamp,
      backlogPath: 'docs/ralph/prototype/prd.json',
      totalPRDs: prds.length,
      totalStories: stories.length,
    },
    mappings: prds.map(prd => ({
      prdPath: prd.path,
      prdTitle: prd.title,
      screenId: prd.screenId,
      flowId: prd.flowId,
      storyIds: stories
        .filter(s => s.source.prdPath === prd.path)
        .map(s => s.id),
      storyCount: stories.filter(s => s.source.prdPath === prd.path).length,
    })),
  };
  
  // Initialize progress.txt
  const progressTxt = `# Ralph Loop Progress — Prototype Implementation
# Generated: ${timestamp}
# Mode: prototype
# Stories: ${stories.length}

## Session Log
---

`;
  
  if (dryRun) {
    console.log('\n[DRY RUN] Would create:');
    console.log('  docs/ralph/prototype/prd.json');
    console.log('  docs/ralph/prototype/prd-map.json');
    console.log('  docs/ralph/prototype/progress.txt');
    console.log('\nBacklog preview:');
    console.log(JSON.stringify(backlog, null, 2).slice(0, 2000) + '...');
    return;
  }
  
  // Create directory
  await run_terminal_cmd('mkdir -p docs/ralph/prototype');
  
  // Write files
  await write('docs/ralph/prototype/prd.json', JSON.stringify(backlog, null, 2));
  await write('docs/ralph/prototype/prd-map.json', JSON.stringify(prdMap, null, 2));
  await write('docs/ralph/prototype/progress.txt', progressTxt);
  
  console.log(`
✅ Backlog created:
   📄 docs/ralph/prototype/prd.json (${stories.length} stories)
   📄 docs/ralph/prototype/prd-map.json
   📄 docs/ralph/prototype/progress.txt
  `);
}

function extractJourneys(stories: GeneratedStory[]): { id: string; name: string; storyIds: string[] }[] {
  const journeyMap = new Map<string, string[]>();
  
  for (const story of stories) {
    if (story.tags.journeyId) {
      const existing = journeyMap.get(story.tags.journeyId) || [];
      existing.push(story.id);
      journeyMap.set(story.tags.journeyId, existing);
    }
  }
  
  // Also create a journey per flow
  const flowMap = new Map<string, string[]>();
  for (const story of stories) {
    const existing = flowMap.get(story.tags.flowId) || [];
    existing.push(story.id);
    flowMap.set(story.tags.flowId, existing);
  }
  
  const journeys: { id: string; name: string; storyIds: string[] }[] = [];
  
  for (const [flowId, storyIds] of flowMap) {
    journeys.push({
      id: `journey-${flowId}`,
      name: flowId.replace(/^\d+-/, '').replace(/-/g, ' '),
      storyIds: storyIds.sort((a, b) => {
        const storyA = stories.find(s => s.id === a)!;
        const storyB = stories.find(s => s.id === b)!;
        return storyA.priority - storyB.priority;
      }),
    });
  }
  
  return journeys;
}

async function getProjectName(): Promise<string> {
  try {
    const pkg = await readFile('package.json');
    const parsed = JSON.parse(pkg);
    return parsed.name || 'unnamed-project';
  } catch {
    return 'unnamed-project';
  }
}
```

**CHECKPOINT D:** Verify backlog structure is valid.

---

## 🔄 Phase E: Output & Validation

### E4: Emit Epistemic Confidence Artifact

```typescript
interface BacklogConfidence {
  verifiabilityScore: number;  // % of stories with machine-verifiable criteria
  coverageScore: number;       // % of PRDs covered by stories
  atomicityScore: number;      // % of stories estimated to complete in 1 iteration
  dependencyScore: number;     // % of dependencies resolvable
  overallConfidence: number;
}

function computeBacklogConfidence(
  stories: GeneratedStory[],
  prds: Step5PRD[]
): BacklogConfidence {
  // Verifiability: stories with at least one command/file/ui check
  const verifiable = stories.filter(s => 
    s.acceptanceCriteria.some(ac => 
      ac.type !== 'manual'
    )
  ).length;
  const verifiabilityScore = (verifiable / stories.length) * 100;
  
  // Coverage: PRDs with at least one story
  const coveredPrds = new Set(stories.map(s => s.source.prdPath));
  const coverageScore = (coveredPrds.size / prds.length) * 100;
  
  // Atomicity: stories estimated at 1 iteration
  const atomic = stories.filter(s => s.estimatedIterations === 1).length;
  const atomicityScore = (atomic / stories.length) * 100;
  
  // Dependencies: stories with resolvable deps
  const storyIds = new Set(stories.map(s => s.id));
  const resolvableDeps = stories.filter(s => 
    s.dependsOn.every(d => storyIds.has(d) || d === '')
  ).length;
  const dependencyScore = (resolvableDeps / stories.length) * 100;
  
  const overallConfidence = (
    verifiabilityScore * 0.4 +
    coverageScore * 0.2 +
    atomicityScore * 0.2 +
    dependencyScore * 0.2
  );
  
  return {
    verifiabilityScore,
    coverageScore,
    atomicityScore,
    dependencyScore,
    overallConfidence,
  };
}

async function emitConfidenceArtifact(
  stories: GeneratedStory[],
  prds: Step5PRD[],
  confidence: BacklogConfidence
): Promise<void> {
  const timestamp = new Date().toISOString();
  
  const artifact = {
    version: '1.0.0',
    command: '@step-5b-prd-to-json',
    timestamp,
    tier: 2,
    confidence: {
      overall: Math.round(confidence.overallConfidence),
      verifiability: Math.round(confidence.verifiabilityScore),
      coverage: Math.round(confidence.coverageScore),
      atomicity: Math.round(confidence.atomicityScore),
      dependencies: Math.round(confidence.dependencyScore),
      passed: confidence.overallConfidence >= 80,
    },
    summary: {
      totalPRDs: prds.length,
      totalStories: stories.length,
      storiesPerPRD: (stories.length / prds.length).toFixed(1),
      estimatedIterations: stories.reduce((sum, s) => sum + s.estimatedIterations, 0),
    },
    issues: confidence.overallConfidence < 80 ? [
      ...(confidence.verifiabilityScore < 80 ? ['Some stories lack machine-verifiable criteria'] : []),
      ...(confidence.coverageScore < 100 ? ['Not all PRDs have corresponding stories'] : []),
      ...(confidence.atomicityScore < 70 ? ['Many stories may require multiple iterations'] : []),
    ] : [],
  };
  
  await run_terminal_cmd('mkdir -p .sigma/confidence');
  const filename = `.sigma/confidence/step-5b-${timestamp.split('T')[0]}.json`;
  await write(filename, JSON.stringify(artifact, null, 2));
  
  console.log(`
📊 Epistemic Confidence: ${Math.round(confidence.overallConfidence)}%
   Verifiability: ${Math.round(confidence.verifiabilityScore)}%
   Coverage: ${Math.round(confidence.coverageScore)}%
   Atomicity: ${Math.round(confidence.atomicityScore)}%
   Dependencies: ${Math.round(confidence.dependencyScore)}%
   
   Artifact saved: ${filename}
  `);
}
```

---

## ✅ Quality Gates

**Step 5b complete when:**

- [ ] All Step 5 PRDs parsed successfully
- [ ] Each PRD has at least one story generated
- [ ] All stories have at least one machine-verifiable criterion
- [ ] prd.json validates against ralph-backlog.schema.json
- [ ] prd-map.json created for traceability
- [ ] progress.txt initialized
- [ ] Epistemic Confidence >= 80%
- [ ] Human approved backlog structure

---

## 🚫 Final Review Gate

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 STEP 5.5 COMPLETE — PRD → RALPH BACKLOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRDs Processed: [X]
Stories Generated: [X]
Epistemic Confidence: [X]%

Created:
✅ docs/ralph/prototype/prd.json
✅ docs/ralph/prototype/prd-map.json
✅ docs/ralph/prototype/progress.txt

Ready for Ralph Loop:
  sigma-ralph.sh --workspace=/path/to/project --mode=prototype

Or run via Claude Code:
  /ralph-run --backlog=docs/ralph/prototype/prd.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply `approve` to finalize
Reply `revise: [feedback]` to modify
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔗 Related Commands

| Command | Relationship |
|---------|--------------|
| `@step-5-wireframe-prototypes` | Prerequisite — creates PRDs to convert |
| `@step-11a-prd-to-json` | Sister command — converts Step 11 PRDs |
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

## 📝 Output Files

### docs/ralph/prototype/prd.json

```json
{
  "$schema": "../../../schemas/ralph-backlog.schema.json",
  "meta": {
    "projectName": "my-app",
    "mode": "prototype",
    "generatedAt": "2026-01-11T12:00:00.000Z",
    "generatedBy": "step-5b",
    "sourcePRDCount": 8,
    "totalStories": 15,
    "passedStories": 0
  },
  "stories": [
    {
      "id": "01-welcome-screen",
      "title": "Welcome Screen",
      "description": "Implement Welcome Screen from Auth flow",
      "priority": 110,
      "passes": false,
      "source": {
        "prdPath": "docs/prds/flows/01-auth/01-welcome-screen.md",
        "step": "step-5"
      },
      "acceptanceCriteria": [
        {
          "id": "ac-1",
          "description": "Welcome screen displays app logo",
          "type": "ui-validation",
          "uiValidation": {
            "mode": "any",
            "route": "/welcome",
            "checks": [
              { "type": "content-exists", "expectedText": "Welcome" }
            ]
          }
        },
        {
          "id": "ac-2",
          "description": "Gap analysis passes with score >= 85%",
          "type": "command",
          "command": "@gap-analysis",
          "expectedScore": 85
        }
      ],
      "tags": {
        "screenId": "01-welcome-screen",
        "screenName": "Welcome Screen",
        "flowId": "01-auth",
        "complexity": "simple"
      },
      "dependsOn": [],
      "estimatedIterations": 1
    }
  ],
  "journeys": [
    {
      "id": "journey-01-auth",
      "name": "auth",
      "storyIds": ["01-welcome-screen", "02-login-screen", "03-signup-screen"]
    }
  ]
}
```

---

<verification>
## Step 5b Verification Schema

### Required Files (30 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Backlog | docs/ralph/prototype/prd.json | 500B | 15 |
| PRD Map | docs/ralph/prototype/prd-map.json | 200B | 8 |
| Progress | docs/ralph/prototype/progress.txt | 50B | 7 |

### Schema Validation (25 points)

| Check | Description | Points |
|-------|-------------|--------|
| json_valid | prd.json is valid JSON | 10 |
| schema_valid | prd.json matches ralph-backlog.schema.json | 10 |
| map_valid | prd-map.json is valid JSON | 5 |

### Content Quality (25 points)

| Check | Description | Points |
|-------|-------------|--------|
| stories_exist | At least 1 story generated | 10 |
| all_prds_covered | Every Step 5 PRD has stories | 10 |
| verifiable_criteria | All stories have machine-verifiable AC | 5 |

### Integration (20 points)

| Check | Description | Points |
|-------|-------------|--------|
| confidence_emitted | .sigma/confidence/step-5b-*.json exists | 5 |
| confidence_passed | Overall confidence >= 80% | 10 |
| source_traceable | All stories have valid source.prdPath | 5 |

</verification>

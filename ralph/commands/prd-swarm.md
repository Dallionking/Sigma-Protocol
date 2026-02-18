---
version: "1.1.0"
last_updated: "2026-01-21"
changelog:
  - "1.1.0: Renamed from step-11b to step-11b for correct sort order"
  - "1.0.0: Initial release — PRD Swarm orchestration for parallel multi-terminal implementation"
description: "Step 11b: PRD Swarm → Analyze PRD dependencies and organize into parallelizable swarms for multi-terminal implementation"
allowed-tools:
  # PRIMARY MCP Tools (Use First)
  - mcp_ref_ref_search_documentation
  - mcp_ref_ref_read_url
  - mcp_exa_web_search_exa
  - mcp_exa_get_code_context_exa
  - mcp_sequential-thinking_sequentialthinking

  # BACKUP MCP Tools (Use only if primary fails)
  - mcp_firecrawl_firecrawl_search
  
  # OTHER TOOLS
  - read_file
  - write
  - list_dir
  - glob_file_search
  - grep
  - run_terminal_cmd
  - todo_write
parameters:
  - --terminals
  - --dry-run
  - --run-gap-analysis
  - --min-swarm-size
  - --strategy
  - --visualize
  - --emit-confidence
---

# /step-11b-prd-swarm — PRD Swarm Orchestration for Parallel Implementation

**Mission**  
Analyze PRD dependencies and organize them into parallelizable "swarms" (subfolders) that can be worked on simultaneously in multiple terminal instances (Cursor, Claude Code, Open Code, etc.).

**Why This Step Exists:**  
For projects with many PRDs (10+), sequential implementation is slow. By analyzing the dependency graph and grouping independent chains, you can:
- **Run multiple coding agents in parallel** — Each terminal works on a swarm
- **Avoid dependency conflicts** — PRDs in different swarms don't depend on each other
- **Maximize throughput** — 4 terminals = up to 4x faster implementation

**This step ensures you can safely parallelize implementation without stepping on dependencies.**

---

## 🔍 When to Use This Step

### Automatically Suggested After Step 11 When:
- ✅ `docs/prds/` contains 5+ PRD files
- ✅ User has access to multiple terminal instances
- ✅ Project complexity warrants parallel development

### Skip This Step If:
- ❌ Fewer than 5 PRDs (sequential is fine)
- ❌ All PRDs have linear dependencies (can't parallelize)
- ❌ Single developer working sequentially (no benefit)

---

## 📋 Command Usage

```bash
# Run as step (after Step 11)
@step-11b-prd-swarm

# Run standalone (any time after PRDs exist)
@prd-orchestrate

# Specify terminal count
@prd-orchestrate --terminals=4

# Preview without moving files
@prd-orchestrate --dry-run=true

# Skip gap analysis
@prd-orchestrate --run-gap-analysis=false

# Different grouping strategies
@prd-orchestrate --strategy=complexity

# RALPH MODE: Convert PRDs to JSON backlog for autonomous loop
@prd-orchestrate --ralph-mode=true

# RALPH MODE: Generate JSON backlog + start Ralph loop
@prd-orchestrate --ralph-mode=true --start-loop=true

# ORCHESTRATE MODE: Generate config for multi-agent orchestration
@prd-orchestrate --orchestrate=true

# ORCHESTRATE + AUTO-LAUNCH: Generate config and spawn tmux workspace
@prd-orchestrate --orchestrate=true --auto-launch=true
```

### Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `--terminals` | 1-8 | `4` | Number of parallel terminals to plan for |
| `--dry-run` | boolean | `true` | Preview swarm plan without moving files |
| `--run-gap-analysis` | boolean | `true` | Run @gap-analysis on each swarm after grouping |
| `--min-swarm-size` | 1-10 | `2` | Minimum PRDs per swarm (smaller swarms get merged) |
| `--strategy` | `balanced`, `complexity`, `dependency-depth` | `balanced` | How to distribute PRDs across swarms |
| `--visualize` | boolean | `false` | Generate Mermaid dependency graph visualization |
| `--emit-confidence` | boolean | `true` | Emit Epistemic Confidence artifact to .sigma/confidence/ |
| `--ralph-mode` | boolean | `false` | **NEW:** Convert PRDs to Ralph JSON backlog instead of folder structure |
| `--start-loop` | boolean | `false` | **NEW:** If ralph-mode, also start the sigma-ralph.sh loop |
| `--ralph-engine` | `auto`, `claude`, `opencode` | `auto` | **NEW:** Engine for Ralph loop (auto-detects) |
| `--orchestrate` | boolean | `false` | **NEW:** Generate multi-agent orchestration config for tmux streams |
| `--auto-launch` | boolean | `false` | **NEW:** If orchestrate, auto-launch tmux workspace |

### Strategy Options

| Strategy | Description | Best For |
|----------|-------------|----------|
| `balanced` | Distribute PRDs evenly by count | General use |
| `complexity` | Group by estimated complexity (Appetite) | Mixed complexity projects |
| `dependency-depth` | Group by dependency chain depth | Deep dependency trees |

---

## ⚡ Preflight (auto)

```typescript
// 1. Get date
const today = new Date().toISOString().split('T')[0];

// 2. Check for PRD directory
const prdDir = 'docs/prds/';
const prdDirExists = await fileExists(prdDir);
if (!prdDirExists) {
  throw new Error('No docs/prds/ directory found. Run Step 11 first.');
}

// 3. Scan for PRD files
const prdFiles = await glob('docs/prds/F*.md');
const flowPrdFiles = await glob('docs/prds/flows/**/*.md');
const allPrdFiles = [...prdFiles, ...flowPrdFiles];

// 4. Check for existing swarm structure
const existingSwarms = await glob('docs/prds/swarm-*/');

// 5. Load existing status
const statusFile = 'docs/prds/.prd-status.json';
const existingStatus = await readFile(statusFile).catch(() => '{}');

// 6. Display context
console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 STEP 11b: PRD SWARM ORCHESTRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: ${today}
PRDs Found: ${allPrdFiles.length}
Existing Swarms: ${existingSwarms.length > 0 ? existingSwarms.length : 'None'}
Status File: ${existingStatus !== '{}' ? 'Found' : 'Will create'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// 7. Validate minimum PRD count
if (allPrdFiles.length < 3) {
  console.log(`
⚠️  Only ${allPrdFiles.length} PRDs found. 
   Swarm orchestration is most useful with 5+ PRDs.
   
   Would you like to:
   [1] Continue anyway (will create minimal swarms)
   [2] Skip this step and implement sequentially
  `);
}
```

---

## 📋 Task Execution Flow

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 STEP 11b: PRD SWARM WORKFLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase A: Context Loading
  [ ] A1: Scan docs/prds/ for all PRD files
  [ ] A2: Load existing .prd-status.json
  [ ] A3: Check for existing swarm folders
  ⏸️  CHECKPOINT: Confirm PRD inventory

Phase B: Dependency Analysis
  [ ] B1: Parse SECTION 0 from each PRD
  [ ] B2: Extract dependency lists
  [ ] B3: Build dependency graph (DAG)
  [ ] B4: Detect circular dependencies
  [ ] B5: Calculate dependency depth per PRD
  ⏸️  CHECKPOINT: Review dependency graph

Phase C: Swarm Planning (Interactive)
  [ ] C1: Recommend terminal count based on graph
  [ ] C2: Ask user for terminal preference
  [ ] C3: Apply grouping algorithm
  [ ] C4: Balance swarms by strategy
  [ ] C5: Generate swarm assignments
  ⏸️  CHECKPOINT: Approve swarm assignments

Phase D: Swarm Execution
  [ ] D1: Create swarm subfolders
  [ ] D2: Move PRD files to swarms
  [ ] D3: Create per-swarm README
  [ ] D4: Generate SWARM-PLAN.md
  [ ] D5: Update .prd-status.json
  ⏸️  CHECKPOINT: Verify file moves

Phase E: Validation
  [ ] E1: Run @gap-analysis on each swarm (if enabled)
  [ ] E2: Verify no broken cross-references
  [ ] E3: Generate handoff summary
  ⏸️  FINAL: Ready for parallel implementation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔄 Phase A: Context Loading

### A1: Scan PRD Files

```typescript
interface PRDFile {
  id: string;           // e.g., "F01", "F02"
  filename: string;     // e.g., "F01-auth.md"
  path: string;         // e.g., "docs/prds/F01-auth.md"
  title: string;        // Extracted from # heading
  dependencies: string[]; // e.g., ["F00", "F03"]
  appetite: string;     // "Small Batch" or "Big Batch"
  priority: string;     // "P0", "P1", "P2", "P3"
  status: string;       // "pending", "in_progress", "complete"
}

async function scanPRDFiles(): Promise<PRDFile[]> {
  const prds: PRDFile[] = [];
  
  // Scan top-level PRDs
  const topLevelPrds = await glob('docs/prds/F*.md');
  
  // Scan flow-based PRDs (Step 5 structure)
  const flowPrds = await glob('docs/prds/flows/**/F*.md');
  const screenPrds = await glob('docs/prds/flows/**/*.md');
  
  // Combine and dedupe
  const allPrdPaths = [...new Set([...topLevelPrds, ...flowPrds, ...screenPrds])];
  
  for (const prdPath of allPrdPaths) {
    const content = await readFile(prdPath);
    const prd = parsePRDContent(content, prdPath);
    prds.push(prd);
  }
  
  return prds;
}
```

### A2: Load Existing Status

```typescript
interface PRDStatus {
  features: Record<string, {
    status: 'pending' | 'in_progress' | 'implemented' | 'verified';
    swarm?: number;
    lastUpdated?: string;
  }>;
  swarms?: {
    count: number;
    created: string;
    strategy: string;
  };
}

async function loadStatus(): Promise<PRDStatus> {
  try {
    const content = await readFile('docs/prds/.prd-status.json');
    return JSON.parse(content);
  } catch {
    return { features: {} };
  }
}
```

### A3: Check Existing Swarms

```typescript
async function checkExistingSwarms(): Promise<string[]> {
  const swarmFolders = await glob('docs/prds/swarm-*/');
  
  if (swarmFolders.length > 0) {
    console.log(`
⚠️  Existing swarm structure detected:
${swarmFolders.map(f => `   • ${f}`).join('\n')}

Options:
  [1] Keep existing swarms, add new PRDs only
  [2] Re-analyze and create new swarm structure
  [3] Cancel and keep current structure
    `);
  }
  
  return swarmFolders;
}
```

**CHECKPOINT A:** Display PRD inventory and ask for confirmation.

---

## 🔄 Phase B: Dependency Analysis

### B1-B2: Parse Section 0 Dependencies

```typescript
/**
 * Parse PRD content to extract Section 0 metadata
 * 
 * Expected format in PRD:
 * ## SECTION 0: SHAPE UP METADATA
 * | **Dependencies** | [F01, F03, F07] | Feature Dependencies |
 */
function parseDependencies(content: string): string[] {
  // Pattern 1: Table format from Section 0
  const tablePattern = /\|\s*\*\*Dependencies\*\*\s*\|\s*\[([^\]]*)\]/i;
  const tableMatch = content.match(tablePattern);
  
  if (tableMatch && tableMatch[1]) {
    // Parse comma-separated list: "F01, F03, F07"
    return tableMatch[1]
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);
  }
  
  // Pattern 2: Markdown list format
  const listPattern = /### Dependencies\s*\n((?:- [^\n]+\n?)+)/i;
  const listMatch = content.match(listPattern);
  
  if (listMatch) {
    return listMatch[1]
      .split('\n')
      .filter(line => line.startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(d => d.length > 0);
  }
  
  // Pattern 3: "Depends on:" inline
  const inlinePattern = /depends?\s*on[:\s]+\[?([^\]\n]+)\]?/i;
  const inlineMatch = content.match(inlinePattern);
  
  if (inlineMatch) {
    return inlineMatch[1]
      .split(/[,;]/)
      .map(d => d.trim())
      .filter(d => /^F\d+/.test(d)); // Only valid PRD IDs
  }
  
  // No dependencies found
  return [];
}

/**
 * Extract PRD ID from filename
 */
function extractPRDId(filename: string): string {
  // Match F01, F02, PRD-01, etc.
  const match = filename.match(/^(F\d+|PRD-\d+)/i);
  return match ? match[1].toUpperCase() : filename.replace('.md', '');
}

/**
 * Parse full PRD content
 */
function parsePRDContent(content: string, path: string): PRDFile {
  const filename = path.split('/').pop() || '';
  const id = extractPRDId(filename);
  
  // Extract title from first # heading
  const titleMatch = content.match(/^#\s+(?:PRD:\s*)?(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : id;
  
  // Extract appetite
  const appetiteMatch = content.match(/\|\s*\*\*Appetite\*\*\s*\|\s*([^|]+)/i);
  const appetite = appetiteMatch ? appetiteMatch[1].trim() : 'Unknown';
  
  // Extract priority
  const priorityMatch = content.match(/\|\s*\*\*Priority\*\*\s*\|\s*(P[0-3])/i);
  const priority = priorityMatch ? priorityMatch[1] : 'P2';
  
  // Extract dependencies
  const dependencies = parseDependencies(content);
  
  return {
    id,
    filename,
    path,
    title,
    dependencies,
    appetite,
    priority,
    status: 'pending',
  };
}
```

### B3: Build Dependency Graph

```typescript
interface DependencyGraph {
  nodes: Map<string, PRDFile>;
  edges: Map<string, string[]>;      // id -> dependencies
  reverseEdges: Map<string, string[]>; // id -> dependents (who depends on me)
}

function buildDependencyGraph(prds: PRDFile[]): DependencyGraph {
  const nodes = new Map<string, PRDFile>();
  const edges = new Map<string, string[]>();
  const reverseEdges = new Map<string, string[]>();
  
  // Add all nodes
  for (const prd of prds) {
    nodes.set(prd.id, prd);
    edges.set(prd.id, prd.dependencies);
    reverseEdges.set(prd.id, []);
  }
  
  // Build reverse edges (who depends on me)
  for (const prd of prds) {
    for (const depId of prd.dependencies) {
      const dependents = reverseEdges.get(depId) || [];
      dependents.push(prd.id);
      reverseEdges.set(depId, dependents);
    }
  }
  
  return { nodes, edges, reverseEdges };
}
```

### B4: Detect Circular Dependencies

```typescript
interface CycleDetectionResult {
  hasCycles: boolean;
  cycles: string[][];
}

function detectCycles(graph: DependencyGraph): CycleDetectionResult {
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const cycles: string[][] = [];
  
  function dfs(nodeId: string, path: string[]): boolean {
    visited.add(nodeId);
    recStack.add(nodeId);
    
    const deps = graph.edges.get(nodeId) || [];
    for (const depId of deps) {
      if (!graph.nodes.has(depId)) {
        // External dependency, skip
        continue;
      }
      
      if (!visited.has(depId)) {
        if (dfs(depId, [...path, depId])) {
          return true;
        }
      } else if (recStack.has(depId)) {
        // Found cycle
        const cycleStart = path.indexOf(depId);
        cycles.push(path.slice(cycleStart));
        return true;
      }
    }
    
    recStack.delete(nodeId);
    return false;
  }
  
  for (const nodeId of graph.nodes.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId, [nodeId]);
    }
  }
  
  return {
    hasCycles: cycles.length > 0,
    cycles,
  };
}
```

### B5: Calculate Dependency Depth

```typescript
function calculateDepthMap(graph: DependencyGraph): Map<string, number> {
  const depths = new Map<string, number>();
  
  function getDepth(nodeId: string, visited: Set<string> = new Set()): number {
    if (depths.has(nodeId)) {
      return depths.get(nodeId)!;
    }
    
    if (visited.has(nodeId)) {
      return 0; // Cycle, already handled
    }
    visited.add(nodeId);
    
    const deps = graph.edges.get(nodeId) || [];
    if (deps.length === 0) {
      depths.set(nodeId, 0);
      return 0;
    }
    
    const maxDepDepth = Math.max(
      ...deps
        .filter(d => graph.nodes.has(d))
        .map(d => getDepth(d, visited))
    );
    
    const depth = maxDepDepth + 1;
    depths.set(nodeId, depth);
    return depth;
  }
  
  for (const nodeId of graph.nodes.keys()) {
    getDepth(nodeId);
  }
  
  return depths;
}
```

**CHECKPOINT B:** Display dependency graph visualization and any issues.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DEPENDENCY ANALYSIS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRDs Analyzed: 72
Root PRDs (no deps): 8
Max Dependency Depth: 5
Circular Dependencies: None ✅

Dependency Chains:
  Chain 1: F01 → F05 → F12 → F18 (depth: 4)
  Chain 2: F02 → F08 → F15 (depth: 3)
  Chain 3: F03 → F09 (depth: 2)
  ... (5 more chains)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply `continue` to proceed with swarm planning.
```

---

## 🔄 Phase C: Swarm Planning (Interactive)

### C1: Recommend Terminal Count

```typescript
interface SwarmRecommendation {
  recommendedTerminals: number;
  reason: string;
  chainCount: number;
  avgChainLength: number;
}

function recommendTerminalCount(
  graph: DependencyGraph,
  depths: Map<string, number>
): SwarmRecommendation {
  // Find independent chains
  const chains = findIndependentChains(graph);
  const chainCount = chains.length;
  const avgChainLength = chains.reduce((a, c) => a + c.length, 0) / chainCount;
  
  // Recommendation logic
  let recommendedTerminals: number;
  let reason: string;
  
  if (chainCount <= 2) {
    recommendedTerminals = 2;
    reason = 'Only 2 independent chains detected';
  } else if (chainCount <= 4) {
    recommendedTerminals = chainCount;
    reason = `${chainCount} independent chains map directly to terminals`;
  } else if (chainCount <= 8) {
    recommendedTerminals = 4;
    reason = 'Multiple chains can be grouped into 4 balanced swarms';
  } else {
    recommendedTerminals = Math.min(6, Math.ceil(chainCount / 2));
    reason = `${chainCount} chains balanced across ${recommendedTerminals} terminals`;
  }
  
  return {
    recommendedTerminals,
    reason,
    chainCount,
    avgChainLength,
  };
}

function findIndependentChains(graph: DependencyGraph): string[][] {
  const chains: string[][] = [];
  const assigned = new Set<string>();
  
  // Find all root nodes (no dependencies within our set)
  const roots = [...graph.nodes.keys()].filter(id => {
    const deps = graph.edges.get(id) || [];
    return deps.filter(d => graph.nodes.has(d)).length === 0;
  });
  
  // Trace chains from each root
  for (const rootId of roots) {
    if (assigned.has(rootId)) continue;
    
    const chain: string[] = [];
    const queue = [rootId];
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (assigned.has(nodeId)) continue;
      
      assigned.add(nodeId);
      chain.push(nodeId);
      
      // Add dependents (nodes that depend on this one)
      const dependents = graph.reverseEdges.get(nodeId) || [];
      for (const depId of dependents) {
        if (!assigned.has(depId)) {
          queue.push(depId);
        }
      }
    }
    
    if (chain.length > 0) {
      chains.push(chain);
    }
  }
  
  return chains;
}
```

### C2: Interactive Terminal Selection

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 SWARM PLANNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on your PRD structure, I recommend:
  → 4 terminals (8 chains balanced across swarms)

Reason: Multiple chains can be grouped into 4 balanced swarms

How many terminals do you want to use?

  [1] 2 terminals (larger batches, fewer context switches)
  [2] 3 terminals 
  [3] 4 terminals ⭐ RECOMMENDED
  [4] 5 terminals
  [5] 6 terminals (smaller batches, more parallelism)
  [C] Custom number (enter after selection)

Enter selection (1-5 or C):
```

### C3-C5: Apply Grouping Algorithm

```typescript
interface Swarm {
  id: number;
  name: string;
  prds: PRDFile[];
  executionOrder: string[]; // Topologically sorted
  totalAppetite: string;
  readyNow: string[];       // PRDs with no pending deps
  blocked: string[];        // PRDs waiting on deps
}

function createSwarms(
  graph: DependencyGraph,
  chains: string[][],
  terminalCount: number,
  strategy: 'balanced' | 'complexity' | 'dependency-depth'
): Swarm[] {
  const swarms: Swarm[] = [];
  
  // Initialize empty swarms
  for (let i = 0; i < terminalCount; i++) {
    swarms.push({
      id: i + 1,
      name: `swarm-${i + 1}`,
      prds: [],
      executionOrder: [],
      totalAppetite: '',
      readyNow: [],
      blocked: [],
    });
  }
  
  // Sort chains by strategy
  let sortedChains = [...chains];
  
  switch (strategy) {
    case 'complexity':
      // Sort by total appetite (Big Batch first)
      sortedChains.sort((a, b) => {
        const aComplexity = a.reduce((sum, id) => {
          const prd = graph.nodes.get(id);
          return sum + (prd?.appetite.includes('Big') ? 2 : 1);
        }, 0);
        const bComplexity = b.reduce((sum, id) => {
          const prd = graph.nodes.get(id);
          return sum + (prd?.appetite.includes('Big') ? 2 : 1);
        }, 0);
        return bComplexity - aComplexity;
      });
      break;
      
    case 'dependency-depth':
      // Sort by max depth (deepest first)
      sortedChains.sort((a, b) => b.length - a.length);
      break;
      
    case 'balanced':
    default:
      // Sort by length for balanced distribution
      sortedChains.sort((a, b) => b.length - a.length);
  }
  
  // Distribute chains to swarms (round-robin for balance)
  for (let i = 0; i < sortedChains.length; i++) {
    const chain = sortedChains[i];
    const swarmIndex = i % terminalCount;
    const swarm = swarms[swarmIndex];
    
    for (const prdId of chain) {
      const prd = graph.nodes.get(prdId);
      if (prd) {
        swarm.prds.push(prd);
      }
    }
  }
  
  // Generate execution order (topological sort within swarm)
  for (const swarm of swarms) {
    swarm.executionOrder = topologicalSort(swarm.prds, graph);
    swarm.readyNow = swarm.prds
      .filter(p => p.dependencies.length === 0)
      .map(p => p.id);
    swarm.blocked = swarm.prds
      .filter(p => p.dependencies.length > 0)
      .map(p => p.id);
  }
  
  return swarms;
}

function topologicalSort(prds: PRDFile[], graph: DependencyGraph): string[] {
  const prdIds = new Set(prds.map(p => p.id));
  const inDegree = new Map<string, number>();
  const result: string[] = [];
  
  // Calculate in-degree (within swarm)
  for (const prd of prds) {
    const depsInSwarm = prd.dependencies.filter(d => prdIds.has(d));
    inDegree.set(prd.id, depsInSwarm.length);
  }
  
  // Start with nodes that have no internal dependencies
  const queue = prds
    .filter(p => inDegree.get(p.id) === 0)
    .map(p => p.id);
  
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);
    
    // Reduce in-degree for dependents
    const dependents = graph.reverseEdges.get(nodeId) || [];
    for (const depId of dependents) {
      if (prdIds.has(depId)) {
        const newDegree = (inDegree.get(depId) || 0) - 1;
        inDegree.set(depId, newDegree);
        if (newDegree === 0) {
          queue.push(depId);
        }
      }
    }
  }
  
  return result;
}
```

**CHECKPOINT C:** Present swarm assignments for approval.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 PROPOSED SWARM ASSIGNMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SWARM 1 (18 PRDs) — Core Auth & User
─────────────────────────────────────
Ready now:
  • F01-auth.md
  • F02-signup.md
  
Execute after F01:
  • F05-user-profile.md
  • F12-settings.md
  • F18-preferences.md
  
[...]

SWARM 2 (16 PRDs) — Dashboard & Charts
─────────────────────────────────────
Ready now:
  • F03-dashboard-layout.md
  
Execute after F03:
  • F08-charts.md
  • F15-data-grid.md

[...]

SWARM 3 (19 PRDs) — Backend Services
─────────────────────────────────────
[...]

SWARM 4 (19 PRDs) — Integrations
─────────────────────────────────────
[...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 72 PRDs across 4 swarms

Reply `approve` to create swarm folders
Reply `adjust: [feedback]` to modify assignments
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔄 Phase D: Swarm Execution

### D1-D2: Create Folders and Move Files

```typescript
async function executeSwarmPlan(
  swarms: Swarm[],
  dryRun: boolean
): Promise<void> {
  const prdBase = 'docs/prds/';
  
  for (const swarm of swarms) {
    const swarmDir = `${prdBase}${swarm.name}/`;
    
    if (dryRun) {
      console.log(`[DRY RUN] Would create: ${swarmDir}`);
      for (const prd of swarm.prds) {
        console.log(`[DRY RUN] Would move: ${prd.path} → ${swarmDir}${prd.filename}`);
      }
      continue;
    }
    
    // Create swarm directory
    await run_terminal_cmd(`mkdir -p "${swarmDir}"`);
    
    // Move PRD files
    for (const prd of swarm.prds) {
      const newPath = `${swarmDir}${prd.filename}`;
      await run_terminal_cmd(`mv "${prd.path}" "${newPath}"`);
      
      // Update path in memory
      prd.path = newPath;
    }
  }
}
```

### D3: Create Per-Swarm README

```typescript
async function createSwarmReadme(swarm: Swarm): Promise<void> {
  const content = `# ${swarm.name.toUpperCase()} — Execution Guide

**Generated:** ${new Date().toISOString().split('T')[0]}
**PRDs:** ${swarm.prds.length}
**Terminal:** ${swarm.id}

---

## Execution Order

Execute these PRDs in order. Each PRD's dependencies must be complete before starting.

| # | PRD ID | Title | Dependencies | Status |
|---|--------|-------|--------------|--------|
${swarm.executionOrder.map((id, i) => {
  const prd = swarm.prds.find(p => p.id === id)!;
  const deps = prd.dependencies.length > 0 ? prd.dependencies.join(', ') : 'None';
  return `| ${i + 1} | ${id} | ${prd.title} | ${deps} | ⬜ |`;
}).join('\n')}

---

## Quick Start

\`\`\`bash
# Implement this swarm
@implement-prd --swarm=${swarm.id}

# Or implement PRDs individually in order
${swarm.executionOrder.slice(0, 3).map(id => `@implement-prd --prd-id=${id}`).join('\n')}
\`\`\`

---

## Ready Now (No Dependencies)

${swarm.readyNow.length > 0 
  ? swarm.readyNow.map(id => `- ${id}`).join('\n')
  : '- None (all have dependencies)'}

## Blocked (Waiting on Dependencies)

${swarm.blocked.length > 0
  ? swarm.blocked.map(id => {
      const prd = swarm.prds.find(p => p.id === id)!;
      return `- ${id} (waiting on: ${prd.dependencies.join(', ')})`;
    }).join('\n')
  : '- None'}

---

*This README is auto-generated by @step-11b-prd-swarm*
`;

  await write(`docs/prds/${swarm.name}/_SWARM-README.md`, content);
}
```

### D4: Generate SWARM-PLAN.md

```typescript
async function generateSwarmPlan(
  swarms: Swarm[],
  recommendation: SwarmRecommendation,
  strategy: string
): Promise<void> {
  const totalPrds = swarms.reduce((sum, s) => sum + s.prds.length, 0);
  const date = new Date().toISOString().split('T')[0];
  
  const content = `# PRD Swarm Plan

**Generated:** ${date}
**PRDs Analyzed:** ${totalPrds}
**Swarms Created:** ${swarms.length}
**Strategy:** ${strategy}

---

## Executive Summary

Your ${totalPrds} PRDs have been organized into ${swarms.length} parallel swarms.
Each swarm can be worked on in a separate terminal without dependency conflicts.

**Recommendation:** ${recommendation.reason}

---

## Terminal Assignments

| Terminal | Swarm | PRDs | Ready Now | Blocked |
|----------|-------|------|-----------|---------|
${swarms.map(s => 
  `| ${s.id} | ${s.name} | ${s.prds.length} | ${s.readyNow.length} | ${s.blocked.length} |`
).join('\n')}

---

## Swarm Details

${swarms.map(s => `
### ${s.name.toUpperCase()} (Terminal ${s.id})

**PRDs:** ${s.prds.length}
**Execution Order:**

${s.executionOrder.map((id, i) => {
  const prd = s.prds.find(p => p.id === id)!;
  return `${i + 1}. **${id}** — ${prd.title}`;
}).join('\n')}
`).join('\n')}

---

## Quick Start Commands

Open ${swarms.length} terminals and run:

\`\`\`bash
# Terminal 1
@implement-prd --swarm=1

# Terminal 2
@implement-prd --swarm=2

# Terminal 3
@implement-prd --swarm=3

# Terminal 4
@implement-prd --swarm=4
\`\`\`

Or use the standalone command in each terminal:

\`\`\`bash
# Any terminal
@prd-orchestrate --status
\`\`\`

---

## Cross-Swarm Dependencies

The following PRDs have dependencies in other swarms (coordinate carefully):

${findCrossSwarmDeps(swarms).map(dep => 
  `- **${dep.from}** (${dep.fromSwarm}) depends on **${dep.to}** (${dep.toSwarm})`
).join('\n') || '- None (all dependencies are within swarms) ✅'}

---

## Implementation Progress

Track progress by updating the status in each swarm's README or run:

\`\`\`bash
@status --prds
\`\`\`

---

*Generated by @step-11b-prd-swarm v1.0.0*
`;

  await write('docs/prds/SWARM-PLAN.md', content);
}

function findCrossSwarmDeps(swarms: Swarm[]): CrossDep[] {
  const crossDeps: CrossDep[] = [];
  const prdToSwarm = new Map<string, string>();
  
  // Map PRD IDs to swarm names
  for (const swarm of swarms) {
    for (const prd of swarm.prds) {
      prdToSwarm.set(prd.id, swarm.name);
    }
  }
  
  // Find cross-swarm dependencies
  for (const swarm of swarms) {
    for (const prd of swarm.prds) {
      for (const depId of prd.dependencies) {
        const depSwarm = prdToSwarm.get(depId);
        if (depSwarm && depSwarm !== swarm.name) {
          crossDeps.push({
            from: prd.id,
            fromSwarm: swarm.name,
            to: depId,
            toSwarm: depSwarm,
          });
        }
      }
    }
  }
  
  return crossDeps;
}
```

### D5: Update .prd-status.json

```typescript
async function updatePrdStatus(
  swarms: Swarm[],
  existingStatus: PRDStatus
): Promise<void> {
  const newStatus: PRDStatus = {
    features: { ...existingStatus.features },
    swarms: {
      count: swarms.length,
      created: new Date().toISOString(),
      strategy: 'balanced',
    },
  };
  
  for (const swarm of swarms) {
    for (const prd of swarm.prds) {
      newStatus.features[prd.id] = {
        ...(existingStatus.features[prd.id] || {}),
        status: existingStatus.features[prd.id]?.status || 'pending',
        swarm: swarm.id,
        lastUpdated: new Date().toISOString(),
      };
    }
  }
  
  await write(
    'docs/prds/.prd-status.json',
    JSON.stringify(newStatus, null, 2)
  );
}
```

**CHECKPOINT D:** Verify file moves completed successfully.

---

## 🔄 Phase E: Validation

### E1: Run @gap-analysis on Each Swarm (Optional)

```typescript
async function runGapAnalysis(swarms: Swarm[], enabled: boolean): Promise<void> {
  if (!enabled) {
    console.log('Skipping @gap-analysis (--run-gap-analysis=false)');
    return;
  }
  
  console.log('\n📊 Running gap analysis on each swarm...\n');
  
  for (const swarm of swarms) {
    console.log(`Analyzing ${swarm.name}...`);
    
    // Invoke @gap-analysis for each swarm
    // This performs post-implementation gap analysis with Epistemic Confidence
    console.log(`
  Run: @gap-analysis --spec=docs/prds/${swarm.name}/ --emit-confidence=true
    `);
    
    // The gap analysis will:
    // 1. Build requirements list from PRDs in swarm
    // 2. Create traceability matrix
    // 3. Identify implementation gaps
    // 4. Auto-fix where possible
    // 5. Emit Epistemic Confidence artifact
  }
  
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 GAP ANALYSIS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Check .sigma/confidence/ for Epistemic artifacts.
Run @status to see Gap Scores per swarm.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}
```

### E2-E3: Final Validation and Handoff

```typescript
async function validateAndGenerateHandoff(swarms: Swarm[]): Promise<void> {
  // Verify all files moved
  for (const swarm of swarms) {
    for (const prd of swarm.prds) {
      const exists = await fileExists(prd.path);
      if (!exists) {
        console.error(`❌ Missing file: ${prd.path}`);
      }
    }
  }
  
  // Generate handoff summary
  const totalPrds = swarms.reduce((sum, s) => sum + s.prds.length, 0);
  
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 STEP 11b COMPLETE — SWARM ORCHESTRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRDs Organized: ${totalPrds}
Swarms Created: ${swarms.length}

Folder Structure:
${swarms.map(s => `  📁 docs/prds/${s.name}/ (${s.prds.length} PRDs)`).join('\n')}
  📄 docs/prds/SWARM-PLAN.md

Next Steps:
  1. Open ${swarms.length} terminal windows
  2. Assign each terminal to a swarm
  3. Run: @implement-prd --swarm=N

Quick Start:
  Terminal 1: @implement-prd --swarm=1
  Terminal 2: @implement-prd --swarm=2
  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply \`approve\` to finalize or \`adjust\` to modify.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}
```

---

## ✅ Quality Gates

**Step 11b complete when:**

- [ ] All PRDs parsed with dependencies extracted
- [ ] No circular dependencies detected
- [ ] Swarms created with balanced distribution
- [ ] All PRD files moved to swarm folders
- [ ] Per-swarm README generated
- [ ] SWARM-PLAN.md created
- [ ] .prd-status.json updated with swarm assignments
- [ ] Human approved final structure

---

## 🚫 Final Review Gate

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 STEP 11b COMPLETE — PRD SWARM ORCHESTRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Swarms: ${swarms.length}
PRDs: ${totalPrds}

Created:
✅ docs/prds/swarm-1/ (${swarms[0].prds.length} PRDs)
✅ docs/prds/swarm-2/ (${swarms[1].prds.length} PRDs)
✅ docs/prds/swarm-3/ (${swarms[2].prds.length} PRDs)
✅ docs/prds/swarm-4/ (${swarms[3].prds.length} PRDs)
✅ docs/prds/SWARM-PLAN.md
✅ docs/prds/.prd-status.json (updated)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply `approve` to proceed to implementation
Reply `revise: [feedback]` to modify swarm structure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔗 Related Commands

| Command | Relationship |
|---------|--------------|
| `@step-11-prd-generation` | Prerequisite — creates PRDs to organize |
| `@prd-orchestrate` | Standalone alias for this step |
| `@implement-prd` | Next step — implements PRDs (supports --swarm) |
| `@status` | Shows swarm completion progress |
| `@gap-analysis` | Post-implementation gap analysis per swarm (with Epistemic Confidence) |

---

## 📝 Notes for @implement-prd

When proceeding to implementation with swarms:

1. **Use --swarm flag:**
   ```bash
   @implement-prd --swarm=1
   ```

2. **Respect execution order:**
   Each swarm's README lists PRDs in dependency order.

3. **Check cross-swarm deps:**
   Some PRDs may depend on work in other swarms.
   SWARM-PLAN.md lists these explicitly.

4. **Track progress:**
   Run `@status --prds` to see completion across all swarms.

---

## 🧠 Epistemic Confidence Gate (Tier 2)

**This is a Tier 2 (Analysis) command. Emits Swarm Score + Dependency Confidence.**

### Confidence Calculation

```typescript
interface SwarmConfidence {
  dependencyScore: number;    // 0-100: How well dependencies are satisfied
  balanceScore: number;       // 0-100: How balanced swarms are
  circularDepsScore: number;  // 0 or 100: Pass/fail for cycles
  crossSwarmScore: number;    // 0-100: Fewer cross-swarm deps = higher
  overallConfidence: number;  // Weighted average
}

function computeSwarmConfidence(
  swarms: Swarm[],
  graph: DependencyGraph,
  cycles: CycleDetectionResult
): SwarmConfidence {
  // Dependency score: all deps resolvable within swarm
  const totalDeps = swarms.flatMap(s => s.prds.flatMap(p => p.dependencies)).length;
  const resolvedDeps = swarms.flatMap(s => 
    s.prds.flatMap(p => p.dependencies.filter(d => 
      s.prds.some(sp => sp.id === d)
    ))
  ).length;
  const dependencyScore = totalDeps > 0 ? (resolvedDeps / totalDeps) * 100 : 100;
  
  // Balance score: how even are swarm sizes
  const sizes = swarms.map(s => s.prds.length);
  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  const maxDeviation = Math.max(...sizes.map(s => Math.abs(s - avgSize)));
  const balanceScore = Math.max(0, 100 - (maxDeviation / avgSize) * 100);
  
  // Circular deps: 0 if any, 100 if none
  const circularDepsScore = cycles.hasCycles ? 0 : 100;
  
  // Cross-swarm deps: fewer = better
  const crossDeps = findCrossSwarmDeps(swarms);
  const crossSwarmScore = Math.max(0, 100 - (crossDeps.length * 10));
  
  // Weighted average
  const overallConfidence = (
    dependencyScore * 0.3 +
    balanceScore * 0.2 +
    circularDepsScore * 0.3 +
    crossSwarmScore * 0.2
  );
  
  return {
    dependencyScore,
    balanceScore,
    circularDepsScore,
    crossSwarmScore,
    overallConfidence,
  };
}
```

### Emit Epistemic Artifact

After completing swarm orchestration, emit:

```markdown
<!-- EPISTEMIC-GATE-START -->
## Epistemic Confidence Report (PRD Swarm)

**Confidence:** [X]% [✅ | ⚠️ | ⛔]
**Computed:** [TIMESTAMP]
**Command:** @step-11b-prd-swarm
**Tier:** 2

### Swarm Analysis Summary
| Metric | Score | Status |
|--------|-------|--------|
| Dependency Resolution | [X]% | [✅/⚠️/⛔] |
| Swarm Balance | [X]% | [✅/⚠️/⛔] |
| Circular Dependencies | [X]% | [✅/⛔] |
| Cross-Swarm Dependencies | [X]% | [✅/⚠️/⛔] |
| **Overall Confidence** | **[X]%** | [✅/⚠️/⛔] |

### Swarm Distribution
| Swarm | PRDs | Ready | Blocked | Health |
|-------|------|-------|---------|--------|
| swarm-1 | [X] | [X] | [X] | [✅/⚠️] |
| swarm-2 | [X] | [X] | [X] | [✅/⚠️] |
| ... | ... | ... | ... | ... |

### Issues Detected
- **CIRCULAR:** [List or "None"]
- **CROSS-SWARM:** [List of cross-swarm dependencies]
- **UNBALANCED:** [List or "None"]

### Recommendations
- [Auto-generated based on scores]

### Integration Note
This Swarm Score feeds into the Epistemic Confidence system.
Run @status to see overall workflow confidence.
<!-- EPISTEMIC-GATE-END -->
```

### Save Confidence Artifact

```typescript
async function saveSwarmConfidenceArtifact(
  swarms: Swarm[],
  confidence: SwarmConfidence
): Promise<void> {
  const timestamp = new Date().toISOString();
  
  const artifact = {
    version: '1.0.0',
    command: '@step-11b-prd-swarm',
    timestamp,
    tier: 2,
    confidence: {
      overall: confidence.overallConfidence,
      dependency: confidence.dependencyScore,
      balance: confidence.balanceScore,
      circular: confidence.circularDepsScore,
      crossSwarm: confidence.crossSwarmScore,
      passed: confidence.overallConfidence >= 70,
    },
    swarms: swarms.map(s => ({
      id: s.id,
      name: s.name,
      prdCount: s.prds.length,
      readyNow: s.readyNow.length,
      blocked: s.blocked.length,
    })),
    issues: {
      circularDeps: [], // Populated if detected
      crossSwarmDeps: findCrossSwarmDeps(swarms),
      unbalanced: [], // Populated if detected
    },
  };
  
  // Ensure directory exists
  await run_terminal_cmd('mkdir -p .sigma/confidence');
  
  // Save artifact
  const filename = `.sigma/confidence/prd-swarm-${timestamp.split('T')[0]}.json`;
  await write(filename, JSON.stringify(artifact, null, 2));
  
  console.log(`\n📊 Epistemic artifact saved: ${filename}`);
  console.log(`   Swarm Confidence: ${Math.round(confidence.overallConfidence)}%`);
}
```

---

---

## 🚀 Orchestrate Mode (--orchestrate)

When `--orchestrate=true`, generate a multi-agent orchestration configuration instead of (or in addition to) the folder structure:

### Generate Orchestration Config

```typescript
async function generateOrchestrationConfig(
  swarms: Swarm[],
  graph: DependencyGraph,
  terminals: number
): Promise<void> {
  const configDir = '.sigma/orchestration';
  await run_terminal_cmd(`mkdir -p "${configDir}"`);
  
  // Map swarms to streams (A, B, C, D, etc.)
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const streams = swarms.slice(0, terminals).map((swarm, i) => ({
    name: letters[i],
    prds: swarm.executionOrder,
    worktree: `stream-${letters[i].toLowerCase()}`,
    description: `Swarm ${swarm.id}: ${swarm.prds.slice(0, 2).map(p => p.title).join(', ')}...`
  }));
  
  // Build dependency map
  const dependencies: Record<string, string[]> = {};
  for (const swarm of swarms) {
    for (const prd of swarm.prds) {
      const deps = prd.dependencies.filter(d => 
        !swarm.prds.some(sp => sp.id === d)
      );
      if (deps.length > 0) {
        dependencies[prd.id] = deps;
      }
    }
  }
  
  // Determine merge order based on dependency depth
  const mergeOrder = streams
    .map(s => ({
      name: s.name,
      maxDepth: Math.max(0, ...s.prds.map(p => depths.get(p) || 0))
    }))
    .sort((a, b) => a.maxDepth - b.maxDepth)
    .map(s => s.name);
  
  const config = {
    version: '1.0.0',
    created: new Date().toISOString(),
    session: 'sigma-orchestration',
    projectRoot: process.cwd(),
    streams,
    dependencies,
    merge_order: mergeOrder,
    settings: {
      mode: 'semi-auto',
      notify_on: ['prd_complete', 'blocked', 'crash', 'all_complete'],
      auto_merge: false,
      verify_stories: true
    },
    metadata: {
      total_prds: swarms.reduce((sum, s) => sum + s.prds.length, 0),
      generated_by: '@step-11b-prd-swarm --orchestrate',
      generated_at: new Date().toISOString()
    }
  };
  
  // Write config
  const configPath = `${configDir}/streams.json`;
  await write(configPath, JSON.stringify(config, null, 2));
  
  console.log(`\n✅ Orchestration config written: ${configPath}`);
  console.log(`   Streams: ${streams.length}`);
  console.log(`   Total PRDs: ${config.metadata.total_prds}`);
}
```

### Auto-Launch Workspace

When `--auto-launch=true` is also specified:

```typescript
async function autoLaunchOrchestration(terminals: number): Promise<void> {
  const spawnScript = './scripts/orchestrator/spawn-streams.sh';
  
  if (!(await fileExists(spawnScript))) {
    console.error('spawn-streams.sh not found. Run install first.');
    return;
  }
  
  console.log(`\n🚀 Launching tmux workspace with ${terminals} streams...\n`);
  
  await run_terminal_cmd(`chmod +x "${spawnScript}"`);
  await run_terminal_cmd(`"${spawnScript}" . ${terminals} --attach`);
}
```

### Orchestrate Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 ORCHESTRATION CONFIG GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Config: .sigma/orchestration/streams.json

Streams:
  Stream A: F001, F005 (Core Auth & User)
  Stream B: F002, F006 (Dashboard & Charts)
  Stream C: F003 (Backend Services)
  Stream D: F004 (Integrations)

Merge Order: A → C → D → B

Next Steps:
  1. Launch workspace:
     npx sigma-protocol orchestrate --streams=4
     
  Or manually:
     ./scripts/orchestrator/spawn-streams.sh . 4

  2. In ORCHESTRATOR pane:
     @orchestrate
     
  3. In each STREAM pane:
     @stream --name=A
     @stream --name=B
     ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📁 Shared PRDs (_shared/ folder)

When a PRD is depended upon by PRDs in multiple swarms, it goes to `_shared/`:

```typescript
async function identifySharedPRDs(
  swarms: Swarm[],
  graph: DependencyGraph
): Promise<string[]> {
  const sharedPrds: string[] = [];
  const prdToSwarms = new Map<string, Set<number>>();
  
  // Map each dependency to which swarms need it
  for (const swarm of swarms) {
    for (const prd of swarm.prds) {
      for (const depId of prd.dependencies) {
        const swarmSet = prdToSwarms.get(depId) || new Set();
        swarmSet.add(swarm.id);
        prdToSwarms.set(depId, swarmSet);
      }
    }
  }
  
  // PRDs needed by 2+ swarms are "shared"
  for (const [prdId, swarmSet] of prdToSwarms) {
    if (swarmSet.size >= 2) {
      sharedPrds.push(prdId);
    }
  }
  
  return sharedPrds;
}

// In Phase D, move shared PRDs to _shared/
async function handleSharedPRDs(
  sharedPrds: string[],
  graph: DependencyGraph
): Promise<void> {
  if (sharedPrds.length === 0) return;
  
  console.log(`\n📦 Moving ${sharedPrds.length} shared PRDs to _shared/...`);
  
  await run_terminal_cmd('mkdir -p docs/prds/_shared/');
  
  for (const prdId of sharedPrds) {
    const prd = graph.nodes.get(prdId);
    if (prd) {
      const newPath = `docs/prds/_shared/${prd.filename}`;
      await run_terminal_cmd(`mv "${prd.path}" "${newPath}"`);
      console.log(`  📄 ${prdId} → _shared/ (used by multiple swarms)`);
    }
  }
}
```

**Output Structure with Shared:**

```
docs/prds/
├── _shared/                  # PRDs used by multiple swarms
│   └── F00-core-utils.md
├── swarm-1/
│   └── ...
├── swarm-2/
│   └── ...
├── SWARM-PLAN.md
└── .prd-status.json
```

---

## 📊 Dependency Visualization (--visualize)

When `--visualize=true`, generate a Mermaid diagram:

```typescript
async function generateDependencyVisualization(
  graph: DependencyGraph,
  swarms: Swarm[]
): Promise<void> {
  let mermaid = '```mermaid\nflowchart TD\n';
  
  // Add subgraphs for each swarm
  for (const swarm of swarms) {
    mermaid += `  subgraph ${swarm.name}[🐝 ${swarm.name.toUpperCase()}]\n`;
    for (const prd of swarm.prds) {
      mermaid += `    ${prd.id}["${prd.id}<br/>${prd.title.slice(0, 20)}..."]\n`;
    }
    mermaid += `  end\n\n`;
  }
  
  // Add edges for dependencies
  for (const swarm of swarms) {
    for (const prd of swarm.prds) {
      for (const depId of prd.dependencies) {
        if (graph.nodes.has(depId)) {
          mermaid += `  ${depId} --> ${prd.id}\n`;
        }
      }
    }
  }
  
  mermaid += '```\n';
  
  // Save to SWARM-PLAN.md or separate file
  const vizPath = 'docs/prds/DEPENDENCY-GRAPH.md';
  await write(vizPath, `# PRD Dependency Graph\n\n${mermaid}`);
  
  console.log(`\n📊 Dependency visualization saved: ${vizPath}`);
}
```

---

<verification>
## Step 11b Verification Schema

### Required Files (25 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Swarm Plan | docs/prds/SWARM-PLAN.md | 1KB | 10 |
| At least 2 swarm folders | docs/prds/swarm-*/ | exists | 8 |
| Updated Status | docs/prds/.prd-status.json | 200B | 7 |

### Required Structure (25 points)

| Check | Description | Points |
|-------|-------------|--------|
| swarm_count | At least 2 swarm folders created | 10 |
| swarm_readme | Each swarm has _SWARM-README.md | 8 |
| prds_moved | All PRDs moved to swarm folders | 7 |

### Content Quality (30 points)

| Check | Description | Points |
|-------|-------------|--------|
| no_circular | No circular dependencies in graph | 10 |
| balanced_swarms | Swarms within 50% size of each other | 10 |
| execution_order | Each swarm has valid topological order | 10 |

### Integration (20 points)

| Check | Description | Points |
|-------|-------------|--------|
| status_updated | .prd-status.json has swarm field | 5 |
| plan_complete | SWARM-PLAN.md has all sections | 5 |
| confidence_emitted | .sigma/confidence/prd-swarm-*.json exists | 5 |
| shared_identified | _shared/ folder exists if multi-swarm deps | 5 |

</verification>


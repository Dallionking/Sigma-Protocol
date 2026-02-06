---
name: langgraph-patterns
description: Use when designing stateful multi-step AI workflows, implementing checkpointing for long-running tasks, or adding human-in-the-loop approval nodes
version: 1.0.0
tags: [langgraph, state-machine, workflow, checkpointing, human-in-the-loop, stateful]
triggers: [langgraph, state graph, checkpoint, human approval, workflow state, conditional branching, long-running]
user-invocable: false
---

# LangGraph Patterns: Stateful Multi-Actor AI Workflows

Design patterns for stateful AI workflows inspired by LangGraph. Use when tasks require persistent state across steps, checkpointing for recovery, or human approval gates.

## Overview

LangGraph patterns model AI workflows as state graphs with nodes (actions) and edges (transitions). The core principle: **explicit state enables reliability, recovery, and human oversight**.

Key insight: Most AI failures happen in multi-step workflows. Explicit state graphs make workflows debuggable, recoverable, and auditable.

## When to Use

**Use LangGraph patterns when:**
- Workflow has 5+ steps with complex transitions
- Failure recovery is critical (can't restart from scratch)
- Human approval required at specific points
- Workflow state must persist across sessions
- Conditional branching based on intermediate results

**Skip LangGraph patterns when:**
- Simple linear workflow (use sequential pipeline)
- No recovery requirements (acceptable to restart)
- Real-time streaming without pause points
- State fits in single context window

```
Steps > 5 AND (recovery needed OR human approval)?
    ├── YES → State graph with checkpointing
    └── NO → Simple pipeline or single agent
```

## State Graph Design Principles

### State Schema Design

Define explicit schema for workflow state. Every piece of information flows through state.

```typescript
interface WorkflowState {
  // Identity
  workflow_id: string;
  created_at: string;

  // Inputs (immutable after start)
  user_request: string;
  config: WorkflowConfig;

  // Progress tracking
  current_node: string;
  completed_nodes: string[];

  // Accumulated results
  research_findings: Finding[];
  draft_content: string;
  review_comments: Comment[];

  // Control flow
  approval_status: 'pending' | 'approved' | 'rejected';
  error: Error | null;
  retry_count: number;
}
```

### State Design Rules

| Rule | Description |
|------|-------------|
| **Explicit over implicit** | All data in state schema, no hidden state |
| **Immutable inputs** | Initial config never modified |
| **Append-only results** | Add to arrays, don't replace |
| **Clear ownership** | Each node owns specific state fields |
| **Serializable always** | State must serialize to JSON |

### Node Types

| Type | Purpose | Example |
|------|---------|---------|
| **Action Node** | Perform work, update state | Research, write, analyze |
| **Decision Node** | Route based on state | Branch on approval status |
| **Human Node** | Wait for human input | Approval gate, feedback |
| **Checkpoint Node** | Force state persistence | Before expensive operations |
| **Error Node** | Handle failures | Retry logic, fallback paths |

## Checkpointing Strategies

### Checkpoint Placement

Place checkpoints strategically to minimize lost work on failure.

```
START → Research → [CHECKPOINT] → Draft → [CHECKPOINT] → Review → END

Checkpoint triggers:
- After expensive operations (API calls, long computation)
- Before human approval gates
- At natural workflow phases
- Before operations that might fail
```

### Checkpoint Granularity

| Strategy | Checkpoint Frequency | Use When |
|----------|---------------------|----------|
| **Coarse** | After major phases | Fast workflow, cheap operations |
| **Fine** | After every node | Expensive operations, unreliable network |
| **Adaptive** | Based on operation cost | Mixed workload |

### Checkpoint Implementation

```typescript
interface CheckpointManager {
  // Save state at checkpoint
  save(workflow_id: string, state: WorkflowState): Promise<void>;

  // Load latest checkpoint
  load(workflow_id: string): Promise<WorkflowState | null>;

  // Resume from checkpoint
  resume(workflow_id: string): Promise<WorkflowState>;

  // List checkpoints for workflow
  list(workflow_id: string): Promise<CheckpointMetadata[]>;

  // Clean old checkpoints
  prune(workflow_id: string, keep_last: number): Promise<void>;
}
```

### Checkpoint Storage Options

| Storage | Durability | Speed | Use Case |
|---------|------------|-------|----------|
| **Memory** | None | Fast | Development, testing |
| **File** | Session | Medium | Single-machine workflows |
| **Database** | High | Medium | Production, multi-machine |
| **Cloud** | Highest | Slow | Mission-critical workflows |

## Human-in-the-Loop Nodes

### Approval Gate Pattern

Pause workflow for human decision.

```typescript
// Node definition
const approvalGate = {
  name: 'approval_gate',
  type: 'human',

  async enter(state: WorkflowState) {
    // Prepare approval request
    return {
      ...state,
      approval_status: 'pending',
      approval_request: {
        summary: state.draft_content.slice(0, 500),
        estimated_cost: calculateCost(state),
        deadline: addHours(new Date(), 24)
      }
    };
  },

  async resume(state: WorkflowState, human_input: HumanInput) {
    return {
      ...state,
      approval_status: human_input.approved ? 'approved' : 'rejected',
      approval_notes: human_input.notes
    };
  }
};
```

### Feedback Collection Pattern

Gather human input for improvement.

```typescript
const feedbackNode = {
  name: 'collect_feedback',
  type: 'human',

  async enter(state: WorkflowState) {
    return {
      ...state,
      feedback_request: {
        content: state.draft_content,
        questions: [
          "Is the tone appropriate?",
          "Any factual errors?",
          "Suggestions for improvement?"
        ]
      }
    };
  },

  async resume(state: WorkflowState, feedback: Feedback) {
    return {
      ...state,
      review_comments: [...state.review_comments, ...feedback.comments],
      revision_needed: feedback.needs_revision
    };
  }
};
```

### Human Node Best Practices

| Practice | Description |
|----------|-------------|
| **Clear context** | Provide all info human needs to decide |
| **Bounded options** | Offer specific choices, not open-ended |
| **Deadline aware** | Handle timeout, default action if no response |
| **Audit trail** | Record who approved, when, with what notes |
| **Resumable** | Workflow continues exactly where it paused |

## Conditional Branching Patterns

### Simple Branch

Route based on single condition.

```typescript
const simpleBranch = {
  name: 'check_approval',
  type: 'decision',

  evaluate(state: WorkflowState): string {
    if (state.approval_status === 'approved') {
      return 'proceed_to_publish';
    } else {
      return 'revise_draft';
    }
  }
};
```

### Multi-Branch

Route to multiple possible destinations.

```typescript
const multiBranch = {
  name: 'classify_request',
  type: 'decision',

  evaluate(state: WorkflowState): string {
    const classification = classifyRequest(state.user_request);

    switch (classification) {
      case 'simple': return 'quick_response';
      case 'research': return 'deep_research';
      case 'creative': return 'creative_generation';
      case 'technical': return 'code_analysis';
      default: return 'fallback_handler';
    }
  }
};
```

### Parallel Branch

Split into concurrent paths, merge results.

```typescript
const parallelBranch = {
  name: 'parallel_analysis',
  type: 'parallel',

  branches: ['security_check', 'performance_check', 'style_check'],

  merge(state: WorkflowState, results: BranchResult[]): WorkflowState {
    return {
      ...state,
      analysis_results: results.reduce((acc, r) => ({
        ...acc,
        [r.branch]: r.findings
      }), {})
    };
  }
};
```

### Loop Pattern

Repeat until condition met.

```typescript
const revisionLoop = {
  name: 'revision_loop',
  type: 'loop',

  condition(state: WorkflowState): boolean {
    return state.revision_needed && state.retry_count < 3;
  },

  body: ['revise_draft', 'review_draft'],

  onExit(state: WorkflowState): string {
    if (state.revision_needed) {
      return 'escalate_to_human';
    }
    return 'proceed_to_publish';
  }
};
```

## Error Recovery and Retries

### Error Classification

| Error Type | Recovery Strategy |
|------------|-------------------|
| **Transient** | Retry with backoff |
| **Input Error** | Return to human for correction |
| **Resource Error** | Wait and retry, or use fallback |
| **Logic Error** | Log, alert, manual intervention |
| **Timeout** | Checkpoint, notify, resume later |

### Retry Pattern

```typescript
const retryWrapper = {
  maxRetries: 3,
  backoffMs: [1000, 5000, 15000],

  async execute(node: Node, state: WorkflowState): Promise<WorkflowState> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await node.execute(state);
      } catch (error) {
        if (attempt === this.maxRetries) throw error;
        if (!isTransient(error)) throw error;

        await sleep(this.backoffMs[attempt]);
        state = { ...state, retry_count: state.retry_count + 1 };
      }
    }
  }
};
```

### Fallback Pattern

```typescript
const withFallback = {
  primary: 'expensive_api_call',
  fallback: 'cached_response',

  async execute(state: WorkflowState): Promise<WorkflowState> {
    try {
      return await this.primary.execute(state);
    } catch (error) {
      console.warn('Primary failed, using fallback', error);
      return await this.fallback.execute({
        ...state,
        used_fallback: true
      });
    }
  }
};
```

### Error Boundaries

```typescript
const errorBoundary = {
  name: 'safe_operation',

  async execute(state: WorkflowState): Promise<WorkflowState> {
    try {
      return await this.riskyOperation(state);
    } catch (error) {
      return {
        ...state,
        error: {
          message: error.message,
          node: this.name,
          timestamp: new Date().toISOString(),
          state_snapshot: state
        },
        current_node: 'error_handler'
      };
    }
  }
};
```

## Integration with External Tools

### Tool Node Pattern

```typescript
const toolNode = {
  name: 'web_search',
  type: 'tool',

  async execute(state: WorkflowState): Promise<WorkflowState> {
    const results = await webSearchTool.search(state.search_query);

    return {
      ...state,
      search_results: results,
      tools_used: [...state.tools_used, 'web_search']
    };
  },

  // Tool-specific error handling
  onError(error: Error, state: WorkflowState): WorkflowState {
    return {
      ...state,
      search_results: [],
      search_error: error.message
    };
  }
};
```

### Tool Orchestration

```typescript
const toolOrchestrator = {
  available_tools: ['web_search', 'code_execute', 'file_read'],

  async selectAndExecute(state: WorkflowState): Promise<WorkflowState> {
    const selected_tool = this.selectTool(state);

    if (!selected_tool) {
      return { ...state, current_node: 'synthesis' };
    }

    const tool_result = await this.executeTool(selected_tool, state);

    return {
      ...state,
      tool_results: [...state.tool_results, tool_result],
      current_node: 'tool_orchestrator' // Loop back for more tools
    };
  }
};
```

## Example Workflow Graph

### Research and Report Workflow

```typescript
const researchWorkflow = {
  name: 'research_report',

  nodes: {
    start: { next: 'gather_requirements' },

    gather_requirements: {
      type: 'action',
      execute: gatherRequirements,
      next: 'plan_research'
    },

    plan_research: {
      type: 'action',
      execute: planResearch,
      next: 'checkpoint_1'
    },

    checkpoint_1: {
      type: 'checkpoint',
      next: 'execute_research'
    },

    execute_research: {
      type: 'parallel',
      branches: ['web_search', 'paper_search', 'expert_interviews'],
      merge: mergeResearchResults,
      next: 'synthesize'
    },

    synthesize: {
      type: 'action',
      execute: synthesizeFindings,
      next: 'draft_report'
    },

    draft_report: {
      type: 'action',
      execute: draftReport,
      next: 'checkpoint_2'
    },

    checkpoint_2: {
      type: 'checkpoint',
      next: 'human_review'
    },

    human_review: {
      type: 'human',
      enter: prepareForReview,
      resume: processReview,
      next: 'review_decision'
    },

    review_decision: {
      type: 'decision',
      evaluate: (s) => s.revision_needed ? 'revise' : 'finalize',
      edges: { revise: 'revise_draft', finalize: 'finalize_report' }
    },

    revise_draft: {
      type: 'action',
      execute: reviseDraft,
      next: 'human_review'
    },

    finalize_report: {
      type: 'action',
      execute: finalizeReport,
      next: 'end'
    },

    end: { type: 'terminal' }
  }
};
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **God State** | State object too large, slow serialization | Split into focused state slices |
| **Hidden State** | State stored outside graph | All state in schema |
| **Checkpoint Spam** | Checkpoint after every action | Strategic placement only |
| **Infinite Loops** | No exit condition from retry | Max retry limits, timeout |
| **Sync Human Gates** | Blocking on human indefinitely | Timeout with default action |
| **Orphan Branches** | Parallel branches never merge | Always define merge point |

## Checklist

Before designing state graph:

- [ ] Workflow requires 5+ steps or complex branching
- [ ] Recovery requirements identified (what can we lose?)
- [ ] Human approval points mapped
- [ ] State schema designed with all needed fields
- [ ] Checkpoint strategy selected (coarse, fine, adaptive)

During implementation:

- [ ] Each node updates only owned state fields
- [ ] All branches have defined merge points
- [ ] Human nodes have timeout handling
- [ ] Error handlers at each failure point
- [ ] Checkpoints before expensive/risky operations

After deployment:

- [ ] Workflow resumes correctly from checkpoints
- [ ] Human nodes notify and resume properly
- [ ] Error recovery works as designed
- [ ] State serialization performs acceptably
- [ ] Audit trail captures all decisions

## Integration with Sigma Protocol

Cross-reference with:
- `@loki-mode` - Multi-agent orchestration patterns
- `@executing-plans` - Plan execution with checkpoints
- `@verification-before-completion` - Validation before proceeding
- `@memory-systems` - State persistence patterns

---

_Remember: State graphs trade simplicity for reliability. If your workflow is linear and failures are acceptable, a simple pipeline is cleaner. Use LangGraph patterns when you need the recovery, human oversight, or complex branching they provide._

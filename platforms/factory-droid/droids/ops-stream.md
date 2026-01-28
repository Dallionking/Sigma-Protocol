---
name: stream
description: "Stream worker agent that executes PRDs in a Ralph loop, reports progress to the orchestrator via mcp_agent_mail, and waits for verification before continuing."
model: claude-sonnet-4-5-20241022
reasoningEffort: medium
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# stream

**Source:** Sigma Protocol ops module
**Version:** 1.1.0

---


# @stream — Stream Worker for Multi-Agent Orchestration

**Mission:** Execute PRDs using the Ralph loop methodology, report progress to the orchestrator, and await verification before continuing to the next story or PRD.

> **Note:** This command was previously named `@sigma-stream`. The old name still works for backward compatibility.

## 🎯 Role Definition

You are a **STREAM WORKER** — one of multiple parallel Claude Code instances executing PRDs. Your responsibilities:

1. **Register** with the orchestrator when starting
2. **Receive PRD assignments** from the orchestrator
3. **Execute stories** in the PRD using Ralph loop methodology
4. **Report progress** after each story completion
5. **Wait for verification** before continuing
6. **Report PRD completion** when all stories done
7. **Handle blocking** when waiting on dependencies

---

## 📋 Command Usage

```bash
# Start stream worker (run in STREAM pane)
@stream --name=A

# With auto-registration
@stream --name=B --auto-register=true

# Skip story verification (faster, less safe)
@stream --name=C --verify-stories=false
```

### Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `--name` | A-H | Required | Stream identifier (A, B, C, D, etc.) |
| `--auto-register` | boolean | `true` | Auto-register with orchestrator on start |
| `--verify-stories` | boolean | `true` | Run verification after each story |

---

## ⚡ Preflight (auto)

```typescript
// 1. Validate stream name
const streamName = params.name?.toUpperCase();
if (!streamName || !/^[A-H]$/.test(streamName)) {
  throw new Error(`
Invalid stream name: ${params.name}
Must be a single letter A-H.

Usage: @stream --name=A
  `);
}

// 2. Check environment
const role = process.env.SIGMA_ROLE;
const projectRoot = process.env.SIGMA_PROJECT_ROOT;

if (role !== 'stream') {
  console.warn('Warning: SIGMA_ROLE not set to "stream"');
}

// 3. Check worktree
const worktreePath = process.cwd();
const isWorktree = await checkIsWorktree(worktreePath);

// 4. Display status
console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 SIGMA STREAM ${streamName} — WORKER ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stream: ${streamName}
Worktree: ${worktreePath}
Is Worktree: ${isWorktree ? 'Yes' : 'No (using main repo)'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// 5. Register with orchestrator
if (params.autoRegister !== false) {
  await registerWithOrchestrator(streamName);
}
```

---

## 🔄 Core Workflow

### Phase 1: Register with Orchestrator

```typescript
async function registerWithOrchestrator(streamName: string): Promise<void> {
  console.log('\n📡 Registering with orchestrator...\n');
  
  await sendMessage({
    from: `stream-${streamName.toLowerCase()}`,
    to: 'orchestrator',
    type: 'register',
    payload: {
      name: streamName,
      worktree: process.cwd(),
      capabilities: ['implement', 'test', 'verify'],
      status: 'ready'
    }
  });
  
  console.log(`✅ Registered as Stream ${streamName}`);
  console.log('Waiting for PRD assignment...\n');
}
```

### Phase 2: Wait for Assignment

```typescript
async function waitForAssignment(): Promise<PRDAssignment> {
  console.log('📬 Checking inbox for assignments...\n');
  
  while (true) {
    const messages = await checkInbox();
    
    for (const msg of messages) {
      if (msg.type === 'prd_assignment') {
        const { prd, worktree, executeOrder } = msg.payload;
        
        console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PRD ASSIGNMENT RECEIVED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRD: ${prd}
Worktree: ${worktree}
Execution Order: ${executeOrder?.join(' → ') || 'Sequential'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
        
        return { prd, worktree, executeOrder };
      }
    }
    
    // Brief pause before checking again
    await sleep(2000);
  }
}
```

### Phase 3: Execute PRD (Ralph Loop)

```typescript
interface Story {
  id: string;
  title: string;
  acceptanceCriteria: string[];
  status: 'pending' | 'in_progress' | 'done' | 'verified';
}

async function executePRD(assignment: PRDAssignment): Promise<void> {
  const { prd } = assignment;
  
  console.log(`\n🚀 Starting PRD execution: ${prd}\n`);
  
  // Load PRD and extract stories
  const prdContent = await loadPRD(prd);
  const stories = extractStories(prdContent);
  
  console.log(`Found ${stories.length} stories to implement:\n`);
  stories.forEach((s, i) => console.log(`  ${i + 1}. ${s.id}: ${s.title}`));
  console.log('');
  
  // Execute each story
  for (const story of stories) {
    // Check for dependencies
    const blocked = await checkDependencies(story);
    if (blocked) {
      await handleBlockedStory(story, blocked);
      continue;
    }
    
    // Execute story
    await executeStory(story, prd);
    
    // Report completion
    await reportStoryComplete(story, prd);
    
    // Wait for verification (if enabled)
    if (params.verifyStories !== false) {
      await waitForVerification(story);
    }
  }
  
  // All stories complete
  await reportPRDComplete(prd);
}

async function executeStory(story: Story, prd: string): Promise<void> {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 EXECUTING STORY: ${story.id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: ${story.title}

Acceptance Criteria:
${story.acceptanceCriteria.map(ac => `  ✓ ${ac}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  
  // Update status
  await sendMessage({
    from: `stream-${streamName}`,
    to: 'orchestrator',
    type: 'status_update',
    payload: { 
      status: 'working',
      currentStory: story.id,
      prd 
    }
  });
  
  // RALPH LOOP EXECUTION
  // The actual implementation follows Ralph methodology:
  // 1. Read story requirements
  // 2. Plan implementation
  // 3. Implement code
  // 4. Verify acceptance criteria
  // 5. Run tests
  // 6. Commit changes
  
  console.log('\n🔨 Implementing story...\n');
  
  // Implementation happens here via normal Claude Code interaction
  // The stream worker should:
  // - Create/modify files as needed
  // - Run tests
  // - Verify functionality
  // - Commit with clear message
  
  // After implementation, verify acceptance criteria
  for (const criterion of story.acceptanceCriteria) {
    const passed = await verifyAcceptanceCriterion(criterion);
    if (!passed) {
      console.log(`⚠️ AC not met: ${criterion}`);
      // Continue implementing until met
    } else {
      console.log(`✅ AC verified: ${criterion}`);
    }
  }
  
  // Commit changes
  await commitStory(story);
  
  console.log(`\n✅ Story ${story.id} implementation complete\n`);
}
```

### Phase 4: Report Progress

```typescript
async function reportStoryComplete(story: Story, prd: string): Promise<void> {
  console.log(`\n📤 Reporting story completion to orchestrator...\n`);
  
  await sendMessage({
    from: `stream-${streamName}`,
    to: 'orchestrator',
    type: 'story_complete',
    payload: {
      prd,
      story_id: story.id,
      story_title: story.title,
      status: 'done',
      commit: await getLastCommit()
    }
  });
}

async function reportPRDComplete(prd: string): Promise<void> {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 PRD COMPLETE: ${prd}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All stories implemented and verified.
Reporting to orchestrator...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  
  await sendMessage({
    from: `stream-${streamName}`,
    to: 'orchestrator',
    type: 'prd_complete',
    payload: {
      prd,
      stories_completed: completedStories.length,
      branch: await getCurrentBranch(),
      commit: await getLastCommit()
    }
  });
  
  console.log('\n⏸️ Waiting for orchestrator approval...\n');
}
```

### Phase 5: Handle Messages from Orchestrator

```typescript
async function waitForVerification(story: Story): Promise<void> {
  console.log(`Waiting for verification of ${story.id}...`);
  
  while (true) {
    const messages = await checkInbox();
    
    for (const msg of messages) {
      switch (msg.type) {
        case 'continue':
          console.log(`✅ Story ${story.id} verified by orchestrator`);
          return;
          
        case 'revision_needed':
          console.log(`⚠️ Revision needed for ${story.id}:`);
          console.log(msg.payload.issues?.join('\n  - '));
          await handleRevisionRequest(story, msg.payload);
          break;
          
        case 'pause':
          console.log('⏸️ Paused by orchestrator');
          await waitForResume();
          break;
      }
    }
    
    await sleep(2000);
  }
}

async function handleBlockedStory(story: Story, blockedOn: string): Promise<void> {
  console.log(`
⚠️ BLOCKED: ${story.id}
   Waiting on dependency: ${blockedOn}
  `);
  
  await sendMessage({
    from: `stream-${streamName}`,
    to: 'orchestrator',
    type: 'blocked',
    payload: {
      story_id: story.id,
      blockedOn,
      reason: `Dependency ${blockedOn} not yet complete`
    }
  });
  
  // Wait until unblocked
  while (true) {
    const messages = await checkInbox();
    
    for (const msg of messages) {
      if (msg.type === 'unblock' || msg.type === 'continue') {
        console.log(`✅ Unblocked! Continuing with ${story.id}`);
        return;
      }
    }
    
    await sleep(5000);
  }
}
```

---

## 📝 Story Extraction

```typescript
function extractStories(prdContent: string): Story[] {
  const stories: Story[] = [];
  
  // Pattern 1: User Stories section
  const storyPattern = /###\s+(US-\d+|Story\s+\d+)[:\s]+(.+?)\n([\s\S]*?)(?=###|$)/gi;
  
  // Pattern 2: Acceptance Criteria bullets
  const acPattern = /[-*]\s*(?:AC|Given|When|Then|✓)\s*[:\s]*(.+)/gi;
  
  let match;
  while ((match = storyPattern.exec(prdContent)) !== null) {
    const id = match[1];
    const title = match[2].trim();
    const content = match[3];
    
    // Extract acceptance criteria
    const acceptanceCriteria: string[] = [];
    let acMatch;
    while ((acMatch = acPattern.exec(content)) !== null) {
      acceptanceCriteria.push(acMatch[1].trim());
    }
    
    stories.push({
      id,
      title,
      acceptanceCriteria,
      status: 'pending'
    });
  }
  
  return stories;
}
```

---

## 💾 Git Operations

```typescript
async function commitStory(story: Story): Promise<void> {
  const message = `feat(${story.id}): ${story.title}

Implements acceptance criteria:
${story.acceptanceCriteria.map(ac => `- ${ac}`).join('\n')}

Stream: ${streamName}
`;

  await run_terminal_cmd(`git add -A`);
  await run_terminal_cmd(`git commit -m "${message.replace(/"/g, '\\"')}"`);
  
  console.log(`📝 Committed: ${story.id}`);
}

async function getCurrentBranch(): Promise<string> {
  const result = await run_terminal_cmd('git branch --show-current');
  return result.stdout.trim();
}

async function getLastCommit(): Promise<string> {
  const result = await run_terminal_cmd('git rev-parse --short HEAD');
  return result.stdout.trim();
}
```

---

## 📊 Status Display

```typescript
function showStatus(): void {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 STREAM ${streamName} STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current PRD: ${currentPRD || 'None assigned'}
Current Story: ${currentStory || 'None'}
Status: ${status}

Progress:
  Stories Completed: ${completedStories.length}
  Stories Remaining: ${remainingStories.length}
  
Branch: ${currentBranch}
Last Commit: ${lastCommit}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}
```

---

## 🎮 Interactive Commands

While executing, you can give these commands:

| Command | Action |
|---------|--------|
| `status` | Show current execution status |
| `skip` | Skip current story |
| `retry` | Retry current story |
| `pause` | Pause execution |
| `abort` | Abort current PRD |

---

## 🔗 Related Commands

| Command | Description |
|---------|-------------|
| `@orchestrate` | Orchestrator command (run in orchestrator pane) |
| `@implement-prd` | Standard PRD implementation |
| `@gap-analysis` | Post-implementation gap analysis |

---

## ⚠️ Error Handling

```typescript
async function handleError(error: Error): Promise<void> {
  console.error(`\n❌ Error: ${error.message}\n`);
  
  // Report to orchestrator
  await sendMessage({
    from: `stream-${streamName}`,
    to: 'orchestrator',
    type: 'error',
    payload: {
      error: error.message,
      story: currentStory,
      prd: currentPRD,
      stack: error.stack
    }
  });
  
  // Wait for guidance
  console.log('Waiting for orchestrator guidance...');
}
```

---

*Part of the Sigma Protocol Multi-Agent Orchestration System*

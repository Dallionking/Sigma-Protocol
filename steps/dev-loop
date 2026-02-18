---
version: "4.0.0"
last_updated: "2025-12-29"
changelog:
  - "4.0.0: Added Active Task Memory (.sigma/memory/active_task.md) for loop resume support across sessions"
  - "3.0.0: Added Grade 4 Agentic Layer - auto-fix via @gap-analysis when verification fails, uses .sigma/tools/ for project verification"
  - "2.0.0: Updated for 13-step workflow, references Step 11 PRDs"
description: "Master orchestrator - automatically implements all PRDs from Step 11 in sequence with self-correcting verification loops"
allowed-tools:
  - read_file
  - write
  - list_dir
  - run_terminal_cmd
  - todo_write
parameters:
  - --from
  - --to
  - --auto-commit
  - --stop-on-failure
---

# @dev-loop

**Master Development Loop - Your "Perfect World" Automation**

## 🎯 Purpose

This is the **ultimate automation** you requested: give it PRDs from Step 11, and it automatically implements them all with verification loops.

**Your perfect workflow:**
```bash
# Steps 1-11: Planning phase
@step-1-ideation → @step-2-architecture → @step-3-ux-design → @step-4-flow-tree → @step-5-wireframe-prototypes → @step-6-design-system → ... → @step-11-prd-generation

# Development phase: ONE COMMAND
@dev-loop --from=F01 --to=F15

# Internally for EACH PRD:
# - @implement-prd (scaffold, code gen, tests)
# - @verify-prd (11-phase validation)
# - Fix gaps (loop until verified)
# - Commit changes
# - Next PRD

# Result: All features implemented, tested, verified, committed ✨
```

<goal>
You are the **Master Development Loop Orchestrator**. Execute ALL steps in order for each PRD.
CRITICAL: Do NOT skip any step. Do NOT combine steps.
Each step ends with a STOP marker — halt and wait for user approval before proceeding.

Phase Roadmap:
| Phase | Name | Key Output |
|-------|------|------------|
| Init | Initialize Loop | Load PRDs, check dependencies, create TODO list, init active task memory |
| 1.5 | Bulletproof Verification | Verify Steps 4/5 traceability gates before processing |
| Per-PRD.1 | Implementation | `@implement-prd` — scaffold, code gen, tests |
| Per-PRD.2 | Manual Review | Present implementation for user review (HITL) |
| Per-PRD.3 | Verification Loop | `@verify-prd` + auto-fix via `@gap-analysis` (Grade 4) |
| Per-PRD.4 | Commit | Git commit, update PRD status, update active task |
| Final | Final Report | `DEV-LOOP-[DATE].md` with statistics and recommendations |

Final Outputs: All PRDs implemented, tested, verified, committed; `DEV-LOOP-[DATE].md` report; updated `.prd-status.json`
Quality gate: All PRDs in range pass `@verify-prd`
</goal>

---

## 📋 Command Usage

```bash
# Implement ALL PRDs sequentially
@dev-loop

# Implement specific range
@dev-loop --from=F01 --to=F05

# Auto-commit after each verified PRD
@dev-loop --from=F01 --to=F10 --auto-commit

# Stop on first failure (don't continue)
@dev-loop --from=F01 --to=F10 --stop-on-failure
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--from` | Start PRD ID (e.g., F01, F01-database) | First PRD |
| `--to` | End PRD ID (e.g., F15, F15-integration) | Last PRD |
| `--auto-commit` | Automatically commit after each verified PRD | `false` |
| `--stop-on-failure` | Stop loop on first failure | `false` |

---

## 📁 File Management (CRITICAL)

**File Strategy**: Updates PRD status tracking + creates loop report

**Output**: 
- Updates `/docs/prds/.prd-status.json`
- Creates `/docs/development/DEV-LOOP-[DATE].md`
- Updates `.sigma/memory/active_task.md` (Agentic Layer)

**Manifest**: `updateManifest('@dev-loop', reportPath, 'append-dated')`

---

## 🧠 Active Task Memory (Agentic Layer)

The dev-loop maintains state in `.sigma/memory/active_task.md` for multi-session continuity.

### Active Task Integration

```typescript
// Initialize active task at loop start
async function initDevLoopActiveTask(prds: PRD[]): Promise<void> {
  const memoryDir = '.sigma/memory';
  await mkdir(memoryDir, { recursive: true });
  
  const content = `# Active Task

## PRD
dev-loop: ${prds[0].id} to ${prds[prds.length - 1].id}

## Phase
implementing

## Completed Steps
${/* Updated as PRDs complete */}

## Pending Steps
${prds.map(p => `- [ ] ${p.id}: ${p.name}`).join('\n')}

## Blockers
- None

## Last Updated
${new Date().toISOString()}
`;
  
  await writeFile(`${memoryDir}/active_task.md`, content);
  console.log('📝 Active task memory initialized');
}

// Update after each PRD
async function updateDevLoopActiveTask(completedPrd: string, status: 'verified' | 'failed' | 'skipped'): Promise<void> {
  const memoryPath = '.sigma/memory/active_task.md';
  
  if (await fileExists(memoryPath)) {
    const content = await readFile(memoryPath);
    
    // Mark PRD as complete in the task list
    const updatedContent = content
      .replace(`- [ ] ${completedPrd}`, `- [x] ${completedPrd} (${status})`)
      .replace(/## Last Updated\n.*/, `## Last Updated\n${new Date().toISOString()}`);
    
    await writeFile(memoryPath, updatedContent);
  }
}

// Read active task on resume
async function readDevLoopActiveTask(): Promise<{ pendingPrds: string[], lastPrd: string } | null> {
  const memoryPath = '.sigma/memory/active_task.md';
  
  try {
    if (await fileExists(memoryPath)) {
      const content = await readFile(memoryPath);
      
      // Check if this is a dev-loop task
      if (content.includes('dev-loop:')) {
        // Extract pending PRDs
        const pendingMatches = content.match(/- \[ \] (F\d+[^:]*)/g) || [];
        const pendingPrds = pendingMatches.map(m => m.replace('- [ ] ', '').split(':')[0]);
        
        // Find last completed PRD
        const completedMatches = content.match(/- \[x\] (F\d+[^:]*)/g) || [];
        const lastCompleted = completedMatches.length > 0 
          ? completedMatches[completedMatches.length - 1].replace('- [x] ', '').split(' ')[0]
          : null;
        
        return {
          pendingPrds,
          lastPrd: lastCompleted,
        };
      }
    }
  } catch {
    return null;
  }
  
  return null;
}

// Clear active task when loop completes
async function completeDevLoopActiveTask(): Promise<void> {
  const memoryPath = '.sigma/memory/active_task.md';
  
  if (await fileExists(memoryPath)) {
    const content = await readFile(memoryPath);
    
    if (content.includes('dev-loop:')) {
      const updatedContent = content
        .replace('## Phase\nimplementing', '## Phase\ncomplete')
        .replace(/## Last Updated\n.*/, `## Last Updated\n${new Date().toISOString()}`);
      
      await writeFile(memoryPath, updatedContent);
      console.log('✅ Dev loop active task marked complete');
    }
  }
}
```

### Resume Support

The active task memory enables resuming a dev-loop after context window resets or session interruptions:

```typescript
// At loop start, check for existing active task
const existingTask = await readDevLoopActiveTask();

if (existingTask && existingTask.pendingPrds.length > 0) {
  console.log(`
🧠 Existing Dev Loop Found
━━━━━━━━━━━━━━━━━━━━━━━━━
Last completed: ${existingTask.lastPrd || 'None'}
Pending PRDs: ${existingTask.pendingPrds.length}
━━━━━━━━━━━━━━━━━━━━━━━━━

The dev loop was interrupted. Resume from where you left off?
`);

  const resume = await prompt('Resume previous loop? (yes/no): ');
  if (resume === 'yes') {
    // Skip to first pending PRD
    fromPrd = existingTask.pendingPrds[0];
    console.log(`📍 Resuming from ${fromPrd}`);
  }
}
```

---

## 🔄 The Development Loop

### **Overview**

```
┌─────────────────────────────────────────┐
│  Step 11: PRD Generation                │
│  Creates F01-F15 PRDs                   │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  @dev-loop START                        │
│  - Load all PRDs                        │
│  - Check dependencies                   │
│  - Create TODO list                     │
└─────────────┬───────────────────────────┘
              │
              ▼
      ┌───────────────┐
      │  FOR EACH PRD │
      └───────┬───────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Phase 1: Implementation                │
│  @implement-prd --prd-id=${id}          │
│  - Parse PRD                            │
│  - Check dependencies                   │
│  - Scaffold files                       │
│  - Generate code                        │
│  - Apply design system                  │
│  - Create tests                         │
│  - Initial validation                   │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Phase 2: Manual Review                 │
│  - Present implementation               │
│  - User reviews code                    │
│  - User tests in browser                │
│  ❓ Ready for verification?             │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Phase 3: Verification                  │
│  @verify-prd --prd-id=${id}             │
│  - 11-phase gap analysis                │
│  - Security audit                       │
│  - Database verification                │
│  - UI testing (browser agent)           │
│  - Performance check                    │
│  - Brutal honesty check                 │
└─────────────┬───────────────────────────┘
              │
              ▼
        ┌─────────┐
        │ PASS?   │
        └────┬────┘
             │
      ┌──────┴──────┐
      │             │
     YES           NO
      │             │
      │             ▼
      │    ┌────────────────────────┐
      │    │  🔧 AUTO-FIX (Grade 4) │
      │    │  @gap-analysis --fix   │
      │    │  .sigma/tools/* verify   │
      │    │  Loop back until pass  │
      │    │  or exhausted          │
      │    └────────┬───────────────┘
      │             │
      │             ▼
      │    ┌────────────────────────┐
      │    │  Still failing?        │
      │    │  HITL: Manual fix      │
      │    │  (only after auto-fix) │
      │    └────────┬───────────────┘
      │             │
      │             └────────┐
      │                      │
      ▼                      │
┌─────────────────────────────────────────┐
│  Phase 4: Commit                        │
│  - git add -A                           │
│  - git commit -m "feat: ${prdId}"       │
│  - Mark PRD as complete                 │
│  - Update status                        │
└─────────────┬───────────────────────────┘
              │
              ▼
        ┌──────────┐
        │ More     │
        │ PRDs?    │
        └────┬─────┘
             │
      ┌──────┴──────┐
      │             │
     YES           NO
      │             │
      └──────┐      │
             │      ▼
             │  ┌─────────────────────┐
             │  │  @dev-loop COMPLETE │
             │  │  - Final report     │
             │  │  - Statistics       │
             │  └─────────────────────┘
             │
             └─► Next PRD
```

---

## 📊 Loop Execution Details

### **Step 1: Initialize Loop**

```typescript
// Read all PRDs
const prdFiles = await glob('/docs/prds/F*.md');
const prds = prdFiles.map(parsePRDFile).sort(byPRDNumber);

// Filter by --from and --to
const filteredPRDs = prds.filter(prd => {
  const num = extractPRDNumber(prd.id);
  return num >= fromNum && num <= toNum;
});

// Load PRD status
const status = await loadPRDStatus();

// Create master TODO list
const todos = filteredPRDs.map(prd => ({
  id: prd.id,
  content: `Implement and verify ${prd.id}: ${prd.name}`,
  status: status[prd.id]?.status || 'pending',
  dependencies: prd.dependencies,
}));

await todo_write({ merge: false, todos });
```

---

### **Step 1.5: Bulletproof Verification (Before Processing PRDs)**

Before processing any PRDs, verify the bulletproof gates from Steps 4 and 5 passed:

```typescript
// Bulletproof Gate Check
const traceabilityMatrix = await fileExists('/docs/flows/TRACEABILITY-MATRIX.md');
const zeroOmissionCert = await fileExists('/docs/flows/ZERO-OMISSION-CERTIFICATE.md');
const wireframeTracker = await fileExists('/docs/prds/flows/WIREFRAME-TRACKER.md');

if (!traceabilityMatrix || !zeroOmissionCert) {
  console.error(`
❌ BULLETPROOF GATE FAILED

Missing required verification artifacts:
${!traceabilityMatrix ? '  ❌ /docs/flows/TRACEABILITY-MATRIX.md (Step 4)' : '  ✅ /docs/flows/TRACEABILITY-MATRIX.md'}
${!zeroOmissionCert ? '  ❌ /docs/flows/ZERO-OMISSION-CERTIFICATE.md (Step 4/5)' : '  ✅ /docs/flows/ZERO-OMISSION-CERTIFICATE.md'}
${!wireframeTracker ? '  ⚠️  /docs/prds/flows/WIREFRAME-TRACKER.md (Step 5 - optional)' : '  ✅ /docs/prds/flows/WIREFRAME-TRACKER.md'}

These artifacts prove that NO screens were missed during flow design (Step 4)
and wireframe creation (Step 5).

ACTION REQUIRED:
1. Run @step-4-flow-tree to create the traceability matrix
2. Run @step-5-wireframe-prototypes to complete wireframes and certificate
3. Then re-run @dev-loop

Proceeding without these artifacts may result in missing PRDs!
`);

  const proceed = await prompt('Continue anyway? (yes/no): ');
  if (proceed !== 'yes') {
    throw new Error('Bulletproof gate failed - run Step 4 and 5 first');
  }
  console.log('⚠️  Proceeding without bulletproof verification (not recommended)');
}

// If certificate exists, verify it shows zero omissions
if (zeroOmissionCert) {
  const certContent = await readFile('/docs/flows/ZERO-OMISSION-CERTIFICATE.md');
  const hasZeroGap = certContent.includes('Features WITHOUT Screens | 0') || 
                     certContent.includes('Gap | 0');
  
  if (!hasZeroGap) {
    console.warn('⚠️  Zero Omission Certificate exists but may have unresolved gaps');
    console.warn('   Review /docs/flows/ZERO-OMISSION-CERTIFICATE.md before proceeding');
  } else {
    console.log('✅ Bulletproof verification passed - all screens accounted for');
  }
}
```

---

### **Step 2: Process Each PRD**

```typescript
for (const prd of filteredPRDs) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Starting PRD: ${prd.id} - ${prd.name}`);
  console.log(`${'='.repeat(60)}\n`);
  
  // Skip if already completed
  if (status[prd.id]?.status === 'verified') {
    console.log(`✅ ${prd.id} already verified, skipping`);
    continue;
  }
  
  // Check dependencies
  const missingDeps = checkDependencies(prd, status);
  if (missingDeps.length > 0) {
    console.error(`❌ Cannot implement ${prd.id}. Missing dependencies:`);
    missingDeps.forEach(dep => console.error(`   - ${dep}`));
    
    if (stopOnFailure) {
      throw new Error(`Dependency check failed for ${prd.id}`);
    }
    continue;
  }
  
  // PHASE 1: Implementation
  console.log(`\n📦 Phase 1: Implementation`);
  await runCommand(`@implement-prd --prd-id=${prd.id}`);
  
  // PHASE 2: Manual Review (HITL)
  console.log(`\n👤 Phase 2: Manual Review`);
  console.log(`\nImplementation complete for ${prd.id}.`);
  console.log(`\nPlease review:`);
  console.log(`  1. Generated code in your editor`);
  console.log(`  2. Test feature in browser (npm run dev)`);
  console.log(`  3. Check that it matches PRD requirements`);
  
  const answer = await prompt(`\nReady to verify ${prd.id}? (yes/no/skip): `);
  
  if (answer === 'skip') {
    console.log(`⏭️  Skipping ${prd.id} for now`);
    continue;
  }
  
  if (answer !== 'yes') {
    console.log(`❌ Review not approved, stopping loop`);
    if (stopOnFailure) throw new Error('User stopped loop');
    continue;
  }
  
  // PHASE 3: Verification Loop with Auto-Fix (Grade 4 Agentic Layer)
  console.log(`\n🔍 Phase 3: Verification`);
  
  let verificationPassed = false;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (!verificationPassed && attempts < maxAttempts) {
    attempts++;
    console.log(`\n🔄 Verification Attempt ${attempts}/${maxAttempts}`);
    
    // Run comprehensive verification
    const result = await runCommand(`@verify-prd --prd-id=${prd.id}`);
    
    // Check if passed
    verificationPassed = result.includes('✅ PASS') || result.includes('PRODUCTION READY');
    
    if (!verificationPassed && attempts < maxAttempts) {
      console.log(`\n❌ Verification failed. Gaps found.`);
      console.log(`\n🔧 Auto-fix attempt ${attempts}/${maxAttempts - 1} via @gap-analysis...`);
      
      // AUTO-FIX: Run gap-analysis with auto-fix before asking human (Grade 4)
      // This is the "Closed Feedback Loop" from the Agentic Layer framework
      await runCommand(`@gap-analysis --spec=${prd.id} --max-iterations=2 --ui=auto`);
      
      // Run project-local tools if available (Grade 3)
      const hasTools = await fileExists('.sigma/tools/typecheck.sh');
      if (hasTools) {
        console.log(`\n🛠️  Running project verification tools...`);
        try {
          await runScript('.sigma/tools/typecheck.sh');
          await runScript('.sigma/tools/lint.sh');
        } catch (toolError) {
          console.log(`   ⚠️  Tool found errors, gap-analysis may have fixed them`);
        }
      }
      
      // Re-verify after auto-fix
      console.log(`\n🔄 Re-verifying after auto-fix...`);
      const reResult = await runCommand(`@verify-prd --prd-id=${prd.id}`);
      verificationPassed = reResult.includes('✅ PASS') || reResult.includes('PRODUCTION READY');
      
      if (verificationPassed) {
        console.log(`\n✅ Auto-fix successful! Verification PASSED for ${prd.id}!`);
      }
    } else if (!verificationPassed) {
      // Auto-fix exhausted, ask human (HITL)
      console.log(`\n⚠️  Auto-fix could not resolve all issues after ${maxAttempts} attempts.`);
      console.log(`\nManual intervention required. Review the verification report.`);
      
      const fixAnswer = await prompt(`\nAttempt manual fix and re-verify? (yes/no): `);
      if (fixAnswer !== 'yes') {
        console.log(`⏸️  Pausing loop for ${prd.id}`);
        if (stopOnFailure) throw new Error('Verification failed');
        break;
      }
    } else {
      console.log(`\n✅ Verification PASSED for ${prd.id}!`);
    }
  }
  
  if (!verificationPassed) {
    console.log(`\n⚠️  Moving to next PRD (${prd.id} not verified)`);
    continue;
  }
  
  // PHASE 4: Commit (if auto-commit enabled)
  console.log(`\n📝 Phase 4: Commit`);
  
  if (autoCommit) {
    await runCommand('git add -A');
    await runCommand(`git commit -m "feat: implement ${prd.id} - ${prd.name}

- Implemented all features from PRD
- All tests passing
- Verification complete
- Production ready

Generated by @dev-loop"`);
    
    console.log(`✅ Changes committed for ${prd.id}`);
  } else {
    console.log(`⏸️  Auto-commit disabled. Commit manually when ready.`);
  }
  
  // Update PRD status
  await updatePRDStatus(prd.id, {
    status: 'verified',
    verifiedDate: new Date().toISOString(),
    commitHash: await getLatestCommit(),
  });
  
  // Update TODO
  await updateTodo(prd.id, 'completed');
  
  console.log(`\n🎉 ${prd.id} COMPLETE!\n`);
}
```

---

### **Step 3: Final Report**

```typescript
// Generate final report
const report = {
  startTime,
  endTime: new Date(),
  totalPRDs: filteredPRDs.length,
  completed: filteredPRDs.filter(p => status[p.id]?.status === 'verified').length,
  failed: filteredPRDs.filter(p => status[p.id]?.status !== 'verified').length,
  prds: filteredPRDs.map(p => ({
    id: p.id,
    name: p.name,
    status: status[p.id]?.status || 'not started',
    implementedDate: status[p.id]?.implementedDate,
    verifiedDate: status[p.id]?.verifiedDate,
  })),
};

// Write report
await write(`/docs/development/DEV-LOOP-${date}.md`, formatReport(report));

console.log(`\n${'='.repeat(60)}`);
console.log(`🎉 @dev-loop COMPLETE!`);
console.log(`${'='.repeat(60)}\n`);
console.log(`Total PRDs: ${report.totalPRDs}`);
console.log(`✅ Completed: ${report.completed}`);
console.log(`❌ Failed: ${report.failed}`);
console.log(`⏱️  Time: ${formatDuration(report.endTime - report.startTime)}`);
console.log(`\n📊 Full report: /docs/development/DEV-LOOP-${date}.md\n`);
```

---

## 📊 Development Loop Report

```markdown
# Development Loop Report
**Date:** 2025-11-06
**Duration:** 6h 23m
**PRDs Processed:** F01-F15

---

## Summary

**Total PRDs:** 15
**✅ Completed:** 13
**⏸️  Paused:** 2
**❌ Failed:** 0

**Success Rate:** 86.7%

---

## PRD Details

### ✅ F01: Database Schema
- **Status:** Verified ✅
- **Implemented:** 2025-11-06 08:45
- **Verified:** 2025-11-06 09:12
- **Duration:** 27 minutes
- **Files Created:** 8
- **Tests:** 12/12 passing
- **Commit:** abc123

### ✅ F02: Authentication System
- **Status:** Verified ✅
- **Implemented:** 2025-11-06 09:30
- **Verified:** 2025-11-06 10:15
- **Duration:** 45 minutes
- **Files Created:** 15
- **Tests:** 24/24 passing
- **Verification Attempts:** 2 (fixed TypeScript errors)
- **Commit:** def456

### ✅ F03: Voice Intake Agent
- **Status:** Verified ✅
- **Implemented:** 2025-11-06 10:30
- **Verified:** 2025-11-06 12:00
- **Duration:** 1h 30m
- **Files Created:** 22
- **Tests:** 38/38 passing
- **Verification Attempts:** 3 (fixed RLS policies, UI bugs)
- **Commit:** ghi789

[... more PRDs ...]

### ⏸️ F14: AI Pricing Calculator
- **Status:** Paused
- **Implemented:** 2025-11-06 14:30
- **Reason:** Waiting for manual review
- **Next Step:** Resume @dev-loop or run @verify-prd --prd-id=F14

### ⏸️ F15: Integration Logos
- **Status:** Not Started
- **Reason:** Dependency F14 not complete
- **Next Step:** Complete F14 first

---

## Statistics

**Total Time:** 6h 23m
**Average per PRD:** 29m
**Fastest:** F01 (27m)
**Slowest:** F03 (1h 30m)

**Files Created:** 187 total
- Database schema: 24
- Server Actions: 32
- API Routes: 18
- React Components: 56
- Tests: 48
- Types: 9

**Tests Generated:** 324 total
- Unit tests: 198
- Integration tests: 86
- E2E tests: 40

**All Tests Passing:** ✅ 324/324

**Code Quality:**
- TypeScript errors: 0
- Linter errors: 0
- Bundle size: 342KB (within limits)
- Test coverage: 78%

---

## Verification Pass Rates

| Attempt | PRDs | Success Rate |
|---------|------|--------------|
| First   | 8    | 61.5%        |
| Second  | 4    | 30.8%        |
| Third   | 1    | 7.7%         |

**Average Attempts:** 1.46 per PRD

---

## Common Issues Found

1. **TypeScript Errors** (5 occurrences)
   - Missing imports
   - Type mismatches
   - Fixed automatically in most cases

2. **RLS Policy Errors** (3 occurrences)
   - Missing RLS policies on new tables
   - Fixed by adding policies

3. **UI Bugs** (2 occurrences)
   - Layout issues on mobile
   - Fixed with responsive classes

---

## Recommendations

### Next Steps
1. Complete F14 verification
2. Implement F15 after F14 verified
3. Run @cleanup-repo to organize files
4. Run @client-handoff for final delivery

### Improvements
- Consider adding more automated UI tests
- Increase test coverage to 85%+
- Add performance monitoring for Voice Intake

---

## Time Saved

**Manual Implementation:** ~45-60h (15 PRDs × 3-4h each)
**Automated Loop:** 6.4h
**Time Saved:** ~40-54h (87-90% reduction) ⚡

---

## Final Status

✅ **Development Loop Successful**

13/15 PRDs implemented and verified. 2 PRDs paused for review. Ready to continue when approved.

**Commands to Continue:**

\`\`\`bash
# Resume development
@dev-loop --from=F14 --to=F15

# Or verify manually
@verify-prd --prd-id=F14
@implement-prd --prd-id=F15
@verify-prd --prd-id=F15

# When all complete
@cleanup-repo
@client-handoff
\`\`\`
```

---

## 🛠️ Implementation Details

### PRD Status Tracking

```typescript
// /docs/prds/.prd-status.json
interface PRDStatus {
  [prdId: string]: {
    status: 'pending' | 'implementing' | 'implemented' | 'verifying' | 'verified' | 'failed';
    implementedDate?: string;
    verifiedDate?: string;
    commitHash?: string;
    filesCreated: string[];
    testsGenerated: number;
    testsPassing: number;
    verificationAttempts: number;
    lastError?: string;
    dependencies: string[];
    nextStep: string;
  };
}
```

### Dependency Checking

```typescript
function checkDependencies(prd: PRD, status: PRDStatus): string[] {
  const missing: string[] = [];
  
  for (const depId of prd.dependencies) {
    const depStatus = status[depId]?.status;
    
    if (!depStatus || depStatus !== 'verified') {
      missing.push(`${depId} (status: ${depStatus || 'not started'})`);
    }
  }
  
  return missing;
}
```

---

## 🔗 Integration with Workflow

**Before @dev-loop:**
- Complete Steps 1-11 (planning phase)
- `@step-11-prd-generation` creates all PRDs
- PRDs are in `/docs/prds/F*.md`
- ⚠️ **RECOMMENDED:** Verify steps are complete first:
  ```bash
  @step-verify --step=1-11 --fix  # Ensure 100% completion on all planning steps
  ```

### Pre-Flight Step Verification

Before running `@dev-loop`, ensure all planning steps (1-11) are 100% complete:

```bash
# Quick verification (no auto-fix)
@step-verify --step=1-11

# Verify and auto-fix any gaps
@step-verify --step=1-11 --fix

# Expected output: All steps at 100/100
```

**Why?** The dev-loop relies on complete outputs from Steps 1-11. Missing files, incomplete sections, or failed checkpoints can cause implementation issues. `@step-verify --fix` fills gaps automatically before you start.

**During @dev-loop:**
- For each PRD:
  1. `@implement-prd` - Implementation
  2. Manual review (HITL)
  3. `@verify-prd` - Verification (loop until pass)
  4. Commit (if auto-commit)
  5. Next PRD

**After @dev-loop:**
- `@cleanup-repo` - Organize files
- `@client-handoff` - Final delivery
- `@tech-debt-audit` - Identify any debt

---

## 🎯 Success Criteria

**Loop Completes Successfully When:**
- ✅ All PRDs in range implemented
- ✅ All PRDs verified (pass @verify-prd)
- ✅ All tests passing
- ✅ All commits made (if auto-commit)
- ✅ PRD status updated
- ✅ Final report generated

---

## 💡 Pro Tips

1. **Start small** - First run: `@dev-loop --from=F01 --to=F03`
2. **Review manually** - Don't auto-commit until confident
3. **Stop on failure** - Use `--stop-on-failure` for first runs
4. **Fix gaps immediately** - Don't accumulate tech debt
5. **Trust verification** - @verify-prd catches 95%+ of issues
6. **Commit often** - Use `--auto-commit` after testing
7. **Monitor progress** - Watch TODO list update in real-time

---

## 🚨 Common Issues

**"Loop stopped - dependency missing"**
- Fix: Implement dependencies first
- Solution: Run `@dev-loop --from=F01` (start from beginning)

**"Verification keeps failing"**
- Fix: Review verification report carefully
- Common causes: TypeScript errors, missing RLS policies, UI bugs
- Solution: Fix issues manually, re-run verification

**"Too slow"**
- Reality: Each PRD takes 20-60 minutes (implementation + verification)
- Normal: 15 PRDs = 5-10 hours
- Still faster than manual (45-60 hours)

**"Manual review needed"**
- This is intentional - HITL ensures quality
- Don't skip reviews - they catch AI mistakes

---

## 📊 Expected Timeline

**For 15 PRDs (typical SSS project):**

| Phase | Time | Description |
|-------|------|-------------|
| Planning (Steps 1-11) | 3-4 hours | One-time setup |
| **@dev-loop** | **6-10 hours** | Automated implementation |
| Per PRD average | 25-40 minutes | Implementation + verification |
| Manual review | 5-10 min/PRD | Human checkpoint |
| Verification loops | 1-3 attempts | Fix gaps |
| Commits | 2 min/PRD | Git operations |

**Total Development Time:** 8-13 hours (vs 45-60 hours manual)

**Time Saved:** ~80-85% ⚡

---

## Final Review Gate

**All outputs for this step:**
- [ ] All PRDs in range implemented via `@implement-prd`
- [ ] All PRDs verified via `@verify-prd`
- [ ] All tests passing
- [ ] PRD status updated in `.prd-status.json`
- [ ] Active task memory updated in `.sigma/memory/active_task.md`
- [ ] `DEV-LOOP-[DATE].md` report generated
- [ ] All commits made (if `--auto-commit`)
- [ ] All phases completed with user approval

**>>> FINAL CHECKPOINT: DEV-LOOP COMPLETE <<<**
**Do NOT proceed to the next step without explicit approval.**

---

$END$


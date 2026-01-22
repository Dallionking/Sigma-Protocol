/**
 * Sigma Protocol - iTerm2 Native Tab Launcher
 * 
 * Creates REAL iTerm2 tabs (not tmux windows) using AppleScript.
 * Each stream gets its own TAB, forks within a stream become PANES in that tab.
 * 
 * Layout:
 *   Tab 1: Orchestrator (single pane)
 *   Tab 2: Stream-A (split into panes: Fork-1 | Fork-2 | Fork-3...)
 *   Tab 3: Stream-B (split into panes: Fork-1 | Fork-2 | Fork-3...)
 *   ...
 * 
 * Backend order on macOS: iTerm2 → tmux → Task subagents
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run AppleScript command using multiple -e flags (one per line)
 */
function osascript(lines) {
  // Build command with multiple -e flags, one per line
  const args = lines
    .filter(line => line.trim())
    .map(line => `-e '${line.replace(/'/g, "'\\''")}'`)
    .join(' ');
  
  return execSync(`osascript ${args}`, { 
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  }).trim();
}

/**
 * Detect the best available terminal backend
 * Order: iTerm2 → tmux → Task subagents
 * @returns {'iterm' | 'tmux' | 'task'}
 */
export function detectBackend() {
  // Check for iTerm2
  try {
    const result = execSync(
      'osascript -e \'tell application "System Events" to (name of processes) contains "iTerm2"\'',
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    if (result === 'true') {
      return 'iterm';
    }
    // iTerm2 exists but not running? Try to detect it's installed
    const apps = execSync('ls /Applications/ 2>/dev/null || true', { encoding: 'utf-8' });
    if (apps.includes('iTerm.app')) {
      return 'iterm';
    }
  } catch { /* iTerm2 not available */ }
  
  // Check for tmux
  try {
    execSync('which tmux', { stdio: 'pipe' });
    return 'tmux';
  } catch { /* tmux not available */ }
  
  // Fallback to Task subagents (in-process, always available)
  return 'task';
}

/**
 * Split the current tab into a new pane
 * @param {'vertical' | 'horizontal'} direction - Split direction
 * @param {string} workdir - Working directory for the new pane
 * @param {string} command - Command to run in the new pane
 * @param {string} paneName - Name for the session
 */
function splitPaneInCurrentTab(direction = 'vertical', workdir, command, paneName) {
  const splitDirection = direction === 'vertical' ? 'vertically' : 'horizontally';
  const cdCmd = `cd \\"${workdir}\\" && ${command}`;
  
  // Split creates new session - capture it and write to it
  osascript([
    'tell application "iTerm2"',
    '  tell current window',
    '    tell current tab',
    '      tell current session',
    `        set newSession to (split ${splitDirection} with default profile)`,
    '      end tell',
    '      tell newSession',
    `        set name to "${paneName}"`,
    `        write text "${cdCmd}"`,
    '      end tell',
    '    end tell',
    '  end tell',
    'end tell'
  ]);
}

/**
 * Run command in a specific pane of the current tab
 * @param {number} paneIndex - Pane index (0-based)
 * @param {string} command - Command to run
 */
function runInPane(paneIndex, command) {
  osascript([
    'tell application "iTerm2"',
    '  tell current window',
    '    tell current tab',
    `      tell session ${paneIndex + 1}`,
    `        write text "${command}"`,
    '      end tell',
    '    end tell',
    '  end tell',
    'end tell'
  ]);
}

/**
 * Send text to a specific tab and session (for auto-start prompts)
 * @param {number} tabIndex - 1-based tab index
 * @param {number} sessionIndex - 1-based session index within tab
 * @param {string} text - Text to send (will be written + Enter)
 */
function sendToSession(tabIndex, sessionIndex, text) {
  // Escape special characters for AppleScript
  const escapedText = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  
  osascript([
    'tell application "iTerm2"',
    '  tell current window',
    `    tell tab ${tabIndex}`,
    `      tell session ${sessionIndex}`,
    `        write text "${escapedText}"`,
    '      end tell',
    '    end tell',
    '  end tell',
    'end tell'
  ]);
}

/**
 * Generate auto-start prompt for orchestrator
 */
function generateOrchestratorAutoPrompt(streams) {
  const streamList = streams.map(s => `• Stream-${s.name}: ${s.prds?.join(', ') || 'unassigned'}`).join('\\n');
  
  return `Read CLAUDE.md and begin orchestrating.

## Streams Active
${streamList}

## Your First Actions:
1. Poll the inbox at .sigma/orchestration/inbox/orchestrator.json
2. Monitor for fork completion reports
3. Run @gap-analysis when forks report "done"
4. Coordinate work across all fork agents

Begin monitoring now.`;
}

/**
 * Generate auto-start prompt for a fork worker
 */
function generateForkAutoPrompt(stream, forkNum, prds) {
  const prdList = prds?.join(', ') || 'as assigned in CLAUDE.md';
  
  return `Read CLAUDE.md and begin implementation.

## Your Assignment
- Stream: ${stream}  
- Fork: ${forkNum}
- PRDs: ${prdList}

## Start Implementation:
1. Read your assigned PRD(s) from docs/prds/
2. Implement using Ralph-loop methodology
3. Commit frequently with clear messages
4. Run @gap-analysis before reporting complete

Begin now.`;
}

// Note: iTerm2 tabs don't have a settable 'name' property via AppleScript.
// Tab titles come from the session name (set in createItermTab) or the running process.
// The session name is set when creating the tab, which is sufficient.

/**
 * Create a new iTerm2 tab and run a command
 * @param {string} tabName - Name for the tab
 * @param {string} workdir - Working directory
 * @param {string} command - Command to run
 */
function createItermTab(tabName, workdir, command) {
  const cdCmd = `cd \\"${workdir}\\" && ${command}`;
  
  osascript([
    'tell application "iTerm2"',
    '  tell current window',
    '    create tab with default profile',
    '    tell current session',
    `      set name to "${tabName}"`,
    `      write text "${cdCmd}"`,
    '    end tell',
    '  end tell',
    'end tell'
  ]);
}

/**
 * Run command in the current/first iTerm2 tab
 * @param {string} tabName - Name for the tab
 * @param {string} workdir - Working directory  
 * @param {string} command - Command to run
 */
function runInCurrentTab(tabName, workdir, command) {
  const cdCmd = `cd \\"${workdir}\\" && ${command}`;
  
  osascript([
    'tell application "iTerm2"',
    '  tell current window',
    '    tell current session',
    `      set name to "${tabName}"`,
    `      write text "${cdCmd}"`,
    '    end tell',
    '  end tell',
    'end tell'
  ]);
}

/**
 * Install Claude Code hooks in a fork's worktree
 * Copies fork-stop.sh to .claude/hooks/ and creates settings.json
 * @param {string} workdir - Fork's working directory
 * @param {string} forkId - Fork identifier (e.g., 'stream-a-fork-1')
 * @param {string} targetDir - Project root directory
 * @param {'fork' | 'orchestrator'} role - Agent role
 */
async function installHooksInWorktree(workdir, forkId, targetDir, role = 'fork') {
  const hooksDir = path.join(workdir, '.claude', 'hooks');
  const settingsPath = path.join(workdir, '.claude', 'settings.json');
  
  await fs.mkdir(hooksDir, { recursive: true });
  
  // Hook script content depends on role
  if (role === 'fork') {
    // Fork Stop hook: auto-report completion, heartbeat
    const forkStopScript = generateForkStopHook(forkId, targetDir);
    await fs.writeFile(path.join(hooksDir, 'fork-stop.sh'), forkStopScript, { mode: 0o755 });
    
    // Settings to register the hook
    const settings = {
      hooks: {
        Stop: [
          {
            matcher: '.*',
            hooks: [
              {
                type: 'command',
                command: `bash ${path.join(hooksDir, 'fork-stop.sh')}`
              }
            ]
          }
        ]
      }
    };
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    
  } else if (role === 'orchestrator') {
    // Orchestrator Stop hook: auto-poll inbox, trigger gap-analysis
    const orchStopScript = generateOrchestratorStopHook(targetDir);
    await fs.writeFile(path.join(hooksDir, 'orchestrator-stop.sh'), orchStopScript, { mode: 0o755 });
    
    const settings = {
      hooks: {
        Stop: [
          {
            matcher: '.*',
            hooks: [
              {
                type: 'command',
                command: `bash ${path.join(hooksDir, 'orchestrator-stop.sh')}`
              }
            ]
          }
        ]
      }
    };
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
  }
}

/**
 * Generate Fork Stop hook script content
 */
function generateForkStopHook(forkId, targetDir) {
  const inboxPath = path.join(targetDir, '.sigma', 'orchestration', 'inbox', 'orchestrator.json');
  const postMessageScript = path.join(__dirname, 'post-message.js');
  
  return `#!/bin/bash
# Fork Stop Hook: Auto-report completion and heartbeat
# Fork ID: ${forkId}
# Generated by Sigma Protocol

FORK_ID="${forkId}"
TARGET_DIR="${targetDir}"
INBOX="${inboxPath}"
POST_MSG="${postMessageScript}"
RESPONSE_COUNT_FILE="/tmp/sigma-fork-\${FORK_ID}-responses"

# Initialize or increment response counter
if [ -f "$RESPONSE_COUNT_FILE" ]; then
  COUNT=$(cat "$RESPONSE_COUNT_FILE")
  COUNT=$((COUNT + 1))
else
  COUNT=1
fi
echo "$COUNT" > "$RESPONSE_COUNT_FILE"

# Heartbeat every 3 responses
if [ $((COUNT % 3)) -eq 0 ]; then
  node "$POST_MSG" --target "$TARGET_DIR" --inbox orchestrator \\
    --from "$FORK_ID" --type heartbeat --status "alive (response $COUNT)"
fi

# Check if this response indicates completion
# Look for completion markers in the last response
if grep -qi "implementation complete\\|prd complete\\|task complete\\|all done" /tmp/sigma-last-response-\${FORK_ID}.txt 2>/dev/null; then
  node "$POST_MSG" --target "$TARGET_DIR" --inbox orchestrator \\
    --from "$FORK_ID" --type prd_complete --status "completed"
fi

exit 0
`;
}

/**
 * Generate Orchestrator Stop hook script content
 */
function generateOrchestratorStopHook(targetDir) {
  const inboxPath = path.join(targetDir, '.sigma', 'orchestration', 'inbox', 'orchestrator.json');
  
  return `#!/bin/bash
# Orchestrator Stop Hook: Auto-poll inbox, trigger gap-analysis
# Generated by Sigma Protocol

TARGET_DIR="${targetDir}"
INBOX="${inboxPath}"
MAX_MESSAGES=50
KEEP_MESSAGES=25

# Read and check for unprocessed messages
if [ -f "$INBOX" ]; then
  # Count unprocessed messages
  UNPROCESSED=$(jq '[.messages[] | select(.processed == false)] | length' "$INBOX" 2>/dev/null || echo "0")
  
  if [ "$UNPROCESSED" -gt 0 ]; then
    echo ""
    echo "📬 ORCHESTRATOR INBOX: $UNPROCESSED new message(s)"
    echo "---"
    
    # Show new messages
    jq -r '.messages[] | select(.processed == false) | "  [\(.type)] from \(.from): \(.status // "no status")"' "$INBOX" 2>/dev/null
    
    # Check for completion messages - suggest gap-analysis
    COMPLETIONS=$(jq '[.messages[] | select(.processed == false and .type == "prd_complete")] | length' "$INBOX" 2>/dev/null || echo "0")
    if [ "$COMPLETIONS" -gt 0 ]; then
      echo ""
      echo "🔍 Fork(s) reported completion. Consider running: @gap-analysis"
    fi
    
    echo "---"
    echo "Use /hub:sync to process messages, or check: $INBOX"
    echo ""
  fi
  
  # Inbox cleanup: if > MAX_MESSAGES, summarize and keep KEEP_MESSAGES
  TOTAL_MESSAGES=$(jq '.messages | length' "$INBOX" 2>/dev/null || echo "0")
  if [ "$TOTAL_MESSAGES" -gt "$MAX_MESSAGES" ]; then
    echo "⚠️  Inbox has $TOTAL_MESSAGES messages (limit: $MAX_MESSAGES). Running cleanup..."
    # Keep the most recent KEEP_MESSAGES
    jq ".messages = .messages[-\${KEEP_MESSAGES}:]" "$INBOX" > "$INBOX.tmp" && mv "$INBOX.tmp" "$INBOX"
    echo "✓ Kept most recent $KEEP_MESSAGES messages"
  fi
  
  # Context summarization: if inbox file > 500 lines, summarize older content
  MAX_LINES=500
  INBOX_LINES=$(wc -l < "$INBOX" 2>/dev/null || echo "0")
  if [ "$INBOX_LINES" -gt "$MAX_LINES" ]; then
    echo "⚠️  Inbox file has $INBOX_LINES lines (limit: $MAX_LINES). Consider manual summarization."
    echo "   Tip: Archive older messages to .sigma/orchestration/archive/"
  fi
fi

exit 0
`;
}

/**
 * Launch orchestration using native iTerm2 tabs + panes
 * 
 * NEW LAYOUT:
 *   Tab 1: Orchestrator (single pane with orchestrator hooks)
 *   Tab 2: Stream-A (split into N panes for Fork-1, Fork-2, etc.)
 *   Tab 3: Stream-B (split into N panes for Fork-1, Fork-2, etc.)
 * 
 * @param {Object} options - Launch options
 * @param {string} options.targetDir - Project directory
 * @param {string} options.agent - Agent command ('claude' or 'opencode')
 * @param {Object} options.config - Streams configuration
 * @param {number} options.forksPerStream - Number of forks per stream
 */
export async function launchItermTabs(options) {
  const {
    targetDir,
    agent = 'claude',
    config,
    forksPerStream = 1,
    autoStart = false  // NEW: Auto-send initial prompts to agents
  } = options;

  const agentCmd = agent === 'claude' ? 'claude --dangerously-skip-permissions' : 'opencode';
  const streams = config.streams || [];
  
  // NEW: Calculate total tabs (1 orchestrator + 1 per stream, panes are inside tabs)
  const totalTabs = 1 + streams.length;
  const totalPanes = 1 + (streams.length * forksPerStream);
  
  console.log(chalk.cyan(`\n📺 Launching iTerm2 tabs + panes`));
  console.log(chalk.gray(`   ${totalTabs} tabs (1 orchestrator + ${streams.length} streams)`));
  console.log(chalk.gray(`   ${totalPanes} total panes (${forksPerStream} fork(s) per stream)`));

  const spinner = ora('Creating iTerm2 layout...').start();

  try {
    // Ensure iTerm2 is running and has a window
    spinner.text = 'Activating iTerm2...';
    osascript(['tell application "iTerm2" to activate']);
    
    await sleep(500);

    // Create inbox directory
    const inboxDir = path.join(targetDir, '.sigma', 'orchestration', 'inbox');
    await fs.mkdir(inboxDir, { recursive: true });
    
    // Initialize orchestrator inbox
    const orchestratorInbox = path.join(inboxDir, 'orchestrator.json');
    await fs.writeFile(orchestratorInbox, JSON.stringify({ 
      messages: [], 
      lastChecked: Date.now(),
      streams: streams.map(s => ({
        name: s.name,
        forks: forksPerStream,
        status: 'pending'
      }))
    }, null, 2));

    const layout = [];

    // =========================================================================
    // Tab 1: Orchestrator (single pane)
    // =========================================================================
    spinner.text = 'Setting up Orchestrator tab...';
    
    // Install orchestrator hooks
    await installHooksInWorktree(targetDir, 'orchestrator', targetDir, 'orchestrator');
    
    // Create orchestrator CLAUDE.md
    const orchClaudeMd = generateOrchestratorClaudeMd({ streams, targetDir, inboxDir });
    await fs.writeFile(path.join(targetDir, 'CLAUDE.md'), orchClaudeMd);
    
    const orchestratorTabName = '🎯 Orchestrator';
    createItermTab(orchestratorTabName, targetDir, agentCmd);
    
    await sleep(600);
    
    layout.push({ 
      tab: 2, 
      name: 'Orchestrator', 
      type: 'orchestrator', 
      panes: [{ name: 'orchestrator', workdir: targetDir }] 
    });

    // =========================================================================
    // Tabs 2+: One tab per stream, with panes for forks
    // =========================================================================
    for (let streamIdx = 0; streamIdx < streams.length; streamIdx++) {
      const stream = streams[streamIdx];
      const streamWorktree = path.join(targetDir, 'worktrees', `stream-${stream.name.toLowerCase()}`);
      // Tab numbering: 1=original shell, 2=orchestrator, 3+=streams
      const tabNum = streamIdx + 3;
      // Include PRD info in tab name for better identification
      const prdList = stream.prds?.join(', ') || 'unassigned';
      const tabName = `Stream-${stream.name}: ${prdList}`;
      
      spinner.text = `Creating tab: ${tabName}...`;
      
      const panes = [];
      
      // Create the new tab with Fork-1
      const fork1Workdir = forksPerStream > 1
        ? path.join(streamWorktree, 'forks', 'fork-1')
        : streamWorktree;
      const fork1Id = `stream-${stream.name.toLowerCase()}-fork-1`;
      
      await fs.mkdir(fork1Workdir, { recursive: true });
      
      // Install fork hooks
      await installHooksInWorktree(fork1Workdir, fork1Id, targetDir, 'fork');
      
      // Create CLAUDE.md for Fork-1
      const fork1ClaudeMd = generateForkClaudeMd({
        stream: stream.name,
        forkNum: 1,
        forkId: fork1Id,
        prds: stream.prds,
        forksPerStream,
        inboxDir,
        targetDir
      });
      await fs.writeFile(path.join(fork1Workdir, 'CLAUDE.md'), fork1ClaudeMd);
      
      createItermTab(tabName, fork1Workdir, agentCmd);
      panes.push({ name: `Fork-1`, forkId: fork1Id, workdir: fork1Workdir });
      
      await sleep(600);
      
      // Split the tab into additional panes for Fork-2, Fork-3, etc.
      for (let forkNum = 2; forkNum <= forksPerStream; forkNum++) {
        const forkWorkdir = path.join(streamWorktree, 'forks', `fork-${forkNum}`);
        const forkId = `stream-${stream.name.toLowerCase()}-fork-${forkNum}`;
        const paneName = `Fork-${forkNum}`;
        
        await fs.mkdir(forkWorkdir, { recursive: true });
        
        // Install fork hooks
        await installHooksInWorktree(forkWorkdir, forkId, targetDir, 'fork');
        
        // Create CLAUDE.md
        const forkClaudeMd = generateForkClaudeMd({
          stream: stream.name,
          forkNum,
          forkId,
          prds: stream.prds,
          forksPerStream,
          inboxDir,
          targetDir
        });
        await fs.writeFile(path.join(forkWorkdir, 'CLAUDE.md'), forkClaudeMd);
        
        spinner.text = `  Splitting pane: ${paneName}...`;
        splitPaneInCurrentTab('vertical', forkWorkdir, agentCmd, paneName);
        panes.push({ name: paneName, forkId, workdir: forkWorkdir });
        
        await sleep(300);
      }
      
      layout.push({
        tab: tabNum,  // tabNum already correctly calculated as streamIdx + 3
        name: `Stream-${stream.name}`,
        type: 'stream',
        stream: stream.name,
        panes,
        prds: stream.prds
      });
    }

    spinner.succeed(`Created ${totalTabs} tabs with ${totalPanes} panes!`);

    // =========================================================================
    // AUTO-START: Send initial prompts to all agents
    // =========================================================================
    if (autoStart) {
      const autoSpinner = ora('Waiting for Claude Code to initialize...').start();
      
      // Claude Code takes ~5 seconds to fully initialize
      await sleep(5500);
      
      autoSpinner.text = 'Sending auto-start prompts to agents...';
      
      // Send to Orchestrator (tab 2, session 1)
      try {
        const orchPrompt = generateOrchestratorAutoPrompt(streams);
        sendToSession(2, 1, orchPrompt);
        autoSpinner.text = '  ✓ Orchestrator activated';
        await sleep(300);
      } catch (e) {
        console.log(chalk.yellow(`  ⚠ Could not auto-start orchestrator: ${e.message}`));
      }
      
      // Send to each fork (tabs 3+, with multiple sessions per tab)
      for (let streamIdx = 0; streamIdx < streams.length; streamIdx++) {
        const stream = streams[streamIdx];
        const tabIndex = streamIdx + 3;
        
        for (let forkNum = 1; forkNum <= forksPerStream; forkNum++) {
          try {
            const forkPrompt = generateForkAutoPrompt(stream.name, forkNum, stream.prds);
            sendToSession(tabIndex, forkNum, forkPrompt);
            autoSpinner.text = `  ✓ Stream-${stream.name}/Fork-${forkNum} activated`;
            await sleep(300);
          } catch (e) {
            console.log(chalk.yellow(`  ⚠ Could not auto-start ${stream.name}/Fork-${forkNum}: ${e.message}`));
          }
        }
      }
      
      autoSpinner.succeed('All agents auto-started!');
    }

    // =========================================================================
    // Print summary
    // =========================================================================
    console.log(chalk.cyan('\n🚀 Orchestration launched!\n'));
    
    console.log(chalk.white('Layout:'));
    for (const tab of layout) {
      if (tab.type === 'orchestrator') {
        console.log(chalk.yellow(`  Tab ${tab.tab}: 🎯 Orchestrator (auto-poll inbox enabled)`));
      } else {
        const paneStr = tab.panes.map(p => p.name).join(' | ');
        console.log(chalk.gray(`  Tab ${tab.tab}: 📦 ${tab.name} [${paneStr}]`));
        console.log(chalk.gray(`           PRDs: ${tab.prds?.join(', ') || 'as assigned'}`));
      }
    }

    console.log(chalk.cyan('\n📋 Navigation:'));
    console.log(chalk.gray('  • Cmd+1, Cmd+2, Cmd+3... → Jump to tab'));
    console.log(chalk.gray('  • Cmd+Opt+Arrow         → Switch between panes'));
    console.log(chalk.gray('  • Cmd+Shift+] or [      → Cycle tabs'));

    console.log(chalk.cyan('\n🔄 Hooks installed:'));
    console.log(chalk.gray('  • Fork Stop hook: auto-report completion + heartbeat'));
    console.log(chalk.gray('  • Orchestrator Stop hook: auto-poll inbox + cleanup'));

    console.log(chalk.cyan('\n📬 Communication:'));
    console.log(chalk.gray(`  Inbox: ${orchestratorInbox}`));
    console.log(chalk.gray('  Forks auto-report via hooks; Orchestrator auto-polls.\n'));

    return { success: true, layout, totalTabs, totalPanes };

  } catch (error) {
    spinner.fail(`Failed to create iTerm2 layout: ${error.message}`);
    
    if (error.message.includes('osascript')) {
      console.log(chalk.yellow('\nMake sure iTerm2 is installed and running.'));
      console.log(chalk.gray('Fallback: sigma orchestrate (uses tmux or task subagents)'));
    }
    
    throw error;
  }
}

/**
 * Generate CLAUDE.md content for a fork agent
 */
function generateForkClaudeMd(options) {
  const { stream, forkNum, forkId, prds, forksPerStream, inboxDir, targetDir } = options;
  
  return `# 🔧 Fork Worker: ${forkId}

## Role
You are a **Fork Worker Agent** in the Sigma Protocol orchestration system.
Your job is to implement the assigned PRDs/stories, then report completion.

## Your Assignment
- **Stream:** ${stream}
- **Fork:** ${forkNum} of ${forksPerStream}
- **PRDs:** ${prds?.join(', ') || 'as assigned'}

---

## Skills & Subagents Available

Use these as needed:
- \`@fork-worker\` - Your primary workflow (implementation loop)
- \`@senior-architect\` - For complex design decisions
- \`@systematic-debugging\` - When stuck on bugs
- \`@gap-analysis\` - Self-check before reporting completion

---

## Implementation Loop

Follow the Ralph-style iteration:

1. **Read the PRD** from \`docs/prds/<prd-id>.md\`
2. **Implement incrementally** - small commits, test as you go
3. **Self-review** - run \`@gap-analysis\` to check for gaps
4. **Report completion** - Your Stop hook will auto-report, or use manual method below

---

## Automatic Reporting (Hooks)

✅ **Your Stop hook is installed!**

- Every 3 responses: Heartbeat sent to orchestrator
- On completion markers: Auto-reports to inbox

To trigger auto-report, include phrases like:
- "Implementation complete"
- "PRD complete" 
- "Task complete"
- "All done"

---

## Manual Completion Report

If hooks fail, manually report:

\`\`\`bash
node ${path.join(targetDir, 'cli/lib/orchestration/post-message.js')} \\
  --target "${targetDir}" \\
  --inbox orchestrator \\
  --from "${forkId}" \\
  --type prd_complete \\
  --prd "<PRD-ID>"
\`\`\`

---

## Start Now

Begin with: **${prds?.[0] || 'first assigned PRD'}**

Read it, implement it, report when done. Go!
`;
}

/**
 * Generate CLAUDE.md content for the orchestrator agent
 */
function generateOrchestratorClaudeMd(options) {
  const { streams, targetDir, inboxDir } = options;
  
  const streamList = streams.map(s => `- **${s.name}**: ${s.prds?.join(', ') || 'PRDs assigned'}`).join('\n');
  
  return `# 🎯 Orchestrator Agent

## Role
You are the **Orchestrator Agent** in the Sigma Protocol multi-agent system.
You coordinate fork workers, review their output, and decide next steps.

---

## Active Streams

${streamList}

---

## Skills & Subagents Available

Use these for your workflow:
- \`@orchestrator-admin\` - Primary orchestration workflow
- \`@gap-analysis\` - Review fork completions
- \`@senior-architect\` - Technical arbitration between forks
- \`@qa-engineer\` - Quality checks before merging

---

## Your Inbox (Auto-Polled)

✅ **Your Stop hook is installed!**

After each response, the hook checks:
\`${inboxDir}/orchestrator.json\`

New messages will appear in your terminal output.

---

## Orchestration Loop

1. **Monitor inbox** - Check for fork completion/heartbeat messages
2. **Review completions** - Run \`@gap-analysis\` on completed work
3. **Compare forks** - If multiple forks completed same PRD, pick winner
4. **Merge winner** - Merge the best implementation
5. **Assign next PRD** - Send new work to available forks
6. **Repeat**

---

## Communication

To send a message to a fork, you can:

1. **Direct instruction** in their CLAUDE.md (they read it on startup)
2. **File-based** message in their inbox

---

## Smart Prompting

When assigning tasks to forks, be specific:

\`\`\`
Fork stream-a-fork-1: 
Implement PRD-003 (user-auth).
Use @senior-architect for the auth flow design.
Use @systematic-debugging if you hit issues.
Report completion when done.
\`\`\`

---

## Inbox Cleanup

The inbox auto-cleans at 50 messages (keeps 25 most recent).
Context is preserved via summarization.

---

## Start Now

1. Check inbox status (auto-polled)
2. If forks need assignment, send them tasks
3. If forks completed, review with \`@gap-analysis\`

Go!
`;
}

/**
 * Quick launch - just create N iTerm2 tabs with Claude
 */
export async function quickLaunchIterm(targetDir, numAgents = 2) {
  console.log(chalk.cyan(`\n⚡ Quick Launch: ${numAgents} Claude Code instances in iTerm2 tabs\n`));

  // Activate iTerm2
  osascript(['tell application "iTerm2" to activate']);
  await sleep(500);

  // First tab uses current
  runInCurrentTab('Agent-1', targetDir, 'claude --dangerously-skip-permissions');

  // Create additional tabs
  for (let i = 2; i <= numAgents; i++) {
    await sleep(300);
    createItermTab(`Agent-${i}`, targetDir, 'claude --dangerously-skip-permissions');
  }

  console.log(chalk.green(`✓ Created ${numAgents} iTerm2 tabs with Claude Code\n`));
  console.log(chalk.gray('Navigation:'));
  console.log(chalk.gray('  Cmd+1, Cmd+2, Cmd+3...  Jump to tab'));
  console.log(chalk.gray('  Cmd+Shift+] / [         Next/Previous tab'));
  console.log(chalk.gray('  Click tab               Switch to tab\n'));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Launch orchestration with detected backend (iTerm2 → tmux → Task)
 * @param {Object} options - Same options as launchItermTabs
 */
export async function launchWithAutoBackend(options) {
  const backend = detectBackend();
  
  console.log(chalk.gray(`Detected backend: ${backend}`));
  
  switch (backend) {
    case 'iterm':
      return launchItermTabs(options);
    
    case 'tmux':
      // Import tmux launcher dynamically
      const { spawnLocalOrchestration } = await import('./tmux-launcher.js');
      return spawnLocalOrchestration(options);
    
    case 'task':
      // Task subagents - in-process, no terminal spawning
      console.log(chalk.yellow('Using Task subagents (in-process, no new terminals)'));
      // TODO: Wire up Task subagent spawning
      return { success: true, backend: 'task', message: 'Task subagent mode not yet implemented' };
    
    default:
      throw new Error(`Unknown backend: ${backend}`);
  }
}

export default {
  launchItermTabs,
  quickLaunchIterm,
  detectBackend,
  launchWithAutoBackend
};

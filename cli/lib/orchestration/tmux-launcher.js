/**
 * Sigma Protocol - Pure tmux Orchestration Launcher
 * 
 * Architecture: Windows (tabs) for streams, Panes for forks
 * 
 * Tab 0: Orchestrator (single pane)
 * Tab 1: Stream-A (multiple panes for forks)
 * Tab 2: Stream-B (multiple panes for forks)
 * ...
 * 
 * No mprocs, no complexity - just tmux.
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync, spawn } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Create a tmux orchestration session with tabs (windows) and panes
 * 
 * @param {Object} options - Launch options
 * @param {string} options.targetDir - Project directory
 * @param {string} options.agent - Agent command ('claude' or 'opencode')
 * @param {Object} options.config - Streams configuration
 * @param {number} options.forksPerStream - Number of forks per stream (1 = no forking)
 * @param {string} [options.sessionName='sigma-orc'] - tmux session name
 */
export async function launchPureTmux(options) {
  const {
    targetDir,
    agent = 'claude',
    config,
    forksPerStream = 1,
    sessionName = 'sigma-orc'
  } = options;

  const agentCmd = agent === 'claude' ? 'claude' : 'opencode';
  const streams = config.streams || [];
  
  console.log(chalk.cyan(`\n📺 Launching tmux orchestration (tabs + panes)`));
  console.log(chalk.gray(`   Session: ${sessionName}`));
  console.log(chalk.gray(`   Layout: 1 orchestrator tab + ${streams.length} stream tabs × ${forksPerStream} fork panes each`));

  // Kill existing session if any
  try {
    execSync(`tmux kill-session -t ${sessionName}`, { stdio: 'pipe' });
    console.log(chalk.gray(`   Killed existing session`));
  } catch {
    // No existing session
  }

  const spinner = ora('Creating tmux session...').start();

  try {
    // Ensure fork worktrees exist if forking
    if (forksPerStream > 1) {
      spinner.text = 'Creating fork worktrees...';
      await createForkWorktrees(targetDir, streams, forksPerStream);
    }

    // Create inbox directory for message bus
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

    // =========================================================================
    // Step 1: Create session with Window 0 (Orchestrator)
    // =========================================================================
    spinner.text = 'Creating orchestrator tab...';
    execSync(`tmux new-session -d -s ${sessionName} -n "Orchestrator" -c "${targetDir}"`, { stdio: 'pipe' });

    // =========================================================================
    // Step 2: Create a Window (tab) for each Stream with Panes for each Fork
    // =========================================================================
    const windowInfo = [{ 
      windowIndex: 0, 
      name: 'Orchestrator', 
      type: 'orchestrator',
      panes: [{ index: 0, workdir: targetDir }]
    }];

    for (let streamIdx = 0; streamIdx < streams.length; streamIdx++) {
      const stream = streams[streamIdx];
      const windowIndex = streamIdx + 1;
      const windowName = `Stream-${stream.name}`;
      const streamWorktree = path.join(targetDir, 'worktrees', `stream-${stream.name.toLowerCase()}`);
      
      spinner.text = `Creating tab: ${windowName}...`;
      
      // Create new window (tab) for this stream
      execSync(`tmux new-window -t ${sessionName} -n "${windowName}" -c "${streamWorktree}"`, { stdio: 'pipe' });
      
      const panes = [];
      
      // Create panes for each fork within this window
      for (let forkNum = 1; forkNum <= forksPerStream; forkNum++) {
        const forkWorkdir = forksPerStream > 1
          ? path.join(streamWorktree, 'forks', `fork-${forkNum}`)
          : streamWorktree;
        
        // Ensure workdir exists
        await fs.mkdir(forkWorkdir, { recursive: true });
        
        if (forkNum === 1) {
          // First pane already exists in the window
          panes.push({ 
            index: 0, 
            forkNum, 
            workdir: forkWorkdir,
            prds: stream.prds 
          });
        } else {
          // Split to create additional panes
          // Alternate between horizontal and vertical splits for better layout
          const splitDir = forkNum % 2 === 0 ? '-h' : '-v';
          execSync(`tmux split-window -t ${sessionName}:${windowIndex} ${splitDir} -c "${forkWorkdir}"`, { stdio: 'pipe' });
          
          panes.push({ 
            index: forkNum - 1, 
            forkNum, 
            workdir: forkWorkdir,
            prds: stream.prds 
          });
        }
        
        // Apply tiled layout after each split for even distribution
        execSync(`tmux select-layout -t ${sessionName}:${windowIndex} tiled`, { stdio: 'pipe' });
      }
      
      // Label each pane
      for (const pane of panes) {
        const paneTitle = forksPerStream > 1 ? `Fork-${pane.forkNum}` : stream.name;
        execSync(`tmux select-pane -t ${sessionName}:${windowIndex}.${pane.index} -T "${paneTitle}"`, { stdio: 'pipe' });
      }
      
      windowInfo.push({
        windowIndex,
        name: windowName,
        type: 'stream',
        stream: stream.name,
        prds: stream.prds,
        panes
      });
    }

    // =========================================================================
    // Step 3: Launch Claude Code in all panes
    // =========================================================================
    spinner.text = 'Launching Claude Code instances...';
    
    // Launch in orchestrator (window 0, pane 0)
    execSync(`tmux send-keys -t ${sessionName}:0.0 'cd "${targetDir}" && ${agentCmd} --dangerously-skip-permissions' Enter`, { stdio: 'pipe' });
    
    // Launch in each stream's forks
    for (const window of windowInfo.filter(w => w.type === 'stream')) {
      for (const pane of window.panes) {
        execSync(`tmux send-keys -t ${sessionName}:${window.windowIndex}.${pane.index} 'cd "${pane.workdir}" && ${agentCmd} --dangerously-skip-permissions' Enter`, { stdio: 'pipe' });
      }
    }

    // =========================================================================
    // Step 4: Wait for Claude instances to initialize
    // =========================================================================
    const totalAgents = 1 + (streams.length * forksPerStream);
    const initWait = 8000 + (totalAgents * 1500);
    spinner.text = `Waiting ${Math.round(initWait/1000)}s for ${totalAgents} Claude instances to initialize...`;
    await sleep(initWait);

    // =========================================================================
    // Step 5: Send instructions to orchestrator
    // =========================================================================
    spinner.text = 'Sending orchestrator instructions...';
    const orchestratorPrompt = generateOrchestratorInstructions(config, forksPerStream, inboxDir, windowInfo);
    await sendPromptToPane(sessionName, 0, 0, orchestratorPrompt);
    await sleep(500);

    // =========================================================================
    // Step 6: Create CLAUDE.md and send instructions to forks
    // =========================================================================
    spinner.text = 'Sending fork instructions...';
    
    for (const window of windowInfo.filter(w => w.type === 'stream')) {
      for (const pane of window.panes) {
        // Create CLAUDE.md in the fork's workdir
        const claudeMdContent = generateClaudeMd({
          stream: window.stream,
          forkNum: pane.forkNum,
          prds: pane.prds,
          forksPerStream
        }, config, inboxDir, targetDir);
        
        const claudeMdPath = path.join(pane.workdir, 'CLAUDE.md');
        await fs.writeFile(claudeMdPath, claudeMdContent);

        // Send instruction
        const forkPrompt = `Read CLAUDE.md and implement the assigned PRDs. Start now.`;
        await sendPromptToPane(sessionName, window.windowIndex, pane.index, forkPrompt);
        await sleep(200);
      }
    }

    // Go back to orchestrator window
    execSync(`tmux select-window -t ${sessionName}:0`, { stdio: 'pipe' });

    spinner.succeed('All agents launched and instructed!');

    // =========================================================================
    // Print session info
    // =========================================================================
    console.log(chalk.cyan('\n🚀 Orchestration session ready!\n'));
    
    console.log(chalk.white('Tab Layout:'));
    for (const window of windowInfo) {
      if (window.type === 'orchestrator') {
        console.log(chalk.yellow(`  [0] Orchestrator - monitors all streams`));
      } else {
        const forkInfo = window.panes.map(p => `Fork-${p.forkNum}`).join(', ');
        console.log(chalk.gray(`  [${window.windowIndex}] ${window.name} - PRDs: ${window.prds?.join(', ')} | Panes: ${forkInfo}`));
      }
    }

    console.log(chalk.cyan('\n📋 tmux Tab Commands:'));
    console.log(chalk.gray('  Ctrl+B → 0-9      Jump to tab by number'));
    console.log(chalk.gray('  Ctrl+B → n        Next tab'));
    console.log(chalk.gray('  Ctrl+B → p        Previous tab'));
    console.log(chalk.gray('  Ctrl+B → w        List all tabs (interactive)'));
    
    console.log(chalk.cyan('\n📋 tmux Pane Commands (within a tab):'));
    console.log(chalk.gray('  Ctrl+B → arrow    Navigate between panes'));
    console.log(chalk.gray('  Ctrl+B → z        Zoom current pane (toggle)'));
    console.log(chalk.gray('  Ctrl+B → q        Show pane numbers'));
    
    console.log(chalk.cyan('\n📋 Session Commands:'));
    console.log(chalk.gray('  Ctrl+B → d        Detach (session keeps running)'));
    console.log(chalk.gray('  Ctrl+B → [        Scroll mode (q to exit)'));
    console.log(chalk.gray(`  tmux attach -t ${sessionName}  Reattach later`));

    console.log(chalk.cyan('\nAttaching to tmux session...\n'));
    
    // =========================================================================
    // Step 7: Attach to session
    // =========================================================================
    const attachProcess = spawn('tmux', ['attach', '-t', sessionName], {
      stdio: 'inherit'
    });

    await new Promise((resolve) => {
      attachProcess.on('close', resolve);
    });

    return { success: true, sessionName, windowInfo };

  } catch (error) {
    spinner.fail(`Failed to create tmux session: ${error.message}`);
    throw error;
  }
}

/**
 * Create worktrees for forks
 */
async function createForkWorktrees(targetDir, streams, forksPerStream) {
  for (const stream of streams) {
    const streamWorktree = path.join(targetDir, 'worktrees', `stream-${stream.name.toLowerCase()}`);
    const forksDir = path.join(streamWorktree, 'forks');
    
    await fs.mkdir(forksDir, { recursive: true });
    
    for (let forkNum = 1; forkNum <= forksPerStream; forkNum++) {
      const forkPath = path.join(forksDir, `fork-${forkNum}`);
      const branchName = `stream-${stream.name.toLowerCase()}-fork-${forkNum}`;
      
      try {
        await fs.access(forkPath);
        // Fork already exists
      } catch {
        // Create fork worktree
        try {
          // Create branch if needed
          try {
            execSync(`git branch ${branchName}`, { cwd: targetDir, stdio: 'pipe' });
          } catch {
            // Branch exists
          }
          
          // Create worktree
          execSync(`git worktree add "${forkPath}" ${branchName}`, { cwd: targetDir, stdio: 'pipe' });
        } catch (error) {
          // Create as regular directory instead
          await fs.mkdir(forkPath, { recursive: true });
        }
      }
    }
  }
}

/**
 * Generate orchestrator instructions
 */
function generateOrchestratorInstructions(config, forksPerStream, inboxDir, windowInfo) {
  const streams = config.streams || [];
  
  const tabList = windowInfo.map(w => {
    if (w.type === 'orchestrator') return `Tab 0: Orchestrator (you)`;
    return `Tab ${w.windowIndex}: ${w.name} (${w.panes.length} forks) - PRDs: ${w.prds?.join(', ')}`;
  }).join('\n');
  
  return `You are the ORCHESTRATOR. You do NOT write code.

## Session Layout
${tabList}

Switch tabs: Ctrl+B then 0, 1, 2, etc.
Switch panes within tab: Ctrl+B then arrow keys

## Your Job
1. Monitor the inbox file for completion messages from forks
2. When a fork reports completion, switch to their tab to review
3. Run @gap-analysis on their branch
4. Compare implementations from parallel forks
5. Pick the best implementation and approve it

## Inbox Location
${inboxDir}/orchestrator.json

Forks append JSON messages like:
{ "from": "stream-a-fork-1", "status": "complete", "prd": "auth", "branch": "..." }

## Commands
- Read inbox: cat ${inboxDir}/orchestrator.json
- Check branch: git diff main...<branch>
- Gap analysis: @gap-analysis

Start by reading the inbox. Say "ready" when you understand.`;
}

/**
 * Generate CLAUDE.md for a fork
 */
function generateClaudeMd(pane, config, inboxDir, targetDir) {
  const { stream, forkNum, prds, forksPerStream } = pane;
  const forkId = forksPerStream > 1 ? `stream-${stream.toLowerCase()}-fork-${forkNum}` : `stream-${stream.toLowerCase()}`;
  
  return `# Fork Instructions: ${forkId}

## Your Assignment
- Stream: ${stream}
${forksPerStream > 1 ? `- Fork: ${forkNum} of ${forksPerStream}` : ''}
- PRDs to implement: ${prds?.join(', ') || 'as assigned'}

## Implementation Loop

For each PRD:
1. Read the PRD file from \`docs/prds/<prd-id>.md\`
2. Implement each story/feature
3. Commit your changes to this branch
4. Report completion to orchestrator

## How to Report Completion

When you finish a PRD (keeps JSON valid):

\`\`\`bash
node "${targetDir}/cli/lib/orchestration/post-message.js" \\
  --target "${targetDir}" \\
  --inbox orchestrator \\
  --from "${forkId}" \\
  --type "prd_complete" \\
  --prd "<prd-id>"
\`\`\`

## Your Branch
You're working on a dedicated branch. Commit frequently.

## Start Now
Begin implementing: ${prds?.[0] || 'first assigned PRD'}
`;
}

/**
 * Send a prompt to a specific tmux window and pane
 */
async function sendPromptToPane(sessionName, windowIndex, paneIndex, prompt) {
  const escapedPrompt = prompt.replace(/'/g, "'\\''");
  execSync(`tmux send-keys -t ${sessionName}:${windowIndex}.${paneIndex} -l '${escapedPrompt}'`, { stdio: 'pipe' });
  execSync(`tmux send-keys -t ${sessionName}:${windowIndex}.${paneIndex} Enter`, { stdio: 'pipe' });
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Quick launch - spawn N Claude instances in tabs (no PRD setup)
 * 
 * @param {string} targetDir - Project directory
 * @param {number} numAgents - Number of Claude instances to launch
 */
export async function quickLaunch(targetDir, numAgents = 2) {
  const sessionName = 'sigma-quick';
  
  console.log(chalk.cyan(`\n⚡ Quick Launch: ${numAgents} Claude Code instances in separate tabs\n`));
  
  // Kill existing
  try {
    execSync(`tmux kill-session -t ${sessionName}`, { stdio: 'pipe' });
  } catch {
    // No existing session - intentionally empty
  }

  // Create session with first window
  execSync(`tmux new-session -d -s ${sessionName} -n "Agent-1" -c "${targetDir}"`, { stdio: 'pipe' });
  execSync(`tmux send-keys -t ${sessionName}:0 'claude --dangerously-skip-permissions' Enter`, { stdio: 'pipe' });
  
  // Create additional windows (tabs)
  for (let i = 2; i <= numAgents; i++) {
    execSync(`tmux new-window -t ${sessionName} -n "Agent-${i}" -c "${targetDir}"`, { stdio: 'pipe' });
    execSync(`tmux send-keys -t ${sessionName}:${i-1} 'claude --dangerously-skip-permissions' Enter`, { stdio: 'pipe' });
  }
  
  // Go back to first tab
  execSync(`tmux select-window -t ${sessionName}:0`, { stdio: 'pipe' });
  
  console.log(chalk.green(`✓ Created ${numAgents} tabs with Claude Code\n`));
  
  console.log(chalk.gray('Navigation:'));
  console.log(chalk.gray('  Ctrl+B → 0-9    Jump to tab by number'));
  console.log(chalk.gray('  Ctrl+B → n/p    Next/Previous tab'));
  console.log(chalk.gray('  Ctrl+B → w      List all tabs'));
  console.log(chalk.gray('  Ctrl+B → d      Detach\n'));
  
  console.log(chalk.cyan('Attaching to session...\n'));
  
  // Attach
  spawn('tmux', ['attach', '-t', sessionName], { stdio: 'inherit' });
}

/**
 * Quick launch with panes (all in one window) for simpler setup
 */
export async function quickLaunchPanes(targetDir, numAgents = 2) {
  const sessionName = 'sigma-quick';
  
  console.log(chalk.cyan(`\n⚡ Quick Launch: ${numAgents} Claude Code instances in panes\n`));
  
  // Kill existing
  try {
    execSync(`tmux kill-session -t ${sessionName}`, { stdio: 'pipe' });
  } catch {
    // No existing session - intentionally empty
  }

  // Create session
  execSync(`tmux new-session -d -s ${sessionName} -c "${targetDir}" -n "sigma"`, { stdio: 'pipe' });
  
  // Create panes
  for (let i = 1; i < numAgents; i++) {
    execSync(`tmux split-window -t ${sessionName}:0 -h -c "${targetDir}"`, { stdio: 'pipe' });
    execSync(`tmux select-layout -t ${sessionName}:0 tiled`, { stdio: 'pipe' });
  }
  
  // Launch Claude in each
  for (let i = 0; i < numAgents; i++) {
    execSync(`tmux send-keys -t ${sessionName}:0.${i} 'claude --dangerously-skip-permissions' Enter`, { stdio: 'pipe' });
  }
  
  console.log(chalk.green(`✓ Created ${numAgents} panes with Claude Code`));
  console.log(chalk.gray(`\nNavigation: Ctrl+B → arrow keys`));
  console.log(chalk.gray(`Zoom pane: Ctrl+B → z\n`));
  
  // Attach
  spawn('tmux', ['attach', '-t', sessionName], { stdio: 'inherit' });
}

export default {
  launchPureTmux,
  quickLaunch,
  quickLaunchPanes
};

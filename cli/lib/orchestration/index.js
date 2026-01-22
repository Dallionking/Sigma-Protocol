/**
 * Sigma Protocol - Orchestration Module
 * 
 * Implements the orchestration flow following the @doctor-fix pattern:
 * 1. PRD detection and validation
 * 2. Agent selection (Claude Code vs OpenCode)
 * 3. Story selector (space-toggle multi-select)
 * 4. Environment selection (Local vs Sandbox)
 * 5. Agent Hub MCP installation (inter-agent communication)
 * 6. Git worktree creation (Step 11b integration)
 * 7. Orchestrator + Stream spawning
 * 8. Status monitoring via /hub:sync
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync, spawn } from 'child_process';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

// ============================================================================
// Step 1: PRD Detection
// ============================================================================

/**
 * Detect PRDs in the project
 * @param {string} targetDir - Project directory
 * @returns {Promise<Array<{id: string, title: string, path: string, content: string}>>}
 */
export async function detectPRDs(targetDir) {
  const prdsDir = path.join(targetDir, 'docs', 'prds');
  const prds = [];

  try {
    const files = await fs.readdir(prdsDir);
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(prdsDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extract title from first heading or filename
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : file.replace('.md', '');
      
      // Use filename (without extension) as ID
      const id = file.replace('.md', '');
      
      prds.push({
        id,
        title,
        path: filePath,
        content
      });
    }
  } catch (_error) {
    // prds directory doesn't exist
    return [];
  }

  return prds;
}

/**
 * Check if PRDs exist and are ready for implementation
 * @param {string} targetDir - Project directory
 * @returns {Promise<{ready: boolean, prds: Array, message: string}>}
 */
export async function checkPRDs(targetDir) {
  const prds = await detectPRDs(targetDir);
  
  if (prds.length === 0) {
    return {
      ready: false,
      prds: [],
      message: 'No PRDs found in docs/prds/. Run Step 11 (PRD Generation) first, or create PRDs manually.'
    };
  }
  
  return {
    ready: true,
    prds,
    message: `Found ${prds.length} PRDs ready for implementation`
  };
}

// ============================================================================
// Step 2: Agent Selection
// ============================================================================

/**
 * Prompt user to select AI coding agent
 * @returns {Promise<'claude'|'opencode'>}
 */
export async function selectAgent() {
  // Detect installed agents
  const hasClaudeCode = checkCommandExists('claude');
  const hasOpenCode = checkCommandExists('opencode');
  
  const choices = [
    {
      name: `Claude Code (Anthropic subscription) ${hasClaudeCode ? chalk.green('✓ installed') : chalk.gray('not installed')}`,
      value: 'claude'
    },
    {
      name: `OpenCode (Open source) ${hasOpenCode ? chalk.green('✓ installed') : chalk.gray('not installed')}`,
      value: 'opencode'
    }
  ];
  
  const { agent } = await inquirer.prompt([{
    type: 'list',
    name: 'agent',
    message: 'Which AI coding agent do you want to use?',
    choices,
    default: hasClaudeCode ? 'claude' : hasOpenCode ? 'opencode' : 'claude'
  }]);
  
  return agent;
}

// ============================================================================
// Step 3: Story Selector
// ============================================================================

/**
 * Show multi-select UI for choosing which PRDs to run
 * @param {Array} prds - List of detected PRDs
 * @returns {Promise<Array>} - Selected PRDs
 */
export async function selectStories(prds) {
  const { selectedStories } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selectedStories',
    message: 'Select stories to build (Space to toggle, Enter to confirm):',
    choices: prds.map((prd) => ({
      name: `${prd.id}: ${prd.title}`,
      value: prd,
      checked: true // Default all selected
    })),
    pageSize: 15,
    validate: (answer) => {
      if (answer.length === 0) {
        return 'You must select at least one story.';
      }
      return true;
    }
  }]);
  
  return selectedStories;
}

// ============================================================================
// Step 4: Environment Selection
// ============================================================================

/**
 * Check if iTerm2 is available (macOS only)
 */
function checkIterm2Available() {
  if (process.platform !== 'darwin') return false;
  try {
    const apps = execSync('ls /Applications/ 2>/dev/null || true', { encoding: 'utf-8' });
    return apps.includes('iTerm.app');
  } catch {
    return false;
  }
}

/**
 * Prompt user to select execution environment
 * @returns {Promise<'local-iterm'|'local-tmux'|'e2b'|'docker'|'daytona'>}
 */
export async function selectEnvironment() {
  const hasIterm = checkIterm2Available();
  
  const localChoices = [];
  if (hasIterm) {
    localChoices.push({ name: 'Local - iTerm2 (native Mac tabs, click to navigate)', value: 'local-iterm' });
  }
  localChoices.push({ name: 'Local - tmux (detachable, Ctrl+B navigation)', value: 'local-tmux' });
  
  const { environment } = await inquirer.prompt([{
    type: 'list',
    name: 'environment',
    message: 'Where should the agents run?',
    choices: [
      ...localChoices,
      new inquirer.Separator('─── Cloud/Sandbox Options ───'),
      { name: 'E2B Sandbox (cloud at scale)', value: 'e2b' },
      { name: 'Docker Sandbox (local containers)', value: 'docker' },
      { name: 'Daytona Sandbox (dev environments)', value: 'daytona' }
    ],
    default: hasIterm ? 'local-iterm' : 'local-tmux'
  }]);
  
  return environment;
}

// ============================================================================
// Step 4.5: Stream Count Selection
// ============================================================================

/**
 * Prompt user to select number of parallel streams
 * @param {number} prdCount - Number of PRDs selected
 * @returns {Promise<number>}
 */
export async function selectStreamCount(prdCount) {
  const { streamCount } = await inquirer.prompt([{
    type: 'list',
    name: 'streamCount',
    message: 'How many parallel streams?',
    choices: [
      { name: `Auto (${Math.min(prdCount, 4)} based on PRD count)`, value: 'auto' },
      { name: '1 stream (sequential)', value: 1 },
      { name: '2 streams', value: 2 },
      { name: '3 streams', value: 3 },
      { name: '4 streams', value: 4 },
      { name: 'Custom...', value: 'custom' }
    ],
    default: 'auto'
  }]);
  
  if (streamCount === 'auto') {
    return Math.min(prdCount, 4);
  }
  
  if (streamCount === 'custom') {
    const { customCount } = await inquirer.prompt([{
      type: 'number',
      name: 'customCount',
      message: 'Enter number of streams (1-8):',
      default: 3,
      validate: (value) => {
        if (value >= 1 && value <= 8) return true;
        return 'Please enter a number between 1 and 8';
      }
    }]);
    return customCount;
  }
  
  return streamCount;
}

// ============================================================================
// Step 4.75: Forks Per Stream Selection (Best of N)
// ============================================================================

/**
 * Prompt user to enable forks (Best of N pattern)
 * Simple yes/no with fork count if yes
 * 
 * Architecture:
 *   tmux (outer shell - shows all stream panes)
 *   └── Stream panes
 *       └── mprocs (inner TUI - manages forks within each stream)
 *           └── Fork processes (each running Claude Code)
 * 
 * @returns {Promise<number>} - Number of forks (1 = no forking)
 */
export async function selectForksPerStream() {
  const { enableForks } = await inquirer.prompt([{
    type: 'confirm',
    name: 'enableForks',
    message: 'Enable parallel forks per stream (Best of N pattern)?',
    default: false
  }]);
  
  if (!enableForks) {
    return 1;
  }
  
  const { forkCount } = await inquirer.prompt([{
    type: 'list',
    name: 'forkCount',
    message: 'How many forks per stream?',
    choices: [
      { name: '2 forks', value: 2 },
      { name: '3 forks (recommended)', value: 3 },
      { name: '5 forks (more comparison options)', value: 5 }
    ],
    default: 3
  }]);
  
  return forkCount;
}

// ============================================================================
// Step 5: Install Agent Hub MCP (Inter-Agent Communication)
// ============================================================================

/**
 * Ensure agent-hub-mcp is installed for inter-agent communication
 * @param {string} _targetDir - Project directory (unused, kept for compatibility)
 * @returns {Promise<boolean>}
 */
export async function ensureAgentMailInstalled(_targetDir) {
  const spinner = ora('Checking Agent Hub MCP installation...').start();
  
  // Check if agent-hub-mcp is configured in Claude Code
  const mcpConfigPath = path.join(process.env.HOME, '.claude', 'mcp.json');
  let isInstalled = false;
  
  try {
    const config = JSON.parse(await fs.readFile(mcpConfigPath, 'utf-8'));
    isInstalled = config.mcpServers && config.mcpServers['agent-hub'];
  } catch {
    // Config doesn't exist or is invalid
  }
  
  if (!isInstalled) {
    spinner.text = 'Installing Agent Hub MCP for inter-agent communication...';
    
    try {
      // Try using Claude Code's mcp add command
      execSync('claude mcp add agent-hub -- npx -y agent-hub-mcp@latest', { stdio: 'pipe' });
      spinner.succeed('Agent Hub MCP installed via Claude Code');
      console.log(chalk.dim('  → Agents can now communicate via /hub:register, /hub:sync, /hub:status'));
      return true;
    } catch (_error) {
      // Claude mcp add failed, try manual config
      try {
        // Read or create mcp.json
        let config = { mcpServers: {} };
        try {
          config = JSON.parse(await fs.readFile(mcpConfigPath, 'utf-8'));
          if (!config.mcpServers) config.mcpServers = {};
        } catch {
          // Create directory if needed
          await fs.mkdir(path.dirname(mcpConfigPath), { recursive: true });
        }
        
        // Add agent-hub server
        config.mcpServers['agent-hub'] = {
          command: 'npx',
          args: ['-y', 'agent-hub-mcp@latest']
        };
        
        await fs.writeFile(mcpConfigPath, JSON.stringify(config, null, 2));
        spinner.succeed('Agent Hub MCP configured in ~/.claude/mcp.json');
        console.log(chalk.yellow('  ⚠ Restart Claude Code to activate inter-agent communication'));
        return true;
      } catch {
        spinner.warn('Could not install Agent Hub MCP. Inter-agent communication will be limited.');
        console.log(chalk.dim('  → Manual install: claude mcp add agent-hub -- npx -y agent-hub-mcp@latest'));
        return false;
      }
    }
  }
  
  spinner.succeed('Agent Hub MCP ready');
  return true;
}

// ============================================================================
// Step 6: Create Git Worktrees
// ============================================================================

/**
 * Create git worktrees for each stream based on Step 11b
 * @param {string} targetDir - Project directory
 * @param {number} numStreams - Number of streams to create
 * @returns {Promise<Array<{name: string, path: string, branch: string}>>}
 */
export async function createWorktrees(targetDir, numStreams) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const worktreesDir = path.join(targetDir, 'worktrees');
  const worktrees = [];
  
  // Create worktrees directory
  await fs.mkdir(worktreesDir, { recursive: true });
  
  const spinner = ora('Creating git worktrees...').start();
  
  for (let i = 0; i < Math.min(numStreams, letters.length); i++) {
    const letter = letters[i];
    const worktreePath = path.join(worktreesDir, `stream-${letter.toLowerCase()}`);
    const branchName = `stream-${letter.toLowerCase()}`;
    
    spinner.text = `Creating worktree: stream-${letter.toLowerCase()}`;
    
    try {
      // Check if worktree already exists
      await fs.access(worktreePath);
      worktrees.push({
        name: letter,
        path: worktreePath,
        branch: branchName,
        existed: true
      });
    } catch {
      // Worktree doesn't exist, create it
      try {
        // Create branch if needed (ignore error if branch exists)
        try {
          execSync(`git branch ${branchName}`, { cwd: targetDir, stdio: 'pipe' });
        } catch {
          // Branch already exists, that's fine
        }
        
        // Create worktree
        execSync(`git worktree add "${worktreePath}" ${branchName}`, { cwd: targetDir, stdio: 'pipe' });
        
        worktrees.push({
          name: letter,
          path: worktreePath,
          branch: branchName,
          existed: false
        });
      } catch (error) {
        spinner.warn(`Could not create worktree stream-${letter.toLowerCase()}: ${error.message}`);
      }
    }
  }
  
  spinner.succeed(`Created ${worktrees.filter(w => !w.existed).length} new worktrees, ${worktrees.filter(w => w.existed).length} already existed`);
  return worktrees;
}

// ============================================================================
// Step 7: Generate streams.json Config
// ============================================================================

/**
 * Generate orchestration config that maps PRDs to streams
 * @param {string} targetDir - Project directory
 * @param {Array} prds - Selected PRDs
 * @param {Array} worktrees - Created worktrees
 * @returns {Promise<Object>}
 */
export async function generateStreamsConfig(targetDir, prds, worktrees) {
  const configDir = path.join(targetDir, '.sigma', 'orchestration');
  await fs.mkdir(configDir, { recursive: true });
  
  // Create inbox directory for message bus
  await fs.mkdir(path.join(configDir, 'inbox'), { recursive: true });
  
  // Distribute PRDs across streams
  const streamsConfig = worktrees.map((worktree, i) => {
    // Simple round-robin distribution of PRDs
    const streamPrds = prds.filter((_, prdIndex) => prdIndex % worktrees.length === i);
    
    return {
      name: worktree.name,
      prds: streamPrds.map(p => p.id),
      worktree: `stream-${worktree.name.toLowerCase()}`,
      priority: i + 1,
      description: `Stream ${worktree.name}: ${streamPrds.map(p => p.title).slice(0, 2).join(', ')}${streamPrds.length > 2 ? '...' : ''}`
    };
  });
  
  const config = {
    version: '1.0.0',
    created: new Date().toISOString(),
    session: 'sigma-orchestration',
    projectRoot: targetDir,
    streams: streamsConfig,
    dependencies: {}, // PRD dependency graph (can be populated from Step 11b)
    merge_order: streamsConfig.map(s => s.name),
    settings: {
      mode: 'semi-auto',
      notify_on: ['prd_complete', 'blocked', 'crash', 'all_complete'],
      auto_merge: false,
      verify_stories: true
    }
  };
  
  const configPath = path.join(configDir, 'streams.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  
  return config;
}

// ============================================================================
// Step 8: Spawn Orchestrator + Streams (Local tmux)
// ============================================================================

/**
 * Generate prompt for orchestrator (DOES NOT implement code!)
 * @param {string} targetDir - Project directory
 * @param {number} forksPerStream - Number of forks per stream
 * @returns {string}
 */
function generateOrchestratorPrompt(targetDir, forksPerStream = 1) {
  const forkInstructions = forksPerStream > 1 ? `
## Best of N Fork Comparison

Each stream has ${forksPerStream} forks working on the same PRD. When forks report completion:

1. **Collect all fork preview URLs and PRs**
   - Each fork creates its own PR to the stream branch
   - Each fork may have a preview URL

2. **Open all previews in browser for comparison**
   - Use browser_navigate to visit each preview URL
   - Use browser_take_screenshot to capture each implementation
   - Compare implementations visually

3. **Run @gap-analysis on each fork's branch**

4. **Pick the BEST fork based on:**
   - Visual quality (screenshots)
   - Gap analysis results
   - Test pass rate
   - Code quality

5. **For the winning fork:**
   - Approve and merge its PR to the stream branch
   - Send CONTINUE message

6. **For losing forks:**
   - Close their PRs with comment explaining why
   - They can continue to next PRD or stop
` : '';

  return `You are the ORCHESTRATOR. You do NOT implement any code.

## Your Responsibilities
1. Monitor all streams via Agent Hub MCP (/hub:sync)
2. Run @gap-analysis when streams report PRD completion
3. Use browser tools to verify frontend implementations
4. Approve or request revisions for completed PRDs
5. Coordinate the final merge sequence
${forkInstructions}

Working directory: ${targetDir}

## Getting Started
1. Register with the hub: /hub:register
2. Check hub status: /hub:status
3. Monitor streams: /hub:sync (shows messages from all agents)

## Communication Commands
- /hub:sync - Get messages and workload updates
- /hub:status - View hub activity overview
- Send messages to streams using Agent Hub tools

CRITICAL: Do NOT write any implementation code. Your role is oversight only.`;
}

/**
 * Generate prompt for stream worker
 * @param {Object} stream - Stream configuration
 * @param {string} worktreePath - Path to stream's worktree
 * @returns {string}
 */
function generateStreamPrompt(stream, worktreePath) {
  return `You are Stream ${stream.name} worker.

Your worktree: ${worktreePath}
Your PRDs: ${stream.prds.join(', ')}

## Getting Started
1. Register with the hub: /hub:register
2. Check for assignments: /hub:sync

## Implementation Loop
For each PRD:
1. Read the PRD file
2. Implement each story using @implement-prd or Ralph loop methodology
3. Report completion: /hub:sync (sends completion message to orchestrator)
4. Wait for orchestrator approval via /hub:sync
5. Move to next PRD when approved

Your git branch: stream-${stream.name.toLowerCase()}
Commit your changes after each completed story.`;
}

/**
 * Spawn local orchestration using tmux
 * Russian doll: tmux (streams) > mprocs (forks) > Claude Code (agents)
 * 
 * @param {string} targetDir - Project directory
 * @param {string} agent - AI agent to use ('claude' or 'opencode')
 * @param {Object} config - Streams configuration
 * @param {number} forksPerStream - Number of forks per stream (1 = no forking)
 * @returns {Promise<void>}
 */
export async function spawnLocalOrchestration(targetDir, agent, config, forksPerStream = 1) {
  // New default: tmux windows (tabs) per stream, panes per fork (no mprocs)
  const { launchPureTmux } = await import('./tmux-launcher.js');
  await launchPureTmux({
    targetDir,
    agent,
    config,
    forksPerStream,
    sessionName: 'sigma-orc'
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a command exists on the system
 * @param {string} command - Command to check
 * @returns {boolean}
 */
function checkCommandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if tmux is installed
 * @returns {boolean}
 */
export function checkTmuxInstalled() {
  return checkCommandExists('tmux');
}

/**
 * Check if mprocs is installed
 * @returns {boolean}
 */
export function checkMprocsInstalled() {
  return checkCommandExists('mprocs');
}

// ============================================================================
// Main Orchestration Flow
// ============================================================================

/**
 * Run the complete orchestration flow following @doctor-fix pattern
 * @param {Object} options - Orchestration options
 * @param {string} options.targetDir - Project directory
 * @param {string} [options.agent] - Pre-selected agent
 * @param {string} [options.environment] - Pre-selected environment
 * @param {boolean} [options.skipAgentPrompt] - Skip agent selection
 * @param {boolean} [options.skipEnvPrompt] - Skip environment selection
 */
export async function runOrchestration(options) {
  const { targetDir } = options;
  
  console.log(chalk.cyan('\n🐝 Sigma Protocol Orchestration\n'));
  
  // Step 1: PRD Detection Check
  console.log(chalk.gray('Checking for PRDs...'));
  const prdCheck = await checkPRDs(targetDir);
  
  if (!prdCheck.ready) {
    console.log(chalk.yellow(`\n⚠️  ${prdCheck.message}\n`));
    console.log(chalk.gray('Create PRDs in docs/prds/ directory or run:'));
    console.log(chalk.cyan('  sigma tutorial   # Then complete Step 11\n'));
    return { success: false, reason: 'no_prds' };
  }
  
  console.log(chalk.green(`✓ ${prdCheck.message}\n`));
  
  // Step 2: Agent Selection
  const agent = options.agent || await selectAgent();
  console.log(chalk.gray(`\nUsing agent: ${agent}\n`));
  
  // Step 3: Story Selector
  const selectedPrds = await selectStories(prdCheck.prds);
  
  if (selectedPrds.length === 0) {
    console.log(chalk.yellow('\nNo stories selected. Exiting.\n'));
    return { success: false, reason: 'no_selection' };
  }
  
  console.log(chalk.cyan(`\nSelected ${selectedPrds.length}/${prdCheck.prds.length} stories:`));
  selectedPrds.forEach(s => console.log(chalk.gray(`  - ${s.id}: ${s.title}`)));
  
  // Step 4: Environment Selection
  const environment = options.environment || await selectEnvironment();
  
  // Sandbox mode - delegate to sandbox orchestration
  if (!environment.startsWith('local')) {
    console.log(chalk.cyan(`\n🐳 Delegating to sandbox orchestration (${environment})...\n`));
    return { 
      success: true, 
      delegateTo: 'sandbox',
      environment,
      agent,
      prds: selectedPrds
    };
  }
  
  // Determine local backend (iterm or tmux)
  const useIterm = environment === 'local-iterm';
  const backendName = useIterm ? 'iTerm2' : 'tmux';
  console.log(chalk.gray(`\nEnvironment: Local (${backendName})\n`));
  
  // Check required tools based on backend
  if (!useIterm && !checkTmuxInstalled()) {
    console.log(chalk.red('Error: tmux is not installed.\n'));
    console.log(chalk.white('Install tmux first:'));
    console.log(chalk.cyan('  macOS: brew install tmux'));
    console.log(chalk.cyan('  Ubuntu: sudo apt install tmux\n'));
    return { success: false, reason: 'no_tmux' };
  }
  
  // Step 4.5: Stream Count Selection
  const numStreams = options.streamCount || await selectStreamCount(selectedPrds.length);
  console.log(chalk.gray(`\nParallel streams: ${numStreams}\n`));
  
  // Step 4.75: Forks Per Stream Selection (Best of N)
  const forksPerStream = options.forksPerStream || await selectForksPerStream();
  
  if (forksPerStream > 1) {
    console.log(chalk.cyan(`\n📐 Architecture: ${backendName} → ${numStreams} streams → ${forksPerStream} forks each`));
    console.log(chalk.gray(`   Total agents: ${numStreams * forksPerStream} Claude Code instances + 1 orchestrator\n`));
  } else {
    console.log(chalk.cyan(`\n📐 Architecture: ${backendName} → ${numStreams} streams (no forks)`));
    console.log(chalk.gray(`   Total agents: ${numStreams} Claude Code instances + 1 orchestrator\n`));
  }
  
  // Step 5: Install Message Bus
  await ensureAgentMailInstalled(targetDir);
  
  // Step 6: Create Git Worktrees
  const worktrees = await createWorktrees(targetDir, numStreams);
  
  if (worktrees.length === 0) {
    console.log(chalk.red('\n❌ Failed to create any git worktrees.\n'));
    return { success: false, reason: 'no_worktrees' };
  }
  
  // Step 7: Generate streams.json Config
  const config = await generateStreamsConfig(targetDir, selectedPrds, worktrees);
  config.forksPerStream = forksPerStream; // Add forks config
  console.log(chalk.green(`\n✓ Generated streams.json with ${config.streams.length} streams, ${forksPerStream} fork(s) each\n`));
  
  // Step 8: Spawn Orchestrator + Streams
  if (useIterm) {
    // Use iTerm2 native tabs and panes
    const { launchItermTabs } = await import('./iterm-launcher.js');
    await launchItermTabs({
      targetDir,
      agent,
      config,
      forksPerStream,
      autoStart: options.autoStart || false
    });
  } else {
    // Use tmux (Russian Doll: tmux > mprocs > Claude)
    await spawnLocalOrchestration(targetDir, agent, config, forksPerStream);
  }
  
  return { success: true };
}

export default {
  detectPRDs,
  checkPRDs,
  selectAgent,
  selectStories,
  selectEnvironment,
  selectStreamCount,
  selectForksPerStream,
  ensureAgentMailInstalled,
  createWorktrees,
  generateStreamsConfig,
  spawnLocalOrchestration,
  runOrchestration,
  checkTmuxInstalled,
  checkMprocsInstalled
};


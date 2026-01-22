/**
 * Sigma Protocol - Fork Manager
 * 
 * Manages the fork layer within streams:
 * 1. Creates nested git worktrees for fork isolation
 * 2. Generates mprocs.yaml for each stream
 * 3. Tracks fork lifecycle and status
 * 4. Aggregates fork results for Best of N selection
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import yaml from 'js-yaml';

/**
 * Fork configuration defaults
 */
const DEFAULTS = {
  forksPerStream: 1,
  forkTimeout: 3600, // 1 hour per fork
  autoCreatePR: true,
  ralphLoop: true
};

/**
 * Generate fork prompt for Claude Code
 * @param {Object} options - Fork options
 * @returns {string} - Prompt for Claude Code
 */
export function generateForkPrompt(options) {
  const { streamName, forkId, prdId, prdTitle, prdPath, worktreePath } = options;
  
  return `You are Fork ${forkId} of Stream ${streamName}.

## Your Assignment
PRD: ${prdTitle} (${prdId})
PRD Path: ${prdPath}

## Your Worktree
Path: ${worktreePath}
Branch: stream-${streamName.toLowerCase()}-fork-${forkId}

## Instructions

1. Read and understand the PRD at ${prdPath}

2. Implement using Ralph loop methodology:
   - Research: Understand requirements
   - Analyze: Plan implementation  
   - Loop: Implement iteratively
   - Polish: Clean up and test
   - Halt: Report completion

3. After each story completion, report via Agent Hub:
   - Run /hub:sync to send completion message
   - Include: story_id, commit_hash, preview_url (if applicable)

4. When PRD is complete:
   - Create a GitHub PR from your branch to stream-${streamName.toLowerCase()}
   - Report PRD_COMPLETE with PR URL

5. Wait for CONTINUE or REVISION_NEEDED from orchestrator

## Remember
- You are one of multiple forks working on the same PRD
- The orchestrator will compare all forks and pick the best
- Focus on quality and completeness
- Commit frequently with clear messages`;
}

/**
 * Generate mprocs.yaml for a stream with forks
 * @param {Object} stream - Stream configuration
 * @param {number} forkCount - Number of forks
 * @param {string} agent - Agent to use ('claude' or 'opencode')
 * @param {string} streamDir - Absolute path to stream worktree directory
 * @returns {string} - YAML content
 */
export function generateMprocsConfig(_stream, forkCount, agent = 'claude', streamDir = '.') {
  const agentCmd = agent === 'claude' ? 'claude' : 'opencode';
  const procs = {};

  for (let i = 1; i <= forkCount; i++) {
    // Build the fork path
    const forkPath = path.join(streamDir, 'forks', `fork-${i}`);

    // Launch Claude interactively (no -p flag) so it stays running
    // User can cycle through forks and interact with each one
    procs[`fork-${i}`] = {
      cwd: forkPath,
      shell: `${agentCmd} --dangerously-skip-permissions`,
      autostart: true
    };
  }

  // Force YAML to quote strings to handle special characters
  return yaml.dump({ procs }, {
    lineWidth: -1,
    forceQuotes: true,
    quotingType: '"'
  });
}

/**
 * Generate initial instructions for a fork
 * @param {Object} stream - Stream configuration
 * @param {number} forkId - Fork ID
 * @returns {string} - Instructions to send to the fork
 */
export function generateForkInstructions(stream, forkId) {
  const simplePrd = stream.prds[0] || 'default';
  return `You are Fork ${forkId} of Stream ${stream.name}. Read docs/prds/${simplePrd}.md and implement it. Run /hub:register to join the hub, then start implementing.`;
}

/**
 * Create nested git worktrees for forks within a stream
 * @param {string} targetDir - Project root directory
 * @param {Object} stream - Stream configuration
 * @param {number} forkCount - Number of forks to create
 * @returns {Promise<Array>} - Created fork paths
 */
export async function createForkWorktrees(targetDir, stream, forkCount) {
  const streamName = stream.name.toLowerCase();
  const streamDir = path.join(targetDir, 'worktrees', `stream-${streamName}`);
  const forksDir = path.join(streamDir, 'forks');
  
  // Ensure forks directory exists
  await fs.mkdir(forksDir, { recursive: true });
  
  const createdForks = [];
  
  for (let i = 1; i <= forkCount; i++) {
    const forkBranch = `stream-${streamName}-fork-${i}`;
    const forkPath = path.join(forksDir, `fork-${i}`);
    
    try {
      // Check if fork already exists
      await fs.access(forkPath);
      console.log(chalk.yellow(`  Fork ${i} already exists at ${forkPath}`));
      createdForks.push({ id: i, path: forkPath, branch: forkBranch, existed: true });
      continue;
    } catch {
      // Fork doesn't exist, create it
    }
    
    try {
      // Create branch from stream branch (or main if stream branch doesn't exist)
      const streamBranch = `stream-${streamName}`;
      try {
        execSync(`git rev-parse --verify ${streamBranch}`, { 
          cwd: targetDir, 
          stdio: 'pipe' 
        });
        // Stream branch exists, create fork from it
        execSync(`git branch ${forkBranch} ${streamBranch} 2>/dev/null || true`, {
          cwd: targetDir,
          stdio: 'pipe'
        });
      } catch {
        // Stream branch doesn't exist, create from current HEAD
        execSync(`git branch ${forkBranch} HEAD 2>/dev/null || true`, {
          cwd: targetDir,
          stdio: 'pipe'
        });
      }
      
      // Create nested worktree
      execSync(`git worktree add "${forkPath}" ${forkBranch}`, {
        cwd: targetDir,
        stdio: 'pipe'
      });

      // Create CLAUDE.md with fork instructions so Claude knows what to do on startup
      const simplePrd = stream.prds[0] || 'default';
      const claudeMd = `# Fork ${i} - Stream ${stream.name}

**START IMMEDIATELY**: Read docs/prds/${simplePrd}.md and implement it.

You are Fork ${i} competing with other forks on the same PRD. Focus on quality.

When done:
1. Commit all changes
2. Append to .sigma/orchestration/inbox/orchestrator.json:
   {"type":"done","fork":${i},"stream":"${stream.name}"}
`;
      await fs.writeFile(path.join(forkPath, 'CLAUDE.md'), claudeMd, 'utf-8');

      console.log(chalk.green(`  ✓ Created fork ${i}: ${forkPath} (${forkBranch})`));
      createdForks.push({ id: i, path: forkPath, branch: forkBranch, existed: false });
      
    } catch (error) {
      console.error(chalk.red(`  ✗ Failed to create fork ${i}: ${error.message}`));
    }
  }
  
  return createdForks;
}

/**
 * Generate and write mprocs.yaml for a stream
 * @param {string} targetDir - Project root directory
 * @param {Object} stream - Stream configuration
 * @param {number} forkCount - Number of forks
 * @param {string} agent - Agent to use
 * @returns {Promise<string>} - Path to generated mprocs.yaml
 */
export async function generateStreamMprocs(targetDir, stream, forkCount, agent = 'claude') {
  const streamName = stream.name.toLowerCase();
  const streamDir = path.join(targetDir, 'worktrees', `stream-${streamName}`);
  const mprocsPath = path.join(streamDir, 'mprocs.yaml');

  // Pass absolute streamDir path so mprocs.yaml has absolute cwd paths
  const mprocsContent = generateMprocsConfig(stream, forkCount, agent, streamDir);
  await fs.writeFile(mprocsPath, mprocsContent, 'utf-8');

  console.log(chalk.cyan(`  Generated mprocs.yaml for stream ${stream.name} with ${forkCount} forks`));

  return mprocsPath;
}

/**
 * Set up all forks for all streams
 * @param {string} targetDir - Project root directory
 * @param {Array} streams - Stream configurations
 * @param {number} forksPerStream - Number of forks per stream
 * @param {string} agent - Agent to use
 * @returns {Promise<Object>} - Setup results
 */
export async function setupAllForks(targetDir, streams, forksPerStream, agent = 'claude') {
  console.log(chalk.blue(`\nSetting up ${forksPerStream} fork(s) per stream...\n`));
  
  const results = {
    streams: [],
    totalForks: 0,
    errors: []
  };
  
  for (const stream of streams) {
    console.log(chalk.cyan(`Stream ${stream.name}:`));
    
    try {
      // Create fork worktrees
      const forks = await createForkWorktrees(targetDir, stream, forksPerStream);
      
      // Generate mprocs.yaml
      const mprocsPath = await generateStreamMprocs(targetDir, stream, forksPerStream, agent);
      
      results.streams.push({
        name: stream.name,
        forks,
        mprocsPath
      });
      results.totalForks += forks.length;
      
    } catch (error) {
      console.error(chalk.red(`  Error setting up stream ${stream.name}: ${error.message}`));
      results.errors.push({ stream: stream.name, error: error.message });
    }
    
    console.log('');
  }
  
  console.log(chalk.green(`✓ Created ${results.totalForks} forks across ${streams.length} streams`));
  
  return results;
}

/**
 * Clean up fork worktrees for a stream
 * @param {string} targetDir - Project root directory
 * @param {string} streamName - Stream name
 * @returns {Promise<void>}
 */
export async function cleanupForkWorktrees(targetDir, streamName) {
  const forksDir = path.join(targetDir, 'worktrees', `stream-${streamName.toLowerCase()}`, 'forks');
  
  try {
    const forkDirs = await fs.readdir(forksDir);
    
    for (const forkDir of forkDirs) {
      const forkPath = path.join(forksDir, forkDir);
      
      try {
        // Remove worktree
        execSync(`git worktree remove "${forkPath}" --force`, {
          cwd: targetDir,
          stdio: 'pipe'
        });
        console.log(chalk.yellow(`  Removed fork worktree: ${forkPath}`));
      } catch (_error) {
        // Try force removal
        await fs.rm(forkPath, { recursive: true, force: true });
        execSync(`git worktree prune`, { cwd: targetDir, stdio: 'pipe' });
      }
    }
    
    // Clean up branches
    execSync(`git branch | grep "stream-${streamName.toLowerCase()}-fork-" | xargs -r git branch -D`, {
      cwd: targetDir,
      stdio: 'pipe'
    });
    
    } catch (_error) {
      // Forks directory doesn't exist or is empty
    }
}

/**
 * Get status of all forks for a stream
 * @param {string} targetDir - Project root directory
 * @param {string} streamName - Stream name
 * @returns {Promise<Array>} - Fork statuses
 */
export async function getForkStatuses(targetDir, streamName) {
  const forksDir = path.join(targetDir, 'worktrees', `stream-${streamName.toLowerCase()}`, 'forks');
  const statuses = [];
  
  try {
    const forkDirs = await fs.readdir(forksDir);
    
    for (const forkDir of forkDirs) {
      const forkPath = path.join(forksDir, forkDir);
      const forkId = forkDir.replace('fork-', '');
      
      try {
        // Get git status
        const status = execSync(`git status --porcelain`, {
          cwd: forkPath,
          encoding: 'utf-8'
        }).trim();
        
        // Get latest commit
        const lastCommit = execSync(`git log -1 --format="%h %s"`, {
          cwd: forkPath,
          encoding: 'utf-8'
        }).trim();
        
        // Check for preview URL file
        let previewUrl = null;
        try {
          previewUrl = await fs.readFile(path.join(forkPath, '.preview-url'), 'utf-8');
          previewUrl = previewUrl.trim();
        } catch {
          // No preview URL
        }
        
        statuses.push({
          id: parseInt(forkId),
          path: forkPath,
          hasChanges: status.length > 0,
          lastCommit,
          previewUrl
        });
        
      } catch (error) {
        statuses.push({
          id: parseInt(forkId),
          path: forkPath,
          error: error.message
        });
      }
    }
    
  } catch {
    // No forks directory
  }
  
  return statuses.sort((a, b) => a.id - b.id);
}

export default {
  generateForkPrompt,
  generateMprocsConfig,
  createForkWorktrees,
  generateStreamMprocs,
  setupAllForks,
  cleanupForkWorktrees,
  getForkStatuses,
  DEFAULTS
};


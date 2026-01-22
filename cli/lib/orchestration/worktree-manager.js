/**
 * Sigma Protocol - Git Worktree Manager
 * 
 * Manages git worktrees for multi-stream parallel development.
 * Each stream gets its own isolated worktree with a dedicated branch.
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

/**
 * Get list of existing git worktrees
 * @param {string} targetDir - Project directory
 * @returns {Promise<Array<{path: string, branch: string, commit: string}>>}
 */
export async function listWorktrees(targetDir) {
  try {
    const output = execSync('git worktree list --porcelain', { 
      cwd: targetDir, 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const worktrees = [];
    let current = {};
    
    for (const line of output.split('\n')) {
      if (line.startsWith('worktree ')) {
        if (current.path) worktrees.push(current);
        current = { path: line.replace('worktree ', '') };
      } else if (line.startsWith('HEAD ')) {
        current.commit = line.replace('HEAD ', '');
      } else if (line.startsWith('branch ')) {
        current.branch = line.replace('branch refs/heads/', '');
      } else if (line === 'bare') {
        current.bare = true;
      }
    }
    
    if (current.path) worktrees.push(current);
    
    return worktrees.filter(w => !w.bare);
  } catch {
    return [];
  }
}

/**
 * Create a new git worktree
 * @param {string} targetDir - Project directory
 * @param {string} name - Worktree name (e.g., 'stream-a')
 * @param {string} [baseBranch] - Branch to base the new worktree on (default: current branch)
 * @returns {Promise<{path: string, branch: string, created: boolean}>}
 */
export async function createWorktree(targetDir, name, baseBranch = null) {
  const worktreePath = path.join(targetDir, 'worktrees', name);
  const branchName = name;
  
  // Check if worktree already exists
  try {
    await fs.access(worktreePath);
    return { path: worktreePath, branch: branchName, created: false, existed: true };
  } catch {
    // Worktree doesn't exist, create it
  }
  
  // Create worktrees directory
  await fs.mkdir(path.join(targetDir, 'worktrees'), { recursive: true });
  
  try {
    // Get current branch if baseBranch not specified
    if (!baseBranch) {
      baseBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: targetDir,
        encoding: 'utf-8'
      }).trim();
    }
    
    // Create branch if it doesn't exist
    try {
      execSync(`git branch ${branchName} ${baseBranch}`, { cwd: targetDir, stdio: 'pipe' });
    } catch {
      // Branch already exists
    }
    
    // Create worktree
    execSync(`git worktree add "${worktreePath}" ${branchName}`, {
      cwd: targetDir,
      stdio: 'pipe'
    });
    
    return { path: worktreePath, branch: branchName, created: true };
  } catch (error) {
    throw new Error(`Failed to create worktree ${name}: ${error.message}`);
  }
}

/**
 * Remove a git worktree
 * @param {string} targetDir - Project directory
 * @param {string} name - Worktree name
 * @param {boolean} [force] - Force removal even if worktree has changes
 */
export async function removeWorktree(targetDir, name, force = false) {
  const worktreePath = path.join(targetDir, 'worktrees', name);
  
  try {
    const forceFlag = force ? '--force' : '';
    execSync(`git worktree remove ${forceFlag} "${worktreePath}"`, {
      cwd: targetDir,
      stdio: 'pipe'
    });
    return { removed: true };
  } catch (error) {
    throw new Error(`Failed to remove worktree ${name}: ${error.message}`);
  }
}

/**
 * Remove all sigma orchestration worktrees
 * @param {string} targetDir - Project directory
 * @param {boolean} [force] - Force removal
 */
export async function removeAllWorktrees(targetDir, force = false) {
  const worktrees = await listWorktrees(targetDir);
  const sigmaWorktrees = worktrees.filter(w => 
    w.path.includes('/worktrees/stream-')
  );
  
  const results = [];
  for (const wt of sigmaWorktrees) {
    try {
      const name = path.basename(wt.path);
      await removeWorktree(targetDir, name, force);
      results.push({ name, removed: true });
    } catch (error) {
      results.push({ name: path.basename(wt.path), removed: false, error: error.message });
    }
  }
  
  return results;
}

/**
 * Get status of a worktree
 * @param {string} worktreePath - Path to worktree
 * @returns {Promise<{clean: boolean, ahead: number, behind: number, modified: number, untracked: number}>}
 */
export async function getWorktreeStatus(worktreePath) {
  try {
    const status = execSync('git status --porcelain', {
      cwd: worktreePath,
      encoding: 'utf-8'
    });
    
    const lines = status.split('\n').filter(l => l.trim());
    const modified = lines.filter(l => l.startsWith(' M') || l.startsWith('M ')).length;
    const untracked = lines.filter(l => l.startsWith('??')).length;
    
    // Get ahead/behind
    let ahead = 0, behind = 0;
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: worktreePath,
        encoding: 'utf-8'
      }).trim();
      
      const remote = execSync(`git rev-list --left-right --count origin/${branch}...HEAD`, {
        cwd: worktreePath,
        encoding: 'utf-8'
      }).trim();
      
      const [b, a] = remote.split('\t').map(Number);
      behind = b;
      ahead = a;
    } catch {
      // No remote tracking branch
    }
    
    return {
      clean: lines.length === 0,
      ahead,
      behind,
      modified,
      untracked
    };
  } catch {
    return { clean: true, ahead: 0, behind: 0, modified: 0, untracked: 0 };
  }
}

/**
 * Sync a worktree with main branch
 * @param {string} worktreePath - Path to worktree
 * @param {string} [mainBranch] - Main branch to sync from (default: main)
 */
export async function syncWorktree(worktreePath, mainBranch = 'main') {
  try {
    // Fetch latest
    execSync('git fetch origin', { cwd: worktreePath, stdio: 'pipe' });
    
    // Merge main branch
    execSync(`git merge origin/${mainBranch}`, { cwd: worktreePath, stdio: 'pipe' });
    
    return { synced: true };
  } catch (error) {
    throw new Error(`Failed to sync worktree: ${error.message}`);
  }
}

/**
 * Print worktree status table
 * @param {string} targetDir - Project directory
 */
export async function printWorktreeStatus(targetDir) {
  const worktrees = await listWorktrees(targetDir);
  const sigmaWorktrees = worktrees.filter(w => 
    w.path.includes('/worktrees/stream-')
  );
  
  if (sigmaWorktrees.length === 0) {
    console.log(chalk.yellow('No sigma orchestration worktrees found.\n'));
    return;
  }
  
  console.log(chalk.cyan('\n📂 Git Worktrees Status:\n'));
  console.log(chalk.gray('  Name           Branch              Status'));
  console.log(chalk.gray('  ' + '─'.repeat(50)));
  
  for (const wt of sigmaWorktrees) {
    const name = path.basename(wt.path).padEnd(14);
    const branch = (wt.branch || 'detached').padEnd(18);
    const status = await getWorktreeStatus(wt.path);
    
    let statusStr = '';
    if (status.clean) {
      statusStr = chalk.green('✓ clean');
    } else {
      const parts = [];
      if (status.modified > 0) parts.push(`${status.modified} modified`);
      if (status.untracked > 0) parts.push(`${status.untracked} untracked`);
      statusStr = chalk.yellow(parts.join(', '));
    }
    
    if (status.ahead > 0) statusStr += chalk.cyan(` ↑${status.ahead}`);
    if (status.behind > 0) statusStr += chalk.magenta(` ↓${status.behind}`);
    
    console.log(`  ${name} ${branch} ${statusStr}`);
  }
  
  console.log('');
}

export default {
  listWorktrees,
  createWorktree,
  removeWorktree,
  removeAllWorktrees,
  getWorktreeStatus,
  syncWorktree,
  printWorktreeStatus
};



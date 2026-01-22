/**
 * Sigma Protocol - GitHub Integration
 * 
 * Handles GitHub operations for fork-based orchestration:
 * 1. Auto-create PRs for each fork
 * 2. Manage PR lifecycle (merge, close, comment)
 * 3. Collect PR URLs for orchestrator comparison
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

/**
 * Check if GitHub CLI (gh) is installed and authenticated
 * @returns {Promise<{available: boolean, authenticated: boolean}>}
 */
export async function checkGitHubCli() {
  try {
    execSync('gh --version', { stdio: 'pipe' });
    
    try {
      execSync('gh auth status', { stdio: 'pipe' });
      return { available: true, authenticated: true };
    } catch {
      return { available: true, authenticated: false };
    }
  } catch {
    return { available: false, authenticated: false };
  }
}

/**
 * Check if GITHUB_TOKEN is set (for Octokit)
 * @returns {boolean}
 */
export function hasGitHubToken() {
  return !!process.env.GITHUB_TOKEN;
}

/**
 * Get repository info from git remote
 * @param {string} cwd - Working directory
 * @returns {{owner: string, repo: string} | null}
 */
export function getRepoInfo(cwd) {
  try {
    const remoteUrl = execSync('git remote get-url origin', {
      cwd,
      encoding: 'utf-8'
    }).trim();
    
    // Parse GitHub URL (https or ssh)
    const httpsMatch = remoteUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
    const sshMatch = remoteUrl.match(/github\.com:([^/]+)\/([^/.]+)/);
    
    const match = httpsMatch || sshMatch;
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', '')
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Create a PR for a fork using GitHub CLI
 * @param {Object} options - PR options
 * @returns {Promise<{url: string, number: number} | null>}
 */
export async function createForkPR(options) {
  const {
    cwd,
    forkId,
    streamName,
    prdTitle,
    previewUrl,
    baseBranch
  } = options;
  
  const forkBranch = `stream-${streamName.toLowerCase()}-fork-${forkId}`;
  const base = baseBranch || `stream-${streamName.toLowerCase()}`;
  
  const title = `[Fork ${forkId}] ${prdTitle}`;
  const body = `## Fork ${forkId} Implementation

**Stream:** ${streamName}
**PRD:** ${prdTitle}
**Branch:** \`${forkBranch}\`

${previewUrl ? `### Preview\n🔗 ${previewUrl}\n` : ''}

---

*This PR was auto-created by Sigma Protocol fork orchestration.*
*The orchestrator will compare all forks and merge the best one.*`;

  // First, check if we can use gh CLI
  const { available, authenticated } = await checkGitHubCli();
  
  if (available && authenticated) {
    try {
      // Push the branch first
      execSync(`git push -u origin ${forkBranch}`, {
        cwd,
        stdio: 'pipe'
      });
      
      // Create PR using gh CLI
      const result = execSync(
        `gh pr create --title "${title}" --body "${body.replace(/"/g, '\\"')}" --base ${base} --head ${forkBranch}`,
        {
          cwd,
          encoding: 'utf-8'
        }
      ).trim();
      
      // Extract PR URL
      const urlMatch = result.match(/https:\/\/github\.com\/[^\s]+/);
      if (urlMatch) {
        const prUrl = urlMatch[0];
        const numberMatch = prUrl.match(/\/pull\/(\d+)/);
        
        console.log(chalk.green(`  ✓ Created PR: ${prUrl}`));
        
        return {
          url: prUrl,
          number: numberMatch ? parseInt(numberMatch[1]) : null
        };
      }
      
      return null;
    } catch (error) {
      console.error(chalk.red(`  ✗ Failed to create PR: ${error.message}`));
      return null;
    }
  }
  
  // Fallback: Try using Octokit if GITHUB_TOKEN is set
  if (hasGitHubToken()) {
    try {
      const { Octokit } = await import('@octokit/rest');
      const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
      
      const repoInfo = getRepoInfo(cwd);
      if (!repoInfo) {
        console.error(chalk.red('  ✗ Could not determine repository info'));
        return null;
      }
      
      // Push the branch first
      execSync(`git push -u origin ${forkBranch}`, {
        cwd,
        stdio: 'pipe'
      });
      
      const response = await octokit.pulls.create({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        title,
        body,
        head: forkBranch,
        base
      });
      
      console.log(chalk.green(`  ✓ Created PR: ${response.data.html_url}`));
      
      return {
        url: response.data.html_url,
        number: response.data.number
      };
      
    } catch (error) {
      console.error(chalk.red(`  ✗ Failed to create PR via API: ${error.message}`));
      return null;
    }
  }
  
  console.warn(chalk.yellow('  ⚠ No GitHub authentication available. PR not created.'));
  console.warn(chalk.gray('    Install gh CLI and run `gh auth login`, or set GITHUB_TOKEN env var.'));
  
  return null;
}

/**
 * Merge a PR
 * @param {Object} options - Merge options
 * @returns {Promise<boolean>}
 */
export async function mergePR(options) {
  const { prUrl: _prUrl, prNumber, cwd, method = 'squash' } = options;
  
  const { available, authenticated } = await checkGitHubCli();
  
  if (available && authenticated && prNumber) {
    try {
      execSync(`gh pr merge ${prNumber} --${method}`, {
        cwd,
        stdio: 'pipe'
      });
      
      console.log(chalk.green(`  ✓ Merged PR #${prNumber}`));
      return true;
    } catch (error) {
      console.error(chalk.red(`  ✗ Failed to merge PR: ${error.message}`));
      return false;
    }
  }
  
  if (hasGitHubToken() && prNumber) {
    try {
      const { Octokit } = await import('@octokit/rest');
      const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
      
      const repoInfo = getRepoInfo(cwd);
      if (!repoInfo) return false;
      
      await octokit.pulls.merge({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        pull_number: prNumber,
        merge_method: method
      });
      
      console.log(chalk.green(`  ✓ Merged PR #${prNumber}`));
      return true;
      
    } catch (error) {
      console.error(chalk.red(`  ✗ Failed to merge PR via API: ${error.message}`));
      return false;
    }
  }
  
  return false;
}

/**
 * Close a PR with a comment
 * @param {Object} options - Close options
 * @returns {Promise<boolean>}
 */
export async function closePR(options) {
  const { prNumber, cwd, comment } = options;
  
  const { available, authenticated } = await checkGitHubCli();
  
  if (available && authenticated && prNumber) {
    try {
      if (comment) {
        execSync(`gh pr comment ${prNumber} --body "${comment.replace(/"/g, '\\"')}"`, {
          cwd,
          stdio: 'pipe'
        });
      }
      
      execSync(`gh pr close ${prNumber}`, {
        cwd,
        stdio: 'pipe'
      });
      
      console.log(chalk.yellow(`  ✓ Closed PR #${prNumber}`));
      return true;
    } catch (error) {
      console.error(chalk.red(`  ✗ Failed to close PR: ${error.message}`));
      return false;
    }
  }
  
  if (hasGitHubToken() && prNumber) {
    try {
      const { Octokit } = await import('@octokit/rest');
      const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
      
      const repoInfo = getRepoInfo(cwd);
      if (!repoInfo) return false;
      
      if (comment) {
        await octokit.issues.createComment({
          owner: repoInfo.owner,
          repo: repoInfo.repo,
          issue_number: prNumber,
          body: comment
        });
      }
      
      await octokit.pulls.update({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        pull_number: prNumber,
        state: 'closed'
      });
      
      console.log(chalk.yellow(`  ✓ Closed PR #${prNumber}`));
      return true;
      
    } catch (error) {
      console.error(chalk.red(`  ✗ Failed to close PR via API: ${error.message}`));
      return false;
    }
  }
  
  return false;
}

/**
 * Get all PRs for a stream's forks
 * @param {string} cwd - Working directory
 * @param {string} streamName - Stream name
 * @returns {Promise<Array>}
 */
export async function getStreamForkPRs(cwd, streamName) {
  const { available, authenticated } = await checkGitHubCli();
  
  if (available && authenticated) {
    try {
      const result = execSync(
        `gh pr list --search "head:stream-${streamName.toLowerCase()}-fork-" --json number,title,url,state,headRefName`,
        {
          cwd,
          encoding: 'utf-8'
        }
      );
      
      return JSON.parse(result);
    } catch {
      return [];
    }
  }
  
  if (hasGitHubToken()) {
    try {
      const { Octokit } = await import('@octokit/rest');
      const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
      
      const repoInfo = getRepoInfo(cwd);
      if (!repoInfo) return [];
      
      const response = await octokit.pulls.list({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        state: 'open'
      });
      
      return response.data
        .filter(pr => pr.head.ref.startsWith(`stream-${streamName.toLowerCase()}-fork-`))
        .map(pr => ({
          number: pr.number,
          title: pr.title,
          url: pr.html_url,
          state: pr.state,
          headRefName: pr.head.ref
        }));
        
    } catch {
      return [];
    }
  }
  
  return [];
}

/**
 * Open PR URLs in browser
 * @param {Array<string>} urls - PR URLs to open
 */
export function openPRsInBrowser(urls) {
  for (const url of urls) {
    try {
      // macOS
      execSync(`open "${url}"`, { stdio: 'pipe' });
    } catch {
      try {
        // Linux
        execSync(`xdg-open "${url}"`, { stdio: 'pipe' });
      } catch {
        try {
          // Windows
          execSync(`start "${url}"`, { stdio: 'pipe' });
        } catch {
          console.log(chalk.gray(`  Open manually: ${url}`));
        }
      }
    }
  }
}

export default {
  checkGitHubCli,
  hasGitHubToken,
  getRepoInfo,
  createForkPR,
  mergePR,
  closePR,
  getStreamForkPRs,
  openPRsInBrowser
};


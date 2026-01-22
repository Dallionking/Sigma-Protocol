/**
 * Sigma Protocol - Comprehensive Installation Wizard
 *
 * Handles installation of all dependencies:
 * - Core: Node.js, npm (prerequisites)
 * - Orchestration: tmux, mprocs (optional for Best of N)
 * - Sandboxes: E2B SDK, Docker, Daytona SDK
 * - Communication: Agent Hub MCP
 * - Agents: Claude Code, OpenCode
 *
 * Enhanced with:
 * - Real-time progress indicators (Listr2)
 * - Dependency pre-check before installation
 * - Estimated time remaining
 */

import { execSync, exec } from 'child_process';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import boxen from 'boxen';
import fs from 'fs/promises';
import path from 'path';
import { Listr } from 'listr2';

// ============================================================================
// Dependency Definitions
// ============================================================================

const DEPENDENCIES = {
  // Core orchestration tools
  orchestration: {
    title: 'Orchestration Tools',
    description: 'Required for running multiple AI agents in parallel',
    items: [
      {
        name: 'tmux',
        description: 'Terminal multiplexer for managing multiple streams',
        required: true,
        check: () => commandExists('tmux'),
        install: {
          darwin: 'brew install tmux',
          linux: 'sudo apt-get install -y tmux',
          win32: 'winget install tmux'
        }
      },
      {
        name: 'mprocs',
        description: 'Process manager for parallel forks within streams (Best of N)',
        required: false, // Optional - only needed for Best of N pattern
        check: () => commandExists('mprocs'),
        install: {
          darwin: 'brew install mprocs',
          linux: 'cargo install mprocs',
          win32: 'cargo install mprocs'
        }
      }
    ]
  },

  // AI Agents
  agents: {
    title: 'AI Coding Agents',
    description: 'The AI agents that will implement your PRDs',
    items: [
      {
        name: 'claude',
        displayName: 'Claude Code',
        description: 'Anthropic\'s AI coding assistant (requires subscription)',
        required: false,
        check: () => commandExists('claude'),
        install: {
          all: 'npm install -g @anthropic-ai/claude-code'
        }
      },
      {
        name: 'opencode',
        displayName: 'OpenCode',
        description: 'Open-source AI coding assistant',
        required: false,
        check: () => commandExists('opencode'),
        install: {
          all: 'npm install -g opencode'
        }
      }
    ]
  },

  // Inter-agent communication
  communication: {
    title: 'Agent Communication',
    description: 'Enables agents to coordinate and share information',
    items: [
      {
        name: 'agent-hub-mcp',
        displayName: 'Agent Hub MCP',
        description: 'MCP server for multi-agent coordination',
        required: true,
        check: async () => await checkMCPServer('agent-hub'),
        install: {
          all: 'claude mcp add agent-hub -- npx -y agent-hub-mcp@latest',
          fallback: 'Manual: Add to ~/.claude/mcp.json'
        }
      }
    ]
  },

  // Sandbox providers
  sandboxes: {
    title: 'Sandbox Providers',
    description: 'Isolated environments for running AI agents',
    items: [
      {
        name: 'e2b',
        displayName: 'E2B Cloud',
        description: 'Scalable cloud sandboxes ($0.10/min)',
        required: false,
        check: () => npmPackageInstalled('e2b'),
        install: {
          all: 'npm install e2b'
        },
        setup: true
      },
      {
        name: 'docker',
        displayName: 'Docker',
        description: 'Free local isolation',
        required: false,
        check: () => commandExists('docker') && dockerRunning(),
        install: {
          darwin: 'brew install --cask docker',
          linux: 'curl -fsSL https://get.docker.com | sh',
          win32: 'winget install Docker.DockerDesktop'
        },
        setup: true
      },
      {
        name: 'daytona',
        displayName: 'Daytona SDK',
        description: 'Open-source cloud sandboxes ($0.08/min)',
        required: false,
        check: () => npmPackageInstalled('@daytonaio/sdk'),
        install: {
          all: 'npm install @daytonaio/sdk'
        },
        setup: true
      }
    ]
  },

  // Browser automation
  browser: {
    title: 'Browser Automation',
    description: 'For visual verification of frontend implementations',
    items: [
      {
        name: 'playwright',
        displayName: 'Playwright',
        description: 'Browser automation for testing',
        required: false,
        check: () => npmPackageInstalled('playwright'),
        install: {
          all: 'npx playwright install'
        }
      }
    ]
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a command exists in PATH
 */
function commandExists(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a global npm package is installed
 */
function npmPackageInstalled(pkg) {
  try {
    execSync(`npm list -g ${pkg}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if Docker daemon is running
 */
function dockerRunning() {
  try {
    execSync('docker info', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if an MCP server is configured in Claude Code
 */
async function checkMCPServer(serverName) {
  // Check both global and project-level configs
  const configPaths = [
    path.join(process.env.HOME, '.claude', 'mcp.json'),
    path.join(process.env.HOME, '.claude.json')
  ];
  
  for (const configPath of configPaths) {
    try {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      
      // Check global mcpServers
      if (config.mcpServers && config.mcpServers[serverName]) {
        return true;
      }
      
      // Check project-level mcpServers (Claude Code stores per-project configs)
      if (config.projects) {
        for (const projectConfig of Object.values(config.projects)) {
          if (projectConfig.mcpServers && projectConfig.mcpServers[serverName]) {
            return true;
          }
        }
      }
    } catch {
      // Config doesn't exist or is invalid
    }
  }
  return false;
}

/**
 * Get install command for current platform
 */
function getInstallCommand(dep) {
  const platform = process.platform;
  return dep.install.all || dep.install[platform] || null;
}

/**
 * Run install command
 */
function runInstall(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve(stdout);
      }
    });
  });
}

// ============================================================================
// Display Functions
// ============================================================================

/**
 * Display welcome banner
 */
function displayWelcome() {
  console.log(boxen(
    chalk.bold.cyan('🚀 SIGMA PROTOCOL INSTALLATION WIZARD\n\n') +
    chalk.white('This wizard will help you install all dependencies\n') +
    chalk.white('needed for the Sigma Protocol orchestration system.'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));
}

/**
 * Display dependency status
 */
async function displayStatus() {
  console.log(chalk.bold('\n📦 Current Status:\n'));

    for (const [_category, group] of Object.entries(DEPENDENCIES)) {
    console.log(chalk.bold.blue(`\n${group.title}`));
    console.log(chalk.dim(group.description));
    console.log();

    for (const dep of group.items) {
      const installed = typeof dep.check === 'function' 
        ? await dep.check() 
        : dep.check;
      
      const status = installed 
        ? chalk.green('✓ Installed') 
        : chalk.red('✗ Not installed');
      
      const required = dep.required 
        ? chalk.yellow(' (required)') 
        : chalk.dim(' (optional)');
      
      console.log(`  ${status} ${dep.displayName || dep.name}${required}`);
      console.log(chalk.dim(`    ${dep.description}`));
    }
  }
}

// ============================================================================
// Installation Functions
// ============================================================================

/**
 * Install a single dependency
 */
async function installDependency(dep) {
  const spinner = ora(`Installing ${dep.displayName || dep.name}...`).start();
  
  const command = getInstallCommand(dep);
  
  if (!command) {
    spinner.warn(`No install command for ${dep.name} on ${process.platform}`);
    return false;
  }
  
  try {
    await runInstall(command);
    spinner.succeed(`${dep.displayName || dep.name} installed`);
    return true;
  } catch (error) {
    spinner.fail(`Failed to install ${dep.name}: ${error.message}`);
    console.log(chalk.dim(`  Manual install: ${command}`));
    return false;
  }
}

/**
 * Install selected dependencies
 */
async function installSelected(selectedDeps) {
  console.log(chalk.bold('\n🔧 Installing selected dependencies...\n'));
  
  const results = { success: [], failed: [] };
  
  for (const dep of selectedDeps) {
    const success = await installDependency(dep);
    if (success) {
      results.success.push(dep.name);
    } else {
      results.failed.push(dep.name);
    }
  }
  
  return results;
}

// ============================================================================
// Main Wizard
// ============================================================================

/**
 * Run the full installation wizard
 */
export async function runInstallWizard(options = {}) {
  displayWelcome();

  // Run pre-check first (unless --skip-check)
  if (!options.skipCheck) {
    const preCheckPassed = await runPreCheck();
    if (!preCheckPassed) {
      const { continueAnyway } = await inquirer.prompt([{
        type: 'confirm',
        name: 'continueAnyway',
        message: 'Continue anyway?',
        default: false
      }]);

      if (!continueAnyway) {
        console.log(chalk.yellow('\nInstallation cancelled. Fix prerequisites first.'));
        return;
      }
    }
  }

  // Show current status
  await displayStatus();

  // Ask what to install
  const { installChoice } = await inquirer.prompt([{
    type: 'list',
    name: 'installChoice',
    message: 'What would you like to install?',
    choices: [
      { name: '🎯 Install All Required', value: 'required' },
      { name: '📦 Install All (Required + Recommended)', value: 'all' },
      { name: '🔧 Custom Selection', value: 'custom' },
      { name: '🔍 Run Pre-Check Only', value: 'check' },
      { name: '❌ Cancel', value: 'cancel' }
    ]
  }]);

  if (installChoice === 'check') {
    await runPreCheck();
    return;
  }
  
  if (installChoice === 'cancel') {
    console.log(chalk.yellow('\nInstallation cancelled.'));
    return;
  }
  
  let depsToInstall = [];
  
  if (installChoice === 'custom') {
    // Build choices for each category
    const choices = [];
    
    for (const [_category, group] of Object.entries(DEPENDENCIES)) {
      choices.push(new inquirer.Separator(`── ${group.title} ──`));
      
      for (const dep of group.items) {
        const installed = typeof dep.check === 'function' 
          ? await dep.check() 
          : dep.check;
        
        if (!installed) {
          choices.push({
            name: `${dep.displayName || dep.name} - ${dep.description}`,
            value: dep,
            checked: dep.required
          });
        }
      }
    }
    
    const { selected } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selected',
      message: 'Select dependencies to install:',
      choices,
      pageSize: 15
    }]);
    
    depsToInstall = selected;
  } else {
    // Collect deps based on choice
    for (const [_category, group] of Object.entries(DEPENDENCIES)) {
      for (const dep of group.items) {
        const installed = typeof dep.check === 'function' 
          ? await dep.check() 
          : dep.check;
        
        if (!installed) {
          if (installChoice === 'all' || (installChoice === 'required' && dep.required)) {
            depsToInstall.push(dep);
          }
        }
      }
    }
  }
  
  if (depsToInstall.length === 0) {
    console.log(chalk.green('\n✓ All selected dependencies are already installed!'));
    return;
  }
  
  // Confirm installation
  console.log(chalk.bold('\nThe following will be installed:'));
  depsToInstall.forEach(dep => {
    console.log(chalk.cyan(`  • ${dep.displayName || dep.name}`));
  });
  
  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: 'Proceed with installation?',
    default: true
  }]);
  
  if (!confirm) {
    console.log(chalk.yellow('\nInstallation cancelled.'));
    return;
  }

  // Install with progress bar
  console.log(chalk.bold('\n🔧 Installing dependencies...\n'));

  let results;
  if (depsToInstall.length > 1) {
    // Use Listr for multiple dependencies (visual progress)
    const ctx = await installWithProgress(depsToInstall);
    results = {
      success: ctx.success || [],
      failed: (ctx.failed || []).map(f => f.name)
    };
  } else {
    // Use simple install for single dependency
    results = await installSelected(depsToInstall);
  }

  // Summary
  console.log(boxen(
    chalk.bold('Installation Summary\n\n') +
    (results.success.length > 0 
      ? chalk.green(`✓ Installed: ${results.success.join(', ')}\n`) 
      : '') +
    (results.failed.length > 0 
      ? chalk.red(`✗ Failed: ${results.failed.join(', ')}\n`) 
      : '') +
    chalk.dim('\nRun `sigma install` again to retry failed items.'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: results.failed.length > 0 ? 'yellow' : 'green'
    }
  ));
  
  // Check for items that need setup
  const needsSetup = depsToInstall.filter(dep => dep.setup && results.success.includes(dep.name));
  
  if (needsSetup.length > 0) {
    const { runSetup } = await inquirer.prompt([{
      type: 'confirm',
      name: 'runSetup',
      message: 'Some items need additional setup. Run setup wizard now?',
      default: true
    }]);
    
    if (runSetup) {
      const { runSetupWizard } = await import('./sandbox/setup-wizard.js');
      await runSetupWizard(process.cwd());
    }
  }
}

/**
 * Quick check for required dependencies
 */
export async function checkRequiredDeps() {
  const missing = [];
  
  for (const [_category, group] of Object.entries(DEPENDENCIES)) {
    for (const dep of group.items) {
      if (dep.required) {
        const installed = typeof dep.check === 'function' 
          ? await dep.check() 
          : dep.check;
        
        if (!installed) {
          missing.push(dep);
        }
      }
    }
  }
  
  return missing;
}

/**
 * Display missing dependencies warning
 */
export async function warnMissingDeps() {
  const missing = await checkRequiredDeps();
  
  if (missing.length > 0) {
    console.log(boxen(
      chalk.yellow.bold('⚠️  Missing Required Dependencies\n\n') +
      missing.map(dep => chalk.red(`  ✗ ${dep.displayName || dep.name}`)).join('\n') +
      chalk.dim('\n\nRun `sigma install` to install missing dependencies.'),
      {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderStyle: 'round',
        borderColor: 'yellow'
      }
    ));
    return false;
  }
  
  return true;
}

export { DEPENDENCIES };


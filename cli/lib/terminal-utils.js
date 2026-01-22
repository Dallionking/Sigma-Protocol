#!/usr/bin/env node

/**
 * Sigma Protocol - Terminal Utilities
 * 
 * Centralized utilities for terminal backend selection and Claude Code spawning.
 * Supports both iTerm2 (native Mac) and tmux (universal).
 */

import chalk from "chalk";
import inquirer from "inquirer";
import boxen from "boxen";
import { execSync } from "child_process";

// ============================================================================
// Environment Checks
// ============================================================================

/**
 * Check if tmux is available
 * @returns {boolean}
 */
export function checkTmux() {
  try {
    execSync("which tmux", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if Claude Code is available
 * @returns {boolean}
 */
export function checkClaudeCode() {
  try {
    execSync("which claude", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if iTerm2 is available (macOS only)
 * @returns {boolean}
 */
export function checkIterm2() {
  if (process.platform !== 'darwin') {
    return false;
  }
  
  try {
    // Check if iTerm2 is installed
    const apps = execSync('ls /Applications/ 2>/dev/null || true', { encoding: 'utf-8' });
    return apps.includes('iTerm.app');
  } catch {
    return false;
  }
}

/**
 * Run AppleScript command using multiple -e flags
 * @param {string[]} lines - AppleScript lines
 * @returns {string} - Output
 */
function osascript(lines) {
  const args = lines
    .filter(line => line.trim())
    .map(line => `-e '${line.replace(/'/g, "'\\''")}'`)
    .join(' ');
  
  return execSync(`osascript ${args}`, { 
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  }).trim();
}

// ============================================================================
// Terminal Backend Selection
// ============================================================================

/**
 * Interactive prompt to select terminal backend
 * @param {string} [backendOverride] - Optional override from CLI flag
 * @returns {Promise<'iterm' | 'tmux'>}
 */
export async function selectTerminalBackend(backendOverride) {
  // If explicit backend specified, use it
  if (backendOverride === 'iterm' || backendOverride === 'tmux') {
    return backendOverride;
  }
  
  // Check what's available
  const hasIterm = checkIterm2();
  const hasTmux = checkTmux();
  
  // If only one option available, use it
  if (hasIterm && !hasTmux) {
    return 'iterm';
  }
  if (hasTmux && !hasIterm) {
    return 'tmux';
  }
  if (!hasIterm && !hasTmux) {
    console.log(chalk.yellow("\n⚠️  No terminal backend available."));
    console.log(chalk.gray("Install iTerm2 (macOS) or tmux to enable spawning."));
    return null;
  }
  
  // Both available - prompt user
  const choices = [];
  
  if (hasIterm) {
    choices.push({
      name: `${chalk.cyan('iTerm2')} - Native Mac tabs, click to navigate`,
      value: 'iterm'
    });
  }
  
  if (hasTmux) {
    choices.push({
      name: `${chalk.green('tmux')} - Detachable sessions, Ctrl+B navigation`,
      value: 'tmux'
    });
  }
  
  const { backend } = await inquirer.prompt([{
    type: 'list',
    name: 'backend',
    message: 'Select terminal backend:',
    choices,
    default: process.platform === 'darwin' ? 'iterm' : 'tmux'
  }]);
  
  return backend;
}

// ============================================================================
// tmux Spawning
// ============================================================================

/**
 * Spawn Claude Code in tmux session
 * @param {string} command - The command to send to Claude
 * @param {string} sessionName - Name for the tmux session
 * @param {string} [workdir] - Working directory
 * @returns {boolean} - Whether spawn was successful
 */
export function spawnClaudeInTmux(command, sessionName = "sigma-task", workdir = process.cwd()) {
  const hasTmux = checkTmux();
  const hasClaude = checkClaudeCode();

  if (!hasTmux) {
    console.log(chalk.yellow("\n⚠️  tmux not found."));
    console.log(chalk.gray("Install with: brew install tmux (macOS)"));
    console.log(chalk.gray("             apt install tmux (Ubuntu/Debian)"));
    printManualCommand(command);
    return false;
  }

  if (!hasClaude) {
    console.log(chalk.yellow("\n⚠️  Claude Code not found."));
    console.log(chalk.gray("Install: npm install -g @anthropic-ai/claude-code"));
    printManualCommand(command);
    return false;
  }

  // Kill existing session if present
  try {
    execSync(`tmux kill-session -t ${sessionName} 2>/dev/null`, { stdio: "pipe" });
  } catch {
    // Session didn't exist, that's fine
  }

  console.log("");
  console.log(chalk.blue(`🚀 Launching Claude Code in tmux session: ${sessionName}`));

  try {
    // Create new tmux session with Claude
    execSync(`tmux new-session -d -s ${sessionName} -c "${workdir}" "claude"`, {
      stdio: "pipe",
    });

    // Wait for Claude to fully initialize (it takes 4-6 seconds typically)
    console.log(chalk.gray("  Waiting for Claude Code to initialize..."));
    execSync("sleep 5");

    // Send the command using literal mode (-l) to avoid special character issues
    execSync(`tmux send-keys -t ${sessionName} -l '${command.replace(/'/g, "'\\''")}'`);
    execSync(`tmux send-keys -t ${sessionName} Enter`);

    console.log(chalk.green(`✅ Command sent: ${command}`));
    console.log("");
    console.log(
      boxen(
        chalk.white.bold("To view the session:\n\n") +
          chalk.cyan(`  tmux attach -t ${sessionName}\n\n`) +
          chalk.gray("Detach with: Ctrl+B then D\n") +
          chalk.gray("Kill session: tmux kill-session -t " + sessionName),
        {
          padding: 1,
          borderColor: "green",
          title: "tmux Session",
          titleAlignment: "center",
        }
      )
    );

    return true;
  } catch (error) {
    console.log(chalk.red(`❌ Failed to spawn tmux session: ${error.message}`));
    printManualCommand(command);
    return false;
  }
}

// ============================================================================
// iTerm2 Spawning
// ============================================================================

/**
 * Spawn Claude Code in iTerm2 tab
 * @param {string} command - The command to send to Claude
 * @param {string} tabName - Name for the tab
 * @param {string} [workdir] - Working directory
 * @returns {boolean} - Whether spawn was successful
 */
export function spawnClaudeInIterm(command, tabName = "sigma-task", workdir = process.cwd()) {
  const hasIterm = checkIterm2();
  const hasClaude = checkClaudeCode();

  if (!hasIterm) {
    console.log(chalk.yellow("\n⚠️  iTerm2 not found."));
    console.log(chalk.gray("Download from: https://iterm2.com/"));
    printManualCommand(command);
    return false;
  }

  if (!hasClaude) {
    console.log(chalk.yellow("\n⚠️  Claude Code not found."));
    console.log(chalk.gray("Install: npm install -g @anthropic-ai/claude-code"));
    printManualCommand(command);
    return false;
  }

  console.log("");
  console.log(chalk.blue(`🚀 Launching Claude Code in iTerm2 tab: ${tabName}`));

  try {
    // Activate iTerm2
    osascript(['tell application "iTerm2" to activate']);
    
    // Small delay to ensure iTerm2 is ready
    execSync("sleep 0.5");
    
    // Create new tab and launch Claude
    const cdCmd = `cd \\"${workdir}\\" && claude --dangerously-skip-permissions`;
    
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

    // Wait for Claude to fully initialize
    console.log(chalk.gray("  Waiting for Claude Code to initialize..."));
    execSync("sleep 5");

    // Send the command
    const escapedCommand = command.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    
    osascript([
      'tell application "iTerm2"',
      '  tell current window',
      '    tell current tab',
      '      tell current session',
      `        write text "${escapedCommand}"`,
      '      end tell',
      '    end tell',
      '  end tell',
      'end tell'
    ]);

    console.log(chalk.green(`✅ Command sent: ${command}`));
    console.log("");
    console.log(
      boxen(
        chalk.white.bold("Claude Code launched in iTerm2!\n\n") +
          chalk.cyan(`  Tab: ${tabName}\n\n`) +
          chalk.gray("Switch tabs: Cmd+Shift+] or Cmd+Shift+[\n") +
          chalk.gray("Close tab: Cmd+W"),
        {
          padding: 1,
          borderColor: "green",
          title: "iTerm2 Tab",
          titleAlignment: "center",
        }
      )
    );

    return true;
  } catch (error) {
    console.log(chalk.red(`❌ Failed to spawn iTerm2 tab: ${error.message}`));
    printManualCommand(command);
    return false;
  }
}

// ============================================================================
// Unified Spawn Function
// ============================================================================

/**
 * Spawn Claude Code using the specified or selected backend
 * @param {string} command - The command to send to Claude
 * @param {Object} options - Spawn options
 * @param {string} [options.backend] - Backend override ('iterm' | 'tmux')
 * @param {string} [options.sessionName] - Session/tab name
 * @param {string} [options.workdir] - Working directory
 * @returns {Promise<boolean>} - Whether spawn was successful
 */
export async function spawnClaude(command, options = {}) {
  const {
    backend: backendOverride,
    sessionName = "sigma-task",
    workdir = process.cwd()
  } = options;
  
  // Select backend (may prompt user)
  const backend = await selectTerminalBackend(backendOverride);
  
  if (!backend) {
    printManualCommand(command);
    return false;
  }
  
  if (backend === 'iterm') {
    return spawnClaudeInIterm(command, sessionName, workdir);
  } else {
    return spawnClaudeInTmux(command, sessionName, workdir);
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Print manual command for fallback
 * @param {string} command 
 */
function printManualCommand(command) {
  console.log("");
  console.log(chalk.white("Manual command to run in Claude Code:"));
  console.log(
    boxen(chalk.cyan(command), {
      padding: { left: 2, right: 2, top: 0, bottom: 0 },
      borderColor: "cyan",
    })
  );
}

export default {
  checkTmux,
  checkClaudeCode,
  checkIterm2,
  selectTerminalBackend,
  spawnClaudeInTmux,
  spawnClaudeInIterm,
  spawnClaude
};

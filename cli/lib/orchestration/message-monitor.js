/**
 * Sigma Protocol - Message Bus Monitor
 * 
 * Watches the .sigma/orchestration/inbox/ directory for status updates
 * from the orchestrator and stream workers.
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

// Message types from orchestrator.py
export const MessageType = {
  REGISTER: 'register',
  PRD_ASSIGNMENT: 'prd_assignment',
  STORY_COMPLETE: 'story_complete',
  PRD_COMPLETE: 'prd_complete',
  CONTINUE: 'continue',
  REVISION_NEEDED: 'revision_needed',
  BLOCKED: 'blocked',
  UNBLOCK: 'unblock',
  ERROR: 'error',
  STATUS_UPDATE: 'status_update',
  PAUSE: 'pause',
  RESUME: 'resume'
};

// Stream status
export const StreamStatus = {
  IDLE: 'idle',
  REGISTERING: 'registering',
  WAITING_ASSIGNMENT: 'waiting_assignment',
  WORKING: 'working',
  BLOCKED: 'blocked',
  COMPLETED: 'completed',
  ERROR: 'error'
};

/**
 * Get the inbox directory path
 * @param {string} targetDir - Project directory
 * @returns {string}
 */
export function getInboxPath(targetDir) {
  return path.join(targetDir, '.sigma', 'orchestration', 'inbox');
}

/**
 * Get the state file path
 * @param {string} targetDir - Project directory
 * @returns {string}
 */
export function getStatePath(targetDir) {
  return path.join(targetDir, '.sigma', 'orchestration', 'state.json');
}

/**
 * Read messages from an inbox file
 * @param {string} inboxPath - Path to inbox file (JSON)
 * @returns {Promise<Array>}
 */
export async function readMessages(inboxPath) {
  try {
    const content = await fs.readFile(inboxPath, 'utf-8');
    const data = JSON.parse(content);
    return data.messages || [];
  } catch {
    return [];
  }
}

/**
 * Read orchestration state
 * @param {string} targetDir - Project directory
 * @returns {Promise<Object|null>}
 */
export async function readState(targetDir) {
  try {
    const statePath = getStatePath(targetDir);
    const content = await fs.readFile(statePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Save orchestration state
 * @param {string} targetDir - Project directory
 * @param {Object} state - State to save
 */
export async function saveState(targetDir, state) {
  const statePath = getStatePath(targetDir);
  await fs.mkdir(path.dirname(statePath), { recursive: true });
  await fs.writeFile(statePath, JSON.stringify(state, null, 2));
}

/**
 * Get status of all streams
 * @param {string} targetDir - Project directory
 * @returns {Promise<Object>}
 */
export async function getStreamStatuses(targetDir) {
  const inboxPath = getInboxPath(targetDir);
  const state = await readState(targetDir);
  const statuses = {};
  
  // Get status from state file if available
  if (state && state.streams) {
    for (const [name, streamState] of Object.entries(state.streams)) {
      statuses[name] = {
        status: streamState.status || StreamStatus.IDLE,
        currentPrd: streamState.currentPrd || null,
        currentStory: streamState.currentStory || null,
        completedPrds: streamState.completedPrds || [],
        completedStories: streamState.completedStories || [],
        lastUpdate: streamState.lastUpdate || null
      };
    }
  }
  
  // Try to read individual inbox files for more recent updates
  try {
    const files = await fs.readdir(inboxPath);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      if (file === 'orchestrator.json') continue;
      
      const streamName = file.replace('.json', '').replace('stream-', '').toUpperCase();
      const messages = await readMessages(path.join(inboxPath, file));
      
      // Get most recent status update
      const lastStatusUpdate = messages
        .filter(m => m.type === MessageType.STATUS_UPDATE)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      
      if (lastStatusUpdate) {
        statuses[streamName] = {
          ...statuses[streamName],
          status: lastStatusUpdate.status || StreamStatus.WORKING,
          currentStory: lastStatusUpdate.story || null,
          lastUpdate: lastStatusUpdate.timestamp
        };
      }
    }
  } catch {
    // Inbox directory doesn't exist yet
  }
  
  return statuses;
}

/**
 * Get orchestrator status
 * @param {string} targetDir - Project directory
 * @returns {Promise<Object>}
 */
export async function getOrchestratorStatus(targetDir) {
  const inboxPath = getInboxPath(targetDir);
  const orchestratorInbox = path.join(inboxPath, 'orchestrator.json');
  
  try {
    const messages = await readMessages(orchestratorInbox);
    const state = await readState(targetDir);
    
    // Count messages by type
    const messageCounts = {};
    for (const msg of messages) {
      messageCounts[msg.type] = (messageCounts[msg.type] || 0) + 1;
    }
    
    // Get pending messages (not yet processed)
    const pendingMessages = messages.filter(m => !m.processed);
    
    return {
      running: state?.orchestrator?.running ?? false,
      startedAt: state?.orchestrator?.startedAt || null,
      totalMessages: messages.length,
      pendingMessages: pendingMessages.length,
      messageCounts,
      registeredStreams: state?.orchestrator?.registeredStreams || [],
      completedPrds: state?.orchestrator?.completedPrds || [],
      blockedStreams: state?.orchestrator?.blockedStreams || []
    };
  } catch {
    return {
      running: false,
      totalMessages: 0,
      pendingMessages: 0,
      messageCounts: {},
      registeredStreams: [],
      completedPrds: [],
      blockedStreams: []
    };
  }
}

/**
 * Print formatted status display
 * @param {string} targetDir - Project directory
 */
export async function printStatus(targetDir) {
  const orchestrator = await getOrchestratorStatus(targetDir);
  const streams = await getStreamStatuses(targetDir);
  
  console.log(chalk.cyan('\n🐝 Sigma Orchestration Status\n'));
  
  // Orchestrator status
  const orchStatus = orchestrator.running ? chalk.green('● Running') : chalk.yellow('○ Not Running');
  console.log(chalk.white.bold('Orchestrator:'), orchStatus);
  
  if (orchestrator.running) {
    console.log(chalk.gray(`  Started: ${orchestrator.startedAt}`));
    console.log(chalk.gray(`  Messages: ${orchestrator.totalMessages} total, ${orchestrator.pendingMessages} pending`));
    console.log(chalk.gray(`  Registered streams: ${orchestrator.registeredStreams.join(', ') || 'none'}`));
    
    if (orchestrator.blockedStreams.length > 0) {
      console.log(chalk.yellow(`  Blocked: ${orchestrator.blockedStreams.join(', ')}`));
    }
  }
  
  // Stream status
  console.log(chalk.white.bold('\nStreams:'));
  
  const streamNames = Object.keys(streams).sort();
  
  if (streamNames.length === 0) {
    console.log(chalk.gray('  No streams configured yet.'));
  }
  
  for (const name of streamNames) {
    const stream = streams[name];
    let statusIcon, statusColor;
    
    switch (stream.status) {
      case StreamStatus.WORKING:
        statusIcon = '●';
        statusColor = chalk.green;
        break;
      case StreamStatus.BLOCKED:
        statusIcon = '◆';
        statusColor = chalk.yellow;
        break;
      case StreamStatus.COMPLETED:
        statusIcon = '✓';
        statusColor = chalk.green;
        break;
      case StreamStatus.ERROR:
        statusIcon = '✗';
        statusColor = chalk.red;
        break;
      case StreamStatus.WAITING_ASSIGNMENT:
        statusIcon = '○';
        statusColor = chalk.cyan;
        break;
      default:
        statusIcon = '○';
        statusColor = chalk.gray;
    }
    
    console.log(`  ${statusColor(statusIcon)} Stream ${name}: ${statusColor(stream.status)}`);
    
    if (stream.currentPrd) {
      console.log(chalk.gray(`    Working on: ${stream.currentPrd}`));
    }
    if (stream.currentStory) {
      console.log(chalk.gray(`    Current story: ${stream.currentStory}`));
    }
    if (stream.completedPrds && stream.completedPrds.length > 0) {
      console.log(chalk.gray(`    Completed: ${stream.completedPrds.join(', ')}`));
    }
  }
  
  console.log('');
}

/**
 * Watch for status changes
 * @param {string} targetDir - Project directory
 * @param {Function} callback - Called when status changes
 * @param {number} [interval] - Poll interval in ms (default: 2000)
 * @returns {Function} Stop function
 */
export function watchStatus(targetDir, callback, interval = 2000) {
  let lastState = null;
  let running = true;
  
  const check = async () => {
    if (!running) return;
    
    try {
      const orchestrator = await getOrchestratorStatus(targetDir);
      const streams = await getStreamStatuses(targetDir);
      const currentState = JSON.stringify({ orchestrator, streams });
      
      if (currentState !== lastState) {
        lastState = currentState;
        callback({ orchestrator, streams });
      }
    } catch (_error) {
      // Ignore errors during polling
    }
    
    if (running) {
      setTimeout(check, interval);
    }
  };
  
  check();
  
  // Return stop function
  return () => {
    running = false;
  };
}

/**
 * Clear all messages and reset state
 * @param {string} targetDir - Project directory
 */
export async function clearMessages(targetDir) {
  const inboxPath = getInboxPath(targetDir);
  
  try {
    const files = await fs.readdir(inboxPath);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        await fs.writeFile(
          path.join(inboxPath, file),
          JSON.stringify({ messages: [] }, null, 2)
        );
      }
    }
    
    // Clear state
    const statePath = getStatePath(targetDir);
    await fs.writeFile(statePath, JSON.stringify({
      version: '1.0.0',
      cleared: new Date().toISOString(),
      orchestrator: { running: false },
      streams: {}
    }, null, 2));
    
  } catch {
    // Inbox doesn't exist yet
  }
}

export default {
  MessageType,
  StreamStatus,
  getInboxPath,
  getStatePath,
  readMessages,
  readState,
  saveState,
  getStreamStatuses,
  getOrchestratorStatus,
  printStatus,
  watchStatus,
  clearMessages
};


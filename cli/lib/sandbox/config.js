/**
 * Sigma Protocol - Sandbox Configuration Management
 * 
 * Handles loading, saving, and validating sandbox configuration
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Default sandbox configuration
 */
export const DEFAULT_CONFIG = {
  provider: null, // e2b, docker, or daytona
  credentials: {
    e2b_api_key: '${E2B_API_KEY}',
    docker_socket: '/var/run/docker.sock',
    daytona_api_key: '${DAYTONA_API_KEY}',
    daytona_api_url: '${DAYTONA_API_URL}'
  },
  defaults: {
    forks_per_story: 3,
    sandbox_lifetime_seconds: 1800,
    auto_destroy: true
  },
  budget: {
    max_spend_usd: 50,
    warn_at_usd: 25,
    track_usage: true
  },
  best_of_n: {
    mode: 'per-story', // per-story, per-stream, per-prd
    n: 3,
    review_strategy: 'hybrid' // hybrid, ai-only, manual
  },
  limits: {
    max_concurrent: {
      e2b: 10,
      docker: 4,
      daytona: 10
    },
    queue_strategy: 'fifo',
    timeout_seconds: {
      creation: 120,
      execution: 1800,
      cleanup: 60
    }
  }
};

/**
 * Get the sandbox config file path
 * @param {string} projectRoot
 * @returns {string}
 */
export function getConfigPath(projectRoot) {
  return path.join(projectRoot, '.sigma', 'orchestration', 'sandbox-config.json');
}

/**
 * Get the session state file path
 * @param {string} projectRoot
 * @returns {string}
 */
export function getSessionStatePath(projectRoot) {
  return path.join(projectRoot, '.sigma', 'orchestration', 'session-state.json');
}

/**
 * Get the cost log file path
 * @param {string} projectRoot
 * @returns {string}
 */
export function getCostLogPath(projectRoot) {
  return path.join(projectRoot, '.sigma', 'orchestration', 'cost-log.json');
}

/**
 * Load sandbox configuration
 * @param {string} projectRoot
 * @returns {Promise<Object|null>}
 */
export async function loadSandboxConfig(projectRoot) {
  const configPath = getConfigPath(projectRoot);
  
  try {
    const content = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(content);
    
    // Merge with defaults to ensure all fields exist
    return mergeDeep(DEFAULT_CONFIG, config);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // Config doesn't exist yet
    }
    throw error;
  }
}

/**
 * Save sandbox configuration
 * @param {string} projectRoot
 * @param {Object} config
 * @returns {Promise<void>}
 */
export async function saveSandboxConfig(projectRoot, config) {
  const configPath = getConfigPath(projectRoot);
  const dir = path.dirname(configPath);
  
  // Ensure directory exists
  await fs.mkdir(dir, { recursive: true });
  
  // Don't save actual API keys, use placeholders
  const safeConfig = sanitizeConfig(config);
  
  await fs.writeFile(configPath, JSON.stringify(safeConfig, null, 2));
}

/**
 * Sanitize config to not save actual API keys
 * @param {Object} config
 * @returns {Object}
 */
export function sanitizeConfig(config) {
  const safe = { ...config };
  
  if (safe.credentials) {
    safe.credentials = { ...safe.credentials };
    
    // Replace actual keys with placeholders
    if (safe.credentials.e2b_api_key && !safe.credentials.e2b_api_key.startsWith('${')) {
      safe.credentials.e2b_api_key = '${E2B_API_KEY}';
    }
    if (safe.credentials.daytona_api_key && !safe.credentials.daytona_api_key.startsWith('${')) {
      safe.credentials.daytona_api_key = '${DAYTONA_API_KEY}';
    }
  }
  
  return safe;
}

/**
 * Load session state for auto-resume
 * @param {string} projectRoot
 * @returns {Promise<Object|null>}
 */
export async function loadSessionState(projectRoot) {
  const statePath = getSessionStatePath(projectRoot);
  
  try {
    const content = await fs.readFile(statePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Save session state for auto-resume
 * @param {string} projectRoot
 * @param {Object} state
 * @returns {Promise<void>}
 */
export async function saveSessionState(projectRoot, state) {
  const statePath = getSessionStatePath(projectRoot);
  const dir = path.dirname(statePath);
  
  await fs.mkdir(dir, { recursive: true });
  
  state.lastCheckpoint = new Date().toISOString();
  await fs.writeFile(statePath, JSON.stringify(state, null, 2));
}

/**
 * Clear session state
 * @param {string} projectRoot
 * @returns {Promise<void>}
 */
export async function clearSessionState(projectRoot) {
  const statePath = getSessionStatePath(projectRoot);
  
  try {
    await fs.unlink(statePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Create a new session state object
 * @param {string} provider
 * @returns {Object}
 */
export function createSessionState(provider) {
  return {
    sessionId: generateUUID(),
    startedAt: new Date().toISOString(),
    provider,
    status: 'running',
    sandboxes: [],
    completedStories: [],
    selectedForks: {},
    costAccumulated: 0,
    lastCheckpoint: new Date().toISOString()
  };
}

/**
 * Load cost log
 * @param {string} projectRoot
 * @returns {Promise<Object>}
 */
export async function loadCostLog(projectRoot) {
  const logPath = getCostLogPath(projectRoot);
  
  try {
    const content = await fs.readFile(logPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { entries: [], totalSpent: 0 };
    }
    throw error;
  }
}

/**
 * Append to cost log
 * @param {string} projectRoot
 * @param {Object} entry
 * @returns {Promise<void>}
 */
export async function appendCostLog(projectRoot, entry) {
  const log = await loadCostLog(projectRoot);
  
  entry.timestamp = new Date().toISOString();
  log.entries.push(entry);
  log.totalSpent = log.entries.reduce((sum, e) => sum + (e.cost || 0), 0);
  
  const logPath = getCostLogPath(projectRoot);
  const dir = path.dirname(logPath);
  
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(logPath, JSON.stringify(log, null, 2));
}

/**
 * Get remaining budget
 * @param {string} projectRoot
 * @param {Object} config
 * @returns {Promise<number>}
 */
export async function getRemainingBudget(projectRoot, config) {
  const maxBudget = config?.budget?.max_spend_usd ?? DEFAULT_CONFIG.budget.max_spend_usd;
  const log = await loadCostLog(projectRoot);
  return Math.max(0, maxBudget - log.totalSpent);
}

/**
 * Deep merge two objects
 * @param {Object} target
 * @param {Object} source
 * @returns {Object}
 */
function mergeDeep(target, source) {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      output[key] = mergeDeep(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
}

/**
 * Generate a UUID v4
 * @returns {string}
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Resolve environment variable placeholders
 * @param {string} value
 * @returns {string}
 */
export function resolveEnvVar(value) {
  if (typeof value !== 'string') return value;
  
  const match = value.match(/^\$\{(\w+)\}$/);
  if (match) {
    return process.env[match[1]] || '';
  }
  return value;
}

/**
 * Get resolved credentials from config
 * @param {Object} config
 * @returns {Object}
 */
export function getResolvedCredentials(config) {
  if (!config?.credentials) return {};
  
  const resolved = {};
  for (const [key, value] of Object.entries(config.credentials)) {
    resolved[key] = resolveEnvVar(value);
  }
  return resolved;
}

/**
 * Validate provider configuration
 * @param {string} provider
 * @param {Object} config
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateProviderConfig(provider, config) {
  const errors = [];
  const creds = getResolvedCredentials(config);
  
  switch (provider) {
    case 'e2b':
      if (!creds.e2b_api_key) {
        errors.push('E2B_API_KEY environment variable is required');
      }
      break;
      
    case 'docker':
      // Docker doesn't need API keys, just check socket exists
      break;
      
    case 'daytona':
      if (!creds.daytona_api_key) {
        errors.push('DAYTONA_API_KEY environment variable is required');
      }
      break;
      
    default:
      errors.push(`Unknown provider: ${provider}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

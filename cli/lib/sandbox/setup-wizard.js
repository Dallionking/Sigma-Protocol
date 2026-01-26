/**
 * Sigma Protocol - Sandbox Setup Wizards
 * 
 * Interactive setup wizards for configuring sandbox providers
 */

import * as readline from 'readline';
import { PROVIDERS } from './providers/index.js';
import { saveSandboxConfig, loadSandboxConfig, DEFAULT_CONFIG } from './config.js';

/**
 * Create readline interface
 */
function createRL() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Prompt for input
 */
function prompt(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Prompt for selection from options
 */
async function promptSelect(rl, question, options) {
  console.log(question);
  options.forEach((opt, i) => {
    console.log(`  [${i + 1}] ${opt.label}`);
  });
  
  const answer = await prompt(rl, '\nSelect option: ');
  const index = parseInt(answer, 10) - 1;
  
  if (index >= 0 && index < options.length) {
    return options[index].value;
  }
  
  return null;
}

/**
 * Display banner box
 */
function displayBanner(title, lines) {
  const width = 65;
  const border = '═'.repeat(width);
  
  console.log('\n╔' + border + '╗');
  console.log('║' + centerText(title, width) + '║');
  console.log('╠' + border + '╣');
  
  for (const line of lines) {
    console.log('║' + padRight(line, width) + '║');
  }
  
  console.log('╚' + border + '╝\n');
}

/**
 * Center text in width
 */
function centerText(text, width) {
  const padding = Math.max(0, width - text.length);
  const left = Math.floor(padding / 2);
  return ' '.repeat(left) + text + ' '.repeat(padding - left);
}

/**
 * Pad text to width
 */
function padRight(text, width) {
  return ('  ' + text).padEnd(width);
}

/**
 * Main setup wizard - provider selection
 */
export async function runSetupWizard(projectRoot) {
  const rl = createRL();
  
  try {
    displayBanner('SANDBOX SETUP WIZARD', [
      '',
      'Choose how to run your AI agent sandboxes:',
      ''
    ]);
    
    const providerOptions = [
      {
        label: 'E2B Cloud - Scalable, isolated, pay-per-use (~$0.10/min)',
        value: 'e2b'
      },
      {
        label: 'Docker (Local) - Free, uses your machine',
        value: 'docker'
      },
      {
        label: 'Daytona - Open-source cloud option (~$0.08/min)',
        value: 'daytona'
      },
      {
        label: 'Cancel setup',
        value: null
      }
    ];
    
    const provider = await promptSelect(rl, '', providerOptions);
    
    if (!provider) {
      console.log('\nSetup cancelled.');
      rl.close();
      return null;
    }
    
    // Run provider-specific wizard
    let result;
    switch (provider) {
      case 'e2b':
        result = await setupE2B(rl, projectRoot);
        break;
      case 'docker':
        result = await setupDocker(rl, projectRoot);
        break;
      case 'daytona':
        result = await setupDaytona(rl, projectRoot);
        break;
    }
    
    rl.close();
    return result;
  } catch (error) {
    rl.close();
    throw error;
  }
}

/**
 * E2B Setup Wizard
 */
export async function setupE2B(rl, projectRoot) {
  displayBanner('E2B CLOUD SANDBOX SETUP', [
    '',
    'E2B provides isolated cloud environments for AI agents.',
    'Used by Perplexity, Manus, Groq for production workloads.',
    '',
    'Step 1: Create account at https://e2b.dev',
    'Step 2: Get API key from dashboard',
    'Step 3: Enter API key below',
    ''
  ]);
  
  const apiKey = await prompt(rl, 'E2B API Key: ');
  
  if (!apiKey) {
    console.log('\n✗ API key is required');
    return null;
  }
  
  console.log('\n[Testing connection...]');
  
  // Validate API key
  const { E2BProvider } = await import('./providers/e2b.js');
  const provider = new E2BProvider({
    credentials: { e2b_api_key: apiKey }
  });
  
  // Set the API key in environment for validation
  const originalKey = process.env.E2B_API_KEY;
  process.env.E2B_API_KEY = apiKey;
  
  try {
    const validation = await provider.validateCredentials();
    
    if (!validation.valid) {
      console.log(`\n✗ ${validation.error}`);
      process.env.E2B_API_KEY = originalKey;
      return null;
    }
    
    console.log('✓ Connected to E2B');
    console.log('✓ API key valid');
    
    // Save configuration
    const config = {
      ...DEFAULT_CONFIG,
      provider: 'e2b',
      credentials: {
        ...DEFAULT_CONFIG.credentials,
        e2b_api_key: '${E2B_API_KEY}' // Placeholder - actual key in env
      }
    };
    
    await saveSandboxConfig(projectRoot, config);
    console.log('✓ Configuration saved\n');
    
    // Remind user to set environment variable
    console.log('⚠️  Remember to add E2B_API_KEY to your environment:');
    console.log('   export E2B_API_KEY="' + apiKey.slice(0, 8) + '..."');
    console.log('   Or add to .env file\n');
    
    return { provider: 'e2b', config };
  } catch (error) {
    console.log(`\n✗ Setup failed: ${error.message}`);
    return null;
  } finally {
    process.env.E2B_API_KEY = originalKey;
  }
}

/**
 * Docker Setup Wizard
 */
export async function setupDocker(rl, projectRoot) {
  displayBanner('DOCKER SANDBOX SETUP', [
    '',
    'Docker provides FREE local isolation for your agents.',
    'No API costs, but uses your machine\'s resources.',
    ''
  ]);
  
  console.log('Checking prerequisites...\n');
  
  const { DockerProvider } = await import('./providers/docker.js');
  const provider = new DockerProvider({});
  
  // Check Docker availability
  const available = await provider.isAvailable();
  
  if (!available) {
    console.log('✗ Docker not found or not running');
    console.log('  Install Docker from https://docker.com');
    return null;
  }
  
  console.log('✓ Docker installed');
  console.log('✓ Docker daemon running');
  
  // Check for sigma-sandbox image
  const validation = await provider.validateCredentials();
  
  if (validation.warnings?.length > 0) {
    console.log('⚠ ' + validation.warnings[0]);
    
    const buildImage = await prompt(rl, '\nBuild sigma-sandbox image now? (y/n): ');
    
    if (buildImage.toLowerCase() === 'y') {
      console.log('\nBuilding sigma-sandbox:latest image...');
      
      try {
        await provider.buildImage(projectRoot);
        console.log('✓ Image built successfully');
      } catch (error) {
        console.log(`✗ Build failed: ${error.message}`);
        console.log('  You can build manually later with: docker build -t sigma-sandbox:latest scripts/sandbox/');
      }
    }
  } else {
    console.log('✓ sigma-sandbox image found');
  }
  
  // Save configuration
  const config = {
    ...DEFAULT_CONFIG,
    provider: 'docker',
    credentials: {
      ...DEFAULT_CONFIG.credentials
    }
  };
  
  await saveSandboxConfig(projectRoot, config);
  console.log('\n✓ Configuration saved\n');
  
  return { provider: 'docker', config };
}

/**
 * Daytona Setup Wizard
 */
export async function setupDaytona(rl, projectRoot) {
  displayBanner('DAYTONA SANDBOX SETUP', [
    '',
    'Daytona provides open-source cloud development environments.',
    'Slightly cheaper than E2B, with self-hosted option.',
    '',
    'Step 1: Create account at https://www.daytona.io',
    'Step 2: Get API key from dashboard',
    'Step 3: Enter API key below',
    ''
  ]);
  
  const apiKey = await prompt(rl, 'Daytona API Key: ');
  
  if (!apiKey) {
    console.log('\n✗ API key is required');
    return null;
  }
  
  const apiUrl = await prompt(rl, 'Daytona API URL (press Enter for default): ');
  
  console.log('\n[Testing connection...]');
  
  // Validate API key
  const { DaytonaProvider, DEFAULT_DAYTONA_URL } = await import('./providers/daytona.js');
  const provider = new DaytonaProvider({
    credentials: {
      daytona_api_key: apiKey,
      daytona_api_url: apiUrl || DEFAULT_DAYTONA_URL
    }
  });
  
  // Set environment for validation
  const originalKey = process.env.DAYTONA_API_KEY;
  const originalUrl = process.env.DAYTONA_API_URL;
  process.env.DAYTONA_API_KEY = apiKey;
  if (apiUrl) process.env.DAYTONA_API_URL = apiUrl;
  
  try {
    const validation = await provider.validateCredentials();
    
    if (!validation.valid) {
      console.log(`\n✗ ${validation.error}`);
      process.env.DAYTONA_API_KEY = originalKey;
      process.env.DAYTONA_API_URL = originalUrl;
      return null;
    }
    
    console.log('✓ Connected to Daytona');
    console.log('✓ API key valid');
    
    // Save configuration
    const config = {
      ...DEFAULT_CONFIG,
      provider: 'daytona',
      credentials: {
        ...DEFAULT_CONFIG.credentials,
        daytona_api_key: '${DAYTONA_API_KEY}',
        daytona_api_url: apiUrl || '${DAYTONA_API_URL}'
      }
    };
    
    await saveSandboxConfig(projectRoot, config);
    console.log('✓ Configuration saved\n');
    
    console.log('⚠️  Remember to add DAYTONA_API_KEY to your environment:');
    console.log('   export DAYTONA_API_KEY="' + apiKey.slice(0, 8) + '..."');
    if (apiUrl) {
      console.log('   export DAYTONA_API_URL="' + apiUrl + '"');
    }
    console.log('   Or add to .env file\n');
    
    return { provider: 'daytona', config };
  } catch (error) {
    console.log(`\n✗ Setup failed: ${error.message}`);
    return null;
  } finally {
    process.env.DAYTONA_API_KEY = originalKey;
    process.env.DAYTONA_API_URL = originalUrl;
  }
}

/**
 * Quick setup with provider name (non-interactive)
 */
export async function quickSetup(projectRoot, providerName, options = {}) {
  const providerInfo = PROVIDERS[providerName];

  if (!providerInfo) {
    throw new Error(`Unknown provider: ${providerName}`);
  }

  // Load existing config or use defaults
  const existingConfig = await loadSandboxConfig(projectRoot) || DEFAULT_CONFIG;

  const config = {
    ...existingConfig,
    provider: providerName,
    ...options
  };

  await saveSandboxConfig(projectRoot, config);

  return { provider: providerName, config };
}

/**
 * Show sandbox configuration and status (for CLI status command)
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<Object>} - Status object
 */
export async function showSandboxStatus(projectRoot) {
  const config = await loadSandboxConfig(projectRoot);

  const status = {
    configured: config !== null,
    provider: config?.provider || 'none',
    forks: config?.defaults?.forks_per_story || 3,
    reviewStrategy: config?.best_of_n?.review_strategy || 'hybrid',
    budget: {
      max: config?.budget?.max_spend_usd || 50,
      warn: config?.budget?.warn_at_usd || 25
    }
  };

  // Check provider availability
  if (config?.provider) {
    const providerInfo = PROVIDERS[config.provider];
    if (providerInfo) {
      try {
        const { default: Provider } = await import(`./providers/${config.provider}.js`);
        const instance = new Provider(config);
        status.providerAvailable = await instance.isAvailable();

        const validation = await instance.validateCredentials();
        status.credentialsValid = validation.valid;
        status.credentialsError = validation.error || null;
        status.warnings = validation.warnings || [];
      } catch (error) {
        status.providerAvailable = false;
        status.credentialsValid = false;
        status.credentialsError = error.message;
      }
    }
  }

  return status;
}

/**
 * Display formatted sandbox status
 * @param {string} projectRoot - Project root directory
 */
export async function displaySandboxStatus(projectRoot) {
  const status = await showSandboxStatus(projectRoot);

  console.log('\n' + '═'.repeat(50));
  console.log('  SANDBOX CONFIGURATION STATUS');
  console.log('═'.repeat(50));

  if (!status.configured) {
    console.log('\n  ⚠️  No sandbox configured');
    console.log('  Run: sigma sandbox setup');
  } else {
    console.log(`\n  Provider:        ${status.provider}`);
    console.log(`  Available:       ${status.providerAvailable ? '✓' : '✗'}`);
    console.log(`  Credentials:     ${status.credentialsValid ? '✓ Valid' : '✗ ' + status.credentialsError}`);
    console.log(`  Forks/story:     ${status.forks}`);
    console.log(`  Review strategy: ${status.reviewStrategy}`);
    console.log(`  Budget:          $${status.budget.max} max, $${status.budget.warn} warn`);

    if (status.warnings?.length > 0) {
      console.log('\n  Warnings:');
      for (const w of status.warnings) {
        console.log(`    ⚠️  ${w}`);
      }
    }
  }

  console.log('\n' + '═'.repeat(50) + '\n');

  return status;
}

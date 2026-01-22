/**
 * Sigma Protocol - Sandbox Orchestrator
 * 
 * Implements sandbox orchestration with message bus integration:
 * 1. Creates sandboxes for orchestrator and streams
 * 2. Uploads orchestrator/worker scripts
 * 3. Runs AI agent (Claude Code) with PRD assignments
 * 4. Monitors progress via mcp_agent_mail
 * 5. Streams logs back to CLI
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { SandboxManager } from './index.js';
import { loadSessionState, saveSessionState, createSessionState } from './config.js';

/**
 * Generate prompt for sandbox orchestrator (DOES NOT implement code!)
 * @param {string} _targetDir - Project directory (unused, for future expansion)
 * @returns {string}
 */
function generateOrchestratorPrompt(_targetDir) {
  return `You are the ORCHESTRATOR running in a sandbox. You do NOT implement any code.

Your responsibilities:
1. Monitor all streams via mcp_agent_mail messages
2. Run @gap-analysis when streams report PRD completion
3. Run browser automation to verify frontend implementations
4. Approve or request revisions for completed PRDs
5. Coordinate the final merge sequence

Project root: /workspace

Start by running:
  python /usr/local/bin/orchestrator.py --init

Then use @orchestrate to begin monitoring.

CRITICAL: Do NOT write any implementation code. Your role is oversight only.
The streams will implement the actual code based on their PRD assignments.`;
}

/**
 * Generate prompt for sandbox stream worker
 * @param {Object} stream - Stream configuration
 * @returns {string}
 */
function generateStreamPrompt(stream) {
  return `You are Stream ${stream.name} worker running in a sandbox.

Your PRDs: ${stream.prds.join(', ')}

Instructions:
1. Register with orchestrator:
   python /usr/local/bin/stream-worker.py --name=${stream.name}

2. Wait for PRD assignment from orchestrator

3. Implement each story using @implement-prd or Ralph loop methodology

4. Report progress via mcp_agent_mail after each story:
   - Send STORY_COMPLETE when a story is done
   - Send PRD_COMPLETE when all stories in a PRD are done
   - Send BLOCKED if you encounter a dependency issue

5. Wait for CONTINUE or REVISION_NEEDED from orchestrator before starting next story

Your git branch: stream-${stream.name.toLowerCase()}
Commit your changes after each completed story.`;
}

/**
 * Run sandbox orchestration with message bus integration
 * @param {Object} options
 * @param {string} options.targetDir - Project directory
 * @param {string} options.provider - Sandbox provider (e2b, docker, daytona)
 * @param {string} options.agent - AI agent to use ('claude' or 'opencode')
 * @param {Object} options.config - Streams configuration
 * @param {Array} options.prds - Selected PRDs
 * @param {number} [options.forksPerStory] - Number of forks per story (Best of N)
 * @param {string} [options.mode] - Orchestration mode (full-auto, semi-auto, manual)
 */
export async function runSandboxOrchestration(options) {
  const {
    targetDir,
    provider,
    agent = 'claude',
    config,
    prds,
    forksPerStory = 1,
    mode = 'semi-auto'
  } = options;

  const agentCmd = agent === 'claude' ? 'claude' : 'opencode';
  const spinner = ora({ text: 'Initializing sandbox orchestration...', spinner: 'dots' }).start();

  try {
    // Initialize sandbox manager
    const manager = new SandboxManager(targetDir);
    await manager.initialize();
    await manager.setProvider(provider);

    // Validate provider
    spinner.text = `Validating ${provider} provider...`;
    const providerInstance = manager.getProviderInstance();
    const { valid, error: validationError } = await providerInstance.validateCredentials();

    if (!valid) {
      spinner.fail(`Provider validation failed: ${validationError}`);
      return { success: false, error: validationError };
    }

    spinner.succeed(`${provider} provider validated`);

    // Create or resume session
    let session = await loadSessionState(targetDir);
    if (!session) {
      session = createSessionState({
        provider,
        stories: prds.map(p => p.id),
        forksPerStory,
        mode,
        targetDir
      });
    }

    // Ensure session.streams is initialized
    if (!session.streams) {
      session.streams = {};
    }

    const results = [];
    const startTime = Date.now();

    console.log(chalk.cyan('\n🐳 Starting Sandbox Orchestration\n'));
    console.log(chalk.gray(`Provider: ${provider.toUpperCase()}`));
    console.log(chalk.gray(`Agent: ${agentCmd}`));
    console.log(chalk.gray(`Streams: ${config.streams.length}`));
    console.log(chalk.gray(`Mode: ${mode}\n`));

    // Create orchestrator sandbox (DOES NOT implement code!)
    const orchestratorSpinner = ora('Creating orchestrator sandbox...').start();
    
    try {
      // Create sandbox - we don't need to store the return value
      await manager.createSandbox('orchestrator', {
        envVars: {
          SIGMA_ROLE: 'orchestrator',
          SIGMA_PROJECT_ROOT: '/workspace',
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || ''
        },
        timeout: 3600 // 1 hour
      });

      orchestratorSpinner.text = 'Uploading orchestrator scripts...';

      // Upload orchestrator scripts
      const orchestratorScriptPath = path.join(targetDir, 'scripts', 'orchestrator', 'orchestrator.py');
      try {
        await fs.access(orchestratorScriptPath);
        await providerInstance.uploadFile('orchestrator', orchestratorScriptPath, '/usr/local/bin/orchestrator.py');
      } catch {
        // Script doesn't exist, create a minimal version
        orchestratorSpinner.text = 'Creating orchestrator script...';
      }

      // Upload streams config
      const streamsConfigPath = path.join(targetDir, '.sigma', 'orchestration', 'streams.json');
      try {
        await fs.access(streamsConfigPath);
        await providerInstance.uploadFile('orchestrator', streamsConfigPath, '/workspace/.sigma/orchestration/streams.json');
      } catch {
        // Create config directory in sandbox
        await providerInstance.execute('orchestrator', 'mkdir -p /workspace/.sigma/orchestration/inbox');
      }

      orchestratorSpinner.text = 'Starting orchestrator...';

      // Start orchestrator Claude Code - fire and forget, output handled by callbacks
      const orchestratorPrompt = generateOrchestratorPrompt(targetDir);
      await providerInstance.execute(
        'orchestrator',
        `${agentCmd} -p "${orchestratorPrompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" --dangerously-skip-permissions`,
        {
          onStdout: (data) => console.log(chalk.cyan('[ORCHESTRATOR]'), data.trim()),
          onStderr: (data) => console.log(chalk.yellow('[ORCHESTRATOR]'), data.trim())
        }
      );

      orchestratorSpinner.succeed('Orchestrator sandbox created and started');
      session.orchestrator = { status: 'running', sandboxId: 'orchestrator' };

    } catch (error) {
      orchestratorSpinner.fail(`Failed to create orchestrator: ${error.message}`);
      // Continue anyway - streams can still work
    }

    // Create stream sandboxes
    for (const stream of config.streams) {
      const streamSpinner = ora(`Creating stream ${stream.name} sandbox...`).start();
      const sandboxId = `stream-${stream.name.toLowerCase()}`;

      try {
        // Create sandbox - we don't need to store the return value
        await manager.createSandbox(sandboxId, {
          envVars: {
            SIGMA_ROLE: 'worker',
            SIGMA_STREAM: stream.name,
            SIGMA_PRDS: stream.prds.join(','),
            ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || ''
          },
          timeout: 3600 // 1 hour
        });

        streamSpinner.text = `Uploading files to stream ${stream.name}...`;

        // Upload stream worker script
        const workerScriptPath = path.join(targetDir, 'scripts', 'orchestrator', 'stream-worker.py');
        try {
          await fs.access(workerScriptPath);
          await providerInstance.uploadFile(sandboxId, workerScriptPath, '/usr/local/bin/stream-worker.py');
        } catch {
          // Script doesn't exist
        }

        // Upload PRDs for this stream
        for (const prdId of stream.prds) {
          const prd = prds.find(p => p.id === prdId);
          if (prd) {
            await providerInstance.uploadFile(sandboxId, prd.path, `/workspace/docs/prds/${prdId}.md`);
          }
        }

        streamSpinner.text = `Starting stream ${stream.name}...`;

        // Start stream worker Claude Code - fire and forget, output handled by callbacks
        const streamPrompt = generateStreamPrompt(stream);
        await providerInstance.execute(
          sandboxId,
          `${agentCmd} -p "${streamPrompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" --dangerously-skip-permissions`,
          {
            onStdout: (data) => console.log(chalk.yellow(`[STREAM ${stream.name}]`), data.trim()),
            onStderr: (data) => console.log(chalk.red(`[STREAM ${stream.name}]`), data.trim())
          }
        );

        streamSpinner.succeed(`Stream ${stream.name} sandbox created and started`);
        
        session.streams[stream.name] = {
          status: 'running',
          sandboxId,
          prds: stream.prds
        };

        results.push({
          stream: stream.name,
          sandboxId,
          success: true
        });

      } catch (error) {
        streamSpinner.fail(`Stream ${stream.name} failed: ${error.message}`);
        results.push({
          stream: stream.name,
          success: false,
          error: error.message
        });
      }
    }

    // Save session state
    await saveSessionState(targetDir, session);

    // Summary
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const successCount = results.filter(r => r.success).length;

    console.log(chalk.green('\n' + '═'.repeat(60)));
    console.log(chalk.green.bold('  🐳 Sandbox Orchestration Started'));
    console.log(chalk.green('═'.repeat(60)));
    console.log('');
    console.log(chalk.white(`  Streams created: ${successCount}/${results.length}`));
    console.log(chalk.white(`  Setup time: ${totalTime}s`));
    console.log('');
    
    if (mode === 'semi-auto') {
      console.log(chalk.cyan('📡 Monitoring Status:'));
      console.log(chalk.gray('   Run: sigma orchestrate --status'));
      console.log(chalk.gray('   Attach: sigma orchestrate --attach'));
      console.log(chalk.gray('   Stop: sigma orchestrate --kill'));
    }

    return {
      success: true,
      results,
      totalTime,
      session
    };

  } catch (error) {
    spinner.fail(`Orchestration failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Simplified test orchestration for verifying sandbox setup
 * @param {Object} options
 * @param {string} options.targetDir - Project directory
 * @param {string} options.provider - Sandbox provider
 */
export async function runTestOrchestration(options) {
  const { targetDir, provider } = options;

  console.log(chalk.cyan('\n🧪 Running Sandbox Test\n'));
  console.log(chalk.gray('This will create a single sandbox and verify the system works.\n'));

  const manager = new SandboxManager(targetDir);
  await manager.initialize();
  await manager.setProvider(provider);

  const spinner = ora({
    text: 'Creating test sandbox...',
    color: 'cyan'
  }).start();

  try {
    // Create test sandbox
    const sandboxId = `test-${Date.now()}`;
    await manager.createSandbox(sandboxId, {
      envVars: {
        TEST_VAR: 'hello-sigma'
      },
      timeout: 300 // 5 minutes
    });

    spinner.text = 'Running test commands...';

    const providerInstance = manager.getProviderInstance();

    // Test basic functionality with streaming
    let output = '';
    const result = await providerInstance.execute(
      sandboxId, 
      'echo "Hello from Sigma sandbox!" && pwd && ls -la',
      {
        onStdout: (data) => { output += data; },
        onStderr: (data) => { output += data; }
      }
    );

    spinner.succeed('Test sandbox created and verified!');

    console.log(chalk.green('\n✅ Sandbox Test Results:\n'));
    console.log(chalk.gray('Output:'));
    console.log(chalk.white(result.stdout || output || '(no output)'));
    
    if (result.stderr) {
      console.log(chalk.yellow('\nWarnings:'));
      console.log(chalk.yellow(result.stderr));
    }

    // Get public URL if available
    const publicUrl = await providerInstance.getPublicUrl(sandboxId);
    if (publicUrl) {
      console.log(chalk.cyan(`\n🌐 Preview URL: ${publicUrl}`));
    }

    // Cleanup
    console.log(chalk.gray('\nCleaning up test sandbox...'));
    await manager.destroySandbox(sandboxId);
    console.log(chalk.green('✓ Cleanup complete\n'));

    return { success: true, result };

  } catch (error) {
    spinner.fail(`Test failed: ${error.message}`);
    
    // Cleanup on failure
    try {
      await manager.destroyAll();
    } catch {
      // Ignore cleanup errors
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Get status of running sandbox orchestration
 * @param {string} targetDir - Project directory
 */
export async function getSandboxOrchestrationStatus(targetDir) {
  const session = await loadSessionState(targetDir);
  
  if (!session) {
    return { running: false, message: 'No orchestration session found' };
  }

  const status = {
    running: true,
    provider: session.provider,
    startedAt: session.startedAt,
    orchestrator: session.orchestrator || { status: 'unknown' },
    streams: {}
  };

  for (const [name, stream] of Object.entries(session.streams || {})) {
    status.streams[name] = {
      status: stream.status,
      sandboxId: stream.sandboxId,
      prds: stream.prds
    };
  }

  return status;
}

export { SandboxManager };

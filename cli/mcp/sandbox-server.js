#!/usr/bin/env node
/**
 * Sigma Protocol - Unified Sandbox MCP Server
 * 
 * Provides a single MCP interface for all sandbox providers (E2B, Docker, Daytona).
 * The orchestrator can use these tools to:
 * - Create sandboxes (auto-selects provider or specify)
 * - Execute commands in sandboxes
 * - Get preview URLs for comparison
 * - Open all previews in browser
 * - Manage sandbox lifecycle
 * - Create forks with same prompt
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Import sandbox providers
import { E2BProvider } from '../lib/sandbox/providers/e2b.js';
import { DockerProvider } from '../lib/sandbox/providers/docker.js';
import { DaytonaProvider } from '../lib/sandbox/providers/daytona.js';

// Provider instances
const providers = {
  e2b: new E2BProvider(),
  docker: new DockerProvider(),
  daytona: new DaytonaProvider()
};

// Active sandboxes tracking
const activeSandboxes = new Map();

/**
 * Check which providers are available
 */
async function getAvailableProviders() {
  const available = [];
  
  for (const [name, provider] of Object.entries(providers)) {
    try {
      const isAvailable = await provider.isAvailable();
      if (isAvailable) {
        available.push(name);
      }
    } catch {
      // Provider not available
    }
  }
  
  return available;
}

/**
 * Auto-select provider based on config or availability
 */
async function selectProvider(explicitProvider) {
  if (explicitProvider && providers[explicitProvider]) {
    if (await providers[explicitProvider].isAvailable()) {
      return providers[explicitProvider];
    }
    throw new Error(`Provider ${explicitProvider} is not available`);
  }
  
  // Check config for preferred provider
  try {
    const configPath = path.join(process.cwd(), '.sigma', 'config.json');
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    const preferred = config.orchestration?.providers?.preferred;
    
    if (preferred && providers[preferred] && await providers[preferred].isAvailable()) {
      return providers[preferred];
    }
  } catch {
    // No config or invalid
  }
  
  // Fallback: try providers in order
  for (const name of ['e2b', 'docker', 'daytona']) {
    if (await providers[name].isAvailable()) {
      return providers[name];
    }
  }
  
  throw new Error('No sandbox provider available. Install E2B SDK, Docker, or Daytona.');
}

/**
 * MCP Tool Definitions
 */
const TOOLS = [
  {
    name: 'sandbox_list_providers',
    description: 'List available sandbox providers and their status',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'sandbox_list',
    description: 'List all active sandboxes across all providers',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'sandbox_create',
    description: 'Create a new sandbox. Auto-selects provider or specify one.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name for the sandbox'
        },
        provider: {
          type: 'string',
          enum: ['e2b', 'docker', 'daytona'],
          description: 'Provider to use (optional, auto-selects if not specified)'
        },
        template: {
          type: 'string',
          description: 'Template/image to use (provider-specific)'
        },
        env: {
          type: 'object',
          description: 'Environment variables to set'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'sandbox_exec',
    description: 'Execute a command in a sandbox',
    inputSchema: {
      type: 'object',
      properties: {
        sandboxId: {
          type: 'string',
          description: 'ID of the sandbox'
        },
        command: {
          type: 'string',
          description: 'Command to execute'
        }
      },
      required: ['sandboxId', 'command']
    }
  },
  {
    name: 'sandbox_upload',
    description: 'Upload a file to a sandbox',
    inputSchema: {
      type: 'object',
      properties: {
        sandboxId: {
          type: 'string',
          description: 'ID of the sandbox'
        },
        localPath: {
          type: 'string',
          description: 'Local file path'
        },
        remotePath: {
          type: 'string',
          description: 'Destination path in sandbox'
        }
      },
      required: ['sandboxId', 'localPath', 'remotePath']
    }
  },
  {
    name: 'sandbox_preview_urls',
    description: 'Get all preview URLs for active sandboxes (for comparison)',
    inputSchema: {
      type: 'object',
      properties: {
        streamId: {
          type: 'string',
          description: 'Filter by stream ID (optional)'
        }
      },
      required: []
    }
  },
  {
    name: 'sandbox_open_previews',
    description: 'Open all preview URLs in Chrome for visual comparison',
    inputSchema: {
      type: 'object',
      properties: {
        streamId: {
          type: 'string',
          description: 'Filter by stream ID (optional)'
        },
        includePRs: {
          type: 'boolean',
          description: 'Also open GitHub PR URLs',
          default: true
        }
      },
      required: []
    }
  },
  {
    name: 'sandbox_logs',
    description: 'Get logs from a sandbox',
    inputSchema: {
      type: 'object',
      properties: {
        sandboxId: {
          type: 'string',
          description: 'ID of the sandbox'
        },
        tail: {
          type: 'number',
          description: 'Number of lines to return',
          default: 100
        }
      },
      required: ['sandboxId']
    }
  },
  {
    name: 'sandbox_destroy',
    description: 'Destroy a sandbox',
    inputSchema: {
      type: 'object',
      properties: {
        sandboxId: {
          type: 'string',
          description: 'ID of the sandbox'
        }
      },
      required: ['sandboxId']
    }
  },
  {
    name: 'sandbox_fork',
    description: 'Create N forks of a sandbox with the same prompt (Best of N pattern)',
    inputSchema: {
      type: 'object',
      properties: {
        baseName: {
          type: 'string',
          description: 'Base name for forks (e.g., "stream-a-dashboard")'
        },
        count: {
          type: 'number',
          description: 'Number of forks to create',
          default: 3
        },
        prompt: {
          type: 'string',
          description: 'Prompt for Claude Code in each fork'
        },
        provider: {
          type: 'string',
          enum: ['e2b', 'docker', 'daytona'],
          description: 'Provider to use'
        },
        repoUrl: {
          type: 'string',
          description: 'Git repository URL to clone'
        },
        branch: {
          type: 'string',
          description: 'Branch to checkout'
        }
      },
      required: ['baseName', 'prompt']
    }
  }
];

/**
 * Tool Handlers
 */
async function handleTool(name, args) {
  switch (name) {
    case 'sandbox_list_providers': {
      const available = await getAvailableProviders();
      return {
        available,
        all: ['e2b', 'docker', 'daytona'],
        status: {
          e2b: available.includes('e2b') ? 'ready' : 'not configured (needs E2B_API_KEY)',
          docker: available.includes('docker') ? 'ready' : 'not available (Docker not running)',
          daytona: available.includes('daytona') ? 'ready' : 'not configured (needs Daytona setup)'
        }
      };
    }
    
    case 'sandbox_list': {
      const sandboxes = [];
      for (const [id, sandbox] of activeSandboxes) {
        sandboxes.push({
          id,
          name: sandbox.name,
          provider: sandbox.provider,
          status: sandbox.status,
          previewUrl: sandbox.previewUrl,
          prUrl: sandbox.prUrl,
          createdAt: sandbox.createdAt
        });
      }
      return { sandboxes, count: sandboxes.length };
    }
    
    case 'sandbox_create': {
      const provider = await selectProvider(args.provider);
      const providerName = Object.keys(providers).find(k => providers[k] === provider);
      
      const sandboxId = await provider.create({
        name: args.name,
        template: args.template,
        env: args.env
      });
      
      activeSandboxes.set(sandboxId, {
        name: args.name,
        provider: providerName,
        status: 'running',
        previewUrl: null,
        prUrl: null,
        createdAt: new Date().toISOString()
      });
      
      // Try to get preview URL
      try {
        const previewUrl = await provider.getPublicUrl(sandboxId);
        if (previewUrl) {
          activeSandboxes.get(sandboxId).previewUrl = previewUrl;
        }
      } catch {
        // No preview URL available
      }
      
      return { sandboxId, provider: providerName, status: 'created' };
    }
    
    case 'sandbox_exec': {
      const sandbox = activeSandboxes.get(args.sandboxId);
      if (!sandbox) {
        throw new Error(`Sandbox not found: ${args.sandboxId}`);
      }
      
      const provider = providers[sandbox.provider];
      const result = await provider.execute(args.sandboxId, args.command);
      
      return result;
    }
    
    case 'sandbox_upload': {
      const sandbox = activeSandboxes.get(args.sandboxId);
      if (!sandbox) {
        throw new Error(`Sandbox not found: ${args.sandboxId}`);
      }
      
      const provider = providers[sandbox.provider];
      await provider.uploadFile(args.sandboxId, args.localPath, args.remotePath);
      
      return { success: true, remotePath: args.remotePath };
    }
    
    case 'sandbox_preview_urls': {
      const previews = [];
      
      for (const [id, sandbox] of activeSandboxes) {
        if (args.streamId && !id.includes(args.streamId)) continue;
        
        if (sandbox.previewUrl) {
          previews.push({
            sandboxId: id,
            name: sandbox.name,
            previewUrl: sandbox.previewUrl,
            prUrl: sandbox.prUrl
          });
        }
      }
      
      return { previews, count: previews.length };
    }
    
    case 'sandbox_open_previews': {
      const previews = [];
      const urls = [];
      
      for (const [id, sandbox] of activeSandboxes) {
        if (args.streamId && !id.includes(args.streamId)) continue;
        
        if (sandbox.previewUrl) {
          urls.push(sandbox.previewUrl);
          previews.push({ type: 'preview', url: sandbox.previewUrl, name: sandbox.name });
        }
        
        if (args.includePRs !== false && sandbox.prUrl) {
          urls.push(sandbox.prUrl);
          previews.push({ type: 'pr', url: sandbox.prUrl, name: sandbox.name });
        }
      }
      
      // Open URLs in Chrome
      for (const url of urls) {
        try {
          execSync(`open -a "Google Chrome" "${url}"`, { stdio: 'pipe' });
        } catch {
          try {
            execSync(`xdg-open "${url}"`, { stdio: 'pipe' });
          } catch {
            // Could not open
          }
        }
      }
      
      return { 
        opened: urls.length,
        previews,
        message: `Opened ${urls.length} URLs in Chrome`
      };
    }
    
    case 'sandbox_logs': {
      const sandbox = activeSandboxes.get(args.sandboxId);
      if (!sandbox) {
        throw new Error(`Sandbox not found: ${args.sandboxId}`);
      }
      
      const provider = providers[sandbox.provider];
      const logs = await provider.getLogs(args.sandboxId, args.tail || 100);
      
      return { logs };
    }
    
    case 'sandbox_destroy': {
      const sandbox = activeSandboxes.get(args.sandboxId);
      if (!sandbox) {
        throw new Error(`Sandbox not found: ${args.sandboxId}`);
      }
      
      const provider = providers[sandbox.provider];
      await provider.destroy(args.sandboxId);
      activeSandboxes.delete(args.sandboxId);
      
      return { success: true, destroyed: args.sandboxId };
    }
    
    case 'sandbox_fork': {
      const provider = await selectProvider(args.provider);
      const providerName = Object.keys(providers).find(k => providers[k] === provider);
      const count = args.count || 3;
      
      const forks = [];
      
      for (let i = 1; i <= count; i++) {
        const forkName = `${args.baseName}-fork-${i}`;
        
        try {
          const sandboxId = await provider.create({
            name: forkName,
            template: args.template,
            env: {
              FORK_ID: i.toString(),
              FORK_NAME: forkName,
              ...args.env
            }
          });
          
          activeSandboxes.set(sandboxId, {
            name: forkName,
            provider: providerName,
            status: 'running',
            forkId: i,
            baseName: args.baseName,
            previewUrl: null,
            prUrl: null,
            createdAt: new Date().toISOString()
          });
          
          // Clone repo if specified
          if (args.repoUrl) {
            await provider.execute(sandboxId, `git clone ${args.repoUrl} /workspace`);
            if (args.branch) {
              await provider.execute(sandboxId, `cd /workspace && git checkout ${args.branch}`);
            }
          }
          
          // Launch Claude Code with prompt
          const escapedPrompt = args.prompt.replace(/'/g, "'\\''").replace(/\n/g, '\\n');
          provider.execute(sandboxId, `claude -p '${escapedPrompt}' --dangerously-skip-permissions`);
          
          // Get preview URL
          try {
            const previewUrl = await provider.getPublicUrl(sandboxId);
            if (previewUrl) {
              activeSandboxes.get(sandboxId).previewUrl = previewUrl;
            }
          } catch {
            // No preview URL
          }
          
          forks.push({
            forkId: i,
            sandboxId,
            name: forkName,
            status: 'running'
          });
          
        } catch (error) {
          forks.push({
            forkId: i,
            name: forkName,
            status: 'failed',
            error: error.message
          });
        }
      }
      
      return {
        baseName: args.baseName,
        count: forks.length,
        forks,
        provider: providerName
      };
    }
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/**
 * Start MCP Server
 */
async function main() {
  const server = new Server(
    {
      name: 'sigma-sandbox',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      const result = await handleTool(name, args || {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: error.message }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Sigma Sandbox MCP Server running...');
}

main().catch(console.error);



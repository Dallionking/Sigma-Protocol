---
name: creating-opencode-plugins
description: "Use when creating OpenCode plugins that hook into command, file, LSP, message, permission, server, session, todo, tool, or TUI events. Provides plugin structure, event API specifications, and implementation patterns."
version: "1.0.0"
platform: opencode
triggers:
  - opencode-plugin
  - event-hook
  - plugin-development
  - opencode-extension
---

# Creating OpenCode Plugins Skill

OpenCode plugins are JavaScript/TypeScript modules that hook into 25+ events across the OpenCode AI assistant lifecycle.

## When to Invoke

Invoke this skill when:

- Intercepting file operations
- Monitoring command execution
- Processing LSP diagnostics
- Managing permissions automatically
- Reacting to session lifecycle
- Extending tool capabilities
- Enhancing TUI interactions

---

## Plugin Structure

### Location

```
# Global plugins (all projects)
~/.config/opencode/plugin/
    └── my-plugin.js

# Project plugins (current project only)
project/
└── .opencode/
    └── plugin/
        └── my-plugin.js
```

### Basic Template

```javascript
// .opencode/plugin/my-plugin.js

export const MyPlugin = async (context) => {
  // context: { project, client, $, directory, worktree }

  return {
    event: async ({ event }) => {
      // event: { type: 'event.name', data: {...} }

      switch (event.type) {
        case "file.edited":
          // Handle file edits
          break;

        case "tool.execute.before":
          // Pre-process tool execution
          break;

        case "tool.execute.after":
          // Post-process tool execution
          break;
      }
    },
  };
};
```

---

## Event Reference

### File Events

| Event                  | Description                 | Data                           |
| ---------------------- | --------------------------- | ------------------------------ |
| `file.edited`          | File was edited             | `{ path, content, timestamp }` |
| `file.watcher.updated` | File system change detected | `{ path, type }`               |

### Tool Events

| Event                 | Description          | Data                                         |
| --------------------- | -------------------- | -------------------------------------------- |
| `tool.execute.before` | Before tool runs     | `{ tool, args, user }`                       |
| `tool.execute.after`  | After tool completes | `{ tool, duration, success, output, error }` |

### Permission Events

| Event                | Description                  | Data                           |
| -------------------- | ---------------------------- | ------------------------------ |
| `permission.replied` | User responded to permission | `{ action, target, decision }` |
| `permission.updated` | Permission setting changed   | `{ action, target, newValue }` |

### Session Events

| Event             | Description         | Data                      |
| ----------------- | ------------------- | ------------------------- |
| `session.created` | New session started | `{ sessionId }`           |
| `session.idle`    | Session became idle | `{ sessionId, duration }` |
| `session.deleted` | Session removed     | `{ sessionId }`           |

### Command Events

| Event              | Description     | Data                        |
| ------------------ | --------------- | --------------------------- |
| `command.executed` | Command was run | `{ command, args, status }` |

### Message Events

| Event               | Description     | Data                     |
| ------------------- | --------------- | ------------------------ |
| `message.*.updated` | Message updated | `{ messageId, content }` |
| `message.*.removed` | Message removed | `{ messageId }`          |

### TUI Events

| Event                 | Description             | Data                |
| --------------------- | ----------------------- | ------------------- |
| `tui.prompt.append`   | Text appended to prompt | `{ text }`          |
| `tui.toast.show`      | Toast notification      | `{ message, type }` |
| `tui.command.execute` | TUI command executed    | `{ command }`       |

---

## Common Patterns

### Environment File Protection

```javascript
export const EnvProtectionPlugin = async ({ project, client }) => {
  const sensitivePatterns = [
    /\.env$/,
    /\.env\..+$/,
    /credentials\.json$/,
    /\.secret$/,
    /secrets\.yaml$/,
  ];

  const isSensitiveFile = (filePath) => {
    return sensitivePatterns.some((pattern) => pattern.test(filePath));
  };

  return {
    event: async ({ event }) => {
      switch (event.type) {
        case "file.edited": {
          const { path } = event.data;

          if (isSensitiveFile(path)) {
            console.warn(`Warning: Sensitive file edited: ${path}`);
          }
          break;
        }

        case "permission.replied": {
          const { action, target, decision } = event.data;

          if (
            (action === "read" || action === "share") &&
            isSensitiveFile(target) &&
            decision === "allow"
          ) {
            console.error(`Blocked ${action} on sensitive file: ${target}`);

            return {
              override: true,
              decision: "deny",
              reason: "Sensitive file protection policy",
            };
          }
          break;
        }
      }
    },
  };
};
```

### Command Notifications

```javascript
export const NotifyPlugin = async ({ project, $ }) => {
  return {
    event: async ({ event }) => {
      switch (event.type) {
        case "tool.execute.after": {
          const { tool, duration, success } = event.data;

          // Notify for long-running operations
          if (duration > 5000) {
            await $`osascript -e 'display notification "Completed in ${duration}ms" with title "${tool}"'`;
          }

          const status = success ? "completed" : "failed";
          console.log(`Tool ${tool} ${status} in ${duration}ms`);
          break;
        }
      }
    },
  };
};
```

### Auto-Format on Save

```javascript
export const AutoFormatPlugin = async ({ $, directory }) => {
  return {
    event: async ({ event }) => {
      if (event.type === "file.edited") {
        const { path } = event.data;

        // Only format JS/TS files
        if (/\.(js|ts|jsx|tsx)$/.test(path)) {
          try {
            await $`prettier --write ${path}`;
            console.log(`Formatted: ${path}`);
          } catch (error) {
            console.error(`Format failed: ${error.message}`);
          }
        }
      }
    },
  };
};
```

### Custom Tool Registration

```javascript
export const CustomToolsPlugin = async ({ client, $ }) => {
  // Register custom tool on initialization
  await client.registerTool({
    name: "lint",
    description: "Run linter with auto-fix option",
    parameters: {
      type: "object",
      properties: {
        fix: {
          type: "boolean",
          description: "Auto-fix issues",
        },
      },
    },
    handler: async ({ fix }) => {
      const result = await $`eslint ${fix ? "--fix" : ""} .`;
      return {
        output: result.stdout,
        errors: result.stderr,
      };
    },
  });

  return {
    event: async ({ event }) => {
      if (event.type === "tool.execute.before") {
        console.log(`Tool: ${event.data.tool}`);
      }
    },
  };
};
```

---

## Plugin Composition

Combine multiple plugins:

```javascript
import { compose } from "opencode-plugin-compose";

const composedPlugin = compose([
  envProtectionPlugin,
  notifyPlugin,
  autoFormatPlugin,
  customToolsPlugin,
]);

// Runs all hooks in sequence
```

---

## Context Object

The plugin receives a context object:

```typescript
interface PluginContext {
  // Project information
  project: {
    root: string;
    name: string;
    config: object;
  };

  // API client
  client: {
    registerTool: (tool: ToolDefinition) => Promise<void>;
    // ... other client methods
  };

  // Shell command executor (zx-style)
  $: (cmd: TemplateStringsArray) => Promise<ProcessOutput>;

  // Current directory
  directory: string;

  // Git worktree (if applicable)
  worktree: string | null;
}
```

---

## Event Data Structures

```typescript
// File Events
interface FileEditedEvent {
  type: "file.edited";
  data: {
    path: string;
    content: string;
    timestamp: number;
  };
}

// Tool Events
interface ToolExecuteBeforeEvent {
  type: "tool.execute.before";
  data: {
    tool: string;
    args: Record<string, any>;
    user: string;
  };
}

interface ToolExecuteAfterEvent {
  type: "tool.execute.after";
  data: {
    tool: string;
    duration: number;
    success: boolean;
    output?: any;
    error?: string;
  };
}

// Permission Events
interface PermissionRepliedEvent {
  type: "permission.replied";
  data: {
    action: "read" | "write" | "execute" | "share";
    target: string;
    decision: "allow" | "deny";
  };
}
```

---

## Best Practices

### Error Handling

```javascript
return {
  event: async ({ event }) => {
    try {
      // Plugin logic
    } catch (error) {
      console.error(`Plugin error: ${error.message}`);
      // Don't throw - prevents plugin from crashing
    }
  },
};
```

### Performance

- Keep event handlers fast
- Defer heavy work to background processes
- Avoid blocking operations in handlers
- Use caching for repeated operations

### Security

- Validate all inputs
- Don't log sensitive data
- Use minimal permissions
- Sandbox external commands

---

## Common Mistakes

| Mistake                  | Why It Fails         | Fix                    |
| ------------------------ | -------------------- | ---------------------- |
| Synchronous handler      | Blocks event loop    | Use `async` handlers   |
| Missing error handling   | Plugin crashes       | Wrap in try/catch      |
| Heavy computation        | Slows operations     | Defer to background    |
| Mutating event data      | Causes side effects  | Return override object |
| Missing event type check | Handles wrong events | Use switch/case        |

---

## Testing Plugins

```javascript
import { MyPlugin } from "./my-plugin.js";

// Mock context
const mockContext = {
  project: { root: "/test/project" },
  client: {},
  $: async (cmd) => ({ stdout: "", stderr: "" }),
  directory: "/test/project",
  worktree: null,
};

// Initialize plugin
const plugin = await MyPlugin(mockContext);

// Simulate event
await plugin.event({
  event: {
    type: "file.edited",
    data: {
      path: ".env",
      content: "SECRET=123",
      timestamp: Date.now(),
    },
  },
});
```

---

## Integration with Sigma Protocol

### Security Enforcement

Create plugins to enforce Sigma security policies.

### Workflow Automation

Automate Sigma workflow steps with event hooks.

### Quality Gates

Implement automated quality checks via plugins.

---

_Remember: Plugins are powerful but should be focused. One plugin per concern. Test thoroughly before deploying._

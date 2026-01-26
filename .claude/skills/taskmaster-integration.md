---
name: taskmaster-integration
description: "Expert skill for Task Master AI integration, MCP tools, and task-driven development"
version: 1.0.0
triggers:
  - taskmaster
  - task-master
  - task management
  - prd parsing
  - complexity analysis
  - task expansion
---

# @taskmaster-integration

Expert knowledge for integrating and developing with Task Master AI - the AI-native task management system.

---

## Overview

Task Master provides:
- PRD → Tasks automatic parsing
- Complexity analysis & expansion
- Dependency management
- Tagged task contexts (multi-branch support)
- MCP server integration

---

## Key Commands (MCP & CLI)

### Project Setup

```bash
# Initialize
task-master init

# Parse PRD to tasks
task-master parse-prd .taskmaster/docs/prd.txt --num-tasks 15

# Analyze complexity
task-master analyze-complexity --research
```

### Task Management

```bash
# List tasks
task-master list
task-master list --status pending

# Get next task
task-master next

# View task details
task-master show <id>

# Expand task into subtasks
task-master expand --id=<id> --research --force

# Update task
task-master update-task --id=<id> --prompt="new info..."

# Set status
task-master set-status --id=<id> --status=done
```

### Tagged Task Contexts

```bash
# List tags
task-master tags

# Create tag (for feature branch)
task-master add-tag feature-auth --from-branch

# Switch context
task-master use-tag feature-auth

# Operations target current tag by default
task-master list  # shows feature-auth tasks
```

---

## MCP Integration

### Config Location
```
.taskmaster/config.json  - Model settings
.taskmaster/tasks/tasks.json - Task data
.cursor/mcp.json - MCP server config
```

### MCP Server Entry

```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "your-key"
      }
    }
  }
}
```

### Key MCP Tools

| Tool | Purpose |
|------|---------|
| `get_tasks` | List tasks with filters |
| `get_task` | Get task details by ID |
| `next_task` | Find next actionable task |
| `add_task` | AI-powered task creation |
| `expand_task` | Break down into subtasks |
| `update_task` | Modify task with new context |
| `update_subtask` | Append progress notes |
| `set_task_status` | Mark task status |
| `parse_prd` | Generate tasks from PRD |
| `analyze_project_complexity` | Complexity scoring |

---

## Integration Patterns

### 1. PRD → Tasks → Orchestration

```javascript
// 1. Parse PRD
await taskmaster.parse_prd({
  input: 'docs/prd.txt',
  numTasks: 15
});

// 2. Analyze complexity
await taskmaster.analyze_project_complexity({ research: true });

// 3. Expand complex tasks
await taskmaster.expand_all({ research: true });

// 4. Generate streams config from tasks
const tasks = await taskmaster.get_tasks({ status: 'pending' });
const streams = groupTasksIntoStreams(tasks);
```

### 2. Fork Worker → Task Updates

```javascript
// Worker reports progress
await taskmaster.update_subtask({
  id: '5.2',
  prompt: 'Implemented auth middleware. Tested with JWT tokens.'
});

// Worker completes
await taskmaster.set_task_status({
  id: '5.2',
  status: 'done'
});
```

### 3. Orchestrator → Gap Analysis

```javascript
// Check task completion quality
const task = await taskmaster.get_task({ id: '5' });

// Run gap analysis
// (Compare implementation against task requirements)
```

---

## Configuration

### Model Selection

```bash
# View current models
task-master models

# Set models
task-master models --set-main claude-sonnet-4-20250514
task-master models --set-research sonar-pro
```

### .taskmaster/config.json Structure

```json
{
  "models": {
    "main": { "provider": "anthropic", "modelId": "claude-sonnet-4-20250514" },
    "research": { "provider": "perplexity", "modelId": "sonar-pro" },
    "fallback": { "provider": "anthropic", "modelId": "claude-3-5-haiku-latest" }
  },
  "global": {
    "defaultSubtasks": 5,
    "defaultPriority": "medium",
    "defaultTag": "master"
  }
}
```

---

## Best Practices

1. **Always use complexity analysis** before expanding tasks
2. **Tag per feature branch** for isolation
3. **Research flag** for external API/library tasks
4. **Update subtasks frequently** to log implementation journey
5. **Run gap-analysis** before marking tasks done

---

## Key Files in Sigma Protocol

- `cli/lib/orchestration/index.js` - Uses Taskmaster for PRD detection
- `.taskmaster/tasks/tasks.json` - Task data
- `.taskmaster/docs/` - PRDs and research
- `.taskmaster/reports/` - Complexity reports

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MCP tools fail | Check API keys in `.cursor/mcp.json` |
| CLI fails | Check API keys in `.env` |
| Tasks not found | Check current tag: `task-master tags` |
| Expansion slow | AI processing takes 30-60s, be patient |

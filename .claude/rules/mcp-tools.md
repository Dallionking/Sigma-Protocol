# Sigma Protocol - MCP Tools & Task Management

## Research Tools
- **Firecrawl**: Web scraping, site crawling, content extraction
- **EXA**: Semantic search, code context, deep research
- **Ref**: Documentation search, URL reading
- **Context7**: Library-specific documentation

## Code Review Tools
- **Greptile**: AI-powered codebase-aware PR review (HTTP MCP at `api.greptile.com/mcp`)

## Task Management
- **Task Master AI**: PRD parsing, task management, research integration

## Claude Code Native Task Management

| Tool | Description |
|------|-------------|
| `TaskCreate` | Create tasks with dependencies |
| `TaskUpdate` | Update task status/content |
| `TaskList` | List all tasks with filters |
| `TaskGet` | Get task details by ID |

**Dependency Tracking:**
- `blockedBy`: Tasks that must complete first
- `blocks`: Tasks waiting on this task

**Status Workflow:** `pending` -> `in_progress` -> `completed`

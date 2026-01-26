---
description: "Run Sigma ops/prompt-handoff"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /prompt-handoff

Invoke the **prompt-handoff** agent from Sigma Protocol.

This command runs the full prompt-handoff workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** `/prompt-handoff [your input here]`

@ops-prompt-handoff

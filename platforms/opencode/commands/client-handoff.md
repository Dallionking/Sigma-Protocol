---
description: "Run Sigma deploy/client-handoff"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /client-handoff

Invoke the **client-handoff** agent from Sigma Protocol.

This command runs the full client-handoff workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** `/client-handoff [your input here]`

@deploy-client-handoff

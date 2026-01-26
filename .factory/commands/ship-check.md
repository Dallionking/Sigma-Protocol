---
description: "Run Sigma deploy/ship-check"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /ship-check

Invoke the **ship-check** agent from Sigma Protocol.

This command runs the full ship-check workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** `/ship-check [your input here]`

@deploy-ship-check

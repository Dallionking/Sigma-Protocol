---
description: "Run Sigma deploy/ship-prod"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /ship-prod

Invoke the **ship-prod** agent from Sigma Protocol.

This command runs the full ship-prod workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** `/ship-prod [your input here]`

@deploy-ship-prod

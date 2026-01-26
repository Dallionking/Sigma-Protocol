---
description: "Run Sigma ops/system-health.mdc"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /system-health.mdc

Invoke the **system-health.mdc** agent from Sigma Protocol.

This command runs the full system-health.mdc workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** `/system-health.mdc [your input here]`

@ops-system-health.mdc

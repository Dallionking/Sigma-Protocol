---
description: "Run Sigma audit/verify-prd"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /verify-prd

Invoke the **verify-prd** agent from Sigma Protocol.

This command runs the full verify-prd workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** `/verify-prd [your input here]`

@audit-verify-prd

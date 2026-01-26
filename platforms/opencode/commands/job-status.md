---
description: "Run Sigma ops/job-status"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /job-status

Invoke the **job-status** agent from Sigma Protocol.

This command runs the full job-status workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** `/job-status [your input here]`

@ops-job-status

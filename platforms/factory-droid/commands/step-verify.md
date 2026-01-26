---
description: "Run Sigma audit/step-verify"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /step-verify

Invoke the **step-verify** agent from Sigma Protocol.

This command runs the full step-verify workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** `/step-verify [your input here]`

@audit-step-verify

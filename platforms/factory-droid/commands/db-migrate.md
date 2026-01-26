---
description: "Run Sigma dev/db-migrate"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /db-migrate

Invoke the **db-migrate** agent from Sigma Protocol.

This command runs the full db-migrate workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** `/db-migrate [your input here]`

@dev-db-migrate

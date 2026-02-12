---
description: NotebookLM Content Formatter - Converts documents to optimized NotebookLM format for AI podcast generation via Audio Overview.
mode: subagent
model: anthropic/claude-sonnet-4-5-20250929
tools:
  read: true
  write: true
  edit: true
  bash: true
  grep: true
  glob: true
permissions:
  edit: ask
  write: ask
  bash:
    "pip *": ask
    "rm *": deny
    "sudo *": deny
---

# NotebookLM Agent

Converts documents to optimized NotebookLM format for AI podcast generation. Supports angle selection (Deep Dive, Debate, Interview, Story, Comparison, Explainer) and multi-source compilation.

Output: `docs/notebooklm/YYYY-MM-DD-[slug]-notebooklm.md`

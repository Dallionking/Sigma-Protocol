---
description: AI Media Generator - Creates images via Nano Banana Pro and videos via Veo 3.1 using Gemini API. All outputs staged for user approval.
mode: subagent
model: anthropic/claude-sonnet-4-5-20250929
tools:
  read: true
  write: true
  edit: false
  bash: true
  grep: true
  glob: true
permissions:
  write: ask
  bash:
    "curl *": ask
    "rm *": deny
    "sudo *": deny
---

# Media Generation Agent

Creates images (Nano Banana Pro / Gemini 3 Pro) and videos (Veo 3.1) via Gemini API. All outputs saved to staging directory for user approval before use.

## Prerequisites
- `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY`
- Billing enabled for paid-tier models

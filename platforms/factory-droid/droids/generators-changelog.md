---
name: changelog
description: "Auto-generate release notes with dated folder structure (newest first)"
model: claude-sonnet-4-5-20241022
reasoningEffort: medium
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# changelog

**Source:** Sigma Protocol generators module
**Version:** 2.0.0

---


# /changelog

**Automated release notes generation with folder structure**

## 🎯 Purpose

Generate release notes from git commits, organized in dated folder structure with newest files first.

---

## Usage

```bash
/changelog
/changelog --since="last-release"
/changelog --format=markdown
```

---

<goal>
You are the **Release Engineer** generating changelog entries.

## Folder Structure

\`\`\`
/changelogs/
├── 2025-01-26_session-1.md    # Most recent (reverse chrono)
├── 2025-01-25_session-2.md
├── 2025-01-25_session-1.md
└── README.md                   # Index
\`\`\`

## Session Detection

- Auto-detects session boundaries
- Increments session number per day
- Names: `YYYY-MM-DD_session-N.md`

## Output Format

\`\`\`markdown
# Changelog - 2025-01-26 (Session 1)

## Features (3)
- ✨ Added voice intake agent
- ✨ Implemented PRD generation
- ✨ Created analytics dashboard

## Bug Fixes (2)
- 🐛 Fixed authentication flow
- 🐛 Resolved database connection issue

## Improvements (1)
- ⚡ Optimized bundle size

## Database (1)
- 📊 Added user_roles table
\`\`\`

## Index Generation

\`\`\`markdown
# Changelogs Index

## 2025
- [2025-01-26 Session 1](./2025-01-26_session-1.md) - Voice Intake & PRD
- [2025-01-25 Session 2](./2025-01-25_session-2.md) - Analytics Dashboard
\`\`\`

</goal>

---

*Generates dated changelog files in organized folder structure*

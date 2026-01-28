---
name: client-handoff
description: "Generate comprehensive client handoff documentation package - architecture, setup, maintenance, troubleshooting"
model: claude-sonnet-4-5-20241022
reasoningEffort: medium
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# client-handoff

**Source:** Sigma Protocol deploy module
**Version:** 2.0.0

---


# @client-handoff

**Generate comprehensive client handoff documentation package**

## 🎯 Purpose

Automate the creation of professional, complete handoff documentation for clients. Reduces manual documentation time from 10+ hours to 15 minutes while ensuring nothing is missed. Creates a production-ready package that enables clients (or their team) to understand, maintain, and scale the application.

**Research shows:** 60% of post-delivery issues stem from incomplete handoff documentation. This command solves that.

---

## 📋 Command Usage

```bash
@client-handoff
@client-handoff --format=pdf
@client-handoff --skip-video
@client-handoff --client-name="Acme Corp"
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--format` | Output format: `markdown`, `pdf`, or `both` | `both` |
| `--skip-video` | Skip video walkthrough script generation | `false` |
| `--client-name` | Client name for personalized docs | Auto-detected from project |

---

## 📁 File Management (CRITICAL)

**This command follows the File Creation & Organization Protocol from `.cursorrules`.**

### Before Creating Files

1. **Check manifest**: Use `checkManifest('@client-handoff')` from `/lib/manifest.ts`
2. **Strategy**: `append-dated` - Each handoff gets a dated file

### Output Location

```
/docs/handoff/
  CLIENT-HANDOFF-2025-11-06.md    ← Main deliverable
  handoff-package/                ← Supporting files
```

### After Creating Files

**Update manifest**: `updateManifest('@client-handoff', filePath, 'append-dated')`

---

## 🔄 Command Orchestration (Invokes Other Commands)

This command intelligently orchestrates multiple other commands to create a complete package:

1. **`@security-audit`** → Security checklist and vulnerability report
2. **`@performance-check`** → Performance baseline and benchmarks
3. **`@api-docs-gen`** → API reference documentation (if exists)
4. **`@test-gen --coverage`** → Test coverage report
5. **`@step-1` through `@step-9`** → Extract existing project docs (PRD, architecture, design system)
6. **`@db-migrate --status`** → Database schema and migration history
7. **`@docs-update`** → Ensure all docs are current

**Why orchestration?** Handoff needs data from multiple systems. This command acts as the "conductor" to gather everything in one go.

---

## 📦 What Gets Generated

The command creates a `/client-handoff/` directory with:

```
/client-handoff/
  ├── 00-HANDOFF-INDEX.md              # Master index (start here)
  ├── 01-PROJECT-OVERVIEW.md            # Executive summary
  ├── 02-ARCHITECTURE.md                # System architecture (from Step 2)
  ├── 03-ENVIRONMENT-SETUP.md           # Setup guide (replaces @onboard for clients)
  ├── 04-DATABASE-SCHEMA.md             # Schema docs + ER diagram
  ├── 05-API-REFERENCE.md               # API endpoints (from @api-docs-gen)
  ├── 06-DEPLOYMENT-RUNBOOK.md          # Deploy process step-by-step
  ├── 07-MONITORING-ALERTS.md           # Error tracking, performance monitoring
  ├── 08-SECURITY-CHECKLIST.md          # Security report (from @security-audit)
  ├── 09-PERFORMANCE-BASELINE.md        # Perf benchmarks (from @performance-check)
  ├── 10-TROUBLESHOOTING-GUIDE.md       # Common issues + solutions
  ├── 11-MAINTENANCE-SCHEDULE.md        # Monthly/quarterly tasks
  ├── 12-SCALING-ROADMAP.md             # When/how to scale
  ├── 13-ACCESS-CREDENTIALS.md          # Checklist of all accounts to transfer
  ├── 14-VIDEO-WALKTHROUGH-SCRIPT.md    # Script for Loom video (optional)
  ├── 15-SUPPORT-CONTACTS.md            # Your agency contact info
  └── _assets/                          # Diagrams, screenshots
```

### Optional Outputs

- **PDF Package:** Single-file PDF with all sections (`HANDOFF-PACKAGE.pdf`)
- **Video Script:** Ready-to-record Loom/video script with timestamps
- **Presentation Slides:** PowerPoint/Keynote outline for handoff meeting

---

## 🛠️ Implementation Phases

### Phase 1: Prerequisites & Validation
**Checklist:**
- [ ] Project has completed Steps 1-9 (or has equivalent docs)
- [ ] All environment variables documented
- [ ] Database migrations are up to date
- [ ] Tests are passing (run `@test-gen --coverage`)
- [ ] Security audit completed (run `@security-audit`)
- [ ] Performance benchmarks established (run `@performance-check`)

**Actions:**
1. Check for `/docs/specs/MASTER_PRD.md` (from Step 1)
2. Check for `/docs/architecture/ARCHITECTURE.md` (from Step 2)
3. Check for `/docs/technical/TECHNICAL-SPEC.md` (from Step 6)
4. If missing, warn user: "Run @step-[X] first to generate missing docs"

---

### Phase 2: Orchestrate Dependent Commands

**Run these commands in parallel (if not already done):**

```bash
# Security
@security-audit --focus=all --output=/tmp/security-report.md

# Performance
@performance-check --output=/tmp/performance-report.md

# API Docs (if applicable)
@api-docs-gen --output=/tmp/api-docs.md

# Test Coverage
@test-gen --coverage --output=/tmp/test-coverage.md

# Database Status
@db-migrate --status --output=/tmp/db-status.md
```

**Wait for completion** → Store results in temp files for aggregation.

---

### Phase 3: Data Collection & Analysis

**Scan Project Structure:**
1. Read package.json → Extract dependencies, scripts, version
2. Read .env.example → Extract required environment variables
3. Read Vercel/deployment config → Extract deployment settings
4. Scan `/app` directory → Identify routes and pages
5. Scan `/actions` directory → Identify server actions
6. Scan `/components` directory → Identify UI components
7. Scan `/db/schema` → Identify database tables

**Extract from Steps 1-9 Docs:**
- Step 1 (PRD) → Project goals, user personas, success metrics
- Step 2 (Architecture) → Tech stack, C4 diagrams, security
- Step 3 (UX) → User flows, wireframes
- Step 4 (Flow Tree) → Screen inventory, navigation flows
- Step 6 (Design System) → Colors, typography, components
- Step 8 (Technical Spec) → API endpoints, database schema

**Use MCP Tools for Research:**
- `@mcp_perplexity-ask` → Best practices for [specific tech stack] handoff
- `@mcp_context7` → Latest Next.js deployment docs
- `@mcp_supabase-mcp-server` → Supabase backup and restore guide

---

### Phase 4: Document Generation

**For each section (01-15), generate using this template logic:**

#### 01-PROJECT-OVERVIEW.md
```markdown
# Project Overview: [Project Name]

**Client:** [Client Name]
**Delivered:** [Date]
**Agency:** Sigma Software Solutions

## Executive Summary
[Extract from Step 1 PRD - Problem & Goal section]

## Key Features
[Extract from Step 1 PRD - Must-haves]

## Tech Stack
[Extract from Step 2 Architecture - Technology Choices]

## Success Metrics
[Extract from Step 1 PRD - Success Metrics]

## Project Team
- Project Lead: [Name]
- Lead Developer: [Name]
- Designer: [Name]

## Quick Links
- Production URL: [URL]
- Staging URL: [URL]
- GitHub Repository: [URL]
- Vercel Dashboard: [URL]
- Supabase Dashboard: [URL]
```

#### 02-ARCHITECTURE.md
```markdown
# System Architecture

[Copy from /docs/architecture/ARCHITECTURE.md]

## Additional Context for Maintenance

### Why We Chose This Architecture
[AI-generated explanation based on project requirements]

### Scalability Considerations
[Based on @performance-check results and project complexity]

### Known Limitations
[Based on technical debt audit or known constraints]
```

#### 03-ENVIRONMENT-SETUP.md
```markdown
# Environment Setup Guide

**Target Audience:** New developer joining the project

## Prerequisites
- Node.js [version from package.json]
- pnpm [version from package.json]
- Git
- Supabase CLI (if applicable)

## Step-by-Step Setup (5 minutes)

### 1. Clone Repository
\`\`\`bash
git clone [repo-url]
cd [project-name]
\`\`\`

### 2. Install Dependencies
\`\`\`bash
pnpm install
\`\`\`

### 3. Environment Variables
Copy `.env.example` to `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

**Required Variables:**
[Generate table from .env.example with descriptions]

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Supabase Dashboard → Settings |
| ... | ... | ... |

### 4. Database Setup
[Extract from @db-migrate --status]

\`\`\`bash
pnpm db:push
pnpm db:seed
\`\`\`

### 5. Start Development Server
\`\`\`bash
pnpm dev
\`\`\`

Visit: http://localhost:3000

## Troubleshooting
[Common setup issues and solutions]
```

#### 04-DATABASE-SCHEMA.md
```markdown
# Database Schema

[Generate from /db/schema/* files using Drizzle]

## Entity-Relationship Diagram
[Generate Mermaid ERD or reference existing diagram]

## Tables

### Table: users
[Auto-generated from schema with field descriptions]

## Migrations
[Extract from @db-migrate --status]

## Backup & Restore
[Research Supabase best practices via @mcp_supabase-mcp-server]
```

#### 05-API-REFERENCE.md
```markdown
# API Reference

[Copy from @api-docs-gen output]

## Authentication
[Describe auth flow from Step 6 Technical Spec]

## Rate Limiting
[Document if implemented]

## Error Codes
[Standard error response format]
```

#### 06-DEPLOYMENT-RUNBOOK.md
```markdown
# Deployment Runbook

## Deployment Architecture
- **Platform:** Vercel
- **Region:** [Auto-detect]
- **CI/CD:** GitHub Actions (or manual)

## Pre-Deployment Checklist
- [ ] All tests passing (`pnpm test`)
- [ ] Linter passing (`pnpm lint`)
- [ ] Type check passing (`pnpm tsc --noEmit`)
- [ ] Environment variables set in Vercel dashboard
- [ ] Database migrations applied
- [ ] Performance benchmarks met (see section 09)

## Deployment Steps

### Staging Deployment
\`\`\`bash
git push origin develop
\`\`\`
[Auto-deploys to staging via Vercel]

### Production Deployment
\`\`\`bash
git checkout main
git merge develop
git push origin main
\`\`\`
[Auto-deploys to production via Vercel]

## Rollback Process
[Document Vercel instant rollback]

## Post-Deployment Verification
- [ ] Visit production URL
- [ ] Check error tracking (Sentry/etc)
- [ ] Monitor performance (Vercel Analytics)
- [ ] Test critical user flows
```

#### 07-MONITORING-ALERTS.md
```markdown
# Monitoring & Alerts

## Error Tracking
[Document Sentry/error tracking setup]

## Performance Monitoring
[Document Vercel Analytics or alternative]

## Uptime Monitoring
[Document if applicable]

## Alert Channels
- Email: [email]
- Slack: [webhook]
- PagerDuty: [if applicable]

## Key Metrics to Watch
[Based on @performance-check baseline]
- Response time (p95): [X]ms
- Error rate: <1%
- Uptime: >99.9%
```

#### 08-SECURITY-CHECKLIST.md
```markdown
# Security Checklist

[Copy from @security-audit report]

## Security Posture Summary
- Security Score: [X]/100
- Critical Issues: [X]
- High Issues: [X]
- Medium Issues: [X]

## Access Control
- [ ] Admin users documented
- [ ] RLS policies verified
- [ ] API keys rotated
- [ ] Secrets stored securely (Vercel env vars)

## Regular Security Tasks
- [ ] Dependency updates (monthly)
- [ ] Security audit (quarterly)
- [ ] Access review (quarterly)
```

#### 09-PERFORMANCE-BASELINE.md
```markdown
# Performance Baseline

[Copy from @performance-check report]

## Benchmarks (as of [date])
- Homepage load time: [X]ms
- API response time (p95): [X]ms
- Lighthouse score: [X]/100
- Core Web Vitals: [Pass/Fail]

## Performance Budget
[Define acceptable ranges]

## Optimization Opportunities
[List potential improvements]
```

#### 10-TROUBLESHOOTING-GUIDE.md
```markdown
# Troubleshooting Guide

## Common Issues

### Issue: Build fails with "Module not found"
**Symptoms:** [Description]
**Cause:** [Explanation]
**Solution:** 
\`\`\`bash
[Commands to fix]
\`\`\`

### Issue: Database connection error
**Symptoms:** [Description]
**Cause:** [Explanation]
**Solution:** [Steps]

[Generate 10-15 common issues based on project complexity]

## Support Escalation
If issue not resolved:
1. Check error logs in Vercel
2. Check Supabase logs
3. Contact [Your Agency] at [email/slack]
```

#### 11-MAINTENANCE-SCHEDULE.md
```markdown
# Maintenance Schedule

## Monthly Tasks (1st of month)
- [ ] Review and update dependencies (`pnpm update`)
- [ ] Run security audit (`@security-audit`)
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Database backup verification

## Quarterly Tasks
- [ ] Major dependency updates (Next.js, React, etc.)
- [ ] Security penetration test
- [ ] Performance optimization review
- [ ] Database optimization (indexes, cleanup)
- [ ] Access control review

## Yearly Tasks
- [ ] SSL certificate renewal (auto-renews, verify)
- [ ] Domain renewal
- [ ] Infrastructure cost review
- [ ] Disaster recovery test
```

#### 12-SCALING-ROADMAP.md
```markdown
# Scaling Roadmap

**Current Capacity:** [Based on architecture]

## When to Scale

### Trigger 1: 1,000+ concurrent users
**Current capacity:** [X] users
**Action:** Upgrade Vercel plan to Pro
**Cost impact:** +$20/month per seat

### Trigger 2: Database >10GB
**Current size:** [X]GB
**Action:** Upgrade Supabase plan
**Cost impact:** [Research Supabase pricing]

### Trigger 3: API requests >10M/month
**Current:** [X]M/month
**Action:** Implement caching (Redis/Vercel KV)
**Cost impact:** +$10-50/month

[Generate 5-10 scaling triggers based on project]

## Horizontal Scaling Strategy
[Document how to add more resources]

## Vertical Scaling Strategy
[Document how to upgrade resources]
```

#### 13-ACCESS-CREDENTIALS.md
```markdown
# Access Credentials Checklist

**⚠️ IMPORTANT:** Transfer these credentials securely (1Password shared vault or similar).

## Services to Transfer

### Production Infrastructure
- [ ] **Vercel Account:** [email] → Transfer ownership to [client email]
- [ ] **Supabase Account:** [email] → Transfer ownership
- [ ] **Domain Registrar:** [registrar] → Transfer DNS or ownership
- [ ] **GitHub Repository:** [repo URL] → Add client as admin

### Third-Party Integrations
- [ ] **Stripe:** [account] → Transfer ownership (if applicable)
- [ ] **Resend/Email:** [account] → Transfer ownership
- [ ] **Error Tracking (Sentry):** [account] → Transfer ownership
- [ ] **Analytics:** [account] → Transfer ownership

### Environment Variables
[List all secrets that need new keys after transfer]

## Post-Transfer Verification
- [ ] Client can deploy to production
- [ ] Client can access database
- [ ] Client can view error logs
- [ ] All services functioning under new ownership
```

#### 14-VIDEO-WALKTHROUGH-SCRIPT.md
```markdown
# Video Walkthrough Script

**Duration:** ~30 minutes  
**Tool:** Loom or Zoom recording

## Recording Outline

### Part 1: Overview (5 min)
- **0:00-1:00** → Welcome, introduce project
- **1:00-2:00** → Show production URL, key features
- **2:00-3:00** → Show Vercel dashboard
- **3:00-4:00** → Show Supabase dashboard
- **4:00-5:00** → Show GitHub repository

### Part 2: Codebase Tour (10 min)
- **5:00-7:00** → Project structure overview
- **7:00-9:00** → Key files (database, API routes, components)
- **9:00-11:00** → Environment variables and config
- **11:00-13:00** → Development workflow
- **13:00-15:00** → Testing and quality checks

### Part 3: Deployment & Maintenance (10 min)
- **15:00-17:00** → How to deploy changes
- **17:00-19:00** → How to rollback
- **19:00-21:00** → Monitoring errors
- **21:00-23:00** → Database backups
- **23:00-25:00** → Monthly maintenance tasks

### Part 4: Troubleshooting & Support (5 min)
- **25:00-27:00** → Common issues + solutions
- **27:00-28:00** → When to contact support
- **28:00-30:00** → Next steps, Q&A info

## Recording Tips
- Record in 1080p
- Show your face (picture-in-picture)
- Speak slowly and clearly
- Pause between major sections
- Use zoom/highlight to emphasize important areas
```

#### 15-SUPPORT-CONTACTS.md
```markdown
# Support Contacts

## Agency Contact Information

**Sigma Software Solutions**
- Website: [agency website]
- Email: support@sigmasoftware.com
- Slack: [shared channel]
- Emergency: [phone]

## Support Tiers

### Tier 1: Documentation
First, check this handoff package.

### Tier 2: Email Support
Email support@sigmasoftware.com
**Response time:** Within 1 business day

### Tier 3: Dedicated Support (if applicable)
[If client purchased support package]
**Response time:** Within 4 hours

### Tier 4: Emergency
[Phone number] (after-hours emergencies only)

## What to Include in Support Request
1. Description of issue
2. Steps to reproduce
3. Error messages (screenshots)
4. When did it start?
5. Affected users/pages

## Scope of Support
**Included:**
- Bug fixes in existing functionality
- Security patches
- Performance issues
- Deployment issues

**Not Included (requires additional contract):**
- New feature development
- Design changes
- Third-party integration changes
- Database schema changes
```

---

### Phase 5: Asset Generation

**Generate supporting assets:**

1. **Architecture Diagrams:**
   - C4 Context diagram (if not in Step 2)
   - C4 Container diagram
   - Database ERD (from Drizzle schema)
   - Deployment diagram

2. **Screenshots:**
   - Admin dashboard
   - Key user flows
   - Error states
   - Mobile responsive views

3. **Code Examples:**
   - How to add a new API route
   - How to add a new database table
   - How to add a new UI component

---

### Phase 6: PDF Generation (Optional)

**If `--format=pdf` or `--format=both`:**

1. Use Markdown → PDF tool (e.g., `mdpdf` or Puppeteer)
2. Apply professional styling (cover page, headers, footers)
3. Add table of contents with page numbers
4. Include agency branding
5. Output: `/client-handoff/HANDOFF-PACKAGE.pdf`

---

### Phase 7: Final Packaging

**Create master index (00-HANDOFF-INDEX.md):**

```markdown
# Client Handoff Package
**Project:** [Project Name]  
**Client:** [Client Name]  
**Delivered:** [Date]  
**Agency:** Sigma Software Solutions

---

## 📖 How to Use This Package

This package contains everything you need to understand, maintain, and scale your application.

**Start here:**
1. Read [01-PROJECT-OVERVIEW.md](./01-PROJECT-OVERVIEW.md)
2. Set up your environment: [03-ENVIRONMENT-SETUP.md](./03-ENVIRONMENT-SETUP.md)
3. Watch the video walkthrough (link below)
4. Review deployment process: [06-DEPLOYMENT-RUNBOOK.md](./06-DEPLOYMENT-RUNBOOK.md)

---

## 📚 Table of Contents

1. [Project Overview](./01-PROJECT-OVERVIEW.md)
2. [Architecture](./02-ARCHITECTURE.md)
3. [Environment Setup](./03-ENVIRONMENT-SETUP.md)
4. [Database Schema](./04-DATABASE-SCHEMA.md)
5. [API Reference](./05-API-REFERENCE.md)
6. [Deployment Runbook](./06-DEPLOYMENT-RUNBOOK.md)
7. [Monitoring & Alerts](./07-MONITORING-ALERTS.md)
8. [Security Checklist](./08-SECURITY-CHECKLIST.md)
9. [Performance Baseline](./09-PERFORMANCE-BASELINE.md)
10. [Troubleshooting Guide](./10-TROUBLESHOOTING-GUIDE.md)
11. [Maintenance Schedule](./11-MAINTENANCE-SCHEDULE.md)
12. [Scaling Roadmap](./12-SCALING-ROADMAP.md)
13. [Access Credentials](./13-ACCESS-CREDENTIALS.md)
14. [Video Walkthrough Script](./14-VIDEO-WALKTHROUGH-SCRIPT.md)
15. [Support Contacts](./15-SUPPORT-CONTACTS.md)

---

## 🎥 Video Walkthrough

[Record a ~30 minute Loom video using script 14]

**Link:** [Insert Loom link after recording]

---

## ✅ Post-Handoff Checklist

- [ ] Client reviewed all documentation
- [ ] Client watched video walkthrough
- [ ] Access credentials transferred
- [ ] Client successfully deployed a change
- [ ] Support channels established
- [ ] Handoff meeting completed
- [ ] Client signed acceptance document

---

## 📞 Questions?

Contact us at support@sigmasoftware.com
```

**Compress package:**
```bash
cd /client-handoff
tar -czf HANDOFF-PACKAGE-[DATE].tar.gz *
```

---

### Phase 8: Validation & Output

**Run final validation:**
- [ ] All 15 sections generated
- [ ] No broken links between docs
- [ ] All code examples tested
- [ ] All environment variables documented
- [ ] PDF generated (if requested)
- [ ] Assets included

**Output summary:**
```
✅ Client Handoff Package Generated

📦 Location: /client-handoff/
📄 Documents: 15 sections
📊 Total Size: [X]MB
🎥 Video Script: Ready to record
💾 Compressed: HANDOFF-PACKAGE-[DATE].tar.gz

Next Steps:
1. Review package for accuracy
2. Record video walkthrough (use script 14)
3. Schedule handoff meeting with client
4. Transfer access credentials (section 13)
5. Archive this package in agency records
```

---

## 🎯 Success Metrics

**Package Quality Indicators:**
- All 15 sections present ✅
- No missing environment variables ✅
- All diagrams included ✅
- Security audit <90 days old ✅
- Performance baseline established ✅

**Client Success Indicators (Post-Handoff):**
- Client successfully deploys within 7 days
- <5 support tickets in first 30 days
- Client satisfaction >4/5 stars
- Zero "how do I...?" questions answered with "check docs"

---

## 🔄 Maintenance

**This command should be run:**
- **Initial:** Before project handoff
- **Updates:** When major changes occur (new features, architecture changes)
- **Refresh:** Quarterly to keep docs current

**Command to refresh docs:**
```bash
@client-handoff --refresh
```

---

## 💡 Pro Tips

1. **Customize per client:** Use `--client-name` to personalize
2. **Include in proposals:** Mention this package in sales to differentiate
3. **Version control:** Keep handoff packages in `/client-handoff/v1/`, `/v2/`, etc.
4. **Feedback loop:** Ask clients what's missing, improve template
5. **Agency brand:** Add your logo, colors, contact info throughout

---

## 🛠️ Technical Implementation Notes

**For Cursor AI implementing this command:**

1. **Read existing docs first** (Steps 1-9)
2. **Invoke dependent commands** (@security-audit, @performance-check, etc.)
3. **Use MCP tools** for research gaps
4. **Generate templates** with placeholders
5. **Fill placeholders** with real project data
6. **Validate all links** and references
7. **Create directory structure** atomically
8. **Output summary** with next steps

**Error Handling:**
- If Step X docs missing → Warn user, continue with what's available
- If dependent command fails → Include placeholder, note in index
- If PDF generation fails → Continue with markdown, warn user

**Performance:**
- Parallelize command invocations where possible
- Cache command outputs (don't re-run if recent)
- Stream output to user (show progress)

---

$END$

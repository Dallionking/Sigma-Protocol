---
name: maintenance-plan
description: "Generate comprehensive long-term maintenance and support documentation for project sustainability"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# maintenance-plan

**Source:** Sigma Protocol ops module
**Version:** 2.0.0

---


# @maintenance-plan

**Generate comprehensive long-term maintenance and support documentation**

## 🎯 Purpose

Automate the creation of proactive maintenance plans that keep applications healthy, secure, and performant over time. Research shows that **agencies without clear maintenance plans see 50% higher client churn** and face unexpected support burdens. This command creates structured, tier-appropriate maintenance documentation.

**For agencies:** Reduces support burden, increases client retention, creates recurring revenue opportunities.

---

## 📋 Command Usage

```bash
@maintenance-plan
@maintenance-plan --tier=basic
@maintenance-plan --tier=premium --include-sla
@maintenance-plan --project-name="Client Project X"
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--tier` | Support tier: `basic`, `standard`, `premium`, `enterprise` | Auto-detect from complexity |
| `--include-sla` | Include detailed SLA definitions | `true` |
| `--project-name` | Project name for personalized docs | Auto-detect |

---

## 📁 File Management (CRITICAL)

**File Strategy**: `replace` - Always update single maintenance plan

**Output**: `/docs/maintenance/MAINTENANCE-PLAN.md`

**Manifest**: `updateManifest('@maintenance-plan', '/docs/maintenance/MAINTENANCE-PLAN.md', 'replace')`

---

## 🔄 Command Orchestration (Invokes Other Commands)

This command orchestrates multiple data sources:

1. **`@estimation-engine --complexity-only`** → Determine maintenance tier based on project complexity
2. **`@tech-debt-audit --summary`** → Current technical health baseline
3. **`@security-audit --checklist`** → Security maintenance requirements
4. **`@performance-check --baseline`** → Performance monitoring needs
5. **Project files** → Extract tech stack, dependencies, infrastructure

**Why orchestration?** Maintenance plans must be tailored to project complexity, tech stack, and current health.

---

## 📦 What Gets Generated

### Primary Output: Maintenance Plan

```
/docs/maintenance/
  ├── MAINTENANCE-PLAN.md                    # Main plan (start here)
  ├── MONTHLY-CHECKLIST.md                   # Monthly tasks
  ├── QUARTERLY-CHECKLIST.md                 # Quarterly tasks
  ├── YEARLY-CHECKLIST.md                    # Yearly tasks
  ├── MONITORING-SETUP.md                    # Monitoring & alerting guide
  ├── BACKUP-RECOVERY.md                     # Backup & disaster recovery
  ├── SCALING-GUIDE.md                       # When & how to scale
  ├── SUPPORT-SLA.md                         # Service level agreements
  └── _templates/
      ├── bug-triage-template.md
      ├── feature-request-template.md
      └── incident-report-template.md
```

### Report Structure (MAINTENANCE-PLAN.md)

```markdown
# Maintenance & Support Plan
**Project:** [Project Name]
**Generated:** [Date]
**Tier:** [Basic/Standard/Premium/Enterprise]
**Valid From:** [Date] to [Date + 1 year]

---

## 📊 Executive Summary

**Support Tier:** [Tier]
**Estimated Monthly Effort:** [X] hours
**Recommended Team:** [X] developers (part-time)
**Key Focus Areas:** [Security, Performance, Dependencies, ...]

**Maintenance Goals:**
- Maintain 99.9% uptime
- Zero critical security vulnerabilities
- <500ms average response time
- Monthly dependency updates
- Quarterly performance optimization

---

## 🔄 Maintenance Schedule

### Monthly Tasks (1st Monday, ~[X] hours)
- [ ] Review error logs and crash reports
- [ ] Update dependencies (patch versions)
- [ ] Security audit (automated scan)
- [ ] Performance monitoring review
- [ ] Database optimization (indexes, cleanup)
- [ ] Backup verification test
- [ ] SSL certificate check
- [ ] Uptime report review

### Quarterly Tasks (~[X] hours)
- [ ] Major dependency updates (minor versions)
- [ ] Manual security review
- [ ] Load testing and capacity planning
- [ ] Code quality audit (`@tech-debt-audit`)
- [ ] Database backup & restore test
- [ ] Access control review
- [ ] Documentation updates
- [ ] Infrastructure cost review

### Yearly Tasks (~[X] hours)
- [ ] Major framework upgrades (e.g., Next.js major version)
- [ ] Full security penetration test
- [ ] Disaster recovery drill
- [ ] Architecture review and refactoring
- [ ] Tech stack evaluation (stay current)
- [ ] Long-term roadmap planning
- [ ] Client satisfaction survey

---

## 🔍 Monitoring & Alerting

### Error Tracking
**Tool:** [Sentry / Datadog / New Relic]
**Configuration:**
- Alert on: Error rate >1% for 5 minutes
- Alert on: Any critical error
- Alert on: 500 errors (immediate)
- Weekly digest: All errors grouped by type

**Response Times:**
- Critical errors: <1 hour
- High-priority errors: <4 hours
- Medium-priority: <24 hours
- Low-priority: Next maintenance window

### Performance Monitoring
**Tool:** [Vercel Analytics / New Relic / Datadog]
**Thresholds:**
- P95 response time: <500ms (alert if >1000ms)
- Homepage load time: <2s (alert if >4s)
- API endpoint timeout: 10s
- Core Web Vitals: All "Good" (green)

**Weekly Report:**
- Performance trends
- Slowest endpoints
- Resource utilization

### Uptime Monitoring
**Tool:** [UptimeRobot / Pingdom / StatusCake]
**Configuration:**
- Check frequency: Every 5 minutes
- Alert channels: Email + Slack
- Status page: [URL]

**SLA Target:** 99.9% uptime (43 minutes downtime/month allowed)

### Infrastructure Monitoring
**Tool:** [Vercel Dashboard / AWS CloudWatch / Datadog]
**Key Metrics:**
- Memory usage: Alert if >80%
- CPU usage: Alert if >70% sustained
- Disk usage: Alert if >85%
- Database connections: Alert if >90% pool size
- API rate limits: Alert if >80%

---

## 💾 Backup & Disaster Recovery

### Database Backups
**Frequency:** Daily automated backups (Supabase default)
**Retention:** 30 days for daily, 12 months for monthly
**Location:** [Supabase encrypted storage / AWS S3]

**Backup Verification:**
- Monthly: Restore to staging environment, verify data integrity
- Quarterly: Full disaster recovery drill

**RTO (Recovery Time Objective):** 4 hours
**RPO (Recovery Point Objective):** 24 hours (daily backups)

### Code & Configuration Backups
**Version Control:** GitHub (primary), GitLab (mirror recommended)
**Branch Strategy:** main (production), develop (staging), feature/* (dev)
**Tag Strategy:** Semantic versioning (v1.2.3) for releases

**Environment Variables:**
- Stored in: Vercel encrypted env vars
- Backup: 1Password shared vault + docs/ENVIRONMENT_VARIABLES.md
- Rotation: Quarterly for all secrets

### Asset Backups
**Media Files:** [Supabase Storage / AWS S3 / Cloudinary]
**Backup Frequency:** Weekly incremental, monthly full
**Retention:** 90 days

### Disaster Recovery Scenarios

#### Scenario 1: Database Corruption
1. Identify corruption scope (use logs)
2. Restore from most recent clean backup
3. Replay transactions if possible
4. Validate data integrity
5. Document incident

**Estimated Downtime:** 2-4 hours

#### Scenario 2: Complete Infrastructure Failure
1. Trigger DR plan (notify team)
2. Spin up infrastructure from IaC templates
3. Restore database from backup
4. Deploy latest production code
5. Update DNS if needed
6. Comprehensive testing

**Estimated Downtime:** 6-12 hours

#### Scenario 3: Security Breach
1. Immediately isolate affected systems
2. Rotate all credentials
3. Restore from pre-breach backup
4. Conduct security audit
5. Patch vulnerabilities
6. Resume operations
7. Notify affected users (if required)

**Estimated Downtime:** 12-24 hours

---

## 📈 Scaling Guide

**Current Capacity:**
- Concurrent users: [X]
- Database size: [X]GB
- API requests: [X]M/month
- Storage: [X]GB

### Scaling Triggers

#### Trigger 1: Database >80% Capacity
**Current:** [X]GB of [X]GB
**Action:** Upgrade Supabase plan OR implement archiving
**Cost Impact:** +$[X]/month
**Timeline:** 1 week

#### Trigger 2: Response Time >1s (P95)
**Current:** [X]ms
**Action:** 
1. Analyze slow queries (use performance monitoring)
2. Add database indexes
3. Implement caching (Redis/Vercel KV)
4. Optimize heavy API endpoints
**Cost Impact:** +$10-50/month (caching)
**Timeline:** 2 weeks

#### Trigger 3: >1,000 Concurrent Users
**Current:** ~[X] users
**Action:** Upgrade Vercel plan from Hobby to Pro
**Cost Impact:** +$20/month
**Timeline:** Immediate (no downtime)

#### Trigger 4: API Rate Limits Hit
**Current:** [X]% of limit
**Action:** 
1. Implement request batching
2. Add caching layer
3. Upgrade third-party API plans
**Cost Impact:** Variable
**Timeline:** 1-2 weeks

#### Trigger 5: Storage >90% Used
**Current:** [X]GB
**Action:** 
1. Implement media compression
2. Move old assets to cold storage
3. Upgrade storage plan
**Cost Impact:** +$[X]/month
**Timeline:** 1 week

### Horizontal Scaling Strategy
[If applicable - e.g., adding more serverless functions, read replicas]

### Vertical Scaling Strategy
[If applicable - e.g., upgrading instance sizes]

---

## 🔐 Security Maintenance

### Monthly Security Tasks
- [ ] Run automated security scan (`@security-audit`)
- [ ] Review dependency vulnerabilities
- [ ] Check for new CVEs affecting tech stack
- [ ] Review access logs for suspicious activity
- [ ] Verify RLS policies still correct
- [ ] Test authentication flows

### Quarterly Security Tasks
- [ ] Manual code security review
- [ ] Penetration testing (basic)
- [ ] Access control audit (who has admin?)
- [ ] API key rotation
- [ ] Review third-party integrations
- [ ] Update security documentation

### Yearly Security Tasks
- [ ] Full penetration test (hire external firm)
- [ ] Compliance audit (GDPR, CCPA, etc.)
- [ ] Security training for team
- [ ] Disaster recovery drill (security breach scenario)

### Security Incident Response
**Contact:** [Security lead email/phone]
**Escalation Path:** Dev → Lead → CTO → Client

**Response Times:**
- Critical (data breach): <1 hour
- High (vulnerability): <4 hours
- Medium: <24 hours
- Low: Next maintenance window

---

## 📦 Dependency Management

### Update Strategy
**Patch versions (1.2.x):** Monthly, automated via `@dependency-update`
**Minor versions (1.x.0):** Quarterly, manual review
**Major versions (x.0.0):** Yearly or as needed, full testing

### Critical Dependencies
[Auto-detected from package.json]

| Dependency | Current | Latest | Update Priority |
|------------|---------|--------|-----------------|
| next | 14.2.5 | 14.2.5 | ✅ Current |
| react | 18.3.1 | 18.3.1 | ✅ Current |
| ... | ... | ... | ... |

### Deprecated Dependencies
[List any deprecated packages that need migration]

**Action Plan:**
1. [Migration task 1]
2. [Migration task 2]

---

## 🐛 Bug Triage & Support Process

### Bug Priority Levels

#### P0: Critical (Production Down)
**Examples:** Site unreachable, data loss, security breach
**Response Time:** <1 hour
**Resolution Time:** <4 hours
**Who:** All hands on deck

#### P1: High (Core Feature Broken)
**Examples:** Auth failing, payments not working, critical user flow blocked
**Response Time:** <4 hours
**Resolution Time:** <24 hours
**Who:** Primary developer

#### P2: Medium (Feature Impaired)
**Examples:** UI bug, slow performance, minor feature not working
**Response Time:** <24 hours
**Resolution Time:** <1 week
**Who:** On-call developer

#### P3: Low (Cosmetic)
**Examples:** Typo, minor UI inconsistency, edge case bug
**Response Time:** <72 hours
**Resolution Time:** Next release
**Who:** Backlog

### Bug Workflow
1. **Report** → Client submits via [support email / portal / Slack]
2. **Triage** → Assign priority (P0-P3)
3. **Assign** → Developer assigned based on priority
4. **Fix** → Code fix + tests
5. **Deploy** → Staging → Production
6. **Verify** → Client confirms fix
7. **Document** → Update changelog

### Support Channels

#### Email Support
**Address:** support@[agency].com
**Hours:** Business hours (9am-5pm EST)
**Response Time:** <24 hours

#### Slack Channel (Premium/Enterprise)
**Channel:** #client-[project]-support
**Hours:** Business hours
**Response Time:** <4 hours

#### Emergency Hotline (Enterprise Only)
**Phone:** [Number]
**Hours:** 24/7
**Response Time:** <1 hour

---

## 🎫 Feature Request Process

### Submission
- Client submits via [support portal / email / Slack]
- Use feature request template (see `/docs/maintenance/_templates/`)

### Evaluation Criteria
1. **Value:** How many users benefit?
2. **Effort:** How many hours to build?
3. **Complexity:** Does it increase tech debt?
4. **Urgency:** Does it block key workflows?
5. **ROI:** Value / Effort ratio

### Approval Process
1. Developer reviews feasibility
2. Estimate effort (use `@estimation-engine`)
3. Present to client with cost/timeline
4. Client approves or defers
5. Schedule in roadmap

### Feature Development
- All features go through full SDLC (design, dev, test, deploy)
- Changes documented in changelog
- Client demos scheduled for major features

---

## 📊 Service Level Agreements (SLA)

### Tier: [Basic/Standard/Premium/Enterprise]

#### Uptime SLA
**Target:** 99.9% (43 minutes downtime/month)
**Measurement:** Monthly average from uptime monitoring
**Credits:** [If applicable - e.g., 5% monthly fee credit if <99.9%]

#### Response Time SLA
| Priority | Response Time | Resolution Time |
|----------|--------------|-----------------|
| P0 (Critical) | <1 hour | <4 hours |
| P1 (High) | <4 hours | <24 hours |
| P2 (Medium) | <24 hours | <1 week |
| P3 (Low) | <72 hours | Next release |

#### Performance SLA
- P95 API response time: <500ms
- Homepage load time: <2s
- Core Web Vitals: All "Good"

**Measurement:** Monthly average from performance monitoring

#### Support Hours
**Basic:** Email only, business hours
**Standard:** Email + Slack, business hours
**Premium:** Email + Slack + video calls, extended hours
**Enterprise:** 24/7 emergency hotline

### Exclusions (Not Covered by SLA)
- Downtime due to client-requested changes
- Third-party service failures (outside our control)
- Scheduled maintenance windows (with 7-day notice)
- Force majeure events
- Issues caused by client modifications

---

## 💰 Maintenance Pricing

### Monthly Retainer Options

#### Basic Tier
**Cost:** $[X]/month
**Includes:**
- Monthly maintenance tasks
- Email support (business hours)
- Dependency updates
- Basic monitoring
- Monthly report

**Best For:** Small projects, low complexity

#### Standard Tier
**Cost:** $[X]/month
**Includes:**
- All Basic features
- Quarterly security audits
- Performance optimization
- Slack support
- Technical debt reduction (4h/month)

**Best For:** Medium projects, moderate complexity

#### Premium Tier
**Cost:** $[X]/month
**Includes:**
- All Standard features
- Priority support (4h response)
- Dedicated developer (8h/month)
- Custom feature development (16h/month)
- Video calls

**Best For:** Large projects, high complexity

#### Enterprise Tier
**Cost:** $[X]/month
**Includes:**
- All Premium features
- 24/7 emergency support
- Dedicated team
- Unlimited small changes
- SLA guarantees with credits

**Best For:** Mission-critical applications

### À la Carte Services
- Emergency hotfix: $[X]/hour (2h minimum)
- Feature development: $[X]/hour
- Performance optimization: $[X] (project-based)
- Security audit: $[X] (one-time)
- Database optimization: $[X] (quarterly)

---

## 📈 Monthly Reporting

**Delivered:** 5th business day of each month
**Format:** PDF + email summary

### Report Contents
1. **Uptime Summary**
   - Uptime percentage
   - Incidents (if any)
   - Resolution times

2. **Performance Metrics**
   - Average response times
   - Slowest endpoints
   - Core Web Vitals scores

3. **Error Summary**
   - Total errors
   - Critical errors
   - Error trends

4. **Security Status**
   - Vulnerabilities found
   - Vulnerabilities fixed
   - Dependencies updated

5. **Work Completed**
   - Maintenance tasks performed
   - Bugs fixed
   - Features added (if any)
   - Hours spent

6. **Recommendations**
   - Optimization opportunities
   - Scaling needs
   - Security improvements

---

## 🔄 Plan Review & Updates

**Review Frequency:** Quarterly
**Next Review:** [Date + 3 months]

**Review Checklist:**
- [ ] Is current tier still appropriate?
- [ ] Are SLA targets being met?
- [ ] Does tech stack need updates?
- [ ] Are new monitoring tools needed?
- [ ] Have requirements changed?
- [ ] Is pricing still aligned with effort?

**Plan Updates:**
This plan is a living document. Updates triggered by:
- Major architecture changes
- Significant scope changes
- Client feedback
- New technology adoption
- Security requirements changes

---

## 📞 Contacts & Escalation

### Primary Contacts
**Developer:** [Name, email, phone]
**Project Manager:** [Name, email, phone]
**Emergency:** [Phone number]

### Escalation Path
1. **Level 1:** Primary developer
2. **Level 2:** Lead developer
3. **Level 3:** CTO / Technical Director
4. **Level 4:** Agency Principal

**Escalation Triggers:**
- Issue unresolved after 2x resolution time SLA
- Client dissatisfaction
- Recurring issues (same bug >3 times)
- Security incidents

---

## 🛠️ Tools & Access

### Required Access
- [ ] Vercel dashboard (deployment)
- [ ] Supabase dashboard (database)
- [ ] GitHub repository (code)
- [ ] Error tracking (Sentry/etc)
- [ ] Monitoring tools
- [ ] DNS management
- [ ] Domain registrar

### Credentials Management
**Storage:** 1Password shared vault
**Rotation Schedule:** Quarterly
**Access Audit:** Monthly

---

## 📚 Documentation Maintenance

### Documentation Checklist
- [ ] Architecture diagrams current
- [ ] API docs up to date
- [ ] Environment variables documented
- [ ] Deployment runbook accurate
- [ ] Troubleshooting guide expanded
- [ ] Changelog maintained

**Update Trigger:** Any production deployment

**Tools:**
- Use `@client-handoff --refresh` to regenerate docs quarterly
- Use `@api-docs-gen` to auto-update API docs

---

## ✅ Success Metrics

**Maintenance Plan Success Indicators:**
- Zero unplanned downtime
- <5 support tickets/month
- All dependencies <30 days old
- Security scan score >90/100
- Client satisfaction >4/5 stars
- Maintenance time within budget (±10%)

**Monthly KPIs:**
Track these metrics in monthly reports
- Uptime %
- Average response time
- Error rate
- Security vulnerabilities
- Dependencies updated
- Support tickets resolved
- Client satisfaction score

---

## 💡 Pro Tips

1. **Set expectations early** - Share this plan during handoff
2. **Automate everything** - Use `@dependency-update`, `@security-audit` regularly
3. **Communicate proactively** - Send monthly reports even if nothing happened
4. **Document everything** - Future developers will thank you
5. **Test backups** - Monthly verification prevents disaster recovery failures
6. **Budget buffer** - Always include 20% buffer for unexpected issues
7. **Client education** - Teach clients how to submit good bug reports

---

## 🔗 Related Commands

- `@client-handoff` → Initial handoff documentation
- `@tech-debt-audit` → Quarterly code health checks
- `@security-audit` → Monthly security scanning
- `@performance-check` → Performance baseline monitoring
- `@dependency-update` → Automated dependency updates

---

**Plan Valid Until:** [Date + 1 year]
**Next Review Date:** [Date + 3 months]

$END$
```

---

## 🛠️ Implementation Phases

### Phase 1: Prerequisites & Data Collection

**Gather project information:**
- Read `package.json` → Extract dependencies, tech stack
- Read `.env.example` → Identify infrastructure components
- Read `/docs/architecture/ARCHITECTURE.md` → Understand system design
- Check Vercel/deployment config → Hosting details
- Check database schema → Data complexity

**Invoke dependent commands:**
```bash
# Get project complexity (determines maintenance tier)
@estimation-engine --complexity-only --input=. --output=/tmp/complexity.json

# Get current technical health
@tech-debt-audit --summary --output=/tmp/debt-summary.json

# Get security baseline
@security-audit --checklist --output=/tmp/security-checklist.json

# Get performance baseline
@performance-check --baseline --output=/tmp/performance-baseline.json
```

---

### Phase 2: Determine Maintenance Tier

**Auto-select tier based on complexity:**
```typescript
function determineMaintenanceTier(complexityScore: number, techStack: string[]): 'basic' | 'standard' | 'premium' | 'enterprise' {
  // Enterprise: High complexity + critical infrastructure
  if (complexityScore > 75 || techStack.includes('microservices')) {
    return 'enterprise';
  }
  
  // Premium: Medium-high complexity
  if (complexityScore > 50) {
    return 'premium';
  }
  
  // Standard: Medium complexity
  if (complexityScore > 25) {
    return 'standard';
  }
  
  // Basic: Low complexity
  return 'basic';
}
```

**Tier characteristics:**
| Tier | Complexity | Monthly Hours | Recommended For |
|------|-----------|---------------|-----------------|
| Basic | 0-25 | 4-8h | Simple CRUD apps, low traffic |
| Standard | 26-50 | 8-16h | Moderate features, integrations |
| Premium | 51-75 | 16-32h | Complex apps, high traffic |
| Enterprise | 76-100 | 32+ h | Mission-critical, microservices |

---

### Phase 3: Generate Maintenance Schedule

**Calculate effort by tier:**
```typescript
interface MaintenanceEffort {
  monthlyHours: number;
  quarterlyHours: number;
  yearlyHours: number;
  tasks: {
    monthly: string[];
    quarterly: string[];
    yearly: string[];
  };
}

function calculateMaintenanceEffort(tier: string, techStack: TechStack): MaintenanceEffort {
  const baseHours = {
    basic: 6,
    standard: 12,
    premium: 24,
    enterprise: 40
  }[tier];
  
  // Adjust for tech stack complexity
  let multiplier = 1.0;
  if (techStack.hasDatabase) multiplier += 0.2;
  if (techStack.hasRealtime) multiplier += 0.3;
  if (techStack.integrationCount > 3) multiplier += 0.2;
  if (techStack.hasCaching) multiplier += 0.1;
  
  return {
    monthlyHours: Math.round(baseHours * multiplier),
    quarterlyHours: Math.round(baseHours * multiplier * 2),
    yearlyHours: Math.round(baseHours * multiplier * 4),
    tasks: generateTaskLists(tier, techStack)
  };
}
```

---

### Phase 4: Monitoring & Alerting Configuration

**Generate monitoring recommendations based on tech stack:**

```typescript
function generateMonitoringPlan(techStack: TechStack): MonitoringPlan {
  const plan: MonitoringPlan = {
    errorTracking: null,
    performance: null,
    uptime: null,
    infrastructure: null
  };
  
  // Error tracking (all projects)
  plan.errorTracking = {
    tool: 'Sentry',
    config: {
      alertOnErrorRate: '>1% for 5 minutes',
      alertOnCriticalError: 'immediate',
      weeklyDigest: true
    }
  };
  
  // Performance monitoring
  if (techStack.framework === 'Next.js') {
    plan.performance = {
      tool: 'Vercel Analytics',
      config: {
        coreWebVitals: true,
        p95ResponseTime: '<500ms',
        alertThreshold: '>1000ms'
      }
    };
  }
  
  // Uptime monitoring
  plan.uptime = {
    tool: 'UptimeRobot',
    config: {
      checkInterval: '5 minutes',
      alertChannels: ['email', 'slack'],
      slaTarget: '99.9%'
    }
  };
  
  // Infrastructure monitoring
  if (techStack.infrastructure === 'Vercel') {
    plan.infrastructure = {
      tool: 'Vercel Dashboard',
      metrics: ['memory', 'cpu', 'function_duration']
    };
  }
  
  return plan;
}
```

---

### Phase 5: Backup & DR Plan Generation

**Create backup strategy based on data requirements:**

```typescript
function generateBackupPlan(database: string, storageType: string): BackupPlan {
  let plan: BackupPlan;
  
  // Database backups
  if (database === 'Supabase') {
    plan = {
      database: {
        frequency: 'Daily (automated)',
        retention: '30 days daily, 12 months monthly',
        location: 'Supabase encrypted storage',
        rto: '4 hours',
        rpo: '24 hours',
        verification: 'Monthly restore to staging'
      },
      media: storageType === 'Supabase Storage' ? {
        frequency: 'Weekly incremental, monthly full',
        retention: '90 days',
        location: 'Supabase Storage',
        verification: 'Monthly spot check'
      } : null,
      code: {
        versionControl: 'GitHub',
        mirroring: 'Recommended: GitLab mirror',
        tagStrategy: 'Semantic versioning for releases'
      },
      disasterRecovery: [
        generateDRScenario('Database corruption'),
        generateDRScenario('Infrastructure failure'),
        generateDRScenario('Security breach')
      ]
    };
  }
  
  return plan;
}
```

---

### Phase 6: Scaling Triggers & Strategy

**Identify scaling triggers based on current capacity:**

```typescript
function generateScalingGuide(currentMetrics: Metrics, techStack: TechStack): ScalingGuide {
  const triggers: ScalingTrigger[] = [];
  
  // Database scaling
  if (currentMetrics.databaseSize > currentMetrics.databaseLimit * 0.8) {
    triggers.push({
      name: 'Database >80% capacity',
      current: `${currentMetrics.databaseSize}GB of ${currentMetrics.databaseLimit}GB`,
      action: 'Upgrade Supabase plan OR implement archiving',
      costImpact: calculateUpgradeCost('supabase', currentMetrics.databaseLimit),
      timeline: '1 week'
    });
  }
  
  // Performance scaling
  if (currentMetrics.p95ResponseTime > 800) {
    triggers.push({
      name: 'Response time >800ms',
      current: `${currentMetrics.p95ResponseTime}ms`,
      action: 'Add caching layer (Redis/Vercel KV)',
      costImpact: '$10-50/month',
      timeline: '2 weeks'
    });
  }
  
  // Traffic scaling
  const concurrentUserCapacity = estimateCapacity(techStack);
  triggers.push({
    name: `>${concurrentUserCapacity * 0.8} concurrent users`,
    current: `~${currentMetrics.avgConcurrentUsers} users`,
    action: 'Upgrade Vercel plan to Pro',
    costImpact: '+$20/month',
    timeline: 'Immediate'
  });
  
  return {
    currentCapacity: currentMetrics,
    triggers: triggers,
    horizontalScaling: generateHorizontalStrategy(techStack),
    verticalScaling: generateVerticalStrategy(techStack)
  };
}
```

---

### Phase 7: SLA Definition

**Generate tier-appropriate SLAs:**

```typescript
interface SLA {
  uptime: {
    target: string;
    measurement: string;
    credits?: string;
  };
  responseTime: {
    p0: string;
    p1: string;
    p2: string;
    p3: string;
  };
  performance: {
    apiResponseTime: string;
    pageLoadTime: string;
    coreWebVitals: string;
  };
  supportHours: string;
  exclusions: string[];
}

function generateSLA(tier: string): SLA {
  const slas = {
    basic: {
      uptime: { target: '99%', measurement: 'Monthly' },
      responseTime: { p0: '<4h', p1: '<8h', p2: '<48h', p3: 'Next release' },
      supportHours: 'Email only, business hours'
    },
    standard: {
      uptime: { target: '99.5%', measurement: 'Monthly' },
      responseTime: { p0: '<2h', p1: '<8h', p2: '<24h', p3: '<72h' },
      supportHours: 'Email + Slack, business hours'
    },
    premium: {
      uptime: { target: '99.9%', measurement: 'Monthly', credits: '5% monthly fee if <99.9%' },
      responseTime: { p0: '<1h', p1: '<4h', p2: '<24h', p3: '<72h' },
      supportHours: 'Email + Slack + video, extended hours'
    },
    enterprise: {
      uptime: { target: '99.95%', measurement: 'Monthly', credits: '10% monthly fee if <99.95%' },
      responseTime: { p0: '<1h', p1: '<4h', p2: '<24h', p3: '<72h' },
      supportHours: '24/7 emergency hotline'
    }
  };
  
  return {
    ...slas[tier],
    performance: {
      apiResponseTime: '<500ms P95',
      pageLoadTime: '<2s',
      coreWebVitals: 'All "Good"'
    },
    exclusions: [
      'Client-requested changes',
      'Third-party service failures',
      'Scheduled maintenance (7-day notice)',
      'Force majeure events'
    ]
  };
}
```

---

### Phase 8: Pricing Calculation

**Calculate monthly retainer based on tier + effort:**

```typescript
function calculateMaintenancePricing(
  tier: string,
  monthlyHours: number,
  hourlyRate: number = 150
): PricingOptions {
  const basePrice = monthlyHours * hourlyRate;
  
  // Add support overhead (20% for premium/enterprise)
  const supportOverhead = ['premium', 'enterprise'].includes(tier) ? 1.2 : 1.0;
  
  const monthlyRetainer = Math.round(basePrice * supportOverhead);
  
  return {
    tier,
    monthlyRetainer,
    includes: getIncludedServices(tier),
    alaCarte: {
      emergencyHotfix: `$${hourlyRate * 1.5}/hour (2h minimum)`,
      featureDevelopment: `$${hourlyRate}/hour`,
      securityAudit: '$2,500 (one-time)',
      performanceOptimization: '$3,500 (project-based)'
    }
  };
}
```

---

### Phase 9: Report Generation & Output

**Generate all maintenance documents:**

```typescript
async function generateMaintenancePlan(projectData: ProjectData): Promise<void> {
  const tier = determineMaintenanceTier(projectData.complexityScore, projectData.techStack);
  const effort = calculateMaintenanceEffort(tier, projectData.techStack);
  const monitoring = generateMonitoringPlan(projectData.techStack);
  const backup = generateBackupPlan(projectData.database, projectData.storage);
  const scaling = generateScalingGuide(projectData.currentMetrics, projectData.techStack);
  const sla = generateSLA(tier);
  const pricing = calculateMaintenancePricing(tier, effort.monthlyHours);
  
  // Generate main plan
  await writeFile('/docs/maintenance/MAINTENANCE-PLAN.md', 
    renderMainPlanTemplate({
      projectName: projectData.name,
      tier,
      effort,
      monitoring,
      backup,
      scaling,
      sla,
      pricing
    })
  );
  
  // Generate supporting documents
  await writeFile('/docs/maintenance/MONTHLY-CHECKLIST.md', renderMonthlyChecklist(tier, effort.tasks.monthly));
  await writeFile('/docs/maintenance/QUARTERLY-CHECKLIST.md', renderQuarterlyChecklist(tier, effort.tasks.quarterly));
  await writeFile('/docs/maintenance/YEARLY-CHECKLIST.md', renderYearlyChecklist(tier, effort.tasks.yearly));
  await writeFile('/docs/maintenance/MONITORING-SETUP.md', renderMonitoringSetup(monitoring));
  await writeFile('/docs/maintenance/BACKUP-RECOVERY.md', renderBackupPlan(backup));
  await writeFile('/docs/maintenance/SCALING-GUIDE.md', renderScalingGuide(scaling));
  await writeFile('/docs/maintenance/SUPPORT-SLA.md', renderSLA(sla));
  
  // Generate templates
  await writeFile('/docs/maintenance/_templates/bug-triage-template.md', BUG_TRIAGE_TEMPLATE);
  await writeFile('/docs/maintenance/_templates/feature-request-template.md', FEATURE_REQUEST_TEMPLATE);
  await writeFile('/docs/maintenance/_templates/incident-report-template.md', INCIDENT_REPORT_TEMPLATE);
}
```

---

### Phase 10: Validation & Output Summary

**Final validation:**
- [ ] Maintenance tier appropriate for complexity
- [ ] Monthly/quarterly/yearly tasks defined
- [ ] Monitoring tools configured
- [ ] Backup strategy documented
- [ ] Scaling triggers identified
- [ ] SLAs defined
- [ ] Pricing calculated
- [ ] All 8 documents generated

**Output summary:**
```
✅ Maintenance Plan Generated

📊 Tier: Premium
⏱️  Monthly Effort: 24 hours
💰 Monthly Retainer: $4,320
📈 Uptime SLA: 99.9%
🔔 Monitoring: Error tracking + Performance + Uptime

📄 Documents Created:
  ✅ /docs/maintenance/MAINTENANCE-PLAN.md
  ✅ /docs/maintenance/MONTHLY-CHECKLIST.md
  ✅ /docs/maintenance/QUARTERLY-CHECKLIST.md
  ✅ /docs/maintenance/YEARLY-CHECKLIST.md
  ✅ /docs/maintenance/MONITORING-SETUP.md
  ✅ /docs/maintenance/BACKUP-RECOVERY.md
  ✅ /docs/maintenance/SCALING-GUIDE.md
  ✅ /docs/maintenance/SUPPORT-SLA.md

📋 Templates Created:
  ✅ Bug triage template
  ✅ Feature request template
  ✅ Incident report template

Next Steps:
1. Review plan with team
2. Set up monitoring tools
3. Schedule first maintenance window
4. Share with client
5. Add to @client-handoff package
```

---

## 🎯 Success Metrics

**Plan Quality Indicators:**
- Tier matches project complexity ✅
- All tasks defined and estimated ✅
- Monitoring configured ✅
- Backups automated ✅
- SLAs realistic and measurable ✅

**Post-Implementation Success:**
- Zero unplanned downtime in first 90 days
- All monthly tasks completed on schedule
- Client satisfaction >4/5 stars
- Support tickets <5/month
- Maintenance hours within ±10% of estimate

---

## 🔄 Maintenance

**This command should be run:**
- **Initial:** During project handoff
- **Updates:** When project complexity changes significantly
- **Refresh:** Yearly or when client upgrades tier
- **Review:** Quarterly to ensure plan still appropriate

**Command to refresh:**
```bash
@maintenance-plan --refresh
```

---

## 💡 Pro Tips

1. **Present during handoff** - Don't surprise clients with maintenance needs
2. **Include in proposals** - Maintenance cost = recurring revenue
3. **Automate checklists** - Use GitHub Issues or project management tool
4. **Track actual vs. estimated** - Improve future planning
5. **Bundle with monitoring** - Set up tools as part of handoff
6. **Client education** - Teach clients WHY maintenance matters
7. **Upsell opportunities** - Start with Basic, upgrade to Premium over time

---

## 🛠️ Technical Implementation Notes

**For Cursor AI implementing this command:**

1. **Auto-detect tier** from project complexity (don't ask unless ambiguous)
2. **Use existing project data** (package.json, architecture docs)
3. **Invoke commands in parallel** (complexity, debt, security, performance)
4. **Generate realistic estimates** (don't underestimate maintenance effort)
5. **Provide pricing ranges** (adjust for geography, market rates)
6. **Include templates** (bug triage, feature requests, incident reports)
7. **Make it actionable** (checklists, not just descriptions)

**Performance:**
- Total runtime: ~2-3 minutes (dependent commands are slow)
- Parallelize where possible
- Cache results from other commands

**Error Handling:**
- If complexity unknown → Default to "standard" tier
- If monitoring tools unknown → Provide generic recommendations
- If pricing not provided → Use industry standard rates

---

$END$

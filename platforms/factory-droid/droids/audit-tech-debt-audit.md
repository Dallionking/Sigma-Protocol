---
name: tech-debt-audit
description: "Scan codebase for technical debt with budgeting, PM integration, velocity tracking, and predictive modeling"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# tech-debt-audit

**Source:** Sigma Protocol audit module
**Version:** 3.0.0

---


# @tech-debt-audit ($1B Valuation Standard)

**Comprehensive technical debt scanning with budgeting, PM integration, and predictive modeling**

## 🎯 Purpose

**Valuation Context:** You are a **Principal Engineer** at a **High-Frequency Trading Firm**. Technical debt is not just "messy code"; it is **risk**. You scan with the precision of an MRI.

Automate the identification, categorization, and prioritization of technical debt across your codebase. Research shows that **40% of project delays stem from accumulated technical debt**.

**v3.0.0** adds debt budgeting, project management integration, velocity tracking, and predictive modeling to help teams manage debt proactively.

---

## 🆕 v3.0.0 Enhancements

### Debt Budgeting System
- **Sprint Budgets**: Set maximum debt points per sprint
- **Budget Alerts**: Get warnings when approaching budget limits
- **Budget Tracking**: Monitor debt accumulation over time
- **Budget Reports**: Visualize budget compliance

### Project Management Integration
- **Jira Export**: Create Jira tickets from debt items
- **Linear Export**: Create Linear issues from debt items
- **GitHub Issues**: Create GitHub issues from debt items
- **Tracking**: Track resolution status across platforms

### Enhanced Trend Tracking
- **Velocity Metrics**: Track debt reduction speed
- **Team Performance**: Compare debt handling across sprints
- **Burndown Charts**: Visualize debt reduction progress
- **Historical Analysis**: Learn from past patterns

### Predictive Debt Modeling
- **Future Projection**: Predict debt levels 1-3 months ahead
- **Risk Assessment**: Identify high-risk areas
- **Intervention Recommendations**: Suggest when to act
- **Cost Modeling**: Estimate cost of debt vs. resolution

---

## 🌐 Cross-Platform Compatibility

### Platform Detection

```typescript
interface PlatformContext {
  platform: 'cursor' | 'claude-code' | 'open-code' | 'unknown';
  mcpAvailable: boolean;
  tools: {
    available: string[];
    fallbacks: Record<string, string>;
  };
}

async function detectPlatform(): Promise<PlatformContext> {
  const cursorMCP = await checkMCPAvailability([
    'mcp_exa_web_search_exa',
    'mcp_Ref_ref_search_documentation',
  ]);
  
  if (cursorMCP.allAvailable) {
    return { platform: 'cursor', mcpAvailable: true, tools: { available: cursorMCP.tools, fallbacks: {} } };
  }
  
  const claudeMCP = await checkMCPAvailability(['web_search', 'read_file']);
  if (claudeMCP.hasWebSearch) {
    return {
      platform: 'claude-code',
      mcpAvailable: false,
      tools: {
        available: claudeMCP.tools,
        fallbacks: {
          'mcp_exa_web_search_exa': 'web_search',
        },
      },
    };
  }
  
  return {
    platform: 'open-code',
    mcpAvailable: false,
    tools: {
      available: ['read_file', 'write', 'grep', 'run_terminal_cmd'],
      fallbacks: {
        'mcp_exa_web_search_exa': 'curl_web_search',
      },
    },
  };
}
```

### Tool Priority

```
1. PRIMARY: MCP tools (mcp_exa_*, mcp_Ref_*)
2. BACKUP: Built-in tools (web_search, grep, read_file)
3. FALLBACK: CLI tools (curl, jq, grep, find)
```

---

## 📋 Command Usage

```bash
@tech-debt-audit
@tech-debt-audit --severity=high
@tech-debt-audit --fix-auto
@tech-debt-audit --output=/custom/path.md
@tech-debt-audit --budget=50              # Set sprint budget (v3.0.0)
@tech-debt-audit --export-pm=jira         # Export to Jira (v3.0.0)
@tech-debt-audit --export-pm=linear       # Export to Linear (v3.0.0)
@tech-debt-audit --export-pm=github       # Export to GitHub Issues (v3.0.0)
@tech-debt-audit --predict                # Show predictive model (v3.0.0)
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--severity` | Filter by severity: `all`, `high`, `medium`, `low` | `all` |
| `--fix-auto` | Automatically fix low-risk issues | `false` |
| `--output` | Custom output path | `/docs/tech-debt/DEBT-REPORT-[DATE].md` |
| `--budget` | Sprint debt budget (points) (v3.0.0) | None |
| `--export-pm` | Export to PM tool: `jira`, `linear`, `github` (v3.0.0) | None |
| `--predict` | Show predictive debt model (v3.0.0) | `false` |

---

## 📁 File Management (CRITICAL)

**File Strategy**: `append-dated` - Track debt reduction over time

**Output**: `/docs/tech-debt/DEBT-REPORT-2025-12-24.md`

**Budget Config**: `/docs/tech-debt/.debt-budget.json` (v3.0.0)

**Manifest**: `updateManifest('@tech-debt-audit', filePath, 'append-dated')`

---

## 💰 Debt Budgeting System (v3.0.0)

### Budget Configuration

```typescript
interface DebtBudget {
  sprintBudget: number; // Max debt points per sprint
  monthlyBudget: number; // Max debt points per month
  alertThreshold: number; // Percentage to trigger warning (e.g., 80)
  categoryBudgets: {
    codeQuality: number;
    typeSafety: number;
    testing: number;
    security: number;
    dependencies: number;
    documentation: number;
  };
  tracking: {
    currentSprint: string;
    sprintStart: string;
    sprintEnd: string;
    accumulated: number;
    history: SprintDebt[];
  };
}

interface SprintDebt {
  sprint: string;
  budget: number;
  actual: number;
  status: 'under' | 'at' | 'over';
  items: DebtItem[];
}

async function initializeBudget(budget: number): Promise<DebtBudget> {
  const budgetConfig: DebtBudget = {
    sprintBudget: budget,
    monthlyBudget: budget * 2,
    alertThreshold: 80,
    categoryBudgets: {
      codeQuality: Math.floor(budget * 0.25),
      typeSafety: Math.floor(budget * 0.20),
      testing: Math.floor(budget * 0.20),
      security: Math.floor(budget * 0.15),
      dependencies: Math.floor(budget * 0.10),
      documentation: Math.floor(budget * 0.10),
    },
    tracking: {
      currentSprint: getCurrentSprintId(),
      sprintStart: getSprintStartDate(),
      sprintEnd: getSprintEndDate(),
      accumulated: 0,
      history: [],
    },
  };
  
  await writeFile('/docs/tech-debt/.debt-budget.json', JSON.stringify(budgetConfig, null, 2));
  
  console.log(`
💰 Debt Budget Initialized
━━━━━━━━━━━━━━━━━━━━━━━━━━
Sprint Budget: ${budget} points
Monthly Budget: ${budget * 2} points
Alert Threshold: ${budgetConfig.alertThreshold}%

Category Budgets:
  Code Quality: ${budgetConfig.categoryBudgets.codeQuality}
  Type Safety: ${budgetConfig.categoryBudgets.typeSafety}
  Testing: ${budgetConfig.categoryBudgets.testing}
  Security: ${budgetConfig.categoryBudgets.security}
  Dependencies: ${budgetConfig.categoryBudgets.dependencies}
  Documentation: ${budgetConfig.categoryBudgets.documentation}
━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  
  return budgetConfig;
}
```

### Budget Tracking

```typescript
async function trackAgainstBudget(
  debtScore: number,
  items: DebtItem[]
): Promise<BudgetStatus> {
  const budget = await loadBudget();
  
  const status: BudgetStatus = {
    budget: budget.sprintBudget,
    current: debtScore,
    percentage: (debtScore / budget.sprintBudget) * 100,
    status: 'under',
    alerts: [],
    categoryStatus: {},
  };
  
  // Overall status
  if (status.percentage >= 100) {
    status.status = 'over';
    status.alerts.push('🚨 BUDGET EXCEEDED: Debt score exceeds sprint budget');
  } else if (status.percentage >= budget.alertThreshold) {
    status.status = 'at';
    status.alerts.push(`⚠️ WARNING: At ${status.percentage.toFixed(0)}% of budget`);
  }
  
  // Category status
  const categoryScores = categorizeDebt(items);
  for (const [category, score] of Object.entries(categoryScores)) {
    const catBudget = budget.categoryBudgets[category] || 10;
    const catPercentage = (score / catBudget) * 100;
    
    status.categoryStatus[category] = {
      budget: catBudget,
      current: score,
      percentage: catPercentage,
      status: catPercentage >= 100 ? 'over' : catPercentage >= 80 ? 'at' : 'under',
    };
    
    if (catPercentage >= 100) {
      status.alerts.push(`🚨 ${category}: Budget exceeded (${catPercentage.toFixed(0)}%)`);
    }
  }
  
  return status;
}

function generateBudgetReport(status: BudgetStatus): string {
  return `
## 💰 Budget Status

### Overall
| Metric | Value | Status |
|--------|-------|--------|
| Budget | ${status.budget} points | - |
| Current | ${status.current} points | ${status.status === 'over' ? '🚨' : status.status === 'at' ? '⚠️' : '✅'} |
| Usage | ${status.percentage.toFixed(1)}% | ${status.status} |

### By Category
| Category | Budget | Current | Usage | Status |
|----------|--------|---------|-------|--------|
${Object.entries(status.categoryStatus).map(([cat, s]) => 
  `| ${cat} | ${s.budget} | ${s.current} | ${s.percentage.toFixed(0)}% | ${s.status === 'over' ? '🚨' : s.status === 'at' ? '⚠️' : '✅'} |`
).join('\n')}

### Alerts
${status.alerts.length > 0 ? status.alerts.map(a => `- ${a}`).join('\n') : 'No alerts'}
`;
}
```

---

## 🔗 Project Management Integration (v3.0.0)

### Export Interface

```typescript
interface PMExportConfig {
  platform: 'jira' | 'linear' | 'github';
  projectKey?: string; // For Jira
  teamId?: string; // For Linear
  repo?: string; // For GitHub
  labels: string[];
  assignee?: string;
  priority: 'high' | 'medium' | 'low';
}

interface PMTicket {
  id: string;
  title: string;
  description: string;
  priority: string;
  labels: string[];
  estimate: string;
  linkedDebtItem: string;
}
```

### Jira Export

```typescript
async function exportToJira(
  items: DebtItem[],
  config: PMExportConfig
): Promise<PMTicket[]> {
  const tickets: PMTicket[] = [];
  
  // Group by severity for better organization
  const grouped = groupBy(items, 'severity');
  
  for (const [severity, severityItems] of Object.entries(grouped)) {
    for (const item of severityItems) {
      const ticket: PMTicket = {
        id: `TD-${item.id}`,
        title: `[Tech Debt] ${item.title}`,
        description: generateJiraDescription(item),
        priority: mapSeverityToPriority(severity),
        labels: ['tech-debt', item.category, severity],
        estimate: `${item.estimatedHours}h`,
        linkedDebtItem: item.id,
      };
      
      tickets.push(ticket);
    }
  }
  
  // Generate Jira import file
  const jiraImport = {
    projects: [{
      key: config.projectKey,
      issues: tickets.map(t => ({
        summary: t.title,
        description: t.description,
        issuetype: { name: 'Task' },
        priority: { name: t.priority },
        labels: t.labels,
        timetracking: { originalEstimate: t.estimate },
      })),
    }],
  };
  
  await writeFile('/docs/tech-debt/jira-import.json', JSON.stringify(jiraImport, null, 2));
  
  console.log(`
📋 Jira Export Complete
━━━━━━━━━━━━━━━━━━━━━━━
Tickets Created: ${tickets.length}
Export File: /docs/tech-debt/jira-import.json

To import:
1. Go to Jira > Project Settings > External System Import
2. Select JSON Import
3. Upload jira-import.json
━━━━━━━━━━━━━━━━━━━━━━━
`);
  
  return tickets;
}
```

### Linear Export

```typescript
async function exportToLinear(
  items: DebtItem[],
  config: PMExportConfig
): Promise<PMTicket[]> {
  const tickets: PMTicket[] = [];
  
  for (const item of items) {
    const ticket: PMTicket = {
      id: `TD-${item.id}`,
      title: `[Tech Debt] ${item.title}`,
      description: generateLinearDescription(item),
      priority: mapSeverityToLinearPriority(item.severity),
      labels: ['tech-debt', item.category],
      estimate: `${item.estimatedHours}h`,
      linkedDebtItem: item.id,
    };
    
    tickets.push(ticket);
  }
  
  // Generate Linear CSV import
  const csvContent = [
    'Title,Description,Priority,Labels,Estimate',
    ...tickets.map(t => 
      `"${t.title}","${t.description.replace(/"/g, '""')}","${t.priority}","${t.labels.join(',')}","${t.estimate}"`
    ),
  ].join('\n');
  
  await writeFile('/docs/tech-debt/linear-import.csv', csvContent);
  
  console.log(`
📋 Linear Export Complete
━━━━━━━━━━━━━━━━━━━━━━━━
Issues Created: ${tickets.length}
Export File: /docs/tech-debt/linear-import.csv

To import:
1. Go to Linear > Team Settings > Imports
2. Select CSV Import
3. Upload linear-import.csv
━━━━━━━━━━━━━━━━━━━━━━━━
`);
  
  return tickets;
}
```

### GitHub Issues Export

```typescript
async function exportToGitHub(
  items: DebtItem[],
  config: PMExportConfig
): Promise<PMTicket[]> {
  const tickets: PMTicket[] = [];
  
  // Generate GitHub CLI commands
  const commands: string[] = [];
  
  for (const item of items) {
    const labels = ['tech-debt', item.category, item.severity].join(',');
    const cmd = `gh issue create --title "[Tech Debt] ${item.title}" --body "${item.description}" --label "${labels}"`;
    commands.push(cmd);
    
    tickets.push({
      id: `TD-${item.id}`,
      title: `[Tech Debt] ${item.title}`,
      description: item.description,
      priority: item.severity,
      labels: [item.category, item.severity],
      estimate: `${item.estimatedHours}h`,
      linkedDebtItem: item.id,
    });
  }
  
  // Write script
  const script = `#!/bin/bash
# Tech Debt Issues Import Script
# Generated: ${new Date().toISOString()}
# Total Issues: ${commands.length}

${commands.join('\n\n')}
`;
  
  await writeFile('/docs/tech-debt/github-import.sh', script);
  
  console.log(`
📋 GitHub Export Complete
━━━━━━━━━━━━━━━━━━━━━━━━━
Issues to Create: ${tickets.length}
Export File: /docs/tech-debt/github-import.sh

To import:
1. Make script executable: chmod +x github-import.sh
2. Run: ./github-import.sh
   (Requires GitHub CLI to be installed and authenticated)
━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  
  return tickets;
}
```

---

## 📈 Enhanced Trend Tracking (v3.0.0)

### Velocity Metrics

```typescript
interface VelocityMetrics {
  debtReductionVelocity: number; // Points reduced per week
  resolutionVelocity: number; // Issues resolved per week
  additionVelocity: number; // New debt added per week
  netVelocity: number; // Net change per week
  trajectory: 'improving' | 'stable' | 'degrading';
  sprintComparison: {
    currentSprint: number;
    previousSprint: number;
    change: number;
    changePercent: number;
  };
}

async function calculateVelocity(): Promise<VelocityMetrics> {
  const history = await loadDebtHistory();
  
  if (history.length < 2) {
    return {
      debtReductionVelocity: 0,
      resolutionVelocity: 0,
      additionVelocity: 0,
      netVelocity: 0,
      trajectory: 'stable',
      sprintComparison: { currentSprint: 0, previousSprint: 0, change: 0, changePercent: 0 },
    };
  }
  
  const current = history[0];
  const previous = history[1];
  const daysBetween = daysDiff(previous.date, current.date);
  const weeksBetween = daysBetween / 7;
  
  // Calculate velocities
  const debtReductionVelocity = (previous.resolved || 0) / weeksBetween;
  const additionVelocity = (current.newDebt || 0) / weeksBetween;
  const netVelocity = (previous.debtScore - current.debtScore) / weeksBetween;
  const resolutionVelocity = (previous.itemsResolved || 0) / weeksBetween;
  
  // Determine trajectory
  let trajectory: 'improving' | 'stable' | 'degrading';
  if (netVelocity > 2) trajectory = 'improving';
  else if (netVelocity < -2) trajectory = 'degrading';
  else trajectory = 'stable';
  
  return {
    debtReductionVelocity,
    resolutionVelocity,
    additionVelocity,
    netVelocity,
    trajectory,
    sprintComparison: {
      currentSprint: current.debtScore,
      previousSprint: previous.debtScore,
      change: previous.debtScore - current.debtScore,
      changePercent: ((previous.debtScore - current.debtScore) / previous.debtScore) * 100,
    },
  };
}

function generateVelocityReport(velocity: VelocityMetrics): string {
  return `
## 📈 Velocity Metrics

### Weekly Rates
| Metric | Value | Status |
|--------|-------|--------|
| Debt Reduction | ${velocity.debtReductionVelocity.toFixed(1)} points/week | ${velocity.debtReductionVelocity > 0 ? '✅' : '⚠️'} |
| Issues Resolved | ${velocity.resolutionVelocity.toFixed(1)}/week | ${velocity.resolutionVelocity > 0 ? '✅' : '⚠️'} |
| New Debt Added | ${velocity.additionVelocity.toFixed(1)} points/week | ${velocity.additionVelocity < 5 ? '✅' : '⚠️'} |
| Net Change | ${velocity.netVelocity > 0 ? '+' : ''}${velocity.netVelocity.toFixed(1)} points/week | ${velocity.netVelocity > 0 ? '✅' : '⚠️'} |

### Sprint Comparison
| Metric | Value |
|--------|-------|
| Current Sprint | ${velocity.sprintComparison.currentSprint} points |
| Previous Sprint | ${velocity.sprintComparison.previousSprint} points |
| Change | ${velocity.sprintComparison.change > 0 ? '+' : ''}${velocity.sprintComparison.change} points (${velocity.sprintComparison.changePercent.toFixed(1)}%) |

### Trajectory: ${velocity.trajectory === 'improving' ? '📈 Improving' : velocity.trajectory === 'degrading' ? '📉 Degrading' : '➡️ Stable'}
`;
}
```

---

## 🔮 Predictive Debt Modeling (v3.0.0)

### Future Projection

```typescript
interface DebtPrediction {
  currentScore: number;
  predictions: {
    oneWeek: { score: number; confidence: number };
    oneMonth: { score: number; confidence: number };
    threeMonths: { score: number; confidence: number };
  };
  riskAreas: {
    area: string;
    currentScore: number;
    predictedScore: number;
    risk: 'high' | 'medium' | 'low';
    intervention: string;
  }[];
  costAnalysis: {
    currentCost: number; // Hours to fix now
    projectedCost: number; // Hours to fix if left
    savingsOpportunity: number; // Hours saved by acting now
  };
  recommendations: string[];
}

async function predictDebtTrajectory(): Promise<DebtPrediction> {
  const history = await loadDebtHistory();
  const velocity = await calculateVelocity();
  const current = await getCurrentDebtScore();
  
  // Simple linear projection based on velocity
  const predictions = {
    oneWeek: {
      score: Math.max(0, Math.min(100, current - velocity.netVelocity)),
      confidence: 0.85,
    },
    oneMonth: {
      score: Math.max(0, Math.min(100, current - velocity.netVelocity * 4)),
      confidence: 0.70,
    },
    threeMonths: {
      score: Math.max(0, Math.min(100, current - velocity.netVelocity * 12)),
      confidence: 0.50,
    },
  };
  
  // Identify risk areas
  const riskAreas = await identifyRiskAreas(history, velocity);
  
  // Cost analysis
  const currentCost = await calculateResolutionCost(current);
  const projectedCost = await calculateResolutionCost(predictions.threeMonths.score);
  
  // Generate recommendations
  const recommendations = generatePredictiveRecommendations(predictions, riskAreas, velocity);
  
  return {
    currentScore: current,
    predictions,
    riskAreas,
    costAnalysis: {
      currentCost,
      projectedCost,
      savingsOpportunity: projectedCost - currentCost,
    },
    recommendations,
  };
}

function generatePredictionReport(prediction: DebtPrediction): string {
  return `
## 🔮 Predictive Debt Model

### Current State
**Debt Score:** ${prediction.currentScore}/100

### Projections
| Timeframe | Predicted Score | Confidence |
|-----------|-----------------|------------|
| 1 Week | ${prediction.predictions.oneWeek.score.toFixed(0)} | ${(prediction.predictions.oneWeek.confidence * 100).toFixed(0)}% |
| 1 Month | ${prediction.predictions.oneMonth.score.toFixed(0)} | ${(prediction.predictions.oneMonth.confidence * 100).toFixed(0)}% |
| 3 Months | ${prediction.predictions.threeMonths.score.toFixed(0)} | ${(prediction.predictions.threeMonths.confidence * 100).toFixed(0)}% |

### Risk Areas
${prediction.riskAreas.map(r => `
#### ${r.area}
- Current: ${r.currentScore} → Predicted: ${r.predictedScore}
- Risk Level: ${r.risk === 'high' ? '🔴 High' : r.risk === 'medium' ? '🟡 Medium' : '🟢 Low'}
- Intervention: ${r.intervention}
`).join('\n')}

### Cost Analysis
| Metric | Hours | Cost (at $150/hr) |
|--------|-------|-------------------|
| Fix Now | ${prediction.costAnalysis.currentCost} | $${prediction.costAnalysis.currentCost * 150} |
| Fix in 3 Months | ${prediction.costAnalysis.projectedCost} | $${prediction.costAnalysis.projectedCost * 150} |
| **Savings Opportunity** | **${prediction.costAnalysis.savingsOpportunity}** | **$${prediction.costAnalysis.savingsOpportunity * 150}** |

### Recommendations
${prediction.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;
}
```

---

## 📊 Enhanced Report (v3.0.0)

```markdown
# Technical Debt Audit Report

**Generated:** 2025-12-24 14:32:00 UTC  
**Codebase:** Sigma (Sigma Software Solutions)  
**Total Debt Score:** 42/100 (Fair)
**Platform:** ${platform.platform}

---

## 📊 Executive Summary

**Overall Health:** Fair (needs attention)  
**Total Issues Found:** 127  
**Estimated Effort to Resolve:** 89 hours (11 days)  
**Priority Issues:** 3 critical, 12 high

**Trend:** ↓ Degrading (debt increased 8% since last audit)

---

## 💰 Budget Status (v3.0.0)

| Metric | Value | Status |
|--------|-------|--------|
| Sprint Budget | 50 points | - |
| Current Debt | 42 points | ✅ Under Budget |
| Usage | 84% | ⚠️ Approaching Limit |

**Alert:** At 84% of sprint budget. Consider prioritizing debt reduction.

---

## 📈 Velocity Metrics (v3.0.0)

| Metric | Value | Trend |
|--------|-------|-------|
| Debt Reduction | 3.2 points/week | ↑ |
| Issues Resolved | 5.1/week | ↑ |
| New Debt Added | 4.5 points/week | → |
| Net Change | -1.3 points/week | ⚠️ |

**Sprint Comparison:** 42 vs 45 (previous) = -3 points (7% improvement)

---

## 🔮 Predictions (v3.0.0)

| Timeframe | Predicted Score | Action Needed |
|-----------|-----------------|---------------|
| 1 Week | 41 | Monitor |
| 1 Month | 38 | Continue current pace |
| 3 Months | 30 | On track for "Good" rating |

**Cost of Inaction:** Fixing now costs 89 hours. Waiting 3 months could cost 120 hours (+35%).

---

## 🚨 Critical Issues (Fix Now)

[Critical issues with Jira/Linear/GitHub integration...]

---

## 📋 PM Export (v3.0.0)

**Available Exports:**
- Jira: \`/docs/tech-debt/jira-import.json\`
- Linear: \`/docs/tech-debt/linear-import.csv\`
- GitHub: \`/docs/tech-debt/github-import.sh\`

**Quick Export:**
\`\`\`bash
@tech-debt-audit --export-pm=jira
@tech-debt-audit --export-pm=linear
@tech-debt-audit --export-pm=github
\`\`\`

---

## 🎯 Actionable Task List

### Immediate (This Sprint)
- [ ] Fix 3 critical issues → 4 hours total
- [ ] Update security dependencies → 0.5 hours
- [ ] Resolve 2 type safety issues → 2 hours

### Next Sprint
- [ ] Reduce code duplication → 8 hours
- [ ] Add missing tests → 12 hours
- [ ] Refactor large files → 16 hours

---

## 🔗 Integration Status

| Command | Last Run | Status |
|---------|----------|--------|
| @tech-debt-audit | Now | ✅ |
| @analyze | Dec 22 | ✅ |
| @security-audit | Dec 20 | ⚠️ Needs refresh |

Run \`@status\` for unified dashboard.

---

**Next Audit:** 2025-12-31 (7 days)
```

---

## 🔗 Related Commands

- `@analyze` - Overall codebase health
- `@security-audit` - Security vulnerability scanning
- `@performance-check` - Performance analysis
- `@status` - Unified project status

---

$END$

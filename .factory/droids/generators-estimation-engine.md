---
name: estimation-engine
description: "AI-powered project estimation from requirements - time, cost, team composition, risk analysis"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# estimation-engine

**Source:** Sigma Protocol generators module
**Version:** 2.0.0

---


# @estimation-engine

**AI-powered project estimation from requirements**

## 🎯 Purpose

Automate project estimation using AI analysis of requirements. Research shows **70% of manual estimates are inaccurate**, leading to scope creep and budget overruns. This command provides data-driven, AI-assisted estimates that improve accuracy and reduce risk.

**For agencies:** Use during sales/proposal phase, project planning, or when evaluating new opportunities.

---

## 📋 Command Usage

```bash
@estimation-engine
@estimation-engine --input=/path/to/prd.md
@estimation-engine --input=/path/to/requirements.txt
@estimation-engine --format=detailed
@estimation-engine --compare=/previous-estimate.json
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--input` | Path to requirements doc (PRD, Master PRD, user stories, etc.) | Interactive prompt |
| `--format` | Output detail level: `summary`, `standard`, `detailed` | `standard` |
| `--detail` | Alias for `--format=detailed` | - |
| `--compare` | Compare with previous estimate (path to JSON) | - |

---

## 📁 File Management (CRITICAL)

**File Strategy**: `create` - One estimate per feature/project

**Output**: `/docs/estimates/ESTIMATE-[FEATURE-ID].md`

**Manifest**: `updateManifest('@estimation-engine', filePath, 'create')`

---

## 🔄 Input Format Flexibility

This command is **format-agnostic** and can parse:

### 1. SSS Master PRD (Future)
When SSS platform generates Master PRDs for clients:
```markdown
# Master PRD: [Project Name]
## Problem & Goal
## Users & Jobs-to-be-Done
## Must-Have Features
## Nice-to-Have Features
## Integrations
## Budget & Timeline
```

### 2. Generic PRD (Steps 1-9 format)
```markdown
# PRD from Steps 1-9
Sections: Problem, Users, Scope, Tech Approach, etc.
```

### 3. JSON Requirements
```json
{
  "project_name": "...",
  "features": [...],
  "integrations": [...],
  "budget_band": "...",
  "timeline": "..."
}
```

### 4. Plain Text Requirements
```
We need a mobile app for food delivery with:
- User registration
- Restaurant browsing
- Real-time order tracking
- Payment integration
```

### 5. User Story List
```
As a customer, I want to browse restaurants
As a customer, I want to place orders
As a restaurant, I want to manage menu
```

### 6. Interactive Prompt
If no input provided, command prompts for key details.

---

## 🔄 Command Orchestration (Optional)

This command can optionally invoke:

1. **`@new-feature --scan-only`** → Extract feature list from PRD (if exists)
2. **`@tech-debt-audit --estimate-only`** → Estimate complexity of existing codebase (if building on top)
3. **Exa/Ref MCP** → Research current market rates, tech stack costs

**Why optional?** These enhance accuracy but aren't required. Command works standalone.

---

## 📦 What Gets Generated

### Primary Output: Estimation Report

```
/docs/estimates/
  ├── ESTIMATE-[PROJECT]-2025-11-06.md      # Human-readable report
  ├── ESTIMATE-[PROJECT]-2025-11-06.json    # Machine-readable data
  └── _history/
      └── ESTIMATE-[PROJECT]-2025-10-01.md  # Previous estimates
```

### Report Structure

```markdown
# Project Estimation Report
**Project:** [Project Name]
**Generated:** [Date/Time]
**Confidence Level:** [High/Medium/Low]

---

## 📊 Executive Summary

**Total Estimated Hours:** [X] hours ([X] weeks)
**Estimated Cost:** $[X],000 - $[X],000
**Team Composition:** [X] developers, [X] designers, [X] QA
**Timeline:** [X] weeks ([X] sprints)
**Risk Level:** [Low/Medium/High]

**Key Assumptions:**
- [Assumption 1]
- [Assumption 2]

---

## 🎯 Scope Analysis

### Must-Have Features ([X] features)
[Auto-extracted from input, categorized by complexity]

| Feature | Complexity | Hours | Risk |
|---------|-----------|-------|------|
| User Authentication | Medium | 24h | Low |
| Payment Integration | High | 40h | Medium |
| ...

### Nice-to-Have Features ([X] features)
[Optional features, budgeted separately]

### Out of Scope
[Explicitly excluded items]

---

## 🏗️ Architecture Complexity

**Complexity Score:** [X]/100 (Similar to F11 logic, but standalone)

**Category:** [No-Code / Low-Code / Custom / Enterprise]

**Reasoning:**
[AI-generated explanation of complexity drivers]

---

## 🛠️ Recommended Tech Stack

**Frontend:** [Recommendation]
**Backend:** [Recommendation]
**Database:** [Recommendation]
**Infrastructure:** [Recommendation]
**Third-Party Services:** [List]

**Rationale:** [AI-generated reasoning based on requirements]

---

## 👥 Team Composition

**Recommended Team:**
- Frontend Developer: [X] hours ([X]% of project)
- Backend Developer: [X] hours ([X]% of project)
- Full-Stack Developer: [X] hours ([X]% of project)
- UI/UX Designer: [X] hours ([X]% of project)
- QA Engineer: [X] hours ([X]% of project)
- DevOps/Infrastructure: [X] hours ([X]% of project)
- Project Manager: [X] hours ([X]% of project)

**Total Team Hours:** [X] hours

---

## 📅 Timeline & Milestones

**Estimated Duration:** [X] weeks ([X] sprints)

### Phase 1: Foundation ([X] weeks)
- Setup & Architecture
- Authentication & Core Infrastructure
- Estimated Hours: [X]h

### Phase 2: Core Features ([X] weeks)
- [Feature 1]
- [Feature 2]
- Estimated Hours: [X]h

### Phase 3: Integration & Polish ([X] weeks)
- Third-party integrations
- Testing & QA
- Deployment
- Estimated Hours: [X]h

### Phase 4: Launch & Handoff ([X] weeks)
- Production deployment
- Documentation
- Client training
- Estimated Hours: [X]h

---

## 💰 Cost Breakdown

### By Phase
| Phase | Hours | Cost (@ $[X]/h) |
|-------|-------|-----------------|
| Foundation | [X]h | $[X],000 |
| Core Features | [X]h | $[X],000 |
| Integration | [X]h | $[X],000 |
| Launch | [X]h | $[X],000 |
| **Total** | **[X]h** | **$[X],000** |

### By Role
| Role | Hours | Cost (@ $[X]/h) |
|------|-------|-----------------|
| Senior Dev | [X]h | $[X],000 |
| Mid-Level Dev | [X]h | $[X],000 |
| Designer | [X]h | $[X],000 |
| QA | [X]h | $[X],000 |
| **Total** | **[X]h** | **$[X],000** |

### Cost Range
**Minimum (Best Case):** $[X],000
**Expected (Most Likely):** $[X],000
**Maximum (Worst Case):** $[X],000

**Confidence Interval:** ±[X]%

---

## ⚠️ Risk Analysis

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | High | High | [Strategy] |
| [Risk 2] | Medium | Medium | [Strategy] |

### Schedule Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | Medium | High | [Strategy] |

### Cost Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | Low | Medium | [Strategy] |

---

## 📊 Confidence Analysis

**Overall Confidence:** [High/Medium/Low]

**Confidence Drivers:**
- Requirements clarity: [Clear/Moderate/Vague]
- Technical complexity: [Low/Medium/High]
- Team experience: [High/Medium/Low]
- Third-party dependencies: [Few/Some/Many]

**To Increase Confidence:**
- [ ] [Recommendation 1]
- [ ] [Recommendation 2]

---

## 🔍 Assumptions & Dependencies

**Key Assumptions:**
1. Client provides all assets/content on time
2. No major scope changes after kickoff
3. Third-party APIs available and stable
4. Team has access to required tools/services

**External Dependencies:**
- [Dependency 1]: [Description]
- [Dependency 2]: [Description]

---

## 📝 Recommended Next Steps

1. **Discovery Call** ([X] hours)
   - Clarify ambiguous requirements
   - Validate technical assumptions
   - Discuss timeline constraints

2. **Technical Proof of Concept** ([X] hours) [Optional]
   - De-risk [specific technical concern]
   - Estimated effort: [X] hours
   - Should be completed before committing

3. **Proposal Creation** ([X] hours)
   - Use this estimate as foundation
   - Add agency margins/contingency
   - Include payment schedule

4. **Contract & SOW** ([X] hours)
   - Define scope boundaries clearly
   - Include change request process
   - Specify acceptance criteria

---

## 🔗 Related Resources

- [Similar project reference] (if available)
- [Tech stack documentation]
- [Industry benchmarks]

---

## 📈 Historical Comparison

[If --compare flag used]

**Previous Estimate:** [Date]
**Current Estimate:** [Date]

| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Hours | [X]h | [X]h | [↑/↓ X%] |
| Cost | $[X]k | $[X]k | [↑/↓ X%] |
| Timeline | [X]w | [X]w | [↑/↓ X%] |

**Variance Explanation:**
[AI-generated analysis of why estimates changed]

---

**Next Review:** [Recommend re-estimating after discovery call]

$END$
```

---

## 🛠️ Implementation Phases

### Phase 1: Input Parsing & Validation

**Goal:** Accept any format, extract structured data

#### Step 1: Detect Input Format
```typescript
function detectInputFormat(content: string): 'master-prd' | 'generic-prd' | 'json' | 'plain-text' | 'user-stories' {
  // Check for SSS Master PRD structure
  if (content.includes('# Master PRD:') && content.includes('## Users & Jobs-to-be-Done')) {
    return 'master-prd';
  }
  
  // Check for generic PRD (Steps 1-9)
  if (content.includes('## Problem & Goal') && content.includes('## Scope')) {
    return 'generic-prd';
  }
  
  // Check for JSON
  if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
    return 'json';
  }
  
  // Check for user stories
  if (content.match(/As a .+, I want .+/g)) {
    return 'user-stories';
  }
  
  // Default: plain text
  return 'plain-text';
}
```

#### Step 2: Extract Structured Data
```typescript
interface ParsedRequirements {
  projectName: string;
  goal: string;
  mustHaveFeatures: string[];
  niceToHaveFeatures: string[];
  integrations: {
    category: string;
    services: string[];
  }[];
  budgetBand?: string;
  timeline?: string;
  successMetrics?: string[];
  users?: { role: string; jobs: string[] }[];
  risks?: string[];
}

async function parseRequirements(content: string, format: string): Promise<ParsedRequirements> {
  // Format-specific parsing logic
  switch (format) {
    case 'master-prd':
      return parseMasterPRD(content);
    case 'generic-prd':
      return parseGenericPRD(content);
    case 'json':
      return JSON.parse(content);
    case 'user-stories':
      return parseUserStories(content);
    case 'plain-text':
      return parseWithAI(content); // Use AI to extract structure
  }
}
```

#### Step 3: Validate Completeness
```typescript
function validateRequirements(req: ParsedRequirements): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!req.projectName) missing.push('Project name');
  if (!req.goal) missing.push('Project goal/problem statement');
  if (!req.mustHaveFeatures || req.mustHaveFeatures.length === 0) {
    missing.push('Must-have features');
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}
```

---

### Phase 2: Complexity Analysis (Standalone Logic)

**Goal:** Calculate complexity score without depending on F11

#### Complexity Scoring Algorithm
```typescript
interface ComplexityFactors {
  featureCount: number;        // 0-20 points
  integrationCount: number;    // 0-15 points
  userTypes: number;           // 0-10 points
  dataComplexity: number;      // 0-20 points
  realtimeNeeds: boolean;      // 0-15 points
  scalingNeeds: boolean;       // 0-10 points
  securityNeeds: number;       // 0-10 points
}

function calculateComplexityScore(req: ParsedRequirements): number {
  let score = 0;
  
  // Feature count (0-20 points)
  const featureCount = req.mustHaveFeatures.length + (req.niceToHaveFeatures?.length || 0);
  if (featureCount <= 5) score += 5;
  else if (featureCount <= 10) score += 10;
  else if (featureCount <= 20) score += 15;
  else score += 20;
  
  // Integration count (0-15 points)
  const integrationCount = req.integrations?.reduce((acc, cat) => acc + cat.services.length, 0) || 0;
  if (integrationCount >= 5) score += 15;
  else if (integrationCount >= 3) score += 10;
  else if (integrationCount >= 1) score += 5;
  
  // User types (0-10 points)
  const userCount = req.users?.length || 1;
  if (userCount >= 4) score += 10;
  else if (userCount >= 2) score += 5;
  
  // Data complexity (0-20 points)
  // Analyze feature descriptions for keywords
  const dataKeywords = ['crud', 'database', 'analytics', 'reporting', 'export', 'import'];
  const dataScore = req.mustHaveFeatures.filter(f => 
    dataKeywords.some(kw => f.toLowerCase().includes(kw))
  ).length;
  score += Math.min(20, dataScore * 3);
  
  // Real-time needs (0-15 points)
  const realtimeKeywords = ['real-time', 'live', 'websocket', 'chat', 'notification', 'streaming'];
  const hasRealtime = req.mustHaveFeatures.some(f => 
    realtimeKeywords.some(kw => f.toLowerCase().includes(kw))
  );
  if (hasRealtime) score += 15;
  
  // Scaling needs (0-10 points)
  const scalingKeywords = ['scale', 'high traffic', 'concurrent', 'load balancing'];
  const hasScaling = req.goal?.toLowerCase().split(' ').some(word => 
    scalingKeywords.some(kw => word.includes(kw))
  ) || false;
  if (hasScaling) score += 10;
  
  // Security needs (0-10 points)
  const securityKeywords = ['auth', 'payment', 'sensitive', 'compliance', 'hipaa', 'gdpr', 'pci'];
  const securityScore = req.mustHaveFeatures.filter(f => 
    securityKeywords.some(kw => f.toLowerCase().includes(kw))
  ).length;
  score += Math.min(10, securityScore * 3);
  
  return Math.min(100, score);
}

function categorizeComplexity(score: number): 'no-code' | 'low-code' | 'custom' | 'enterprise' {
  if (score <= 25) return 'no-code';
  if (score <= 50) return 'low-code';
  if (score <= 75) return 'custom';
  return 'enterprise';
}
```

---

### Phase 3: AI-Powered Analysis (Research & Recommendations)

**Use Exa/Ref MCP for market research:**

```typescript
async function analyzeWithAI(req: ParsedRequirements): Promise<AIAnalysis> {
  // Query 1: Tech stack recommendations
  const techStackQuery = `
    For a ${req.goal} project with these features:
    ${req.mustHaveFeatures.join(', ')}
    
    What tech stack would you recommend in 2025?
    Consider: frontend framework, backend framework, database, hosting.
  `;
  
  const techStackResponse = await exaGetCodeContext(techStackQuery);
  
  // Query 2: Effort estimation
  const effortQuery = `
    How many developer hours does a typical ${req.goal} project take with these features:
    ${req.mustHaveFeatures.join(', ')}
    
    Provide realistic estimates for: frontend, backend, design, QA, DevOps.
  `;
  
  const effortResponse = await exaGetCodeContext(effortQuery);
  
  // Query 3: Risk factors
  const riskQuery = `
    What are common risks and challenges when building:
    ${req.goal}
    
    With integrations: ${req.integrations?.map(i => i.category).join(', ')}
  `;
  
  const riskResponse = await exaGetCodeContext(riskQuery);
  
  return {
    techStack: parseTechStackFromAI(techStackResponse),
    effortEstimate: parseEffortFromAI(effortResponse),
    risks: parseRisksFromAI(riskResponse)
  };
}
```

---

### Phase 4: Effort Estimation (Hours Calculation)

**Base formula inspired by F11 logic but standalone:**

```typescript
interface EffortEstimate {
  frontend: number;
  backend: number;
  design: number;
  qa: number;
  devops: number;
  pm: number;
  total: number;
}

function estimateEffort(
  req: ParsedRequirements,
  complexityScore: number,
  aiAnalysis: AIAnalysis
): EffortEstimate {
  // Base hours per feature (varies by complexity category)
  const category = categorizeComplexity(complexityScore);
  const baseHoursPerFeature = {
    'no-code': 4,
    'low-code': 8,
    'custom': 20,
    'enterprise': 40
  }[category];
  
  // Calculate feature hours
  const mustHaveHours = req.mustHaveFeatures.length * baseHoursPerFeature;
  const niceToHaveHours = (req.niceToHaveFeatures?.length || 0) * baseHoursPerFeature * 0.7;
  const featureHours = mustHaveHours + niceToHaveHours;
  
  // Distribution by role (industry standard percentages)
  const frontend = featureHours * 0.35;  // 35%
  const backend = featureHours * 0.35;   // 35%
  const design = featureHours * 0.15;    // 15%
  const qa = featureHours * 0.10;        // 10%
  const devops = featureHours * 0.05;    // 5%
  
  // Project management overhead (15% of dev time)
  const pm = (frontend + backend) * 0.15;
  
  const total = frontend + backend + design + qa + devops + pm;
  
  return {
    frontend: Math.round(frontend),
    backend: Math.round(backend),
    design: Math.round(design),
    qa: Math.round(qa),
    devops: Math.round(devops),
    pm: Math.round(pm),
    total: Math.round(total)
  };
}
```

---

### Phase 5: Cost Calculation

**Use market rates (configurable):**

```typescript
interface RateCard {
  seniorDev: number;      // $/hour
  midDev: number;
  juniorDev: number;
  designer: number;
  qa: number;
  pm: number;
}

// Default rates (US market, 2025)
const DEFAULT_RATES: RateCard = {
  seniorDev: 150,
  midDev: 100,
  juniorDev: 75,
  designer: 120,
  qa: 80,
  pm: 130
};

function estimateCost(
  effort: EffortEstimate,
  rates: RateCard = DEFAULT_RATES
): { min: number; expected: number; max: number } {
  // Assume 70% senior, 30% mid for dev work
  const devCost = (effort.frontend + effort.backend) * (0.7 * rates.seniorDev + 0.3 * rates.midDev);
  const designCost = effort.design * rates.designer;
  const qaCost = effort.qa * rates.qa;
  const devopsCost = effort.devops * rates.seniorDev;
  const pmCost = effort.pm * rates.pm;
  
  const expected = devCost + designCost + qaCost + devopsCost + pmCost;
  
  // Confidence intervals: ±25%
  const min = expected * 0.75;
  const max = expected * 1.25;
  
  return {
    min: Math.round(min),
    expected: Math.round(expected),
    max: Math.round(max)
  };
}
```

---

### Phase 6: Timeline & Milestone Generation

**Sprint-based planning:**

```typescript
interface Milestone {
  phase: string;
  weeks: number;
  hours: number;
  deliverables: string[];
}

function generateTimeline(effort: EffortEstimate, req: ParsedRequirements): Milestone[] {
  const totalHours = effort.total;
  const teamSize = 2; // Assume 2-person team (adjust based on project)
  const hoursPerWeek = teamSize * 40; // 40 hours/person/week
  
  const totalWeeks = Math.ceil(totalHours / hoursPerWeek);
  
  // Standard phase breakdown
  const milestones: Milestone[] = [
    {
      phase: 'Foundation',
      weeks: Math.ceil(totalWeeks * 0.20),
      hours: Math.round(totalHours * 0.20),
      deliverables: [
        'Project setup & architecture',
        'Authentication system',
        'Core infrastructure',
        'Database schema'
      ]
    },
    {
      phase: 'Core Features',
      weeks: Math.ceil(totalWeeks * 0.50),
      hours: Math.round(totalHours * 0.50),
      deliverables: req.mustHaveFeatures.slice(0, 3)
    },
    {
      phase: 'Integration & Polish',
      weeks: Math.ceil(totalWeeks * 0.20),
      hours: Math.round(totalHours * 0.20),
      deliverables: [
        'Third-party integrations',
        'Testing & QA',
        'Performance optimization',
        'Bug fixes'
      ]
    },
    {
      phase: 'Launch & Handoff',
      weeks: Math.ceil(totalWeeks * 0.10),
      hours: Math.round(totalHours * 0.10),
      deliverables: [
        'Production deployment',
        'Documentation (via @client-handoff)',
        'Client training',
        'Post-launch support setup'
      ]
    }
  ];
  
  return milestones;
}
```

---

### Phase 7: Risk Assessment

**Identify common risk patterns:**

```typescript
interface Risk {
  category: 'technical' | 'schedule' | 'cost';
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

function assessRisks(req: ParsedRequirements, complexityScore: number): Risk[] {
  const risks: Risk[] = [];
  
  // High complexity = schedule risk
  if (complexityScore > 70) {
    risks.push({
      category: 'schedule',
      description: 'High project complexity may extend timeline',
      probability: 'medium',
      impact: 'high',
      mitigation: 'Build MVP first, add complex features incrementally'
    });
  }
  
  // Many integrations = technical risk
  const integrationCount = req.integrations?.reduce((acc, cat) => acc + cat.services.length, 0) || 0;
  if (integrationCount >= 3) {
    risks.push({
      category: 'technical',
      description: 'Third-party API dependencies may cause delays',
      probability: 'high',
      impact: 'medium',
      mitigation: 'Verify API availability early, build mocks for testing'
    });
  }
  
  // Vague requirements = all risks
  if (!req.budgetBand || !req.timeline) {
    risks.push({
      category: 'cost',
      description: 'Unclear requirements may lead to scope creep',
      probability: 'high',
      impact: 'high',
      mitigation: 'Conduct detailed discovery call, lock scope in SOW'
    });
  }
  
  return risks;
}
```

---

### Phase 8: Report Generation

**Markdown + JSON output:**

```typescript
async function generateReport(
  req: ParsedRequirements,
  complexityScore: number,
  effort: EffortEstimate,
  cost: { min: number; expected: number; max: number },
  timeline: Milestone[],
  risks: Risk[],
  aiAnalysis: AIAnalysis
): Promise<{ markdown: string; json: object }> {
  // Generate markdown using template from earlier
  const markdown = `# Project Estimation Report\n\n...`;
  
  // Generate JSON for machine consumption
  const json = {
    generated_at: new Date().toISOString(),
    project_name: req.projectName,
    complexity_score: complexityScore,
    complexity_category: categorizeComplexity(complexityScore),
    effort: effort,
    cost: cost,
    timeline: timeline,
    risks: risks,
    tech_stack: aiAnalysis.techStack,
    confidence: calculateConfidence(req)
  };
  
  return { markdown, json };
}
```

---

### Phase 9: Validation & Output

**Final checks:**
- [ ] All required fields populated
- [ ] Effort estimates realistic (cross-check with AI analysis)
- [ ] Cost within industry norms
- [ ] Timeline feasible
- [ ] Risks identified
- [ ] JSON valid

**Output summary:**
```
✅ Project Estimation Complete

📊 Complexity: 68/100 (Custom Development)
⏱️  Estimated Effort: 480 hours (12 weeks)
💰 Estimated Cost: $60,000 - $80,000 (expected: $72,000)
👥 Team: 2 developers + 1 designer
⚠️  Risks Identified: 4 (2 high, 2 medium)

📄 Reports Generated:
  - /docs/estimates/ESTIMATE-[PROJECT]-2025-11-06.md
  - /docs/estimates/ESTIMATE-[PROJECT]-2025-11-06.json

💡 Confidence: Medium
   To increase: Conduct discovery call to clarify [X, Y, Z]

Next Steps:
1. Review estimate for accuracy
2. Schedule discovery call with client
3. Adjust estimates based on discovery findings
4. Generate proposal (add 20% margin)
```

---

## 🎯 Success Metrics

**Estimation Accuracy Indicators:**
- Confidence level calculated ✅
- Industry benchmarks referenced ✅
- Multiple scenarios provided (min/expected/max) ✅
- Risk factors identified ✅
- Comparable project data used (if available) ✅

**Post-Project Success (Track Over Time):**
- Actual hours within 20% of estimate
- Actual cost within 15% of estimate
- Actual timeline within 2 weeks of estimate
- Zero scope creep issues
- Client satisfaction with estimation transparency

---

## 🔄 Maintenance & Learning

**This command should be run:**
- **Pre-Sales:** During opportunity evaluation
- **Proposal Phase:** Before sending proposal to client
- **Post-Discovery:** Re-estimate after discovery call
- **Change Requests:** Re-estimate when scope changes

**Learning Over Time:**
Save actual project outcomes to improve future estimates:

```bash
@estimation-engine --record-actual \
  --estimate=/docs/estimates/ESTIMATE-PROJECT-A.json \
  --actual-hours=520 \
  --actual-cost=75000 \
  --actual-weeks=14
```

This builds a historical database for better future predictions.

---

## 💡 Pro Tips

1. **Always run after discovery** - initial estimates are rough, refine after client call
2. **Add 20% buffer** - for proposals, add agency margin on top of estimate
3. **Track accuracy** - compare estimates to actuals, improve over time
4. **Use for qualification** - if estimate exceeds client budget, discuss scope reduction
5. **Version control** - save all estimates, compare when scope changes
6. **Be transparent** - share this report with clients (builds trust)

---

## 🛠️ Technical Implementation Notes

**For Cursor AI implementing this command:**

1. **Format detection is critical** - be robust in parsing multiple formats
2. **AI queries are expensive** - cache Perplexity responses for similar projects
3. **Confidence scoring** - penalize vague requirements heavily
4. **Historical learning** - implement actual vs. estimated tracking for future improvement
5. **Industry benchmarks** - hardcode reasonable defaults, update quarterly
6. **Output both formats** - markdown for humans, JSON for tools/integrations
7. **Interactive prompts** - if input missing, ask smart follow-up questions

**Performance:**
- Total runtime: ~2-3 minutes (AI queries are slow)
- Parallelize AI queries where possible
- Cache common tech stack recommendations

**Error Handling:**
- If Exa/Ref unavailable → Use hardcoded tech stack templates
- If parsing fails → Fall back to interactive prompts
- If confidence <50% → Warn user, recommend discovery call first

---

$END$

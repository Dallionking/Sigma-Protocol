---
name: cost-optimizer
description: "Cloud cost optimization analyzer - identify waste, suggest cheaper alternatives, forecast spending"
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

# cost-optimizer

**Source:** Sigma Protocol generators module
**Version:** 2.0.0

---


# @cost-optimizer

**Cloud infrastructure cost optimization with actionable recommendations**

## 🎯 Purpose

Reduce cloud spending without sacrificing performance. Research shows **35% of cloud spending is wasted** on over-provisioned resources, unused services, and suboptimal configurations. This command identifies cost-saving opportunities across your infrastructure.

**For agencies:** Reduces client operational costs, improves profit margins, demonstrates value beyond development.

---

## 📋 Command Usage

```bash
@cost-optimizer
@cost-optimizer --provider=vercel
@cost-optimizer --output=/docs/cost/
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--provider` | Cloud provider: `vercel`, `aws`, `supabase`, `all` | `all` |
| `--output` | Custom output directory | `/docs/cost/` |

---

## 📁 File Management (CRITICAL)

**File Strategy**: `append-dated` - Track cost optimizations

**Output**: `/docs/cost/COST-OPTIMIZATION-2025-11-06.md`

**Manifest**: `updateManifest('@cost-optimizer', filePath, 'append-dated')`

---

## 📦 What Gets Analyzed

### 1. Vercel (Hosting & Edge Functions)
- ✅ Plan tier appropriateness
- ✅ Bandwidth usage
- ✅ Function execution time
- ✅ Build minutes consumption
- ✅ Team seats utilization

### 2. Supabase (Database & Auth)
- ✅ Database size vs plan limits
- ✅ Storage usage (files)
- ✅ Bandwidth consumption
- ✅ Auth users vs plan limits
- ✅ Database connections

### 3. Third-Party Services
- ✅ Stripe fees (payment processing)
- ✅ Email service (Resend)
- ✅ Error tracking (Sentry)
- ✅ Analytics tools
- ✅ AI API costs (OpenAI, Perplexity)

### 4. General Optimizations
- ✅ Resource utilization
- ✅ Caching opportunities
- ✅ Image optimization
- ✅ Bundle size reduction
- ✅ Database query efficiency

---

## 📄 Cost Optimization Report

```markdown
# Cost Optimization Report
**Date:** November 6, 2025  
**Current Monthly Cost:** $147/month  
**Potential Savings:** $43/month (29%)  
**Optimized Cost:** $104/month

---

## 📊 Current Cost Breakdown

| Service | Plan | Monthly Cost | Usage | Status |
|---------|------|--------------|-------|--------|
| Vercel | Pro | $20 | 65% utilized | ⚠️ Optimize |
| Supabase | Pro | $25 | 42% utilized | ⚠️ Downgrade |
| Stripe | 2.9% + $0.30 | $87 | Variable | ✅ Optimal |
| Resend | Free | $0 | 2.1k/3k emails | ✅ Good |
| Sentry | Free | $0 | 4.5k/5k errors | ✅ Good |
| OpenAI | Pay-as-go | $15 | Variable | ⚠️ Optimize |
| **Total** | | **$147/mo** | | |

---

## 💰 Optimization Opportunities

### High Impact (Quick Wins)

#### 1. Downgrade Supabase Pro → Free ($25/mo savings)

**Current Usage:**
- Database: 240MB / 500MB (48%)
- Storage: 1.2GB / 8GB (15%)
- Bandwidth: 12GB / 250GB (5%)
- Auth Users: 234 / unlimited

**Analysis:**
You're only using 42% of Pro features. Free tier provides:
- 500MB database (you use 240MB ✅)
- 1GB storage (you use 1.2GB ❌)
- 2GB bandwidth (you use 12GB ❌)

**Recommendation:** Stay on Pro temporarily, but implement:
1. Image optimization (reduce storage by 600MB)
2. CDN for static assets (reduce bandwidth by 10GB)
3. Then downgrade next month

**Estimated Savings:** $25/month (after optimization)  
**Implementation Time:** 4-6 hours

---

#### 2. Optimize OpenAI API Usage ($8/mo savings)

**Current Usage:**
- PRD Generation: 120 requests/month @ $0.10 = $12
- Complexity Assessment: 50 requests/month @ $0.06 = $3
- **Total:** $15/month

**Issues:**
- Not caching repeated queries
- Using GPT-4 for all requests (expensive)
- No request batching

**Optimization:**
\`\`\`typescript
// Add Redis caching
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

async function generatePRD(input: string) {
  // Check cache first
  const cacheKey = \`prd:\${hashInput(input)}\`;
  const cached = await redis.get(cacheKey);
  if (cached) return cached;
  
  // Use GPT-3.5 for simple PRDs, GPT-4 for complex
  const model = isComplexPRD(input) ? 'gpt-4' : 'gpt-3.5-turbo';
  const result = await openai.chat.completions.create({
    model,
    messages: [...],
  });
  
  // Cache for 30 days
  await redis.set(cacheKey, result, { ex: 60 * 60 * 24 * 30 });
  
  return result;
}
\`\`\`

**Cost Breakdown After Optimization:**
- GPT-3.5 for 70% of requests: 84 req @ $0.002 = $0.17
- GPT-4 for 30% of requests: 36 req @ $0.10 = $3.60
- Upstash Redis: $3/month
- **New Total:** $6.77/month (was $15)

**Savings:** $8.23/month  
**Implementation Time:** 2 hours

---

#### 3. Optimize Vercel Bandwidth ($5/mo potential savings)

**Current Usage:**
- Bandwidth: 195GB / 1TB (19%)
- Function Invocations: 1.2M / unlimited

**Issues:**
- Serving uncompressed images
- No CDN for static assets
- Large JavaScript bundles

**Optimization:**

1. **Enable Image Optimization:**
\`\`\`javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
};
\`\`\`

2. **Add CDN (Cloudflare R2):**
- Store static assets on R2 ($0.015/GB vs Vercel bandwidth)
- Estimated savings: $5/month

**Savings:** $5/month  
**Implementation Time:** 3 hours

---

### Medium Impact

#### 4. Reduce Bundle Size (Indirect Savings)

**Current Bundle Size:**
- First Load JS: 287KB
- Largest Chunk: 142KB

**Optimization:**
\`\`\`bash
# Analyze bundle
npx @next/bundle-analyzer

# Remove unused dependencies
npx depcheck

# Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
});
\`\`\`

**Impact:**
- Faster page loads
- Lower bandwidth usage (indirect Vercel savings)
- Better Core Web Vitals

**Savings:** ~$3/month (indirect)  
**Implementation Time:** 4 hours

---

#### 5. Database Query Optimization

**Issues Detected:**
- 23 N+1 query patterns
- Missing indexes on frequently queried columns
- Suboptimal connection pooling

**Optimization:**
\`\`\`typescript
// Add indexes
await db.execute(\`
  CREATE INDEX idx_leads_email ON crm_leads(email);
  CREATE INDEX idx_leads_stage ON crm_leads(stage);
  CREATE INDEX idx_sessions_user ON intake_sessions(supabase_user_id);
\`);

// Use query batching
import { db } from '@/db';

// ❌ Bad (N+1)
const leads = await db.select().from(crmLeads);
for (const lead of leads) {
  const project = await db.select().from(crmProjects).where(eq(crmProjects.leadId, lead.id));
}

// ✅ Good (single query with join)
const leadsWithProjects = await db
  .select()
  .from(crmLeads)
  .leftJoin(crmProjects, eq(crmLeads.id, crmProjects.leadId));
\`\`\`

**Impact:**
- Faster queries (50% reduction in response time)
- Lower database CPU usage
- Better scalability

**Savings:** ~$2/month (lower resource usage)  
**Implementation Time:** 6 hours

---

### Low Impact (Long-term)

#### 6. Consider Reserved Instances (If Scaling)

**When:** Monthly cost exceeds $500/month

**Potential Savings:** 20-40% with annual commitments
- Vercel: No reserved pricing (contact sales for Enterprise)
- Supabase: 20% discount on annual billing
- AWS (if migrating): Up to 72% with Reserved Instances

**Not Applicable Now:** Current spending too low to benefit

---

## 📈 Cost Forecast

### Current Trajectory (No Changes)
\`\`\`
$200 ┤
$150 ┤       ●───●───● (Current: $147)
$100 ┤    ●
 $50 ┤  ●
  $0 ┤─────────────────────
     Jul Aug Sep Oct Nov
\`\`\`

**Projected 6-Month Cost:** $882 ($147/mo avg)

---

### After Optimizations
\`\`\`
$200 ┤
$150 ┤       ●
$100 ┤    ●───●───●───● (Optimized: $104)
 $50 ┤  ●
  $0 ┤─────────────────────
     Jul Aug Sep Oct Nov
\`\`\`

**Projected 6-Month Cost:** $624 ($104/mo avg)  
**Total Savings:** $258 over 6 months

---

## 🎯 Optimization Roadmap

### Month 1 (Quick Wins)
- [ ] Implement OpenAI caching (2h) → Save $8/mo
- [ ] Optimize images for Supabase storage (4h) → Enable downgrade
- [ ] Add database indexes (2h) → Improve performance

**Total Effort:** 8 hours  
**Monthly Savings:** $8/mo (immediate) + $25/mo (after storage optimization)

---

### Month 2 (Medium Wins)
- [ ] Downgrade Supabase to Free ($25/mo savings)
- [ ] Set up Cloudflare R2 CDN (3h) → Save $5/mo
- [ ] Reduce bundle size (4h) → Save $3/mo

**Total Effort:** 7 hours  
**Additional Monthly Savings:** $8/mo

---

### Month 3 (Long-term)
- [ ] Monitor and fine-tune
- [ ] Re-evaluate plan tiers based on growth
- [ ] Consider annual billing discounts

---

## 💡 Cost Monitoring & Alerts

### Set Up Alerts

**Vercel:**
\`\`\`bash
# Set bandwidth alert at 80% usage
# Via Vercel Dashboard → Settings → Usage Alerts
\`\`\`

**Supabase:**
\`\`\`bash
# Set database size alert at 400MB (80% of 500MB)
# Via Supabase Dashboard → Settings → Billing
\`\`\`

**OpenAI:**
\`\`\`javascript
// Track API usage in code
import { trackApiUsage } from '@/lib/analytics';

async function callOpenAI() {
  const result = await openai.chat.completions.create({...});
  
  // Log usage
  await trackApiUsage({
    model: 'gpt-4',
    tokens: result.usage.total_tokens,
    cost: calculateCost(result.usage),
  });
  
  return result;
}
\`\`\`

---

## 📊 Cost per Feature

| Feature | Monthly Cost | Usage | Cost per Use |
|---------|--------------|-------|--------------|
| Voice Intake | $4 | 120 sessions | $0.03 |
| PRD Generation | $12 | 120 PRDs | $0.10 |
| Complexity Assessment | $3 | 50 assessments | $0.06 |
| CRM Operations | $8 | Unlimited | N/A |
| Hosting & CDN | $20 | Unlimited | N/A |
| Database | $25 | Unlimited | N/A |
| Payment Processing | $87 | 300 transactions | $0.29 |

**Most Expensive Feature:** Payment Processing (59% of total cost)  
**Note:** Stripe fees unavoidable (standard industry rate)

---

## 🔍 Hidden Costs Identified

1. **Unused Vercel Team Seats** (1 seat @ $20/mo)
   - Remove inactive team member
   - Savings: $20/mo

2. **Redundant Error Tracking**
   - Using both Sentry (free) + Vercel Errors (included)
   - Recommendation: Stick with one
   - Savings: $0 (both free, but simplifies)

3. **Over-provisioned Database Connections**
   - Max pool: 50 connections
   - Actual usage: Peak 18 connections
   - Recommendation: Reduce to 25
   - Savings: Minimal, but better resource usage

---

## 🎯 Summary

### Current State
- **Monthly Cost:** $147
- **Utilization:** 65% (under-utilized)
- **Waste:** ~35% ($51/mo)

### After Optimization
- **Monthly Cost:** $104 (-29%)
- **Utilization:** 85% (optimal)
- **Waste:** ~15% ($16/mo)

### Total Savings
- **Monthly:** $43
- **Yearly:** $516
- **Implementation Time:** ~15 hours
- **ROI:** $516 / 15 hours = $34/hour

---

## 🔗 Resources

- [Vercel Pricing](https://vercel.com/pricing)
- [Supabase Pricing](https://supabase.com/pricing)
- [AWS Cost Calculator](https://calculator.aws/)
- [FinOps Best Practices](https://www.finops.org/)

---

## 📅 Review Schedule

- **Weekly:** Monitor usage dashboards
- **Monthly:** Review this report, adjust as needed
- **Quarterly:** Re-evaluate plan tiers based on growth

---

**Next Review:** December 6, 2025

$END$
```

---

## 🛠️ Implementation Phases

### Phase 1: Gather Cost Data

**Read configuration files:**
```typescript
async function gatherCostData() {
  const vercelJson = await detectVercelUsage();
  const supabaseConfig = await detectSupabaseUsage();
  const packageJson = JSON.parse(await readFile('package.json'));
  
  return {
    vercel: vercelJson,
    supabase: supabaseConfig,
    dependencies: packageJson.dependencies,
  };
}
```

---

### Phase 2: Analyze Usage vs Limits

**Calculate utilization:**
```typescript
interface ServiceUsage {
  service: string;
  plan: string;
  cost: number;
  usage: {
    metric: string;
    used: number;
    limit: number;
    percentage: number;
  }[];
}

function analyzeUtilization(usage: ServiceUsage): string {
  const avgUtilization = usage.usage.reduce((sum, u) => sum + u.percentage, 0) / usage.usage.length;
  
  if (avgUtilization < 50) return 'Under-utilized (consider downgrade)';
  if (avgUtilization < 80) return 'Good utilization';
  if (avgUtilization < 95) return 'Near limit (consider upgrade soon)';
  return 'Over limit (upgrade immediately)';
}
```

---

### Phase 3: Identify Optimization Opportunities

**Use AI for recommendations:**
```typescript
async function generateOptimizations(costData: CostData): Promise<Optimization[]> {
  const recommendations = await mcp_perplexity_ask([{
    role: 'user',
    content: `Given this cloud infrastructure setup: ${JSON.stringify(costData)}, what are the top 3 cost optimization opportunities? Consider caching, right-sizing, and alternative services.`
  }]);
  
  return parseRecommendations(recommendations);
}
```

---

### Phase 4: Calculate Potential Savings

**ROI analysis:**
```typescript
interface Optimization {
  title: string;
  impact: 'high' | 'medium' | 'low';
  savings: number; // $/month
  implementationHours: number;
  risk: 'low' | 'medium' | 'high';
}

function calculateROI(opt: Optimization): number {
  const yearlySavings = opt.savings * 12;
  const implementationCost = opt.implementationHours * 50; // $50/hour
  
  return yearlySavings / implementationCost;
}

function prioritizeOptimizations(opts: Optimization[]): Optimization[] {
  return opts.sort((a, b) => {
    // High impact + low effort = highest priority
    const scoreA = (a.impact === 'high' ? 3 : a.impact === 'medium' ? 2 : 1) / a.implementationHours;
    const scoreB = (b.impact === 'high' ? 3 : b.impact === 'medium' ? 2 : 1) / b.implementationHours;
    return scoreB - scoreA;
  });
}
```

---

### Phase 5: Generate Cost Forecast

**Project future costs:**
```typescript
function forecastCosts(currentCost: number, growthRate: number, months: number): number[] {
  const forecast = [currentCost];
  
  for (let i = 1; i < months; i++) {
    forecast.push(forecast[i - 1] * (1 + growthRate));
  }
  
  return forecast;
}
```

---

### Phase 6: Validation & Output

**Final checks:**
- [ ] All services analyzed
- [ ] Optimizations prioritized by ROI
- [ ] Savings calculated
- [ ] Implementation time estimated
- [ ] Risks identified

**Output summary:**
```
✅ Cost Optimization Analysis Complete

💰 Current Monthly Cost: $147
📉 Potential Savings: $43/month (29%)
✨ Optimized Cost: $104/month

Top Opportunities:
  1. Downgrade Supabase → $25/mo (4-6h)
  2. Optimize OpenAI usage → $8/mo (2h)
  3. Optimize Vercel bandwidth → $5/mo (3h)

📊 ROI: $516/year savings for ~15h effort

📄 Report: /docs/cost/COST-OPTIMIZATION-2025-11-06.md

Next Review: December 6, 2025
```

---

## 🎯 Success Metrics

**Optimization Quality:**
- Savings identified >20% ✅
- ROI >$30/hour ✅
- Risks assessed ✅
- Implementation time estimated ✅

---

## 🔄 Maintenance

**Run quarterly** to identify new optimization opportunities as usage patterns change.

---

## 💡 Pro Tips

1. **Set usage alerts** - Catch overages early
2. **Annual billing** - Save 10-20% if predictable
3. **Monitor trends** - Sudden spikes indicate issues
4. **Right-size early** - Don't over-provision "just in case"
5. **Review unused services** - Cancel what you don't use
6. **Negotiate enterprise** - Once spending >$1k/month
7. **Track per-feature costs** - Identify expensive features

---

$END$

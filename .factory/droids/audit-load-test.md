---
name: load-test
description: "Automated load testing and performance benchmarking - simulate traffic, identify bottlenecks, capacity planning"
model: claude-sonnet-4-5-20241022
reasoningEffort: high
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# load-test

**Source:** Sigma Protocol audit module
**Version:** 2.0.0

---


# @load-test

**Automated load testing and performance benchmarking**

## 🎯 Purpose

Proactively identify performance bottlenecks before they impact production users. Research shows that **60% of agencies skip load testing**, leading to production outages and poor user experiences during traffic spikes. This command simulates realistic user traffic to validate your application can handle the load.

**For agencies:** Prevents embarrassing production failures, validates infrastructure capacity, and provides data-driven scaling recommendations.

---

## 📋 Command Usage

```bash
@load-test
@load-test --scenario=smoke
@load-test --users=1000 --duration=5m
@load-test --scenario=spike --output=/docs/performance/
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--scenario` | Test scenario: `smoke`, `load`, `stress`, `spike`, `soak` | `load` |
| `--users` | Concurrent users to simulate | Auto-detect from scenario |
| `--duration` | Test duration (e.g., `30s`, `5m`, `1h`) | Auto-detect from scenario |
| `--output` | Custom output directory | `/docs/performance/load-tests/` |

---

## 📁 File Management (CRITICAL)

**File Strategy**: `append-dated` - Track performance baselines over time

**Output**: `/docs/performance/LOAD-TEST-2025-11-06.md`

**Manifest**: `updateManifest('@load-test', filePath, 'append-dated')`

---

## 🎯 Test Scenarios

### 1. Smoke Test (Quick Validation)
**Purpose:** Verify system works under minimal load  
**Users:** 1-5 concurrent  
**Duration:** 30 seconds  
**Use case:** After deployment, quick sanity check

```bash
@load-test --scenario=smoke
```

**What it tests:**
- All critical endpoints respond
- No obvious errors
- Basic functionality works

---

### 2. Load Test (Normal Traffic)
**Purpose:** Validate performance under expected load  
**Users:** 50-100 concurrent (based on analytics)  
**Duration:** 5 minutes  
**Use case:** Pre-release validation

```bash
@load-test --scenario=load
```

**What it tests:**
- Average response times
- Error rates under normal load
- Resource utilization
- Database performance

---

### 3. Stress Test (Breaking Point)
**Purpose:** Find maximum capacity before failure  
**Users:** Ramp from 0 → 500+ (until failure)  
**Duration:** 10 minutes  
**Use case:** Capacity planning

```bash
@load-test --scenario=stress
```

**What it tests:**
- Maximum concurrent users
- Failure threshold
- Degradation patterns
- Recovery behavior

---

### 4. Spike Test (Sudden Traffic)
**Purpose:** Validate behavior during traffic spikes  
**Users:** 0 → 200 → 0 (sudden jump)  
**Duration:** 3 minutes  
**Use case:** Marketing campaign, viral content

```bash
@load-test --scenario=spike
```

**What it tests:**
- Auto-scaling response
- Rate limiting effectiveness
- Cache warming
- Error handling under sudden load

---

### 5. Soak Test (Endurance)
**Purpose:** Identify memory leaks and degradation  
**Users:** 50 concurrent (sustained)  
**Duration:** 1 hour  
**Use case:** Before major releases

```bash
@load-test --scenario=soak
```

**What it tests:**
- Memory leaks
- Connection pool exhaustion
- Log file growth
- Long-term stability

---

## 📦 What Gets Generated

### Output Structure

```
/docs/performance/load-tests/
  ├── LOAD-TEST-2025-11-06-14-30.md          # Test report
  ├── LOAD-TEST-2025-11-06-14-30.json        # Raw metrics
  ├── charts/
  │   ├── response-times.png                 # Response time chart
  │   ├── throughput.png                     # Requests/sec chart
  │   └── error-rate.png                     # Error rate chart
  └── _history/
      └── LOAD-TEST-2025-10-01.md            # Previous tests
```

---

## 📄 Test Report Format

```markdown
# Load Test Report
**Date:** November 6, 2025 14:30:00 UTC  
**Scenario:** Load Test (Normal Traffic)  
**Duration:** 5 minutes  
**Target:** https://staging.example.com

---

## 📊 Summary

**Result:** ✅ PASS  
**Peak Concurrent Users:** 100  
**Total Requests:** 15,247  
**Success Rate:** 99.8%  
**Avg Response Time:** 142ms

**Status:** System performed well under normal load. No critical issues detected.

---

## 🎯 Key Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Avg Response Time | 142ms | <500ms | ✅ Excellent |
| P95 Response Time | 387ms | <1000ms | ✅ Excellent |
| P99 Response Time | 621ms | <2000ms | ✅ Good |
| Max Response Time | 1,834ms | <5000ms | ✅ Acceptable |
| Requests/Second | 50.8 req/s | >10 req/s | ✅ Excellent |
| Error Rate | 0.2% | <1% | ✅ Excellent |
| Timeout Rate | 0% | <0.1% | ✅ Excellent |

---

## 📈 Response Time Distribution

```
    0ms ┤
  500ms ┤ ████████████████████████████░░░░
 1000ms ┤ ██████░░░░░░░░░░░░░░░░░░░░░░░░░
 1500ms ┤ ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 2000ms ┤ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
        └──────────────────────────────────
         0s      1m      2m      3m      4m      5m

Legend:
  50th percentile (median): 128ms
  75th percentile: 245ms
  95th percentile: 387ms
  99th percentile: 621ms
```

---

## 🚦 Throughput (Requests/Second)

```
60 req/s ┤
50 req/s ┤ ███████████████████████████████
40 req/s ┤ ███████████████████████████████
30 req/s ┤ ███████████████████████████████
20 req/s ┤ ███████████████████████████████
10 req/s ┤ ███████████████████████████████
         └─────────────────────────────────
          0s  1m  2m  3m  4m  5m

Avg: 50.8 req/s
Peak: 58.3 req/s
Min: 42.1 req/s
```

---

## ❌ Error Analysis

**Total Errors:** 31 (0.2% of requests)

| Error Type | Count | % | Example |
|------------|-------|---|---------|
| 500 Internal Server Error | 18 | 58% | POST /api/prd/generate |
| 429 Rate Limit Exceeded | 8 | 26% | GET /api/crm/leads |
| 503 Service Unavailable | 3 | 10% | GET /dashboard |
| 504 Gateway Timeout | 2 | 6% | POST /api/intake/session |

**Root Causes:**
1. **PRD Generation Timeout:** 18 errors on `/api/prd/generate`
   - Issue: AI processing takes >30s for complex PRDs
   - Recommendation: Increase timeout to 60s OR implement async processing

2. **Rate Limiting:** 8 errors on `/api/crm/leads`
   - Issue: Individual users hitting rate limit during load test
   - Status: Working as intended (expected behavior)

3. **Database Connection Pool:** 3 errors during peak load
   - Issue: Connection pool exhausted (max 20 connections)
   - Recommendation: Increase pool size to 50

---

## 🔍 Endpoint Performance

| Endpoint | Requests | Avg Time | P95 Time | Errors |
|----------|----------|----------|----------|--------|
| GET / | 1,524 | 87ms | 142ms | 0 |
| GET /dashboard | 1,203 | 312ms | 478ms | 3 |
| POST /api/auth/login | 102 | 456ms | 687ms | 0 |
| GET /api/crm/leads | 4,521 | 124ms | 289ms | 8 |
| POST /api/crm/leads | 312 | 201ms | 398ms | 0 |
| POST /api/prd/generate | 89 | 2,834ms | 4,521ms | 18 |
| GET /api/intake/session | 2,103 | 95ms | 178ms | 0 |
| POST /api/intake/answer | 3,421 | 142ms | 312ms | 2 |

**Slowest Endpoints:**
1. `POST /api/prd/generate` - 2.8s avg (AI processing)
2. `POST /api/auth/login` - 456ms avg (bcrypt hashing)
3. `GET /dashboard` - 312ms avg (complex query)

---

## 💻 System Resources

### CPU Usage
```
100% ┤
 75% ┤     ████████
 50% ┤  ████████████████
 25% ┤ ████████████████████
  0% ┤─────────────────────────
      0s  1m  2m  3m  4m  5m

Avg: 42%
Peak: 78%
Recommendation: ✅ Healthy (headroom available)
```

### Memory Usage
```
4GB ┤
3GB ┤     ██████████████
2GB ┤  ████████████████████
1GB ┤─────────────────────────
     0s  1m  2m  3m  4m  5m

Avg: 1.8GB
Peak: 2.4GB
Limit: 4GB
Recommendation: ✅ Healthy (40% headroom)
```

### Database Connections
```
50 ┤
40 ┤
30 ┤
20 ┤ ██████████████████████░
10 ┤ ████████████████████████
 0 ┤─────────────────────────
    0s  1m  2m  3m  4m  5m

Avg: 12 connections
Peak: 18 connections
Limit: 20 connections
Recommendation: ⚠️ Increase pool to 50 (90% utilization at peak)
```

---

## 🎯 Recommendations

### Critical (Fix Before Production)
None identified. System stable under normal load.

### High Priority (Fix Before Next Release)
1. **Increase Database Connection Pool**
   - Current: 20 connections
   - Recommended: 50 connections
   - Effort: 5 minutes (env var change)
   - Impact: Prevents 503 errors during peak traffic

2. **Increase PRD Generation Timeout**
   - Current: 30 seconds
   - Recommended: 60 seconds
   - Effort: 10 minutes
   - Impact: Reduces 500 errors for complex PRDs

### Medium Priority (Plan for Next Quarter)
3. **Implement Async PRD Generation**
   - Use background job queue (BullMQ/Inngest)
   - Return job ID immediately, poll for completion
   - Effort: 8 hours
   - Impact: Better UX, no timeouts

4. **Add Redis Caching**
   - Cache `/api/crm/leads` responses (5 min TTL)
   - Reduce database load by ~60%
   - Effort: 4 hours
   - Cost: +$10/month

---

## 📊 Capacity Planning

**Current Capacity:**
- **Concurrent Users:** 100 (tested)
- **Requests/Second:** 50.8 avg
- **Est. Daily Users:** ~5,000 (extrapolated)

**Scaling Triggers:**
| User Growth | Action | Cost Impact |
|-------------|--------|-------------|
| 1,000 daily users | Current setup OK | $0 |
| 5,000 daily users | Add Redis cache | +$10/month |
| 10,000 daily users | Increase DB pool to 100 | +$0 |
| 25,000 daily users | Upgrade Vercel to Pro | +$20/month |
| 50,000 daily users | Add read replica | +$50/month |
| 100,000+ daily users | Horizontal scaling | +$200+/month |

**Recommendation:** Current infrastructure can handle 5,000 daily users comfortably. Monitor and plan Redis caching when approaching 5,000 users.

---

## 🔗 Related Tests

- Previous load test: [LOAD-TEST-2025-10-01.md](../_history/LOAD-TEST-2025-10-01.md)
- Performance baseline: [BASELINE-2025-11-01.md](../BASELINE-2025-11-01.md)
- Security audit: [SECURITY-AUDIT-2025-11-01.md](../../security/SECURITY-AUDIT-2025-11-01.md)

---

## 🧪 Test Configuration

**Tool:** k6 (open-source load testing)  
**Test Script:** `/scripts/load-test.js`  
**Virtual Users:** 100 concurrent  
**Ramp-Up:** 30 seconds  
**Steady State:** 4 minutes  
**Ramp-Down:** 30 seconds

**Endpoints Tested:**
- Homepage (25% of traffic)
- Dashboard (20% of traffic)
- API endpoints (55% of traffic)

**User Behavior:**
- Login → Browse dashboard → View leads → Create lead → Logout

---

**Next Load Test:** December 6, 2025 (monthly)

$END$
```

---

## 🛠️ Implementation Phases

### Phase 1: Prerequisites & Setup

**Check if k6 is installed:**
```bash
k6 version || npx k6 version || echo "Installing k6..."
```

**If not installed:**
```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Windows
choco install k6

# Or use Docker
docker pull grafana/k6
```

---

### Phase 2: Generate Test Script

**Create k6 test script based on scenario:**

```javascript
// /scripts/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 }, // Ramp up
        { duration: '4m', target: 100 },  // Steady state
        { duration: '30s', target: 0 },   // Ramp down
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // 95% of requests under 1s
    'http_req_failed': ['rate<0.01'],    // Error rate under 1%
    'errors': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Homepage
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'homepage status 200': (r) => r.status === 200,
    'homepage loads <500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  sleep(1);
  
  // Login
  res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'test123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, {
    'login status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  const authToken = res.json('token');
  sleep(1);
  
  // Dashboard
  res = http.get(`${BASE_URL}/dashboard`, {
    headers: { 'Authorization': `Bearer ${authToken}` },
  });
  check(res, {
    'dashboard status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(2);
  
  // CRM Leads
  res = http.get(`${BASE_URL}/api/crm/leads`, {
    headers: { 'Authorization': `Bearer ${authToken}` },
  });
  check(res, {
    'leads status 200': (r) => r.status === 200,
    'leads loads <500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  sleep(3);
  
  // Create Lead
  res = http.post(`${BASE_URL}/api/crm/leads`, JSON.stringify({
    name: `Test Lead ${__VU}-${__ITER}`,
    email: `test${__VU}@example.com`,
    company: 'Test Company',
  }), {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
  check(res, {
    'create lead status 201': (r) => r.status === 201,
  }) || errorRate.add(1);
  sleep(2);
}

export function handleSummary(data) {
  return {
    '/tmp/k6-summary.json': JSON.stringify(data),
  };
}
```

**Scenario-specific configurations:**
```javascript
const SCENARIOS = {
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '30s',
  },
  load: {
    executor: 'ramping-vus',
    stages: [
      { duration: '30s', target: 100 },
      { duration: '4m', target: 100 },
      { duration: '30s', target: 0 },
    ],
  },
  stress: {
    executor: 'ramping-vus',
    stages: [
      { duration: '2m', target: 100 },
      { duration: '2m', target: 200 },
      { duration: '2m', target: 300 },
      { duration: '2m', target: 400 },
      { duration: '2m', target: 500 },
    ],
  },
  spike: {
    executor: 'ramping-vus',
    stages: [
      { duration: '10s', target: 200 },  // Spike
      { duration: '1m', target: 200 },
      { duration: '10s', target: 0 },    // Drop
    ],
  },
  soak: {
    executor: 'constant-vus',
    vus: 50,
    duration: '1h',
  },
};
```

---

### Phase 3: Run Load Test

**Execute k6:**
```bash
k6 run \
  --out json=/tmp/k6-results.json \
  --summary-export=/tmp/k6-summary.json \
  /scripts/load-test.js
```

**Monitor in real-time:**
```
          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: /scripts/load-test.js
     output: json (/tmp/k6-results.json)

  scenarios: (100.00%) 1 scenario, 100 max VUs, 5m30s max duration

     ✓ homepage status 200
     ✓ login status 200
     ✓ dashboard status 200

     checks.........................: 99.80% ✓ 45723 ✗ 91
     data_received..................: 45 MB  150 kB/s
     data_sent......................: 15 MB  50 kB/s
     http_req_duration..............: avg=142ms p(95)=387ms
     http_req_failed................: 0.20%  ✓ 31 ✗ 15216
     http_reqs......................: 15247  50.82/s
     iterations.....................: 3061   10.20/s
     vus............................: 1      min=1 max=100
     vus_max........................: 100    min=100 max=100
```

---

### Phase 4: Parse Results & Generate Report

**Parse k6 JSON output:**
```typescript
interface K6Results {
  metrics: {
    http_req_duration: { values: { avg: number; p95: number; p99: number; max: number } };
    http_reqs: { values: { count: number; rate: number } };
    http_req_failed: { values: { rate: number } };
    checks: { values: { rate: number } };
  };
  root_group: {
    checks: Check[];
  };
}

async function parseK6Results(jsonPath: string): Promise<LoadTestResults> {
  const raw = JSON.parse(await readFile(jsonPath));
  
  return {
    summary: {
      totalRequests: raw.metrics.http_reqs.values.count,
      avgResponseTime: Math.round(raw.metrics.http_req_duration.values.avg),
      p95ResponseTime: Math.round(raw.metrics.http_req_duration.values.p95),
      p99ResponseTime: Math.round(raw.metrics.http_req_duration.values.p99),
      maxResponseTime: Math.round(raw.metrics.http_req_duration.values.max),
      requestsPerSecond: raw.metrics.http_reqs.values.rate,
      errorRate: raw.metrics.http_req_failed.values.rate * 100,
      successRate: raw.metrics.checks.values.rate * 100,
    },
    endpoints: groupByEndpoint(raw),
    errors: extractErrors(raw),
  };
}
```

---

### Phase 5: Generate Visualizations

**Create ASCII charts for markdown:**
```typescript
function generateResponseTimeChart(metrics: number[]): string {
  const max = Math.max(...metrics);
  const buckets = [0, 500, 1000, 1500, 2000];
  
  const histogram = buckets.map((bucket, i) => {
    const nextBucket = buckets[i + 1] || Infinity;
    const count = metrics.filter(m => m >= bucket && m < nextBucket).length;
    const percentage = (count / metrics.length) * 100;
    const bars = Math.round(percentage / 3); // Scale to fit
    
    return `${bucket.toString().padStart(6)}ms ┤ ${'█'.repeat(bars)}${'░'.repeat(30 - bars)}`;
  });
  
  return histogram.join('\n');
}
```

**Generate PNG charts (optional, requires external tool):**
```bash
# Use gnuplot or similar
gnuplot -e "set terminal png; plot '/tmp/k6-results.csv'" > response-times.png
```

---

### Phase 6: System Resource Monitoring

**Collect system metrics during test:**
```bash
# Start monitoring in background
while [ -f /tmp/load-test-running ]; do
  echo "$(date +%s),$(ps aux | awk '{sum+=$3} END {print sum}'),$(free -m | awk 'NR==2{print $3}')" >> /tmp/system-metrics.csv
  sleep 5
done
```

**Parse and include in report:**
```typescript
interface SystemMetrics {
  timestamp: number;
  cpuPercent: number;
  memoryMB: number;
}

function parseSystemMetrics(csvPath: string): SystemMetrics[] {
  const lines = readFileSync(csvPath, 'utf-8').split('\n');
  return lines.map(line => {
    const [timestamp, cpu, memory] = line.split(',');
    return {
      timestamp: parseInt(timestamp),
      cpuPercent: parseFloat(cpu),
      memoryMB: parseInt(memory),
    };
  });
}
```

---

### Phase 7: Generate Recommendations

**AI-powered analysis:**
```typescript
async function generateRecommendations(results: LoadTestResults): Promise<string[]> {
  const recommendations: string[] = [];
  
  // High error rate
  if (results.summary.errorRate > 1) {
    recommendations.push({
      priority: 'critical',
      title: 'High error rate detected',
      description: `${results.summary.errorRate.toFixed(1)}% of requests failed`,
      action: 'Investigate error logs and fix root causes',
    });
  }
  
  // Slow response times
  if (results.summary.p95ResponseTime > 1000) {
    recommendations.push({
      priority: 'high',
      title: 'Slow P95 response time',
      description: `95th percentile at ${results.summary.p95ResponseTime}ms (target: <1000ms)`,
      action: 'Profile slow endpoints, add caching, or optimize queries',
    });
  }
  
  // Database connection pool exhaustion
  const dbErrors = results.errors.filter(e => e.message.includes('connection pool'));
  if (dbErrors.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Database connection pool exhausted',
      description: `${dbErrors.length} requests failed due to connection limits`,
      action: 'Increase connection pool size from 20 to 50',
    });
  }
  
  return recommendations;
}
```

---

### Phase 8: Validation & Output

**Final checks:**
- [ ] k6 test completed successfully
- [ ] Results parsed correctly
- [ ] Metrics within acceptable ranges
- [ ] Recommendations generated
- [ ] Report saved
- [ ] Charts created

**Output summary:**
```
✅ Load Test Complete

🎯 Scenario: Load Test (Normal Traffic)
👥 Peak Users: 100 concurrent
⏱️  Duration: 5 minutes
📊 Total Requests: 15,247

Results:
  ✅ Success Rate: 99.8%
  ✅ Avg Response: 142ms
  ✅ P95 Response: 387ms
  ✅ Throughput: 50.8 req/s
  ⚠️ Errors: 31 (0.2%)

📄 Report: /docs/performance/load-tests/LOAD-TEST-2025-11-06-14-30.md
📊 Metrics: /docs/performance/load-tests/LOAD-TEST-2025-11-06-14-30.json

🎯 Top Recommendations:
  1. Increase DB connection pool (5min, high priority)
  2. Increase PRD timeout (10min, high priority)
  3. Add Redis caching (4h, medium priority)

📈 Capacity: System can handle 5,000 daily users comfortably

Next Load Test: December 6, 2025 (monthly)
```

---

## 🎯 Success Metrics

**Test Quality Indicators:**
- Test completed without crashing ✅
- All endpoints tested ✅
- Realistic user behavior simulated ✅
- System resources monitored ✅
- Recommendations actionable ✅

**System Health Indicators:**
- Error rate <1% ✅
- P95 response time <1000ms ✅
- No timeouts ✅
- Resources within limits ✅

---

## 🔄 Maintenance

**This command should be run:**
- **Monthly:** Regular performance validation
- **Pre-Release:** Before major deployments
- **After Scaling:** Validate new infrastructure
- **Marketing Campaigns:** Before traffic spikes

**Command to run specific scenario:**
```bash
@load-test --scenario=spike  # Before viral campaign
@load-test --scenario=soak   # Before major release
@load-test --scenario=stress # For capacity planning
```

---

## 💡 Pro Tips

1. **Test staging first** - Never load test production
2. **Warm up caches** - Run smoke test before load test
3. **Monitor in real-time** - Use APM tools (Datadog, New Relic)
4. **Test after fixes** - Verify improvements worked
5. **Gradually increase load** - Don't jump to max immediately
6. **Include in CI/CD** - Automated performance gates
7. **Share with clients** - Demonstrate performance commitment

---

## 🛠️ Technical Implementation Notes

**For Cursor AI implementing this command:**

1. **Use k6** - Industry-standard, better than Artillery/JMeter
2. **Generate realistic scripts** - Mimic actual user behavior
3. **Monitor system resources** - CPU, memory, DB connections
4. **Parse JSON output** - k6 provides structured data
5. **Generate charts** - ASCII for markdown, PNG for reports
6. **AI recommendations** - Analyze patterns, suggest fixes
7. **Historical comparison** - Track performance over time

**Performance:**
- Test runtime: Varies by scenario (30s to 1h)
- Report generation: ~30 seconds
- Chart generation: ~10 seconds

**Error Handling:**
- If k6 not installed → Provide installation instructions
- If target unreachable → Fail fast, suggest troubleshooting
- If test crashes → Save partial results, warn user
- If metrics missing → Skip charts, note in report

---

$END$

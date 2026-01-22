# Step 10: Deployment Setup

> Deployment configuration and CI/CD pipeline

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     GitHub                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Repository                           │   │
│  │  main ─────────────────────────────────────────   │   │
│  │         │                                         │   │
│  │         └──────────────> Preview PRs              │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
└──────────────────────────│───────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      Vercel                              │
│  ┌────────────────┐  ┌────────────────┐                │
│  │  Production    │  │   Preview      │                │
│  │  (main)        │  │   (PRs)        │                │
│  │                │  │                │                │
│  │  sigmatrade.   │  │  pr-123.       │                │
│  │  vercel.app    │  │  vercel.app    │                │
│  └────────────────┘  └────────────────┘                │
│                                                          │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     Supabase                             │
│  ┌────────────────┐  ┌────────────────┐                │
│  │  Production    │  │  Development   │                │
│  │  Project       │  │  Project       │                │
│  └────────────────┘  └────────────────┘                │
└──────────────────────────────────────────────────────────┘
```

## Vercel Configuration

### vercel.json

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Environment Variables

### Production (.env.production)

```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Development (.env.local)

```bash
# Supabase (Development)
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-key
```

## GitHub Actions CI/CD

### .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  build:
    runs-on: ubuntu-latest
    needs: [lint, type-check, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

### .github/workflows/deploy.yml

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Database Migrations

### Supabase CLI Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref
```

### Migration Workflow

```bash
# Create new migration
supabase migration new add_feature_x

# Apply migrations to local
supabase db reset

# Push to production
supabase db push
```

### CI Migration Check

```yaml
# .github/workflows/migration-check.yml
name: Migration Check

on:
  pull_request:
    paths:
      - 'supabase/migrations/**'

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase db lint
      - run: supabase db diff --use-migra
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Type check passing
- [ ] Lint errors resolved
- [ ] Environment variables configured
- [ ] Database migrations reviewed

### Post-Deployment

- [ ] Smoke test critical paths
- [ ] Check error monitoring
- [ ] Verify SSL certificate
- [ ] Test authentication flow
- [ ] Verify real-time connections

## Rollback Procedure

```bash
# Via Vercel Dashboard
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "Promote to Production"

# Via CLI
vercel rollback [deployment-url]
```

## Custom Domain Setup

```bash
# Add domain in Vercel
vercel domains add sigmatrade.com

# Configure DNS
# A Record: @ -> 76.76.21.21
# CNAME: www -> cname.vercel-dns.com
```

## Next Steps

Proceed to Step 11: Monitoring Setup.



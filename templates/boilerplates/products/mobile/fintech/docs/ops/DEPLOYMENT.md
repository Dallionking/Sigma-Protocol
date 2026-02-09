# Trading Platform - Deployment Strategy

**Version:** 1.0  
**Date:** 2025-12-11

---

## Deployment Overview

| Environment | Purpose | Database | Deploy Trigger |
|-------------|---------|----------|----------------|
| **Development** | Local dev | Supabase Local | `npm start` |
| **Preview** | PR testing | Supabase Branch | PR opened |
| **Staging** | Pre-production | Supabase Staging | Merge to `develop` |
| **Production** | Live users | Supabase Production | Merge to `main` |

---

## Mobile App Deployment (EAS)

### EAS Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "resourceClass": "m1-large"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "developer@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD1234"
      }
    }
  }
}
```

### Build Commands

```bash
# Development build (with dev client)
eas build --profile development --platform ios

# Preview build (for TestFlight internal testing)
eas build --profile preview --platform ios

# Production build
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios --latest
```

### OTA Updates

```bash
# Create update for staging
eas update --branch staging --message "Fix balance display bug"

# Create update for production
eas update --branch production --message "v1.0.1 hotfix"
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test

  build-preview:
    if: github.event_name == 'pull_request'
    needs: [lint-and-type-check, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g eas-cli
      - run: npm ci
      - run: eas build --profile preview --platform ios --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: [lint-and-type-check, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g eas-cli
      - run: npm ci
      - run: eas update --branch staging --message "${{ github.event.head_commit.message }}"
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [lint-and-type-check, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g eas-cli
      - run: npm ci
      - run: eas build --profile production --platform ios --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## Supabase Deployment

### Database Migrations

```bash
# Create a new migration
supabase migration new add_income_events_table

# Apply migrations to local
supabase db reset

# Push migrations to remote
supabase db push

# Pull remote schema (for syncing)
supabase db pull
```

### Edge Functions Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy plaid-create-link-token

# Deploy with secrets
supabase secrets set PLAID_CLIENT_ID=xxx PLAID_SECRET=xxx
```

### Environment Management

```bash
# Link to staging project
supabase link --project-ref staging-project-ref

# Link to production project
supabase link --project-ref production-project-ref
```

---

## Release Process

### Version Numbering

Follow semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes, major features
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes, small improvements

### Release Checklist

```markdown
## Pre-Release Checklist

### Code Quality
- [ ] All tests passing
- [ ] Lint errors resolved
- [ ] TypeScript errors resolved
- [ ] Code review approved

### Testing
- [ ] Manual testing on staging
- [ ] E2E tests passing (Maestro)
- [ ] Performance regression check
- [ ] Security scan clean

### Database
- [ ] Migrations tested on staging
- [ ] Rollback plan documented
- [ ] Data backup verified

### App Store
- [ ] App Store metadata updated
- [ ] Screenshots current
- [ ] Privacy policy updated (if needed)
- [ ] What's New text prepared

### Release
- [ ] Version bumped in app.json
- [ ] Changelog updated
- [ ] Release notes prepared
- [ ] Team notified
```

### Rollback Procedures

#### OTA Rollback

```bash
# List recent updates
eas update:list

# Rollback to previous update
eas update:rollback --branch production
```

#### App Store Rollback

If critical issue in production build:
1. Disable problematic features via feature flags
2. Submit emergency patch build
3. Request expedited review from Apple

#### Database Rollback

```bash
# Revert last migration
supabase migration revert

# Restore from backup (if needed)
# Contact Supabase support for point-in-time recovery
```

---

## Feature Flags

Use environment variables or remote config for feature toggles:

```typescript
// lib/featureFlags.ts
export const featureFlags = {
  FOUNDING_MEMBER_ENABLED: process.env.EXPO_PUBLIC_ENABLE_FOUNDING_MEMBER === 'true',
  ELITE_UI_ENABLED: process.env.EXPO_PUBLIC_ENABLE_ELITE_UI === 'true',
  PLAID_SANDBOX: process.env.EXPO_PUBLIC_PLAID_ENVIRONMENT === 'sandbox',
};

// Usage
if (featureFlags.FOUNDING_MEMBER_ENABLED) {
  showFoundingMemberBadge();
}
```

---

## Deployment Monitoring

### Post-Deploy Checks

1. **Smoke Tests**
   - App launches successfully
   - Login works
   - Balance displays
   - Realtime updates working

2. **Metrics Watch**
   - Error rate stable
   - Latency within bounds
   - No crash spike

3. **User Feedback**
   - Monitor App Store reviews
   - Check support tickets
   - Watch social mentions

### Deployment Alerts

```yaml
# Alert on deployment
- condition: deployment_completed
  action: notify_slack
  channels: [#releases, #engineering]
  
# Alert on deployment failure
- condition: deployment_failed
  action: page_oncall
```

---

*Deployment strategy ready for implementation.*




# Deployment Guide - Sigma Protocol Landing Page

## Vercel Deployment (Recommended)

### Option 1: GitHub Integration

1. Push landing-page directory to GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Configure project settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `landing-page`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

5. Add environment variables:
   ```
   NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key (optional)
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com (optional)
   ```

6. Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from landing-page directory
cd landing-page
vercel

# Production deployment
vercel --prod
```

## Custom Domain Setup

1. In Vercel project settings, go to "Domains"
2. Add your custom domain (e.g., `sigmaprotocol.dev`)
3. Follow DNS configuration instructions
4. Update `metadataBase` in `app/layout.tsx` to your domain

## Environment Variables

### Required
None - the site works without any environment variables.

### Optional

**PostHog Analytics:**
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**GitHub Token (for enhanced star count API rate limits):**
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

## Performance Verification

After deployment, verify performance:

1. **Lighthouse CI:**
   ```bash
   npx lighthouse https://your-domain.com --view
   ```
   Target: Performance 95+, SEO 100, Accessibility 90+

2. **WebPageTest:**
   - Go to [webpagetest.org](https://www.webpagetest.org)
   - Test from multiple locations
   - Target: FCP < 1.5s, LCP < 2.5s

3. **Vercel Analytics:**
   - Enable in project settings
   - Monitor Core Web Vitals in production

## CI/CD Configuration

Vercel automatically deploys:
- **Production:** On push to `main` branch
- **Preview:** On pull requests

### GitHub Actions (Optional)

Add `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
          uploadArtifacts: true
```

## Monitoring

### PostHog Dashboard

1. Go to PostHog project
2. Create dashboard with:
   - Total page views
   - `install_command_copied` conversion rate
   - `cta_clicked` by location
   - `workflow_step_expanded` distribution

### Vercel Analytics

Monitor:
- Real User Metrics (RUM)
- Core Web Vitals
- Geographic distribution
- Device breakdown

## Security Headers

Configured in `vercel.json`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Rollback Procedure

If deployment fails:

1. Go to Vercel project → Deployments
2. Find last successful deployment
3. Click "..." → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Performance Optimization Checklist

- [ ] Images optimized (WebP, lazy loading)
- [ ] Fonts self-hosted with `next/font`
- [ ] Bundle analyzed (`npm run build` shows size)
- [ ] Analytics lazy loaded
- [ ] No blocking scripts in `<head>`
- [ ] CSS critical path optimized
- [ ] Reduced motion respected

## Post-Launch

1. **Week 1:**
   - Monitor Lighthouse scores daily
   - Check PostHog events firing correctly
   - Verify GitHub star count updates
   - Test on multiple browsers

2. **Week 2:**
   - Analyze A/B test results (if configured)
   - Review analytics drop-off points
   - Optimize based on user behavior

3. **Month 1:**
   - SEO performance review
   - Conversion rate optimization
   - Update stats (PRDs generated, etc.)

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### PostHog Not Tracking
1. Verify `NEXT_PUBLIC_POSTHOG_KEY` is set
2. Check browser console for errors
3. Disable ad blockers for testing
4. Verify PostHog project is active

### GitHub Star Count Not Updating
- Check API rate limit: `curl -I https://api.github.com/rate_limit`
- Add `GITHUB_TOKEN` to bypass rate limits
- Verify fallback value (1000) displays correctly

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **PostHog Docs:** https://posthog.com/docs

---

**Deployed:** Ready for Task 12 verification
**Target URL:** https://sigmaprotocol.dev (or Vercel subdomain)

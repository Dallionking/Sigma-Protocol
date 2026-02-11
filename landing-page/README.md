# Sigma Protocol Landing Page

Official marketing site for Sigma Protocol - AI-Powered PRD Generation & Swarm Orchestration.

## Features

- Next.js 14+ with App Router and TypeScript
- Tailwind CSS with Gotham Night color palette
- Framer Motion animations
- PostHog analytics integration
- Responsive design (mobile-first)
- SEO optimized with structured data
- Lighthouse performance 95+

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# PostHog Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# GitHub Token (Optional - for star count API)
GITHUB_TOKEN=your_github_token
```

## Deployment

This project is optimized for Vercel deployment:

1. Push to GitHub
2. Import repository in Vercel
3. Configure environment variables
4. Deploy

Alternatively, use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Project Structure

```
landing-page/
├── app/
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # Home page
│   ├── globals.css       # Global styles with Gotham Night palette
│   └── sitemap.ts        # SEO sitemap
├── components/
│   ├── HeroSection.tsx
│   ├── FeatureHighlights.tsx
│   ├── WorkflowVisualization.tsx
│   ├── TrustSignals.tsx
│   ├── QuickStart.tsx
│   ├── Footer.tsx
│   └── PostHogProvider.tsx
├── lib/
│   ├── constants.ts      # Workflow steps, stats, etc.
│   ├── utils.ts          # Utility functions
│   └── analytics/
│       └── posthog.ts    # Analytics tracking
├── public/
│   └── robots.txt
└── vercel.json           # Security headers
```

## Performance Targets

- Lighthouse Performance: 95+
- First Contentful Paint (FCP): <1.5s
- Cumulative Layout Shift (CLS): <0.1
- Total bundle size: <200KB (gzip)

## Analytics Events

PostHog tracks the following events:

- `install_command_copied` - Brew command copied
- `cta_clicked` - CTA button engagement
- `workflow_step_expanded` - Workflow step exploration
- `github_link_clicked` - External GitHub navigation

## License

MIT - See LICENSE in repository root

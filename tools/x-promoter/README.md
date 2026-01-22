# X Promoter

**Automated X/Twitter promotion system with multi-account support**

Part of [SSS Protocol](https://github.com/dallionking/sss-protocol) - A FAANG-style AI development workflow.

---

## Overview

X Promoter is an intelligent automation tool that monitors X/Twitter for relevant conversations and posts contextual, engaging replies promoting your projects. It uses AI (Claude) to generate authentic, varied responses that add value to conversations.

### Features

- **Multi-Account Support** - Manage multiple X accounts, each promoting different products
- **AI-Powered Content** - Uses Claude to generate contextual, authentic replies
- **Smart Filtering** - Finds the most relevant tweets using keyword and account monitoring
- **Tone Variation** - Automatically varies between educational, relatable, value-first, and direct tones
- **Rate Limiting** - Built-in protection against spam with per-account and global limits
- **24/7 Operation** - Runs continuously with configurable intervals
- **Render Ready** - One-click deployment to Render with included configuration

---

## Quick Start

### Prerequisites

- Node.js 20+
- X Developer Account with Basic tier API access ($100/month)
- Anthropic API key for Claude

### Installation

```bash
# Navigate to the x-promoter directory
cd tools/x-promoter

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env with your credentials (see Configuration section)

# Initialize database
npm run cli db init

# Test your account connection
npm run cli account test sss-protocol

# Start the promoter
npm start
```

---

## Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Database (leave empty for local SQLite, or use Postgres URL for production)
DATABASE_URL=

# Anthropic API Key (required)
ANTHROPIC_API_KEY=your_key_here

# X Account 1 Credentials
X_ACCOUNT_1_NAME=sss-protocol
X_ACCOUNT_1_API_KEY=your_api_key
X_ACCOUNT_1_API_SECRET=your_api_secret
X_ACCOUNT_1_ACCESS_TOKEN=your_access_token
X_ACCOUNT_1_ACCESS_SECRET=your_access_token_secret
X_ACCOUNT_1_BEARER_TOKEN=your_bearer_token

# Add more accounts as needed (X_ACCOUNT_2_*, X_ACCOUNT_3_*, etc.)
```

### Account Configuration

Edit `src/config/accounts.json` to customize:

- **Product info** - Name, tagline, GitHub URL, features
- **Keywords** - Topics to monitor
- **Target accounts** - Specific accounts to follow
- **Rate limits** - Max replies per day, minimum interval
- **Tone weights** - Balance between different reply styles

---

## CLI Commands

```bash
# Account Management
npm run cli account list          # List all accounts
npm run cli account add           # Add new account (interactive)
npm run cli account test <id>     # Test account connection
npm run cli account stats <id>    # View account statistics
npm run cli account enable <id>   # Enable an account
npm run cli account disable <id>  # Disable an account

# Running
npm run cli start                 # Start automated system
npm run cli run-once              # Run single cycle
npm run cli preview               # Preview candidate tweets (dry run)

# Database
npm run cli db init               # Initialize database
```

---

## Deployment to Render

### Option 1: Blueprint (Recommended)

1. Fork/clone this repo
2. Connect your repo to Render
3. Create a new Blueprint and select `render.yaml`
4. Add environment variables in Render dashboard:
   - `ANTHROPIC_API_KEY`
   - `X_ACCOUNT_1_*` credentials
5. Deploy!

### Option 2: Manual Setup

1. Create a new **Background Worker** on Render
2. Connect your repository
3. Set build command: `npm ci && npm run build`
4. Set start command: `node dist/index.js`
5. Create a **PostgreSQL** database
6. Add environment variables:
   - `DATABASE_URL` (from your Postgres instance)
   - `ANTHROPIC_API_KEY`
   - `X_ACCOUNT_1_*` credentials
7. Deploy!

---

## Getting X API Access

1. Go to [developer.twitter.com](https://developer.twitter.com/)
2. Sign up for a developer account
3. Create a new Project and App
4. Apply for **Basic** tier access ($100/month)
5. Generate your API keys and tokens:
   - API Key & Secret
   - Access Token & Secret
   - Bearer Token

**Important:** You need Basic tier for write access (posting tweets).

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                     SCHEDULER (every 5 min)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FEED MONITOR                              │
│  • Search by keywords                                        │
│  • Get tweets from target accounts                          │
│  • Filter already-replied tweets                            │
│  • Score relevance with AI                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   CONTENT GENERATOR                          │
│  • Select tone (educational/relatable/value-first/direct)   │
│  • Generate contextual reply with Claude                    │
│  • Validate quality and uniqueness                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     RATE LIMITER                             │
│  • Check daily limits                                        │
│  • Enforce minimum intervals                                │
│  • Add natural timing jitter                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    POST REPLY                                │
│  • Send reply via X API                                     │
│  • Log to database                                          │
│  • Track engagement                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Cost Estimate

| Service | Cost |
|---------|------|
| X API Basic (per account) | $100/month |
| Claude API (est. 3000 replies) | ~$10-20/month |
| Render Background Worker | $7/month |
| Render Postgres | $7/month |
| **Total (1 account)** | **~$124-127/month** |

---

## Adding More Accounts

1. Add credentials to `.env`:
   ```bash
   X_ACCOUNT_2_NAME=my-other-project
   X_ACCOUNT_2_API_KEY=...
   # etc.
   ```

2. Add configuration to `src/config/accounts.json`:
   ```json
   {
     "id": "my-other-project",
     "name": "My Other Project",
     "enabled": true,
     "product": {
       "name": "My Other Project",
       "tagline": "Something cool",
       "githubUrl": "https://github.com/..."
     },
     ...
   }
   ```

3. Restart the service

**Note:** Each X account needs its own API subscription ($100/month each).

---

## Best Practices

1. **Start Conservative** - Begin with low reply limits and increase gradually
2. **Monitor Engagement** - Check `account stats` regularly
3. **Vary Content** - The AI varies tones, but review occasionally
4. **Respect the Community** - Only engage with genuinely relevant content
5. **Follow X Rules** - Automated activity must comply with X's ToS

---

## Troubleshooting

### "No credentials found for account"
- Ensure environment variables are set correctly
- Variable names must match pattern: `X_ACCOUNT_N_*`

### "Rate limit exceeded"
- Wait for daily reset (midnight UTC)
- Consider reducing `maxRepliesPerDay` in config

### "Failed to post reply"
- Check API permissions (need write access)
- Verify access tokens aren't expired
- Check X's rate limits in developer dashboard

---

## License

MIT - Part of SSS Protocol

Created by Dallion King


